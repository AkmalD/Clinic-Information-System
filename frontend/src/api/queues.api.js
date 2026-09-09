import axiosClient from './axiosClient';

export function createQueue(registrationId) {
  return axiosClient.post('/queues', { registrationId });
}
export function callQueue(id) {
  return axiosClient.put(`/queues/${id}/call`);
}