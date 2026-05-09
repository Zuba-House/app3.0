import { CheckoutCustomerInfo, CheckoutValidationIssue } from '../types/checkout.types';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCheckoutCustomer(mode: 'authenticated' | 'guest', customer: CheckoutCustomerInfo): CheckoutValidationIssue[] {
  const issues: CheckoutValidationIssue[] = [];
  if (!customer.name.trim()) {
    issues.push({ field: 'name', message: 'Please add your full name.' });
  }
  if (!emailRegex.test(customer.email.trim())) {
    issues.push({ field: 'email', message: 'Please add a valid email.' });
  }
  const phoneDigits = customer.phone.replace(/\D/g, '');
  if (mode === 'guest' && phoneDigits.length < 7) {
    issues.push({ field: 'phone', message: 'Please add a valid phone number for guest checkout.' });
  }
  return issues;
}

