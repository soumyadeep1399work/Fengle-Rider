export type OrderStatus = 'placed' | 'accepted' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod' | 'wallet';

export interface DeliveryItem {
  itemId: number;
  name: string;
  quantity: number;
  categoryName: string;
}

/** A delivery the rider is (or was) assigned to — an order, from the rider's side. */
export interface Delivery {
  id: number;
  status: OrderStatus;
  isClubbed: boolean;
  categoriesLabel: string;
  itemTotal: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  createdAt: string;
  readyAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  etaMinutes: number | null;
  /** Undefined until the backend exposes it — see reference-backend-dev-tools. */
  restaurantName: string | null;
  restaurantAddress: string | null;
  restaurantLat: number | null;
  restaurantLng: number | null;
  items: DeliveryItem[];
}

export type RiderStatus = 'active' | 'inactive' | 'suspended';

export type VehicleType = 'bike' | 'scooter' | 'bicycle' | 'car';

export interface RiderProfile {
  id: number;
  name: string | null;
  phone: string;
  vehicleType: VehicleType | null;
  vehicleNumber: string | null;
  status: RiderStatus;
  walletBalance: number;
}

export interface WalletLedgerEntry {
  id: number;
  entryType: 'credit' | 'debit';
  amount: number;
  reason: 'cod_collected' | 'settlement_payout' | 'settlement_deduction' | 'order_refund' | 'order_payment' | 'manual_adjustment';
  notes: string | null;
  createdAt: string;
}
