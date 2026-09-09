import axiosClient from './axiosClient';

export function getPoli() {
  return axiosClient.get('/poli');
}