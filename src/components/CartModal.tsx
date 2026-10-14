import React, { useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, Send, CheckCircle2, Utensils, FileText, Sparkles, Layers } from 'lucide-react';
import { CartItem, Table, Order } from '../types/index.ts';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalMode: 'cart' | 'bill';
  cart: CartItem[];
  cartTotal: number;
  tables: Table[];
  currentTableId: number;
  activeOrder?: Order | null;
  onTableChange: (tableId: number) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onPlaceOrder: () => void;
  onPayment: (method: 'QR' | 'EFECTIVO') => void;
  cashAmount: string;
  setCashAmount: (val: string) => void;
  onViewMenu: () => void;
  onSwitchToBill?: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  modalMode,
  cart,
  cartTotal,
  tables,
  currentTableId,
  activeOrder,
  onTableChange,
  onUpdateQty,
  onRemoveItem,
  onPlaceOrder,
  onPayment,
  cashAmount,
  setCashAmount,
  onViewMenu,
  onSwitchToBill,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTable = tables.find(t => t.id === Number(currentTableId)) || tables[0];
  const isAdditionMode = Boolean(activeOrder && modalMode === 'cart');
  const itemsToShow = modalMode === 'bill' ? (activeOrder?.items || []) : cart;
  const totalToShow = modalMode === 'bill' ? (activeOrder?.total || 0) : cartTotal;
  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-sm flex justify-end animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container: fixed 100dvh for zero mobile overflow cut-off */}
      <div className="relative w-full max-w-[500px] bg-[#1c1917] h-[100dvh] max-h-[100dvh] flex flex-col justify-between border-l border-[#3a3632] shadow-2xl z-10 overflow-hidden">
        
        {/* Header (Always Visible) */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-[#3a3632] flex items-center justify-between bg-[#292524]">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              modalMode === 'bill' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : isAdditionMode 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-[#ff7a00]/20 text-[#ff7a00]'
            }`}>
              {modalMode === 'bill' ? <FileText className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-[17px] sm:text-[18px] font-serif font-bold text-[#f5efe6] leading-tight">
                {modalMode === 'bill' 
                  ? 'Cuenta de la Mesa' 
                  : isAdditionMode 
                    ? 'Adición a la Comanda' 
                    : 'Tu Pedido en Carrito'}
              </h3>
              <p className="text-[11px] text-[#a8a29e] flex items-center gap-1.5">
                <span>{currentTable?.name || `Mesa #${currentTableId}`}</span>
                {modalMode === 'cart' && totalItemsCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-[#ff7a00] font-semibold">{totalItemsCount} {totalItemsCount === 1 ? 'ítem' : 'ítems'}</span>
                  </>
                )}
                {isAdditionMode && (
                  <span className="text-amber-400 font-bold bg-amber-500/10 px-1.5 rounded">
                    Mesa con comanda activa
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1c1917] hover:bg-[#3a3632] text-[#a8a29e] hover:text-white transition-colors cursor-pointer"
            aria-label="Cerrar Carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-0 overscroll-contain">
          {/* Table Selector Box inside Cart so user can switch table easily */}
          <div className="bg-[#292524] p-3 rounded-xl border border-[#3a3632] flex items-center justify-between text-xs">
            <span className="text-[#a8a29e] font-medium">Mesa:</span>
            <select
              value={currentTableId}
              onChange={(e) => onTableChange(Number(e.target.value))}
              className="bg-[#1c1917] text-[#ff7a00] font-bold border border-[#3a3632] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#ff7a00] cursor-pointer"
            >
              {tables.map(t => (
                <option key={t.id} value={t.id}>
                  Mesa #{t.id} - {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active Order Notice if table has an active comanda */}
          {activeOrder && modalMode === 'cart' && (
            <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Mesa con Comanda Activa (Bs. {activeOrder.total.toFixed(2)})</span>
              </div>
              <p className="text-[11px] text-[#d6d3d1] leading-relaxed">
                Los nuevos platos o bebidas que agregues se enviarán como una <strong>adición a la misma comanda</strong> sin duplicar la mesa en cocina.
              </p>
            </div>
          )}

          {itemsToShow.length === 0 ? (
            <div className="text-center py-12 px-4 text-[#a8a29e]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#ff7a00]/15 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-[#ff7a00]" />
              </div>
              <p className="text-lg font-bold text-[#f5efe6] mb-1">
                {modalMode === 'bill' ? 'No hay consumos pendientes' : 'No tienes platos en el carrito'}
              </p>
              <p className="text-xs text-[#a8a29e] max-w-xs mx-auto mb-6 leading-relaxed">
                {modalMode === 'bill'
                  ? 'Esta mesa no tiene comandas pendientes de pago.'
                  : activeOrder
                    ? 'Tu comanda actual ya está registrada. Agrega nuevos platos o bebidas desde el menú para adicionarlos a tu mesa.'
                    : 'Explora nuestro menú tradicional y a la leña para añadir tus platos favoritos.'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onViewMenu();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#ff7a00] hover:bg-[#ff8c1a] text-white font-bold text-sm shadow-lg transition-transform active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Utensils className="w-4 h-4" /> Ver Menú Completo
                </button>
                {activeOrder && onSwitchToBill && modalMode === 'cart' && (
                  <button
                    onClick={onSwitchToBill}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#292524] hover:bg-[#3a3632] text-emerald-400 font-bold text-sm border border-emerald-500/30 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" /> Ver Cuenta Activa (Bs. {activeOrder.total.toFixed(2)})
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Items List */}
              <div className="space-y-2.5">
                {itemsToShow.map((item: any, index: number) => (
                  <div
                    key={item.id || index}
                    className="flex items-center justify-between bg-[#292524] p-3.5 sm:p-4 rounded-[16px] border border-[#3a3632] gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[13px] sm:text-[14px] font-bold text-[#f5efe6] truncate">
                          {item.nombre}
                        </h4>
                        {item.isAddition && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                            Adición
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#ff7a00] font-extrabold">
                          Bs. {(item.precioBs * item.qty).toFixed(2)}
                        </span>
                        <span className="text-[11px] text-[#a8a29e]">
                          (Bs. {item.precioBs.toFixed(2)} c/u)
                        </span>
                      </div>
                    </div>

                    {modalMode === 'cart' ? (
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1c1917] px-2 py-1.5 rounded-xl border border-[#3a3632] shrink-0">
                        {item.qty === 1 ? (
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                            title="Eliminar del carrito"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onUpdateQty(item.id, -1)}
                            className="p-1 text-[#a8a29e] hover:text-white transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="text-xs sm:text-sm font-bold w-5 text-center text-[#f5efe6]">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => onUpdateQty(item.id, 1)}
                          className="p-1 text-[#ff7a00] hover:text-[#ff8c1a] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-[#a8a29e] bg-[#1c1917] px-2.5 py-1 rounded-lg border border-[#3a3632]">
                        {item.qty}x
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Bill Details if mode is bill */}
              {modalMode === 'bill' && (
                <div className="pt-4 space-y-5 border-t border-[#3a3632]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff7a00]">
                    Seleccione Método de Pago
                  </h4>

                  {/* Pago con QR */}
                  <div className="bg-[#292524] p-4 rounded-2xl border border-[#3a3632] space-y-3 text-center">
                    <span className="text-xs font-bold text-[#f5efe6] block">Pago con QR Simple / Banco Sol</span>
                    <div className="bg-white p-3 rounded-xl w-36 h-36 mx-auto flex items-center justify-center shadow">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`PAGO_MESA_${currentTableId}_TOTAL_${totalToShow.toFixed(2)}`)}`}
                        alt="QR Pago"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[11px] text-[#a8a29e]">
                      Escanea desde cualquier app bancaria de Bolivia (Simple QR)
                    </p>
                    <button
                      onClick={() => onPayment('QR')}
                      className="w-full py-2.5 rounded-[12px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow cursor-pointer transition-colors"
                    >
                      Confirmar Pago con QR (Bs. {totalToShow.toFixed(2)})
                    </button>
                  </div>

                  {/* Pago en Efectivo */}
                  <div className="bg-[#292524] p-4 rounded-2xl border border-[#3a3632] space-y-3">
                    <span className="text-xs font-bold text-[#f5efe6] block text-center">
                      Pago en Efectivo (con Mozo / Caja)
                    </span>
                    <input
                      type="number"
                      placeholder="Monto entregado en Bs."
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="w-full bg-[#1c1917] border border-[#3a3632] rounded-xl px-4 py-2 text-sm text-[#f5efe6] focus:outline-none focus:border-emerald-500"
                    />
                    {cashAmount && Number(cashAmount) >= totalToShow && (
                      <p className="text-emerald-400 font-bold text-center text-xs">
                        Cambio a devolver: Bs. {(Number(cashAmount) - totalToShow).toFixed(2)}
                      </p>
                    )}
                    <button
                      onClick={() => onPayment('EFECTIVO')}
                      disabled={!cashAmount || Number(cashAmount) < totalToShow}
                      className="w-full py-2.5 rounded-[12px] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer transition-colors"
                    >
                      Confirmar Pago en Efectivo
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Bottom Footer: GUARANTEED VISIBLE ON MOBILE */}
        {itemsToShow.length > 0 && modalMode === 'cart' && (
          <div className="shrink-0 p-4 sm:p-5 bg-[#292524] border-t border-[#3a3632] shadow-[0_-8px_25px_rgba(0,0,0,0.5)] space-y-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-5">
            {/* Total Row */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#a8a29e] block">
                  {isAdditionMode ? 'Total de esta adición' : 'Total a Pagar'}
                </span>
                <span className="text-xs text-amber-400 font-medium">
                  {totalItemsCount} {totalItemsCount === 1 ? 'plato' : 'platos'} nuevos
                </span>
              </div>
              <div className="text-right">
                <span className="text-[20px] sm:text-[22px] font-black text-[#ff7a00] font-sans">
                  Bs. {totalToShow.toFixed(2)}
                </span>
                {isAdditionMode && activeOrder && (
                  <span className="text-[10px] text-[#a8a29e] block">
                    Total comanda final: Bs. {(activeOrder.total + totalToShow).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Prominent Send Order / Addition Button */}
            <button
              onClick={onPlaceOrder}
              disabled={cart.length === 0}
              className="w-full py-3.5 sm:py-4 px-4 rounded-[16px] bg-gradient-to-r from-[#ff7a00] via-[#ff8c1a] to-[#ff7a00] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 text-white font-extrabold text-[15px] sm:text-[16px] shadow-[0_6px_25px_rgba(255,122,0,0.5)] flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-white/20"
            >
              <Send className="w-5 h-5 text-white animate-pulse" />
              <span>{isAdditionMode ? 'Enviar Adición a Cocina' : 'Enviar Pedido a Cocina'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
