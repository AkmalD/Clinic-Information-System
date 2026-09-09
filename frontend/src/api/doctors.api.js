import axiosClient from './axiosClient';

export function getDoctors(params) {
  return axiosClient.get('/doctors', { params });
}
export function createDoctor(data) {
  return axiosClient.post('/doctors', data);
}
export function updateDoctor(id, data) {
  return axiosClient.put(`/doctors/${id}`, data);
}
export function deleteDoctor(id) {
  return axiosClient.delete(`/doctors/${id}`);
}
