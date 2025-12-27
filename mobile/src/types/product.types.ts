/**
 * Product Types
 * Matches the backend product model
 */

export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PENDING = 'pending',
}

export interface Attribute {
  _id: string;
  name: string;
  values: string[];
}

export interface ProductVariation {
  _id: string;
  attributes: Record<string, string>; // e.g., { "Color": "Red", "Size": "M" }
  price: number;
  salePrice?: number;
  stock: number;
  sku?: string;
  image?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string | Category;
  categories?: string[];
  sku?: string;
  stock: number;
  stockStatus: 'in_stock' | 'out_of_stock' | 'on_backorder';
  status: ProductStatus;
  productType: 'simple' | 'variable';
  attributes?: Attribute[];
  variations?: ProductVariation[];
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string;
  children?: Category[];
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'newest';
  page?: number;
  limit?: number;
}

