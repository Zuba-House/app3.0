# Zuba House Mobile App

A modern, TEMU-style e-commerce mobile application built with React Native (Expo) for the Zuba House fashion marketplace.

## Features

### Core Shopping Features
- **Home Screen** - Promotional banners, categories, brands, product sections
- **Product Search** - TEMU-style layout with category sidebar
- **Product Details** - Full product info, images, add to cart
- **Shopping Cart** - Quantity management, checkout navigation
- **Wishlist** - Save favorite products
- **Order History** - View past orders

### TEMU-Style Features
- **Flash Sale** - Countdown timers with urgency indicators
- **Daily Check-In** - Points rewards for daily visits
- **Deal of the Day** - Featured product with big discount
- **Trending Products** - Popular items with view counts
- **Category Deals** - Browse deals by category
- **Recently Viewed** - Quick access to browsed products
- **Referral System** - Share and earn rewards
- **Free Shipping Progress** - Visual indicator for threshold
- **Limited Stock Alerts** - Urgency notifications

### Checkout Flow
- Multi-step checkout (Address → Shipping → Payment → Review)
- Address management with form validation
- Stripe payment integration
- Order confirmation with animations

### Authentication
- Email/password registration
- Login with JWT tokens
- Password reset flow
- Guest browsing mode

## Tech Stack

- **Framework**: React Native 0.81.5 (Expo ~54.0.0)
- **Navigation**: React Navigation 6.x
- **State Management**: Redux Toolkit 2.0.1
- **UI Components**: React Native Paper 5.11.3
- **Images**: Expo Image 3.0.11
- **Animations**: React Native Reanimated 4.1.1
- **Language**: TypeScript 5.3.3

## Backend API

The app connects to the Zuba House backend API:
- **Base URL**: `https://zuba-api.onrender.com`
- **Authentication**: JWT tokens
- **Data**: Shared with Zuba House website

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#0b2735` | Headers, text, buttons |
| Secondary | `#efb291` | Prices, accents, active states |
| Tertiary | `#e5e2db` | Backgrounds, borders |

## Project Structure

```
mobile/
├── src/
│   ├── screens/
│   │   ├── Auth/           # Login, Register, Password Reset
│   │   ├── Home/           # Main product browsing
│   │   ├── Search/         # Product search with sidebar
│   │   ├── Products/       # Product detail page
│   │   ├── Cart/           # Shopping cart
│   │   ├── Checkout/       # Checkout flow screens
│   │   ├── Address/        # Address management
│   │   ├── Wishlist/       # Saved products
│   │   ├── Orders/         # Order history
│   │   ├── Profile/        # User account
│   │   └── Brands/         # Brand listing
│   ├── components/
│   │   ├── ProductCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FlashSale.tsx
│   │   ├── DailyCheckIn.tsx
│   │   ├── DealOfTheDay.tsx
│   │   ├── TrendingProducts.tsx
│   │   ├── CategoryDeals.tsx
│   │   ├── RecentlyViewed.tsx
│   │   ├── ReferralBanner.tsx
│   │   ├── FreeShippingBanner.tsx
│   │   ├── LimitedStock.tsx
│   │   └── SplashScreen.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   ├── checkout.service.ts
│   │   ├── address.service.ts
│   │   └── wishlist.service.ts
│   ├── store/
│   │   └── slices/
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── constants/
│   │   ├── config.ts
│   │   └── colors.ts
│   └── types/
├── assets/
│   └── brands/
├── app.json
└── package.json
```

## Getting Started

### Prerequisites
- Node.js >= 18.x
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go App (for testing on physical devices)

### Installation

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run android  # Android
npm run ios      # iOS (macOS only)
npm run web      # Web preview
```

### Environment Setup

The app uses environment variables for configuration:

```env
# API Configuration
API_URL=https://zuba-api.onrender.com
```

## Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/product/getAllProducts` | GET | Fetch all products |
| `/api/cart/get` | GET | Get user cart |
| `/api/cart/add` | POST | Add item to cart |
| `/api/order/create` | POST | Create new order |
| `/api/address` | GET/POST | Address management |
| `/api/stripe/create-checkout-session` | POST | Stripe payment |

## Development Workflow

### Adding a New Feature
1. Create screen in `src/screens/[Feature]/`
2. Add service methods in `src/services/`
3. Add navigation route in `AppNavigator.tsx`
4. Add TypeScript types as needed
5. Style with brand colors

### Styling Guidelines
- Use brand colors from `constants/colors.ts`
- Follow TEMU-style minimalist design
- Include smooth animations
- Ensure responsive layouts

## Screenshots

### Home Screen
- Promotional banner carousel
- Daily check-in banner
- Flash sale with countdown
- Deal of the day
- Category deals
- Trending products

### Checkout Flow
- Address selection
- Shipping method
- Payment via Stripe
- Order confirmation

## Testing

```bash
# TypeScript check
npx tsc --noEmit

# Build for web
npx expo export --platform web
```

## Version

- **App Version**: 1.0.0
- **Expo SDK**: ~54.0.0
- **React Native**: 0.81.5

## License

Proprietary - Zuba House

## Contact

For support: support@zubahouse.com
