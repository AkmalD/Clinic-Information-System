import axiosClient from './axiosClient';

export function getUsers(params) {
  return axiosClient.get('/users', { params });
}
export function createUser(data) {
  return axiosClient.post('/users', data);
}
export function updateUser(id, data) {
  return axiosClient.put(`/users/${id}`, data);
}
// Backend melakukan soft delete (nonaktifkan), bukan hapus permanen
export function deactivateUser(id) {
  return axiosClient.delete(`/users/${id}`);
}
