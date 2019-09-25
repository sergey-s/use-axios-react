import { renderHook, act } from '@testing-library/react-hooks';
import {
  useParallelPatchCallback,
  provideAxiosInstance,
  useParallelGetCallback,
  useParallelPostCallback,
  useParallelPutCallback,
  useParallelDeleteCallback
} from '../';

const axios = jest.fn((config) => new Promise(
  (resolve, reject) =>
    config.arg && String(config.arg).startsWith('err')
      ? reject(`error-${config.arg}`)
      : resolve({ data: `success-${config.arg}` })
));
provideAxiosInstance(axios);

describe('useParallelRequestCallback() hook', () => {

  function axiosConfigFactory(arg) {
    return { arg };
  }

  function callExec(renderHookResult, args) {
    return renderHookResult.current[0](args);
  }

  beforeEach(() => axios.mockClear());

  it('should return a callback function and its\' loading indicator', () => {
    const { result } = renderHook(() => useParallelPatchCallback(axiosConfigFactory));

    const [exec, loading] = result.current;
    expect(typeof exec).toBe('function');
    expect(typeof loading).toBe('boolean');
  });

  it('should make an API call per passed argument', () => {
    const { result } = renderHook(() => useParallelPatchCallback(axiosConfigFactory));

    act(() => callExec(result, ['foo', 'bar']));

    expect(axios.mock.calls.length).toBe(2);
    expect(axios.mock.calls[0][0].arg).toBe('foo');
    expect(axios.mock.calls[1][0].arg).toBe('bar');
  });

  it('should add a correct request method to axios config', () => {
    const get = renderHook(() => useParallelGetCallback(axiosConfigFactory)).result;
    const post = renderHook(() => useParallelPostCallback(axiosConfigFactory)).result;
    const put = renderHook(() => useParallelPutCallback(axiosConfigFactory)).result;
    const patch = renderHook(() => useParallelPatchCallback(axiosConfigFactory)).result;
    const del = renderHook(() => useParallelDeleteCallback(axiosConfigFactory)).result;

    act(() => {
      const args = ['foo'];

      callExec(get, args);
      callExec(post, args);
      callExec(put, args);
      callExec(patch, args);
      callExec(del, args);
    });

    expect(axios.mock.calls.length).toBe(5);
    expect(axios.mock.calls[0][0].method).toBe('GET');
    expect(axios.mock.calls[1][0].method).toBe('POST');
    expect(axios.mock.calls[2][0].method).toBe('PUT');
    expect(axios.mock.calls[3][0].method).toBe('PATCH');
    expect(axios.mock.calls[4][0].method).toBe('DELETE');
  });

  it('should split input args into succeed and failed', async () => {
    const { result } = renderHook(() => useParallelPatchCallback(axiosConfigFactory));
    const args = ['foo', 'bar', 'err1', 'err2', 'baz'];

    await act(async () => await callExec(result, args));

    const [, loading, { succeed, failed }] = result.current;
    expect(loading).toBe(false);
    expect(succeed).toEqual(['foo', 'bar', 'baz']);
    expect(failed).toEqual(['err1', 'err2']);
  });

  it('should collect successful responses and errors', async () => {
    const { result } = renderHook(() => useParallelPatchCallback(axiosConfigFactory));
    const args = ['foo', 'bar', 'err1', 'err2', 'baz'];

    await act(async () => await callExec(result, args));

    const [, loading, { data, responses, errors }] = result.current;
    expect(loading).toBe(false);
    expect(responses).toHaveLength(3);
    expect(data).toEqual(['success-foo', 'success-bar', 'success-baz']);
    expect(errors).toEqual(['error-err1', 'error-err2']);
  });

  describe('loading indicator', () => {
    it('should be FALSE initially', () => {
      const { result } = renderHook(() => useParallelPatchCallback(axiosConfigFactory));
      const [, loading] = result.current;
      expect(loading).toBe(false);
    });

    it('should turn to TRUE when executing a request', () => {
      const { result } = renderHook(() => useParallelPatchCallback(axiosConfigFactory));

      act(() => callExec(result, ['foo', 'bar']));

      const [, loading] = result.current;
      expect(loading).toBe(true);
    });

    it('should turn to back to FALSE when requests finished', async () => {
      const { result } = renderHook(() => useParallelPatchCallback(axiosConfigFactory));

      await act(() => callExec(result, ['foo', 'bar']));

      const [, loading] = result.current;
      expect(loading).toBe(false);
    });
  });

  describe('retry()', () => {

    function getRetry(result) {
      return result.current[2].retry;
    }

    it('should be undefined before exec() is called', () => {
      const { result } = renderHook(() => useParallelPatchCallback(axiosConfigFactory));
      expect(getRetry(result)).toBe(undefined);
    });

    it('should remain undefined after all exec() requests finish successfully', async () => {
      const { result } = renderHook(() => useParallelPatchCallback(axiosConfigFactory));

      await act(() => callExec(result, ['foo', 'bar']));

      const [, loading, { succeed }] = result.current;
      expect(loading).toBe(false);
      expect(succeed).toHaveLength(2);
      expect(getRetry(result)).toBe(undefined);
    });

    it('should be a function after some of the exec() requests failed', async () => {
      const { result } = renderHook(() => useParallelPatchCallback(axiosConfigFactory));

      await act(() => callExec(result, ['err']));

      const [, loading, { failed }] = result.current;
      expect(loading).toBe(false);
      expect(failed).toHaveLength(1);
      expect(getRetry(result)).toBeInstanceOf(Function);
    });

    it('should retry only failed requests', async () => {
      const { result } = renderHook(() => useParallelPatchCallback(axiosConfigFactory));
      await act(async () => await callExec(result, ['foo', 'err1', 'err2', 'bar']));

      axios.mockClear();
      await act(getRetry(result));

      expect(axios.mock.calls.length).toBe(2);
      expect(axios.mock.calls[0][0].arg).toBe('err1');
      expect(axios.mock.calls[1][0].arg).toBe('err2');
    });

    it('should turn to undefined when all retry() requests succeed', async () => {
      let callsCounter = 0;
      const failingOnceAxios = jest.fn(
        () => new Promise((resolve, reject) => callsCounter++ ? resolve({ data: 'ok' }) : reject('error'))
      );
      provideAxiosInstance(failingOnceAxios);
      const { result } = renderHook(() => useParallelPatchCallback(axiosConfigFactory));
      await act(() => callExec(result, ['err1', 'foo']));

      failingOnceAxios.mockClear();
      await act(getRetry(result));

      expect(callsCounter).toBe(3);
      expect(failingOnceAxios.mock.calls.length).toBe(1);
      expect(result.current[2].failed).toHaveLength(0);
      expect(getRetry(result)).toBe(undefined);
    });
  });
});
