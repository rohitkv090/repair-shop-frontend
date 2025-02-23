const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Clear auth state and redirect to login
        localStorage.clear();
        window.location.href = '/';
      }
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

import { CreateItemDto, Item, UpdateItemDto } from "@/app/types/item";

export const itemsApi = {
  createItem: (data: CreateItemDto) => 
    apiRequest<Item>('/items', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getAllItems: () => 
    apiRequest<Item[]>('/items'),

  getItem: (id: string) => 
    apiRequest<Item>(`/items/${id}`),

  updateItem: (id: string, data: UpdateItemDto) => 
    apiRequest<Item>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteItem: (id: string) => 
    apiRequest(`/items/${id}`, {
      method: 'DELETE'
    }),

  updateStock: (id: string, quantity: number) => 
    apiRequest<Item>(`/items/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    })
};