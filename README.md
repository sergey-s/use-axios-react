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
import React from "react";
import { useGetData } from "use-axios-react";

const KanyeQuote = () => {
  const [data, loading] = useGetData("https://api.kanye.rest/");

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
  const [data, loading, { error, retry }] = useGetData("https://api.kanye.rest/", { cancelable: true });

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
  const [create, sending, { error, data }] = usePostCallback(userToRequest);

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

[![Edit Pagination](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/react-pagination-with-axios-hooks-9j5dr?fontsize=14)

```js
import React, { useState } from "react";
import { useGetData } from "use-axios-react";

const PaginatedKanyeQuotes = () => {
  const [page, setPage] = useState(1);
  const [data, loading] = useGetData(
    { url: "https://api.kanye.rest/", params: { page } },
    { cancelable: true }
  );

  if (loading) return <Spinner />;

  const prev = () => setPage(page - 1);
  const next = () => setPage(page + 1);

  return (
    <div>
      <Quote>{data.quote}</Quote>
      <div>
        <Button onClick={prev} disabled={page <= 1} label="← Prev" />
        <span className="mx-5">Page {page}</span>
        <Button onClick={next} disabled={page >= 9} label="Next →" />
      </div>
    </div>
  );
};
```
</details>

<details>
<summary><b>Basic TodoMVC CRUD</b></summary>

[![Edit TodoMVC CRUD](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/todomvc-crud-y77vf?fontsize=14)

```js
import React from "react";
import axios from "axios";
import {
  provideAxiosInstance,
  useGetData,
  usePostCallback,
  useDeleteCallback,
  usePatchCallback
} from "use-axios-react";

provideAxiosInstance(
  axios.create({
    baseURL: "https://todo-backend-golang-goa.herokuapp.com"
  })
);

/**
 * Map todos to axios request configs
 */
const todoObjectToAxiosRequest = ({ id, title, order, completed }) => ({
  url: id ? `/todos/${id}` : "/todos",
  data: { title, order, completed }
});

const TodoMvcApp = () => {
  // Reusing the same mapping function for all CRUD requests
  const [create, creating, { error: createError }] = usePostCallback(todoObjectToAxiosRequest);
  const [remove, removing, { error: removeError }] = useDeleteCallback(todoObjectToAxiosRequest);
  const [update, updating, { error: updateError }] = usePatchCallback(todoObjectToAxiosRequest);

  // Re-fetch after any of actions is completed
  const allRequestsDone = !creating && !removing && !updating;
  const [todos = [], fetching, { error: fetchError }] = useGetData("/todos", {
    // The hook will re-run every time `depends` changes
    depends: [creating, removing, updating],
    // Actual request will be performed only if this is true
    willRun: allRequestsDone
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
```
</details>

<details>
<summary><b>Common state GET & POST</b></summary>
  
[![Edit Common state GET & POST](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/common-state-get-post-z93n5?fontsize=14)

```js
import React, { useEffect } from "react";
import { useGetData, usePostCallback } from "use-axios-react";

const CreateUser = () => {
  
  // Do an initial load
  const [users = [], loading, { error: loadError, setData: setUsers }] = useGetData("https://reqres.in/api/users");

  // We're particularly interested in the create() callback and the response data (new user data)
  const [create, creating, { error: createError, data: newUser }] = usePostCallback("https://reqres.in/api/users");

  // Update users state evey time the newUser changes
  useEffect(
    () => {
      newUser && setUsers([...users, newUser]);
    },
    [newUser]
  );

  return (
    <Layout>
      <Button onClick={() => create({})}>Create dummy user</Button>

      <span>{(loading || creating) && "Loading..."}</span>
      <span>{(loadError || createError) && "Error occurred"}</span>

      <UserList users={users} />
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

