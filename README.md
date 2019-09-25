<div align="center">
🚀 Axios in React in the hooks era
</div>
<p align="center">
<div align="center">
  <pre>npm i axios use-axios-react</pre>
</div>

## Features

- Hooks for ✅ data fetching ✅ CRUD ✅ Batch operations
- ✅ Request cancellation
- ✅ Retry/reload callbacks
- ✅ Zero-configuration, yet fully configurable when needed
- ✅ No app architecture commitments, drop in into your React and Axios project and start using hooks in your new components
- No extra-dependencies (React and Axios are peer dependencies), thus minimum overhead if your project already uses axios
- All axios features

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

<b>Basic data fetching (GET)</b>

[![Edit Fetch example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/fetch-with-reload-retry-hlmb2?fontsize=14)

```js
import React from 'react';
import { useGetData } from 'use-axios-react';

const KanyeQuote = () => {
  const [data, loading] = useGetData("https://api.kanye.rest/", { cancelable: true });

  if (loading) return <div>Loading...</div>;

  return <blockquote>{data.quote}</blockquote>;
};
```

<b>Cancellable fetching (GET) with reload and retry</b>

[![Edit Cancelable fetch with reload & retry](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/fetch-with-reload-retry-ghrd8?fontsize=14)

```js
import React from "react";
import { useGetData } from "use-axios-react";

const KanyeQuote = () => {
  const [data, loading, error, { retry }] = useGetData("https://api.kanye.rest/", { cancelable: true });

  if (loading) return <Spinner />;
  if (error) return <Button onClick={retry} label="RETRY" />;

  return (
    <div>
      <Quote>{data.quote}</Quote>
      <Button onClick={retry} label="RELOAD" />
    </Fragment>
  );
};
```

<b>Basic POST example</b>

[![Edit POST example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/post-example-8x59c?fontsize=14)

```js
import React from "react";
import { usePostCallback } from "use-axios-react";

function userToRequest({ name, job }) {
  return {
    url: "https://reqres.in/api/users",
    data: { name, job }
  };
}

const CreateUser = () => {
  const [create, sending, error, { data }] = usePostCallback(userToRequest);

  const neo = { name: "Neo", job: "The One" };
  const morpheus = { name: "Morpheus", job: "Leader" };

  return (
    <Layout>
      <Button onClick={() => create(neo)}>Neo</Button>
      <Button onClick={() => create(morpheus)}>Morpheus</Button>
      <StatusBar sending={sending} error={error} lastUser={data} />
    </Layout>
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

- [Full featured TodoMVC app](https://github.com/sergey-s/todomvc-react-hooks-api-crud)

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
<tr>
    <td>
        <br/>
        <code>useParallelPostCallback()</code><br/><br/>
        <code>useParallelPutCallback()</code><br/><br/>
        <code>useParallelPatchCallback()</code><br/><br/>
        <code>useParallelDeleteCallback()</code><br/><br/>
        <code>useParallelGetCallback()</code><br/><br/>
    </td>
    <td>
        Use this if you need to <b>create callbacks to trigger batch requests</b>
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

- result array structure is `[data, loading, { error, response, retry, retriesCount, setData }]`:

-------------------

#### `use{Method}Callback(url|axiosConfig|factory, options): []`

Where {Method} is one of the following: `Post, Put, Patch, Delete, Get` 

* `url|axiosConfig|factory` &mdash; Request URL, axios config object or factory, producing an axios config object from 
callback args

- result array structure is `[exec, loading, { error, retry, response, data, execCount, input }]`:

-------------------

#### `useParallel{Method}Callback(axiosConfigFactory): []`

Where {Method} is one of the following: `Post, Put, Patch, Delete, Get` 

* `axiosConfigFactory` &mdash; A function producing an axios config object from 
callback args

- result array structure is `[exec, loading, { retry, errors, responses, data, succeed, failed, execCount, input }]`

-------------------

## Support 👩‍

* Please feel free to create issues with questions

