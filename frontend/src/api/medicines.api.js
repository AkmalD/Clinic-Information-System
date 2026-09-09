import axiosClient from './axiosClient';

export function getMedicines(params) {
  return axiosClient.get('/medicines', { params });
}