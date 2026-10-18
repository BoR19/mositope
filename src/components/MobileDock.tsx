import React from 'react';
import { Utensils, ShoppingBag, QrCode, ChefHat, Layers, Lock } from 'lucide-react';
import { Order, CartItem } from '../types/index.ts';

interface MobileDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cart: CartItem[];
  orders: Order[];
  waiterCallsCount?: number;
  onOpenCart: () => void;
  isCartOpen: boolean;
  isStaffAuthenticated?: boolean;
}

export const MobileDock: React.FC<MobileDockProps> = ({
  activeTab,
  onTabChange,
  cart,
  orders,
  waiterCallsCount = 0,
  onOpenCart,
  isCartOpen,
  isStaffAuthenticated = false,
}) => {
  const totalCartCount = cart.reduce((s, i) => s + i.qty, 0);
  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'pagado' && o.status !== 'cancelado' && o.status !== 'servido'
  ).length;

  // Lista de todas las secciones disponibles en la aplicación
  const allTabs = [
    { id: 'menu', label: 'Menú', icon: Utensils, isAction: false, isStaff: false },
    { id: 'cart-tab', label: 'Carrito', icon: ShoppingBag, isAction: true, isStaff: false },
    { id: 'tables', label: 'Mesas', icon: QrCode, isAction: false, isStaff: true },
    { id: 'kitchen', label: 'Cocina', icon: ChefHat, isAction: false, isStaff: true },
    { id: 'admin', label: 'Admin', icon: Layers, isAction: false, isStaff: true },
  ];

  /**
   * REGLAS DE ACCESO PARA LA BARRA DE NAVEGACIÓN INFERIOR (BottomNav):
   * 
   * 1. SI EL USUARIO ES CLIENTE (Ingresó por QR de mesa sin sesión de personal activa):
   *    - Muestra ÚNICAMENTE los botones de "Menú" y "Carrito".
   *    - Oculta por completo los botones de "Mesas", "Cocina" y "Admin" para que el cliente no tenga distracciones
   *      ni intente acceder a áreas restringidas.
   * 
   * 2. SI EL USUARIO ES PERSONAL / ADMIN (Inició sesión con PIN o rol autorizado):
   *    - Muestra la barra completa: "Menú", "Carrito", "Mesas", "Cocina" y "Admin".
   */
  const visibleTabs = isStaffAuthenticated
    ? allTabs
    : allTabs.filter((tab) => !tab.isStaff);

  return (
    <nav 
      aria-label="Barra de navegación inferior"
      className="fixed bottom-0 left-0 right-0 z-[900] bg-[#1c1917]/95 backdrop-blur-xl border-t border-[#3a3632] flex md:hidden items-center justify-around px-3 py-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
    >
      <div 
        className={`w-full flex items-center transition-all duration-200 ${
          isStaffAuthenticated 
            ? 'justify-around gap-1' 
            : 'justify-center gap-4 sm:gap-6 max-w-sm mx-auto'
        }`}
      >
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.isAction ? isCartOpen : activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.isAction) {
                  onOpenCart();
                } else {
                  onTabChange(tab.id);
                }
              }}
              className={`relative flex-1 flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer active:scale-95 ${
                !isStaffAuthenticated 
                  ? 'py-2 px-4 max-w-[170px]' 
                  : 'py-1.5 px-1'
              } ${
                isActive
                  ? 'text-[#ff7a00] font-bold bg-[#ff7a00]/10 border border-[#ff7a00]/30 shadow-sm'
                  : 'text-[#a8a29e] hover:text-[#f5efe6] border border-transparent hover:bg-[#292524]/60'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 mb-1 transition-transform ${
                    isActive 
                      ? 'text-[#ff7a00]' 
                      : tab.isAction && totalCartCount > 0 
                      ? 'text-[#ff7a00]' 
                      : ''
                  }`}
                />
                
                {/* Candado informativo si aplica */}
                {tab.isStaff && !isStaffAuthenticated && (
                  <span className="absolute -top-1.5 -left-1.5 p-0.5 rounded-full bg-[#292524] text-stone-400 border border-[#3a3632]">
                    <Lock className="w-2.5 h-2.5 text-stone-400" />
                  </span>
                )}

                {/* Badge con la cantidad de platos/bebidas en el carrito */}
                {tab.id === 'cart-tab' && totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 min-w-[16px] h-4 bg-[#ff7a00] text-white rounded-full text-[9px] font-black flex items-center justify-center shadow animate-pulse">
                    {totalCartCount}
                  </span>
                )}

                {/* Badge de comandas activas para Cocina (solo en vista de personal) */}
                {tab.id === 'kitchen' && activeOrdersCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-amber-500 text-black rounded-full text-[9px] font-bold flex items-center justify-center shadow">
                    {activeOrdersCount}
                  </span>
                )}

                {/* Badge de llamados al mozo para Admin/Mesas (solo en vista de personal) */}
                {tab.id === 'admin' && waiterCallsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow animate-pulse">
                    {waiterCallsCount}
                  </span>
                )}
              </div>
              <span className={`leading-tight ${!isStaffAuthenticated ? 'text-[12px] font-semibold' : 'text-[10px] font-semibold'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Alias de exportación para compatibilidad
export const BottomNav = MobileDock;
export default MobileDock;
