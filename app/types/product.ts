export interface Product {
  id: string;
  name: string;
}

export interface CreateProductDto {
  name: string;
}

export type UpdateProductDto = CreateProductDto;