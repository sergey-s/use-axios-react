import axios from 'axios';

let axiosInstance = axios;

function provideAxiosInstance(instance) {
  axiosInstance = instance;
}

export { axiosInstance, provideAxiosInstance };
