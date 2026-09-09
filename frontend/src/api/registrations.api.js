import axiosClient from './axiosClient';

export function getRegistrations(params) {
  return axiosClient.get('/registrations', { params });
}
export function createRegistration(data) {
  return axiosClient.post('/registrations', data);
}
export function updateRegistration(id, data) {
  return axiosClient.put(`/registrations/${id}`, data);
}