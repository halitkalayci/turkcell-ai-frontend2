import { v4 as uuidv4 } from 'uuid';
import type { Product } from '../types/product';
import type { CreateProductDto, UpdateProductDto } from '../types/dtos';

const buildPlaceholderImageUrl = (name: string): string =>
  `https://placehold.co/300x300?text=${encodeURIComponent(name)}`;

const store: Product[] = [
  {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    name: 'Akıllı Telefon X',
    price: 22499,
    originalPrice: 24999,
    discountPercentage: 10,
    imageUrl: 'https://placehold.co/300x300?text=Telefon+X',
    rating: 4.5,
    reviewCount: 97,
  },
  {
    id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    name: 'Kablosuz Kulaklık Pro',
    price: 2799,
    originalPrice: 3499,
    discountPercentage: 20,
    imageUrl: 'https://placehold.co/300x300?text=Kulaklık+Pro',
    rating: 4.2,
    reviewCount: 64,
  },
  {
    id: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    name: 'Laptop Ultra 15',
    price: 47699,
    originalPrice: 52999,
    discountPercentage: 10,
    imageUrl: 'https://placehold.co/300x300?text=Laptop+Ultra',
    rating: 4.8,
    reviewCount: 152,
  },
  {
    id: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80',
    name: 'Tablet S10',
    price: 15937,
    originalPrice: 18750,
    discountPercentage: 15,
    imageUrl: 'https://placehold.co/300x300?text=Tablet+S10',
    rating: 4.0,
    reviewCount: 38,
  },
  {
    id: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8091',
    name: 'Akıllı Saat Z',
    price: 7649,
    originalPrice: 8999,
    discountPercentage: 15,
    imageUrl: 'https://placehold.co/300x300?text=Akıllı+Saat',
    rating: 3.9,
    reviewCount: 45,
  },
  {
    id: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f809102',
    name: 'Bluetooth Hoparlör',
    price: 1039,
    originalPrice: 1299,
    discountPercentage: 20,
    imageUrl: 'https://placehold.co/300x300?text=Hoparlör',
    rating: 4.3,
    reviewCount: 112,
  },
];

const findAll = (): Product[] => [...store];

const findById = (id: string): Product | undefined =>
  store.find((product) => product.id === id);

const create = (dto: CreateProductDto): Product => {
  const product: Product = {
    id: uuidv4(),
    name: dto.name,
    price: dto.price,
    originalPrice: dto.originalPrice,
    discountPercentage: dto.discountPercentage,
    imageUrl: dto.imageUrl ?? buildPlaceholderImageUrl(dto.name),
    rating: dto.rating,
    reviewCount: dto.reviewCount,
  };

  store.push(product);
  return product;
};

const replace = (id: string, dto: CreateProductDto): Product | undefined => {
  const index = store.findIndex((product) => product.id === id);
  if (index === -1) return undefined;

  const updated: Product = {
    id,
    name: dto.name,
    price: dto.price,
    originalPrice: dto.originalPrice,
    discountPercentage: dto.discountPercentage,
    imageUrl: dto.imageUrl ?? buildPlaceholderImageUrl(dto.name),
    rating: dto.rating,
    reviewCount: dto.reviewCount,
  };

  store[index] = updated;
  return updated;
};

const update = (id: string, dto: UpdateProductDto): Product | undefined => {
  const index = store.findIndex((product) => product.id === id);
  if (index === -1) return undefined;

  const existing = store[index];
  const updated: Product = {
    ...existing,
    ...dto,
    id,
  };

  store[index] = updated;
  return updated;
};

const remove = (id: string): boolean => {
  const index = store.findIndex((product) => product.id === id);
  if (index === -1) return false;

  store.splice(index, 1);
  return true;
};

export const productStore = { findAll, findById, create, replace, update, remove };
