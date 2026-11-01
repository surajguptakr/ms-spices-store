export type PricedLine = { unitPrice: number; quantity: number };

export const FREE_SHIPPING_THRESHOLD = 999;
export const STANDARD_SHIPPING = 80;

export function calculatePricing(
  items: PricedLine[],
  options: { shippingFee?: number; freeShippingThreshold?: number } = {},
) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const threshold = options.freeShippingThreshold ?? FREE_SHIPPING_THRESHOLD;
  const fee = options.shippingFee ?? STANDARD_SHIPPING;
  const shipping = subtotal === 0 || subtotal >= threshold ? 0 : fee;
  return { subtotal, shipping, total: subtotal + shipping };
}

export function isCodServiceable(pinCode: string): boolean {
  return /^[1-9]\d{5}$/.test(pinCode);
}