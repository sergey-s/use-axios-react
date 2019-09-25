import { useState, useEffect } from 'react';
import { CancelToken, isCancel } from 'axios';
import { axiosInstance } from './axiosInstance';

const useRequestData = (axiosConfig, execConfig = {}) => {

  if (typeof execConfig.willRun === 'undefined') {
    execConfig.willRun = true;
  }

  const [state, setState] = useState({
    loading: Boolean(execConfig.willRun),
    retriesCount: 0,
    error: null,
    response: null,
    data: undefined, // Undefined to allow a default value when destructuring hook return value
  });

  // ------------------------

  const { cancelable } = execConfig;
  let { willRun, depends } = execConfig;

  if (typeof willRun === 'undefined') {
    willRun = true;
  }

  if (!depends) {
    const { url, method, params, data } = axiosConfig;
    depends = [willRun, url, method, JSON.stringify(params), JSON.stringify(data)];
  }

  depends.push(state.retriesCount);

  // ------------------------

  useEffect(
    () => {
      if (!willRun) {
        return;
      }

      let cancelToken;

      async function doRequest() {
        setState({ ...state, loading: true, error: null });

        const requestConfig = { ...axiosConfig };
        if (cancelable) {
          cancelToken = CancelToken.source();
          requestConfig.cancelToken = cancelToken.token;
        }

        try {
          const response = await axiosInstance(requestConfig);
          setState({ ...state, loading: false, response, data: response.data });
        } catch (error) {
          if (!isCancel(error)) {
            setState({ ...state, loading: false, error });
          }
        }
      }

      doRequest();

      if (cancelable) {
        return () => cancelToken.cancel();
      }
    },
    depends
  );

  const retry = () => setState({ ...state, error: null, loading: true, retriesCount: state.retriesCount + 1 });
  const setData = (data) => setState({ ...state, data });
  const { data, loading, error, response, retriesCount } = state;

  return [data, loading, { error, response, retry, retriesCount, setData }];
};

function normalizedConfig(config) {
  if (typeof config === 'string') {
    return { url: config };
  }

  return config;
}

const useGetData = (config, ...args) => useRequestData({ ...normalizedConfig(config), method: 'GET' }, ...args);

export { useGetData };
