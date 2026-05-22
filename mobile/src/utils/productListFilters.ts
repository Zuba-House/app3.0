/**
 * Client-side filters for ProductList screen (aligned with home merchandising).
 */

import type { ProductListParams } from '../constants/routes';
import type { Product } from '../types/product.types';
import type { Category } from '../services/category.service';
import { filterPricedProducts } from './productDisplay';
import { getSaleInfo } from './productSaleInfo';

export function applyListFilter(products: Product[], params: ProductListParams): Product[] {
  let list = filterPricedProducts(products);
  const name = (params.categoryName || params.categoryFilter || '').trim().toLowerCase();

  if (params.categoryId) {
    list = list.filter((p) => {
      const cat = p.category;
      const id = typeof cat === 'object' ? (cat as Category)._id : String(cat ?? '');
      if (id === params.categoryId) return true;
      if (Array.isArray(p.categories)) {
        return p.categories.some((c) => String(c) === params.categoryId);
      }
      return false;
    });
  } else if (name) {
    list = list.filter((p) => {
      const cat = p.category;
      const catName =
        typeof cat === 'object' ? String((cat as Category).name ?? '').toLowerCase() : '';
      return catName.includes(name) || name.includes(catName);
    });
  }

  switch (params.filter) {
    case 'flash-sale':
    case 'sale': {
      const onSale = list.filter((p) => getSaleInfo(p).isOnSale);
      if (onSale.length >= 4) {
        list = onSale.sort(
          (a, b) => getSaleInfo(b).discountPercent - getSaleInfo(a).discountPercent
        );
      } else {
        const relaxed = list.filter(
          (p) =>
            getSaleInfo(p).isOnSale ||
            Number(p.salePrice ?? 0) > 0 ||
            Number((p as unknown as Record<string, unknown>).discount ?? 0) > 0
        );
        list = relaxed.length > 0 ? relaxed : list;
      }
      break;
    }
    case 'featured':
      list = list.filter((p) => Boolean(p.featured) || getSaleInfo(p).isOnSale);
      break;
    case 'new-arrivals':
      list = [...list].sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
      break;
    case 'trending':
      list = [...list].sort((a, b) => {
        const score = (p: Product) => {
          const row = p as unknown as Record<string, unknown>;
          return (
            Number(row.wishlistCount ?? 0) * 2 +
            Number(row.totalSales ?? 0) * 3 +
            Number(row.views ?? 0)
          );
        };
        return score(b) - score(a);
      });
      break;
    default:
      break;
  }

  if (params.sortBy === 'newest') {
    list = [...list].sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );
  }

  return list;
}

/** List screens with a filter need more than one API page — first page alone is often empty. */
export function listNeedsCatalogScan(params: ProductListParams): boolean {
  return Boolean(params.filter || params.categoryId || params.categoryName || params.categoryFilter);
}
