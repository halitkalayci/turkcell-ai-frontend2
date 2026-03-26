import type { Request, Response } from 'express';
import { productStore } from '../store/productStore';
import type { CreateProductDto, UpdateProductDto } from '../types/dtos';

const REQUIRED_CREATE_FIELDS: (keyof CreateProductDto)[] = [
  'name',
  'price',
  'originalPrice',
  'discountPercentage',
  'rating',
  'reviewCount',
];

const isValidCreatePayload = (body: unknown): body is CreateProductDto => {
  if (typeof body !== 'object' || body === null) return false;
  return REQUIRED_CREATE_FIELDS.every(
    (field) => field in (body as Record<string, unknown>)
  );
};

const buildNotFoundBody = (id: string) => ({
  message: `Product with id "${id}" not found`,
});

const MISSING_FIELDS_MESSAGE =
  'Missing required fields: name, price, originalPrice, discountPercentage, rating, reviewCount';

export const getAll = (_req: Request, res: Response): void => {
  res.status(200).json(productStore.findAll());
};

export const getById = (req: Request, res: Response): void => {
  const product = productStore.findById(req.params.id);

  if (!product) {
    res.status(404).json(buildNotFoundBody(req.params.id));
    return;
  }

  res.status(200).json(product);
};

export const create = (req: Request, res: Response): void => {
  if (!isValidCreatePayload(req.body)) {
    res.status(400).json({ message: MISSING_FIELDS_MESSAGE });
    return;
  }

  const product = productStore.create(req.body);
  res.status(201).json(product);
};

export const update = (req: Request, res: Response): void => {
  if (!isValidCreatePayload(req.body)) {
    res.status(400).json({ message: MISSING_FIELDS_MESSAGE });
    return;
  }

  const product = productStore.replace(req.params.id, req.body as CreateProductDto);

  if (!product) {
    res.status(404).json(buildNotFoundBody(req.params.id));
    return;
  }

  res.status(200).json(product);
};

export const partialUpdate = (req: Request, res: Response): void => {
  const dto = req.body as UpdateProductDto;
  const product = productStore.update(req.params.id, dto);

  if (!product) {
    res.status(404).json(buildNotFoundBody(req.params.id));
    return;
  }

  res.status(200).json(product);
};

export const remove = (req: Request, res: Response): void => {
  const deleted = productStore.remove(req.params.id);

  if (!deleted) {
    res.status(404).json(buildNotFoundBody(req.params.id));
    return;
  }

  res.status(204).send();
};
