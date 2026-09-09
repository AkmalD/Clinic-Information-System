import axiosClient from './axiosClient';

export function getPatients(params) {
  return axiosClient.get('/patients', { params });
}
export function createPatient(data) {
  return axiosClient.post('/patients', data);
}
export function updatePatient(id, data) {
  return axiosClient.put(`/patients/${id}`, data);
}
export function deletePatient(id) {
  return axiosClient.delete(`/patients/${id}`);
}