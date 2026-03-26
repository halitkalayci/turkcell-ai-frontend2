export interface CreateProductDto {
  name: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
}

export type UpdateProductDto = Partial<CreateProductDto>;
