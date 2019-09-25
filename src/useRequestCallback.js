import { useState, useEffect } from 'react';
import { axiosInstance } from './axiosInstance';

function applyArgToAxiosConfig(arg, config) {
  let resultConfig = (typeof config === 'function') ? config(arg) : config;
  if (typeof resultConfig === 'string') {
    resultConfig = { url: resultConfig };
  }

  return resultConfig;
}

function useRequestCallback(axiosConfigOrFactory, axiosConfigOverrides = {}) {
  const [state, setState] = useState({
    execCount: 0,
    execInput: null,
    loading: false,
    error: null,
    response: null,
    data: null,
  });

  const exec = (arg) => setState({
    ...state,
    loading: true,
    error: null,
    execInput: arg,
    execCount: state.execCount + 1,
  });

  useEffect(
    () => {
      if (!state.execCount) {
        return;
      }

      async function doRequest() {
        const requestConfig = {
          ...applyArgToAxiosConfig(state.execInput, axiosConfigOrFactory),
          ...axiosConfigOverrides
        };

        try {
          const response = await axiosInstance(requestConfig);
          setState({ ...state, loading: false, response, data: response.data });
        } catch (error) {
          setState({ ...state, loading: false, error });
        }
      }

      doRequest();
    },
    [state.execCount]
  );

  const retry = () => exec(state.execInput);
  const { loading, error, response, data, execCount, execInput } = state;

  return [exec, loading, { error, retry, response, data, execCount, input: execInput }];
}

const useGetCallback    = (axiosConfigOrFactory) => useRequestCallback(axiosConfigOrFactory, { method: 'GET' });
const usePostCallback   = (axiosConfigOrFactory) => useRequestCallback(axiosConfigOrFactory, { method: 'POST' });
const usePutCallback    = (axiosConfigOrFactory) => useRequestCallback(axiosConfigOrFactory, { method: 'PUT' });
const usePatchCallback  = (axiosConfigOrFactory) => useRequestCallback(axiosConfigOrFactory, { method: 'PATCH' });
const useDeleteCallback = (axiosConfigOrFactory) => useRequestCallback(axiosConfigOrFactory, { method: 'DELETE' });

export { useGetCallback, usePostCallback, usePutCallback, usePatchCallback, useDeleteCallback };
