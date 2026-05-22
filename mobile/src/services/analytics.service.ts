/**
 * Analytics Service
 * Handles user behavior tracking and analytics
 */

import { postDataOptional } from './api';

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: Date;
}

class AnalyticsService {
  private userId: string | null = null;
  private sessionId: string | null = null;
  private enabled: boolean = false;

  /**
   * Initialize analytics
   */
  initialize(userId?: string) {
    this.userId = userId || null;
    this.enabled = true;
  }

  /**
   * Track an event
   */
  async track(event: string, properties?: Record<string, any>) {
    if (!this.enabled) return;

    try {
      const eventData: AnalyticsEvent = {
        event,
        properties: {
          ...properties,
          session_id: this.sessionId || properties?.session_id,
          platform: 'mobile',
          page: properties?.page || 'mobile_app',
          timestamp: new Date().toISOString(),
        },
        userId: this.userId || undefined,
      };

      const res = await postDataOptional('/api/analytics/track', eventData);
      if (__DEV__ && !res.ok && res.status !== 404) {
        console.log('[Analytics] skipped:', res.message || res.status);
      }
    } catch {
      // Never block UI for analytics
    }
  }

  /**
   * Track screen view
   */
  async screenView(screenName: string, properties?: Record<string, any>) {
    await this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Track product view
   */
  async productView(productId: string, productName: string, price?: number) {
    await this.track('product_view', {
      product_id: productId,
      product_name: productName,
      price,
    });
  }

  /**
   * Track add to cart
   */
  async addToCart(productId: string, productName: string, price: number, quantity: number = 1) {
    await this.track('add_to_cart', {
      product_id: productId,
      product_name: productName,
      price,
      quantity,
      value: price * quantity,
    });
  }

  /**
   * Track checkout start
   */
  async checkoutStart(cartValue: number, itemCount: number) {
    await this.track('checkout_start', {
      value: cartValue,
      item_count: itemCount,
    });
  }

  /**
   * Track purchase
   */
  async purchase(orderId: string, value: number, items: Array<{ id: string; name: string; price: number; quantity: number }>) {
    await this.track('purchase', {
      order_id: orderId,
      value,
      items,
      item_count: items.reduce((sum, item) => sum + item.quantity, 0),
    });
  }

  /**
   * Track search
   */
  async search(query: string, resultsCount?: number) {
    await this.track('search', {
      search_query: query,
      results_count: resultsCount,
    });
  }

  /**
   * Track category view
   */
  async categoryView(categoryId: string, categoryName: string) {
    await this.track('category_view', {
      category_id: categoryId,
      category_name: categoryName,
    });
  }

  /**
   * Track brand view
   */
  async brandView(brandId: string, brandName: string) {
    await this.track('brand_view', {
      brand_id: brandId,
      brand_name: brandName,
    });
  }

  /**
   * Register an active app session (heartbeat for admin metrics).
   */
  async sessionHeartbeat(sessionId: string) {
    this.sessionId = sessionId;
    await this.track('app_session', { session_id: sessionId });
  }

  setSessionId(sessionId: string | null) {
    this.sessionId = sessionId;
  }

  /**
   * Set user ID
   */
  setUserId(userId: string | null) {
    this.userId = userId;
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
