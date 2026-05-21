import * as WebBrowser from 'expo-web-browser';
import type { ProductListParams } from '../constants/routes';
import { lightHaptic } from '../utils/haptics';

type Nav = { navigate: (name: string, params?: object) => void };

export async function pressNavigate(nav: Nav, route: string, params?: object): Promise<void> {
  await lightHaptic();
  nav.navigate(route, params);
}

export function navigateToProductList(nav: Nav, params: ProductListParams): void {
  void pressNavigate(nav, 'ProductList', params);
}

export function navigateToProductDetail(nav: Nav, productId: string): void {
  void pressNavigate(nav, 'ProductDetail', { productId });
}

export function navigateToCategories(nav: Nav): void {
  void pressNavigate(nav, 'Categories');
}

export type PromoSlideAction = {
  id: string;
  title: string;
  title2?: string;
  subtitle?: string;
  link?: string;
};

export async function openBannerAction(nav: Nav, slide: PromoSlideAction): Promise<void> {
  await lightHaptic();
  const link = slide.link?.trim();
  if (link) {
    if (link.startsWith('zuba://')) {
      const path = link.replace('zuba://', '').toLowerCase();
      if (path.includes('cart')) {
        nav.navigate('Cart');
        return;
      }
      if (path.includes('flash') || path.includes('sale')) {
        navigateToProductList(nav, { filter: 'flash-sale', title: 'Flash Sale' });
        return;
      }
      if (path.includes('new')) {
        navigateToProductList(nav, { filter: 'new-arrivals', title: 'New Arrivals' });
        return;
      }
      const category = path.replace('category/', '').trim();
      if (category) {
        navigateToProductList(nav, { categoryName: category, title: category });
        return;
      }
    }
    if (link.startsWith('http://') || link.startsWith('https://')) {
      await WebBrowser.openBrowserAsync(link);
      return;
    }
    navigateToProductList(nav, { categoryName: link, title: link });
    return;
  }

  const hay = `${slide.title} ${slide.title2 ?? ''} ${slide.subtitle ?? ''}`.toUpperCase();
  if (hay.includes('FLASH')) {
    navigateToProductList(nav, { filter: 'flash-sale', title: 'Flash Sale', sortBy: 'sale' });
    return;
  }
  if (hay.includes('NEW ARRIVAL') || hay.includes('FRESH')) {
    navigateToProductList(nav, { filter: 'new-arrivals', title: 'New Arrivals', sortBy: 'newest' });
    return;
  }
  if (hay.includes('FREE SHIPPING')) {
    nav.navigate('Cart');
    return;
  }
  navigateToProductList(nav, { filter: 'featured', title: 'Shop Now' });
}
