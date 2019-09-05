<div align="center">
🚀 Axios in React in the hooks era
</div>
<p align="center">
<div align="center">
  <pre>npm i axios use-axios-react</pre>
</div>

## Features

- Hooks for ✅ data fetching and ✅ CRUD
- ✅ Request cancellation
- ✅ Retry/reload callbacks
- ✅ Zero-configuration, yet fully configurable when needed
- ✅ No app architecture commitments, drop in into your React and Axios project and start using hooks in your new components
- No extra-dependencies (React and Axios are peer depencies), thus minimum overhead if your project already uses Axios
- All Axios features

## Installation

```
npm i use-axios-react
```

Make sure axios itself is installed

```
npm i axios
```

And make sure you use React v16.8.0 or newer.

## Examples 

<b>Data fetching with request cancellation</b>

```js
import React from 'react';
import { useGetData } from 'use-axios-react';

const Advice = () => {
  const [data, loading] = useGetData('https://api.adviceslip.com/advice', { cancellable: true });

  if (loading) {
    return <div>Loading...</div>;
  }

  return <blockquote>{data.slip.advice}</blockquote>;
};
```

<b>Basic POST example</b>

```js
import React, { Fragment } from 'react';
import { useGetData } from 'use-axios-react';

const BasicExample = () => {
  const [data, loading, error, { retry }] = useGetData('https://api.kanye.rest/', { cancelable: true });

  if (loading) return <Spinner />;
  if (error) return <div>Error occurred, try to <Button onClick={retry} label="RETRY" /></div>;

  return (
    <Fragment>
      <Quote>{data.quote}</Quote>
      <Button onClick={retry} label="RELOAD" />
    </Fragment>
  );
};
```

<details>
<summary><b>Pagination</b></summary>

```js
import React, { Fragment } from 'react';
import { useGetData } from 'use-axios-react';

const PaginationExample = () => {
  const [page, setPage] = useState(1);
  const goPrev = () => setPage(page - 1);
  const goNext = () => setPage(page + 1);

  const [data, loading] = useGetData(
    { url: 'https://api.kanye.rest/', params: { page } },
    { cancelable: true }
  );

  if (loading) {
    return <Spinner />;
  }

  return (
    <Fragment>
      <Quote>{data.quote}</Quote>
      <div>
        <Button onClick={goPrev} disabled={page <= 1} label="&larr; Prev" />
        <span className="mx-5">Page {page}</span>
        <Button onClick={goNext} label="Next &rarr;" />
      </div>
    </Fragment>
  );
};
```
</details>

<details>
<summary><b>Basic CRUD</b></summary>

```js
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Layout, Header, NewTodo, TodoList } from './components';
import {
  provideAxiosInstance, useGetData, usePostCallback, useDeleteCallback, usePatchCallback } from 'use-axios-react';

provideAxiosInstance(axios.create({
  baseURL: 'http://slim3-todo-backend.appelsiini.net',
}));

/**
 * Map todos to axios request configs
 */
const todoObjectToAxiosRequest = ({ uid, title, order, completed }) => ({
  url: uid ? `/todos/${uid}` : '/todos',
  data: { title, order, completed }
});

const TodoMvcApp = () => {
  const [create, creating, createError] = usePostCallback(todoObjectToAxiosRequest);
  const [remove, removing, removeError] = useDeleteCallback(todoObjectToAxiosRequest);
  const [update, updating, updateError] = usePatchCallback(todoObjectToAxiosRequest);

  const [todos = [], fetching, fetchError] = useGetData('/todos', {
    depends: [creating, removing, updating],
    willRun: !creating && !removing && !updating,
  });

  if (createError || removeError || updateError || fetchError) {
    return <div>Error occurred, please reload</div>;
  }

  return (
    <Layout>
      <Header loading={creating || removing || updating || fetching}>
        <NewTodo create={create} />
      </Header>
      <TodoList todos={todos} remove={remove} update={update} loading={fetching} />
    </Layout>
  );
};

ReactDOM.render(<TodoMvcApp />, document.getElementById('root'));
```
</details>

<details>
<summary><b>Configuration, common state managed by GET & POST, request retries</b></summary>

```js
import React, { useEffect } from 'react';
import axios from 'axios';
import { provideAxiosInstance, useGetData, usePostCallback } from 'use-axios-react';

// Set axios instance with baseURL
provideAxiosInstance(axios.create({
  baseURL: 'http://slim3-todo-backend.appelsiini.net',
}));

const TodoApp = () => {
  
  // Fetch existing todos
  const [todos = [], fetching, fetchError, { setState: setTodos }] = useGetData('/todos', {
    // This means run only on mount, the same principle as with the useState() second argument
    depends: []
  });
  
  // Get the `create` callback to POST new todos
  const [create, creating, createError, { retry, data: createdTodo }] = usePostCallback((title) => ({
    url: '/todos', data: { title }
  }));

  if (creating || fetching) {
    return (<div>Loading...</div>);
  }

  // Show the retry on create error
  if (createError) {
    return (<div>Error occurred <button onClick={retry}>RETRY</button></div>);
  }

  // Update the todos if one has been successfully created
  const hasCreated = createdTodo && !creating && !createError;
  useEffect(
    () => { hasCreated && setTodos([...todos, createdTodo]); },
    [hasCreated]
  );

  return (
    <Layout>
      <Header>
        <NewTodo create={create} />
      </Header>
      <TodoList todos={todos} remove={remove} update={update} />
    </Layout>
  );
};

```
</details>

### Example apps

- [Basic data fetching](https://github.com/sergey-s/data-fetching-use-axios-react-example)
- [Basic CRUD with reload](https://github.com/sergey-s/crud-use-axios-react-example)
- [Full featured TodoMVC app](https://github.com/sergey-s/todo-mvc-react-hooks-real-api)

* *Submit a PR with your example!*

### API Overview

#### Hooks

<table>
<tr>
    <td><code>useGetData()</code></td>
    <td>
        Use this one if you need to <b>fetch data</b> depending on some state 
        (e.g. to fetch search results depending on search term)
    </td>
</tr>
<tr>
    <td>
        <br/>
        <code>usePostCallback()</code><br/><br/>
        <code>usePutCallback()</code><br/><br/>
        <code>usePatchCallback()</code><br/><br/>
        <code>useDeleteCallback()</code><br/><br/>
        <code>useGetCallback()</code><br/><br/>
    </td>
    <td>
        Use this if you need to <b>create callbacks to trigger a request</b> programmatically
    </td>
</tr>
</table>

#### Settings

<table>
<tr>
    <td><code>provideAxiosInstance()</code></td>
    <td>
        Provide a custom axios instance to use with the hooks
    </td>
</tr>
</table>

### API Reference

-------------------

#### `useGetData(url|axiosConfig, options): []`

- `url|axiosConfig` &mdash; Refer to [axios request config](https://github.com/axios/axios#request-config) documentation for details
- `options` &mdash; The `use{...}Data` hook options:

<table>
<tr>
    <td><code>cancelable:&nbsp;bool</code></td>
    <td>Whether the request should be canceled on component unmount</td>
</tr>
<tr>
    <td><code>depends:&nbsp;[]</code></td>
    <td>
        Hook's effect will be re-run only if one of the passed array values changes.
        Refer to the <a href="https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects">React useEffect(effect, depends)</a>
        second argument docs to learn how it works.
    </td>
</tr>
<tr>
    <td><code>willRun:&nbsp;bool</code></td>
    <td>Request will be be executed only if this option is true. This is usually an expression such as <code>willRun: !loading</code></td>
</tr>
</table>

- result array structure is `[data, loading, error, otherData]`:

<table>
<tr>
    <td><code>data:&nbsp;any</code></td>
    <td>Response data</td>
</tr>
<tr>
    <td><code>loading:&nbsp;bool</code></td>
    <td>Loading indicator</td>
</tr>
<tr>
    <td><code>error:&nbsp;Error|null</code></td>
    <td>Error, if any</td>
</tr>
<tr>
    <td><code>otherData:&nbsp;Object</code></td>
    <td><code>{ response, retry, retriesCount, setData }</code></td>
</tr>
</table>

-------------------

#### `use{Method}Callback(url|axiosConfig|factory, options): []`

Where {Method} is one of the following: `Post, Put, Patch, Delete, Get` 

* `url|axiosConfig|factory` &mdash; Request URL, axios config object or factory, producing an axios config object from 
callback args
- `options` &mdash; The `use{...}Callback` hook options:

<table>
<tr>
    <td><code>cancelable:&nbsp;bool</code></td>
    <td>Whether the request should be canceled on component unmount</td>
</tr>
</table>

- result array structure is `[callback, loading, error, otherData]`:

<table>
<tr>
    <td><code>exec:&nbsp;Function</code></td>
    <td>Callback function to execute the request</td>
</tr>
<tr>
    <td><code>loading:&nbsp;bool</code></td>
    <td>Loading indicator</td>
</tr>
<tr>
    <td><code>error:&nbsp;Error|null</code></td>
    <td>Error, if any</td>
</tr>
<tr>
    <td><code>otherData:&nbsp;Object</code></td>
    <td><code>{ retry, response, data, execCount, input }</code></td>
</tr>
</table>

-------------------

## Support 👩‍

* Please feel free to create issues with questions
* It's meant to grow and evolve to cover nicely more data transfer use cases &mdash; you can open an issues to describe your unique use case
* PRs are welcomed

## Tahnk you!
