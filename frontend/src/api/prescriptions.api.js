import axiosClient from './axiosClient';

export function createPrescription(data) {
  return axiosClient.post('/prescriptions', data);
}