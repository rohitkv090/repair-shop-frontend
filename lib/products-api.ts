import { apiRequest } from './api';
import { CreateProductDto, Product, UpdateProductDto } from '@/app/types/product';

export const productsApi = {
  createProduct: (data: CreateProductDto) => 
    apiRequest<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getAllProducts: () => 
    apiRequest<Product[]>('/products'),

  getProduct: (id: string) => 
    apiRequest<Product>(`/products/${id}`),

  updateProduct: (id: string, data: UpdateProductDto) => 
    apiRequest<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteProduct: (id: string) => 
    apiRequest(`/products/${id}`, {
      method: 'DELETE'
    })
};