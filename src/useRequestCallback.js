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
  const [execCount, setExecCount] = useState(0);
  const [execInput, setExecArg] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [data, setData] = useState(null);

  const exec = (arg) => {
    setError(false);
    setLoading(true);
    setExecArg(arg);
    setExecCount(execCount + 1);
  };

  useEffect(
    () => {
      if (!execCount) {
        return;
      }

      async function doRequest() {
        const requestConfig = { ...applyArgToAxiosConfig(execInput, axiosConfigOrFactory), ...axiosConfigOverrides };
        try {
          const response = await axiosInstance(requestConfig);
          setResponse(response);
          setData(response.data);
        } catch (e) {
          setError(e);
        } finally {
          setLoading(false);
        }
      }

      doRequest();
    },
    [execCount]
  );

  const retry = () => exec(execInput);

  return [exec, loading, error, { retry, response, data, execCount, input: execInput }];
}

const useGetCallback    = (axiosConfigOrFactory) => useRequestCallback(axiosConfigOrFactory, { method: 'GET' });
const usePostCallback   = (axiosConfigOrFactory) => useRequestCallback(axiosConfigOrFactory, { method: 'POST' });
const usePutCallback    = (axiosConfigOrFactory) => useRequestCallback(axiosConfigOrFactory, { method: 'PUT' });
const usePatchCallback  = (axiosConfigOrFactory) => useRequestCallback(axiosConfigOrFactory, { method: 'PATCH' });
const useDeleteCallback = (axiosConfigOrFactory) => useRequestCallback(axiosConfigOrFactory, { method: 'DELETE' });

export { useGetCallback, usePostCallback, usePutCallback, usePatchCallback, useDeleteCallback };
