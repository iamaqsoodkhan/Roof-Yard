export type ThemeMode = 'dark' | 'light';

export type OrderType = 'delivery' | 'takeaway' | 'dining';

export type PaymentMethod = 'cod' | 'pay_at_counter';

export type OrderStatus = 'confirmed' | 'cooking' | 'out_for_delivery' | 'delivered';

export interface MenuVariant {
  label: string;
  price: number;
}

export interface MenuAddon {
  id: string;
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image: string;
  variants?: MenuVariant[];
  addons?: MenuAddon[];
  featured?: boolean;
  popular?: boolean;
}

export interface CartItem {
  cartKey: string;
  itemId: string;
  name: string;
  image: string;
  variantLabel?: string;
  addonLabel?: string;
  unitPrice: number;
  quantity: number;
}

export interface KarachiArea {
  id: string;
  name: string;
  zone: string;
  lat: number;
  lng: number;
}

export interface OrderItemPayload {
  name: string;
  variant?: string;
  addon?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderType: OrderType;
  areaName: string;
  address: string;
  distanceKm: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  items: OrderItemPayload[];
  notes: string;
  createdAtMs: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  phone: string;
  savedArea: string;
  savedAddress: string;
}

export interface FlyingThumbnail {
  id: string;
  src: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}
