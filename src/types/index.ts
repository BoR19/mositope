export interface MenuItem {
  id: string;
  categoria: string;
  nombre: string;
  descripcion: string;
  notas?: string;
  precioBs: number;
  disponible: boolean;
  image: string;
  prepTime?: string;
  spicy?: number;
}

export interface CartItem extends MenuItem {
  qty: number;
}

export interface Table {
  id: number;
  name: string;
  seats: number;
  status: 'free' | 'occupied' | 'reserved' | 'por-pagar';
  currentOrder?: {
    id: string;
    items: (CartItem | OrderItem)[];
    total: number;
    time: string;
  } | null;
}

export interface OrderItem {
  id: string;
  nombre: string;
  precioBs: number;
  qty: number;
  categoria?: string;
}

export interface Order {
  id: string;
  tableId: number;
  tableName: string;
  items: OrderItem[];
  total: number;
  status: 'pendiente' | 'en-preparacion' | 'servido';
  time: string;
}

export interface WaiterCall {
  id: string;
  tableId: number;
  tableName: string;
  type: 'mozo' | 'cuenta';
  time: string;
}

export interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
}
