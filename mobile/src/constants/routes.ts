/**
 * Navigation route params shared across stack screens.
 */

export type ProductListFilter =
  | 'flash-sale'
  | 'new-arrivals'
  | 'trending'
  | 'featured'
  | 'sale';

export type ProductListParams = {
  title?: string;
  subtitle?: string;
  categoryId?: string;
  categoryName?: string;
  categoryFilter?: string;
  filter?: ProductListFilter;
  sortBy?: 'newest' | 'trending' | 'sale' | 'price_asc' | 'price_desc';
};

export type CategoriesParams = undefined;

export type SettingsParams = undefined;
