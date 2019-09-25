import { useState, useEffect } from 'react';
import { axiosInstance } from './axiosInstance';

function useParallelRequestCallback(axiosConfigFactory, axiosConfigOverrides = {}) {
  const [state, setState] = useState({
    loading: false,
    execCount: 0,
    execInput: undefined,
    succeed: [],
    failed: [],
    errors: [],
    responses: [],
    data: []
  });

  const exec = (input) => setState({
    ...state,
    loading: true,
    execInput: input,
    execCount: state.execCount + 1,
    errors: [],
    succeed: [],
    failed: [],
  });

  useEffect(
    () => {
      if (!state.execCount) {
        return;
      }

      async function doRequests() {
        const requests = [];
        for (const arg of state.execInput) {
          const requestConfig = { ...axiosConfigFactory(arg), ...axiosConfigOverrides };
          requests.push(() => axiosInstance(requestConfig));
        }

        const promises = requests.map((make) => make());

        const responses = [];
        const data = [];
        const errors = [];
        const succeed = [];
        const failed = [];
        let doneCount = 0;

        for (const [i, promise] of promises.entries()) {
          try {
            const response = await promise;
            responses.push(response);
            data.push(response.data);
            succeed.push(state.execInput[i]);
          } catch (e) {
            errors.push(e);
            failed.push(state.execInput[i]);
          } finally {
            if (++doneCount === promises.length) {
              setState({ ...state, errors, responses, data, succeed, failed, loading: false });
            }
          }
        }
      }

      doRequests();
    },
    [state.execCount]
  );

  const { loading, errors, responses, data, succeed, failed, execCount, execInput } = state;
  const retry = failed.length ? () => exec(failed) : undefined;

  return [exec, loading, {
    retry, errors, responses, data, succeed, failed, execCount, input: execInput
  }];
}

const useParallelGetCallback = (axiosConfigFactory) =>
  useParallelRequestCallback(axiosConfigFactory, { method: 'GET' });

const useParallelPostCallback = (axiosConfigFactory) =>
  useParallelRequestCallback(axiosConfigFactory, { method: 'POST' });

const useParallelPutCallback = (axiosConfigFactory) =>
  useParallelRequestCallback(axiosConfigFactory, { method: 'PUT' });

const useParallelPatchCallback = (axiosConfigFactory) =>
  useParallelRequestCallback(axiosConfigFactory, { method: 'PATCH' });

const useParallelDeleteCallback = (axiosConfigFactory) =>
  useParallelRequestCallback(axiosConfigFactory, { method: 'DELETE' });

export {
  useParallelGetCallback,
  useParallelPostCallback,
  useParallelPutCallback,
  useParallelPatchCallback,
  useParallelDeleteCallback
};
