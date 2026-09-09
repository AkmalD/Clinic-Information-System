import axiosClient from './axiosClient';

export function getDoctors(params) {
  return axiosClient.get('/doctors', { params });
}