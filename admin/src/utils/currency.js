/**
 * Currency formatting utility for admin panel
 */

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }

  const numAmount = parseFloat(amount);
  
  return numAmount.toLocaleString('en-US', {
    style: 'currency',
    currency: currency
  });
};

