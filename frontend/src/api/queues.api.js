import axiosClient from './axiosClient';

export function getQueues(params) {
  return axiosClient.get('/queues', { params });
}
export function createQueue(registrationId) {
  return axiosClient.post('/queues', { registrationId });
}
export function callQueue(id) {
  return axiosClient.put(`/queues/${id}/call`);
}
export function updateQueueStatus(id, status) {
  return axiosClient.put(`/queues/${id}/status`, { status });
}