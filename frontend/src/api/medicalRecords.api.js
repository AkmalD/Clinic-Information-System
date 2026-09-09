import axiosClient from './axiosClient';

export function createMedicalRecord(data) {
  return axiosClient.post('/medical-records', data);
}
export function getMedicalRecordsByPatient(patientId) {
  return axiosClient.get(`/medical-records/${patientId}`);
}