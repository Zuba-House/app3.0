# Zuba House Mobile App - PRD

## Project Overview
**App Name:** Zuba House Mobile App  
**Platform:** React Native (Expo)  
**Backend:** https://zuba-api.onrender.com  
**Design Style:** TEMU-style, Minimalist, Professional

## Brand Identity
| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#0b2735` | Headers, text, buttons |
| Secondary | `#efb291` | Prices, accents, active states |
| Tertiary | `#e5e2db` | Backgrounds, borders |

## User Personas
1. **Fashion-conscious shoppers** - Looking for African fashion
2. **African diaspora** - Seeking cultural connection through fashion
3. **Value-conscious consumers** - Want quality at reasonable prices

---

## Features Implemented

### Core Features
- [x] Authentication (Login, Register, Password Reset)
- [x] Bottom Tab Navigation (Home, Search, Wishlist, Orders, Profile)
- [x] Product browsing and search
- [x] Shopping cart with quantity management
- [x] Wishlist functionality
- [x] Order history
- [x] User profile management

### Checkout Flow (Session 1)
- [x] Multi-step checkout (Address → Shipping → Payment → Review)
- [x] Address management with form validation
- [x] Stripe payment integration
- [x] Order confirmation with animations

### TEMU-Style Features (Session 2)
- [x] **Flash Sale** - Countdown timers, sold progress, urgency badges
- [x] **Daily Check-In** - Points rewards, streak system, modal UI
- [x] **Deal of the Day** - Featured product with countdown
- [x] **Trending Products** - Grid with trending badges, view counts
- [x] **Category Deals** - Category cards with discount badges
- [x] **Recently Viewed** - Auto-tracking of viewed products
- [x] **Referral Banner** - Share to earn rewards
- [x] **Free Shipping Banner** - Progress indicator
- [x] **Limited Stock Alert** - Urgency indicator

---

## File Structure

### New Components (Session 2)
```
/app/mobile/src/components/
├── FlashSale.tsx
├── DailyCheckIn.tsx
├── DealOfTheDay.tsx
├── TrendingProducts.tsx
├── CategoryDeals.tsx
├── RecentlyViewed.tsx
├── ReferralBanner.tsx
├── FreeShippingBanner.tsx
└── LimitedStock.tsx
```

### Checkout Screens (Session 1)
```
/app/mobile/src/screens/Checkout/
├── CheckoutScreen.tsx
├── PaymentScreen.tsx
└── OrderConfirmationScreen.tsx

/app/mobile/src/screens/Address/
└── AddAddressScreen.tsx
```

### Services
```
/app/mobile/src/services/
├── checkout.service.ts
└── address.service.ts
```

---

## Backlog

### P0 - Critical
- [ ] Configure Stripe live keys in backend
- [ ] Test end-to-end checkout flow

### P1 - High Priority
- [ ] Product variation selection UI (size, color)
- [ ] Push notifications
- [ ] Order tracking timeline
- [ ] Search autocomplete

### P2 - Medium Priority
- [ ] Review submission
- [ ] Advanced filters
- [ ] Price drop alerts
- [ ] Spin-the-wheel game

### P3 - Nice to Have
- [ ] Image search
- [ ] Voice search
- [ ] Dark mode
- [ ] Multi-language

---

## Technical Stack

| Technology | Version |
|------------|---------|
| Expo | ~54.0.0 |
| React Native | 0.81.5 |
| TypeScript | 5.3.3 |
| Redux Toolkit | 2.0.1 |
| React Navigation | 6.x |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/product/getAllProducts` | GET | Fetch products |
| `/api/cart/get` | GET | Get cart |
| `/api/cart/add` | POST | Add to cart |
| `/api/order/create` | POST | Create order |
| `/api/address` | GET/POST | Addresses |
| `/api/stripe/create-checkout-session` | POST | Payment |

---

## Session History

### Session 2 - Feb 22, 2026 (TEMU Features)
- Added 9 TEMU-style components
- Enhanced HomeScreen with all new sections
- Added RecentlyViewed tracking to ProductDetailScreen
- Updated README.md for mobile app

### Session 1 - Feb 22, 2026 (Core Features)
- Checkout flow implementation
- Address management
- Cart and Profile enhancements
- Cart badge in header

---

*Last Updated: Feb 22, 2026*
