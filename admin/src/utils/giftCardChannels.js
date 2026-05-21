/** Gift card redeemable on mobile app */
export function giftCardHasMobile(card) {
  const ch = card?.allowedChannels || card?.channels;
  if (!Array.isArray(ch) || ch.length === 0) return true;
  return ch.includes('mobile');
}

export function giftCardIsAppExclusive(card) {
  const ch = card?.allowedChannels || card?.channels;
  return Array.isArray(ch) && ch.length === 1 && ch.includes('mobile');
}

export function giftCardPlatformLabel(card) {
  const ch = card?.allowedChannels || card?.channels;
  if (!Array.isArray(ch) || ch.length === 0) return 'Web + App';
  if (ch.length === 1 && ch.includes('mobile')) return 'App only';
  if (ch.includes('mobile') && ch.includes('web')) return 'Web + App';
  if (ch.includes('mobile')) return 'App';
  return 'Web';
}
