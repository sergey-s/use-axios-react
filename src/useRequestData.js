import { useState, useEffect } from 'react';
import { CancelToken, isCancel } from 'axios';
import { axiosInstance } from './axiosInstance';

const useRequestData = (axiosConfig, execConfig = {}) => {

  const [retriesCount, setRetriesCount] = useState(0);
  const retry = () => setRetriesCount(retriesCount + 1);

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

  depends.push(retriesCount);

  // ------------------------

  // Undefined allows to initialize a destructed variable with some initial value for data
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(willRun);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  useEffect(
    () => {
      if (!willRun) {
        return;
      }

      let cancelToken;

      async function doRequest() {
        setLoading(true);
        setError(null);

        const requestConfig = { ...axiosConfig };
        if (cancelable) {
          cancelToken = CancelToken.source();
          requestConfig.cancelToken = cancelToken.token;
        }

        try {
          const response = await axiosInstance(requestConfig);
          setResponse(response);
          setData(response.data);
          setLoading(false);
        } catch (e) {
          if (!isCancel(e)) {
            setError(e);
            setLoading(false);
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

  return [data, loading, error, { response, retry, retriesCount, setData }];
};

function normalizedConfig(config) {
  if (typeof config === 'string') {
    return { url: config };
  }

  return config;
}

const useGetData = (config, ...args) => useRequestData({ ...normalizedConfig(config), method: 'GET' }, ...args);

export { useGetData };
