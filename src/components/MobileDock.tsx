import React from 'react';
import { Utensils, ShoppingBag, QrCode, ChefHat, Layers } from 'lucide-react';
import { Order, CartItem } from '../types/index.ts';

interface MobileDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cart: CartItem[];
  orders: Order[];
  onOpenCart: () => void;
  isCartOpen: boolean;
}

export const MobileDock: React.FC<MobileDockProps> = ({
  activeTab,
  onTabChange,
  cart,
  orders,
  onOpenCart,
  isCartOpen,
}) => {
  const totalCartCount = cart.reduce((s, i) => s + i.qty, 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'servido').length;

  const tabs = [
    { id: 'menu', label: 'Menú', icon: Utensils, isAction: false },
    { id: 'cart-tab', label: 'Carrito', icon: ShoppingBag, isAction: true },
    { id: 'tables', label: 'Mesas', icon: QrCode, isAction: false },
    { id: 'kitchen', label: 'Cocina', icon: ChefHat, isAction: false },
    { id: 'admin', label: 'Admin', icon: Layers, isAction: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[900] bg-[#1c1917]/95 backdrop-blur-xl border-t border-[#3a3632] flex md:hidden items-center justify-around px-2 py-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
      {tabs.map((tab) => {
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
            className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
              isActive ? 'text-[#ff7a00] font-bold' : 'text-[#a8a29e] hover:text-[#f5efe6]'
            }`}
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 mb-1 ${
                  tab.isAction && totalCartCount > 0 ? 'text-[#ff7a00]' : ''
                }`}
              />
              {tab.id === 'cart-tab' && totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1.5 min-w-[16px] h-4 bg-[#ff7a00] text-white rounded-full text-[9px] font-black flex items-center justify-center shadow">
                  {totalCartCount}
                </span>
              )}
              {tab.id === 'kitchen' && activeOrdersCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-amber-500 text-black rounded-full text-[9px] font-bold flex items-center justify-center">
                  {activeOrdersCount}
                </span>
              )}
            </div>
            <span className="leading-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
