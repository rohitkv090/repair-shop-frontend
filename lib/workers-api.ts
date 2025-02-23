import { apiRequest } from './api';

export interface Worker {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface CreateWorkerDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateWorkerDto {
  name?: string;
  email?: string;
  password?: string;
}

export const workersApi = {
  getAllWorkers: () => 
    apiRequest<Worker[]>('/workers'),

  getWorker: (id: number) => 
    apiRequest<Worker>(`/workers/${id}`),

  createWorker: (data: CreateWorkerDto) => 
    apiRequest<Worker>('/workers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateWorker: (id: number, data: UpdateWorkerDto) => 
    apiRequest<Worker>(`/workers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteWorker: (id: number) => 
    apiRequest(`/workers/${id}`, {
      method: 'DELETE'
    })
};