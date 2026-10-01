import { apiFetch } from './client';
import { Delivery, DeliveryItem, OrderStatus, PaymentMethod } from '../types';

// Money columns arrive as decimal strings.
const num = (v: unknown) => Number(v ?? 0);

function mapDelivery(o: any): Delivery {
  const items: DeliveryItem[] = (o.items ?? [])
    .filter((i: any) => i.status === undefined || i.status === 'confirmed')
    .map((i: any) => ({
      itemId: Number(i.item_id),
      name: String(i.name),
      quantity: Number(i.quantity),
      categoryName: String(i.category_name ?? ''),
    }));
  return {
    id: Number(o.id),
    status: o.status as OrderStatus,
    isClubbed: Boolean(o.is_clubbed),
    categoriesLabel: String(o.category_name ?? ''),
    itemTotal: num(o.item_total),
    grandTotal: num(o.grand_total),
    paymentMethod: o.payment_method as PaymentMethod,
    deliveryAddress: String(o.delivery_address ?? ''),
    deliveryLat: num(o.delivery_lat),
    deliveryLng: num(o.delivery_lng),
    createdAt: String(o.created_at),
    readyAt: o.ready_at ?? null,
    pickedUpAt: o.picked_up_at ?? null,
    deliveredAt: o.delivered_at ?? null,
    etaMinutes: o.eta_minutes ?? null,
    // Not on the order payload yet — see reference-backend-dev-tools memory.
    // Mapped optimistically so the UI lights up the moment the backend adds them.
    restaurantName: o.restaurant_name ?? null,
    restaurantAddress: o.restaurant_address ?? null,
    restaurantLat: o.restaurant_lat != null ? num(o.restaurant_lat) : null,
    restaurantLng: o.restaurant_lng != null ? num(o.restaurant_lng) : null,
    customerPhone: o.customer_phone ?? null,
    items,
  };
}

/** All of this rider's orders (any status) — filtered client-side into active/history. */
export async function fetchMyDeliveries(): Promise<Delivery[]> {
  const { orders } = await apiFetch<{ orders: any[] }>('/orders');
  return orders.map(mapDelivery);
}

export function markPickedUp(id: number) {
  return apiFetch<{ message: string; eta_minutes: number }>(`/orders/${id}/picked-up`, { method: 'POST', body: {} });
}

export function markOnTheWay(id: number) {
  return apiFetch<{ message: string }>(`/orders/${id}/on-the-way`, { method: 'POST', body: {} });
}

/**
 * `deliveryOtp` is the code the customer reads out at drop-off (never sent to the rider).
 * `codAmountCollected` is required and must exactly equal grandTotal for a COD order.
 */
export function markDelivered(id: number, deliveryOtp: string, codAmountCollected?: number) {
  return apiFetch<{ message: string }>(`/orders/${id}/delivered`, {
    method: 'POST',
    body: {
      delivery_otp: deliveryOtp,
      ...(codAmountCollected != null ? { cod_amount_collected: codAmountCollected } : {}),
    },
  });
}
