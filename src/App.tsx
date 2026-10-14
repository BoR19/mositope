import React, { useState, useEffect, useMemo } from 'react';
import { 
  Utensils, QrCode, ShoppingBag, Clock, Sparkles, AlertCircle, 
  ChefHat, Layers, Award, Bell, FileText, CheckCheck, LogIn, LogOut
} from 'lucide-react';
import { db, auth, googleProvider } from './firebase.ts';
import { collection, onSnapshot, addDoc, updateDoc, doc, setDoc } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

import { MENU_CATEGORIAS, INITIAL_MENU, INITIAL_TABLES } from './data/menuData.ts';
import { MenuItem, CartItem, Table, Order, OrderItem, WaiterCall, NotificationState } from './types/index.ts';
import { ProductCard } from './components/ProductCard.tsx';
import { CartModal } from './components/CartModal.tsx';
import { FloatingCartBar } from './components/FloatingCartBar.tsx';
import { MobileDock } from './components/MobileDock.tsx';
import { QrModal } from './components/QrModal.tsx';
import { ActiveOrderBanner } from './components/ActiveOrderBanner.tsx';

export default function App() {
  // Authentication & Core Data States
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('menu'); 
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  
  // UI & Interaction States
  const [currentTableId, setCurrentTableId] = useState<number>(2);
  const [customerModalOpen, setCustomerModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'cart' | 'bill'>('cart');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [qrModalTable, setQrModalTable] = useState<Table | null>(null);
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);

  // Show Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Firebase Real-time Subscriptions
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const unsubscribeOrders = onSnapshot(collection(db, 'pedidos'), (snapshot) => {
      const liveOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      setOrders(liveOrders);

      // Auto-update table occupied status based on active orders (until order is paid or cancelled)
      setTables(prev => prev.map(t => {
        const tableActiveOrder = liveOrders.find(o => o.tableId === t.id && o.status !== 'pagado' && o.status !== 'cancelado');
        if (tableActiveOrder) {
          const status = tableActiveOrder.status === 'por-pagar' ? 'por-pagar' : 'occupied';
          return { ...t, status, currentOrder: tableActiveOrder };
        }
        return { ...t, status: 'free', currentOrder: null };
      }));
    }, (error) => {
      console.warn("Pedidos snapshot listener error:", error);
    });

    const unsubscribeMenu = onSnapshot(collection(db, 'menu'), async (snapshot) => {
      const existingIds = new Set(snapshot.docs.map(d => d.id));
      for (const item of INITIAL_MENU) {
        if (!existingIds.has(item.id)) {
          try {
            await setDoc(doc(db, 'menu', item.id), item);
          } catch (e) {
            console.error("Error al sembrar ítem de menú:", e);
          }
        }
      }
      if (snapshot.docs.length > 0) {
        setMenu(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)));
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMenu();
      unsubscribeOrders();
    };
  }, []);

  // Detect Mesa from URL query params (e.g. ?mesa=3)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mesaParam = params.get('mesa');
    if (mesaParam) {
      const tableId = Number(mesaParam);
      if (tables.some(t => t.id === tableId)) {
        setCurrentTableId(tableId);
      }
    }
  }, [tables]);

  // Active Order for Current Selected Table
  const activeOrderForCurrentTable = useMemo(() => {
    return orders.find(
      o => o.tableId === Number(currentTableId) && 
      o.status !== 'pagado' && 
      o.status !== 'cancelado'
    ) || null;
  }, [orders, currentTableId]);

  // Cart Calculations & Handlers
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.precioBs * item.qty), 0);
  }, [cart]);

  const addToCart = (product: MenuItem) => {
    if (!product.disponible) {
      showToast('Este producto no está disponible en este momento.', 'error');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`Agregado: ${product.nombre}`);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    showToast('Producto eliminado del carrito');
  };

  // Place Order or Send Addition to Firestore (prevents duplicate orders per table until paid)
  const placeOrder = async () => {
    if (cart.length === 0) return;
    const tableObj = tables.find(t => t.id === Number(currentTableId)) || tables[0];
    
    // Check if table already has an active order in progress
    const existingOrder = orders.find(
      o => o.tableId === tableObj.id && 
      o.status !== 'pagado' && 
      o.status !== 'cancelado'
    );

    if (existingOrder) {
      // ADICIÓN: Merge seamlessly into existing order so kitchen comanda is unified without duplicate cards!
      try {
        const additionItems: OrderItem[] = cart.map(item => ({
          id: item.id,
          nombre: item.nombre,
          precioBs: item.precioBs,
          qty: item.qty,
          categoria: item.categoria,
          isAddition: true
        }));

        const updatedItems = [...existingOrder.items, ...additionItems];
        const updatedTotal = Number((existingOrder.total + cartTotal).toFixed(2));

        await updateDoc(doc(db, 'pedidos', existingOrder.id), {
          items: updatedItems,
          total: updatedTotal,
          hasAddition: true,
          additionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        setCart([]);
        setCustomerModalOpen(false);
        showToast(`¡Adición enviada a cocina para ${tableObj.name}! 🍲`);
      } catch (error) {
        console.error("Error al enviar adición:", error);
        showToast("Hubo un error al enviar la adición. Intenta de nuevo.", "error");
      }
    } else {
      // NUEVA COMANDA PARA MESA LIBRE
      const newOrder = {
        tableId: tableObj.id,
        tableName: tableObj.name,
        items: cart.map(item => ({
          id: item.id,
          nombre: item.nombre,
          precioBs: item.precioBs,
          qty: item.qty,
          categoria: item.categoria
        })),
        total: Number(cartTotal.toFixed(2)),
        status: 'pendiente',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now()
      };

      try {
        await addDoc(collection(db, 'pedidos'), newOrder);
        setCart([]);
        setCustomerModalOpen(false);
        showToast(`¡Pedido de ${tableObj.name} enviado a cocina con éxito! 🍲`);
      } catch (error) {
        console.error("Error al enviar pedido:", error);
        showToast("Hubo un error al enviar el pedido. Intenta de nuevo.", "error");
      }
    }
  };

  // Cancel order (allowed before kitchen starts cooking)
  const cancelOrder = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'pedidos', orderId), {
        status: 'cancelado'
      });
      showToast('Comanda cancelada con éxito. La mesa ha quedado libre.');
    } catch (e) {
      console.error("Error al cancelar comanda:", e);
      showToast("Error al cancelar la comanda", "error");
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'pedidos', orderId), { status: newStatus });
      showToast(`Pedido actualizado a: ${newStatus}`);
    } catch (e) {
      console.error("Error updating status:", e);
      showToast("Error al actualizar estado", "error");
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'menu', id), { disponible: !currentStatus });
      showToast(`Estado de disponibilidad actualizado.`);
    } catch (e) {
      console.error("Error toggling availability:", e);
      showToast("Error al actualizar disponibilidad", "error");
    }
  };

  const callWaiter = (table: Table) => {
    const newCall: WaiterCall = {
      id: `CALL-${Date.now()}`,
      tableId: table.id,
      tableName: table.name,
      type: 'mozo',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setWaiterCalls(prev => [newCall, ...prev]);
    showToast(`Llamada de mozo enviada para ${table.name}. ¡Un mozo viene en camino!`);
  };

  const requestBill = async (table: Table) => {
    const newCall: WaiterCall = {
      id: `CALL-${Date.now()}`,
      tableId: table.id,
      tableName: table.name,
      type: 'cuenta',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setWaiterCalls(prev => [newCall, ...prev]);

    // Update order status to 'por-pagar' in Firestore if active order exists
    const activeOrder = orders.find(
      o => o.tableId === table.id && 
      o.status !== 'pagado' && 
      o.status !== 'cancelado'
    );
    if (activeOrder && activeOrder.status !== 'por-pagar') {
      try {
        await updateDoc(doc(db, 'pedidos', activeOrder.id), { status: 'por-pagar' });
      } catch (e) {
        console.warn("Error setting status por-pagar:", e);
      }
    }

    setModalMode('bill');
    setCustomerModalOpen(true);
  };

  // Payment Confirmation & Table Liberation in Firestore
  const handlePayment = async (method: 'QR' | 'EFECTIVO') => {
    const tableObj = tables.find(t => t.id === Number(currentTableId)) || tables[0];
    const activeOrder = orders.find(
      o => o.tableId === tableObj.id && 
      o.status !== 'pagado' && 
      o.status !== 'cancelado'
    );

    if (activeOrder) {
      try {
        await updateDoc(doc(db, 'pedidos', activeOrder.id), {
          status: 'pagado',
          paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          paymentMethod: method
        });
        setCustomerModalOpen(false);
        setCashAmount('');
        showToast(`¡Pago con ${method} confirmado! Mesa #${tableObj.id} liberada. ¡Muchas gracias! ✨`);
      } catch (e) {
        console.error("Error al registrar pago:", e);
        showToast("Error al registrar pago", "error");
      }
    } else {
      setCustomerModalOpen(false);
      setCashAmount('');
      showToast(`Pago procesado. ¡Muchas gracias por su preferencia! ✨`);
    }
  };

  // Staff function to collect & liberate table immediately
  const liberateTable = async (tableId: number) => {
    const orderToPay = orders.find(
      o => o.tableId === tableId && 
      o.status !== 'pagado' && 
      o.status !== 'cancelado'
    );

    if (orderToPay) {
      try {
        await updateDoc(doc(db, 'pedidos', orderToPay.id), {
          status: 'pagado',
          paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          paymentMethod: 'EFECTIVO'
        });
        showToast(`Mesa #${tableId} cobrada y liberada con éxito.`);
      } catch (e) {
        console.error("Error al liberar mesa:", e);
        showToast("Error al liberar mesa", "error");
      }
    } else {
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'free', currentOrder: null } : t));
      showToast(`Mesa #${tableId} está libre.`);
    }
  };

  // Robust QR Printing with Iframe Fallback
  const printQRCode = (table: Table) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://mositope.vercel.app/?mesa=${table.id}`)}`;
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      // Fallback for mobile browsers or popup blocker
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Imprimir QR - ${table.name}</title>
              <style>
                body { font-family: system-ui, sans-serif; text-align: center; padding: 30px; }
                .card { border: 2px dashed #333; padding: 25px; border-radius: 16px; max-width: 320px; margin: 0 auto; }
                img { width: 220px; height: 220px; margin: 15px auto; }
                h1 { font-size: 20px; margin: 0; }
                p { font-size: 14px; color: #555; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>El Churo Mosito</h1>
                <p><strong>${table.name}</strong></p>
                <img src="${qrUrl}" alt="QR Mesa ${table.id}" />
                <p>Escanee para ordenar desde su smartphone</p>
              </div>
              <script>
                window.onload = function() {
                  window.focus();
                  window.print();
                };
              </script>
            </body>
          </html>
        `);
        doc.close();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 3000);
      }
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Imprimir QR - ${table.name}</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 30px; }
            .card { border: 2px dashed #333; padding: 25px; border-radius: 16px; max-width: 320px; margin: 0 auto; }
            img { width: 220px; height: 220px; margin: 15px auto; }
            h1 { font-size: 20px; margin: 0; }
            p { font-size: 14px; color: #555; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>El Churo Mosito</h1>
            <p><strong>${table.name}</strong></p>
            <img src="${qrUrl}" alt="QR Mesa ${table.id}" />
            <p>Escanee para ordenar desde su smartphone</p>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filtered Menu
  const categoriesWithAll = ['TODOS', ...MENU_CATEGORIAS];
  const filteredMenu = useMemo(() => {
    if (selectedCategory === 'TODOS') return menu;
    return menu.filter(item => item.categoria === selectedCategory);
  }, [menu, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#1c1917] text-[#f5efe6] font-sans antialiased selection:bg-[#ff7a00] selection:text-white overflow-x-hidden relative w-full">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-5 right-5 z-[1300] flex items-center gap-3 px-5 py-3.5 rounded-[16px] shadow-2xl backdrop-blur-md border animate-bounce ${
          notification.type === 'error' 
            ? 'bg-red-950/90 border-red-500/50 text-red-200' 
            : 'bg-[#292524]/95 border-[#ff7a00]/40 text-[#f5efe6]'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400 shrink-0" /> : <Sparkles className="w-5 h-5 text-[#ff7a00] shrink-0" />}
          <span className="text-[14px] font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1c1917]/95 backdrop-blur-md border-b border-[#3a3632]">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-6 h-[68px] sm:h-[72px] flex items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] bg-gradient-to-tr from-[#ff7a00] to-amber-500 flex items-center justify-center shadow-[0_8px_30px_rgba(255,122,0,0.4)] shrink-0">
              <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[16px] sm:text-[20px] font-bold tracking-tight text-[#f5efe6] font-serif leading-tight truncate">
                El Churo Mosito
              </h1>
              <p className="text-[10px] sm:text-[11px] text-[#a8a29e] tracking-[0.06em] uppercase font-medium truncate">
                Gastronomía de Altura • Tarija
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center p-1.5 rounded-[16px] border border-[#3a3632] bg-[#292524]">
            {[
              { id: 'menu', label: 'Menú', icon: Utensils },
              { id: 'tables', label: 'Mesas', icon: QrCode },
              { id: 'kitchen', label: 'Cocina', icon: ChefHat },
              { id: 'admin', label: 'Admin', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const activeCount = orders.filter(o => o.status !== 'pagado' && o.status !== 'cancelado' && o.status !== 'servido').length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-[12px] gap-2 text-[13px] font-semibold transition-all cursor-pointer ${
                    isActive ? 'bg-[#ff7a00] text-white shadow-lg' : 'text-[#a8a29e] hover:text-[#f5efe6]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'kitchen' && activeCount > 0 && (
                    <span className="ml-1 w-5 h-5 bg-amber-500 text-black rounded-full text-[10px] font-bold flex items-center justify-center">
                      {activeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Header Cart Button - Always visible, never cut off */}
          <div className="flex items-center gap-2 shrink-0">
            {user && (
              <button 
                onClick={() => signOut(auth)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#292524] border border-[#3a3632] text-xs text-[#a8a29e] hover:text-white"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" /> Salir
              </button>
            )}
            <button
              onClick={() => { setModalMode('cart'); setCustomerModalOpen(true); }}
              className="relative px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-[14px] bg-[#ff7a00] hover:bg-[#ff8c1a] text-white font-bold transition-all shadow-[0_4px_20px_rgba(255,122,0,0.35)] flex items-center gap-2 active:scale-95 shrink-0 cursor-pointer"
              aria-label="Abrir Carrito"
            >
              <ShoppingBag className="w-5 h-5 shrink-0" />
              <span className="font-extrabold text-[14px]">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
              <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">
                Carrito
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 pb-36 sm:pb-12">
        {activeTab === 'menu' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Banner */}
            <div className="relative rounded-[24px] overflow-hidden bg-gradient-to-r from-[#292524] to-[#1c1917] border border-[#3a3632] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-3 z-10 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff7a00]/20 text-[#ff7a00] text-[12px] font-semibold tracking-wide uppercase">
                  <Award className="w-3.5 h-3.5" /> Sabor Auténtico Tarijeño
                </span>
                <h2 className="text-[26px] sm:text-[34px] font-serif font-extrabold tracking-tight text-[#f5efe6] leading-[1.15]">
                  Pide directamente a cocina desde tu smartphone
                </h2>
                <p className="text-[13px] sm:text-[14px] text-[#a8a29e] leading-relaxed">
                  Escanea el código QR de tu mesa, agrega tus platos al carrito y envíalos a cocina sin demoras.
                </p>
                <div className="pt-2 flex flex-wrap gap-2.5 items-center">
                  <div className="flex items-center gap-2 bg-[#1c1917] border border-[#3a3632] rounded-xl px-3 py-2">
                    <span className="text-xs text-[#a8a29e]">Mesa:</span>
                    <select 
                      value={currentTableId}
                      onChange={(e) => setCurrentTableId(Number(e.target.value))}
                      className="bg-transparent text-sm font-bold text-[#ff7a00] focus:outline-none cursor-pointer"
                    >
                      {tables.map(t => (
                        <option key={t.id} value={t.id} className="bg-[#1c1917] text-white">
                          #{t.id} - {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={() => callWaiter(tables.find(t => t.id === Number(currentTableId)) || tables[0])}
                    className="px-3.5 py-2 rounded-xl bg-[#3a3632] hover:bg-[#ff7a00] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5 text-[#ff7a00]" /> Llamar Mozo
                  </button>
                  <button 
                    onClick={() => requestBill(tables.find(t => t.id === Number(currentTableId)) || tables[0])}
                    className="px-3.5 py-2 rounded-xl bg-[#3a3632] hover:bg-emerald-600 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" /> Pedir Cuenta
                  </button>
                </div>
              </div>
            </div>

            {/* Active Table Order Banner: Real-time Comanda Tracker */}
            {activeOrderForCurrentTable && (
              <ActiveOrderBanner
                order={activeOrderForCurrentTable}
                tableName={tables.find(t => t.id === Number(currentTableId))?.name || `Mesa #${currentTableId}`}
                onOpenAdditions={() => {
                  showToast('Selecciona platos o bebidas abajo para adicionarlos a tu mesa');
                  const menuSec = document.getElementById('menu-list-section');
                  if (menuSec) menuSec.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenBill={() => {
                  setModalMode('bill');
                  setCustomerModalOpen(true);
                }}
                onCancelOrder={cancelOrder}
              />
            )}

            {/* Categories Carousel */}
            <div id="menu-list-section" className="flex items-center gap-2 overflow-x-auto w-full pb-2 no-scrollbar scroll-mt-24">
              {categoriesWithAll.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-[14px] text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === category 
                      ? 'bg-[#ff7a00] text-white shadow-lg' 
                      : 'bg-[#292524] text-[#a8a29e] hover:bg-[#3a3632] hover:text-[#f5efe6] border border-[#3a3632]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Menu Grid: If TODOS, grouped neatly by Category; If specific, direct list */}
            {selectedCategory === 'TODOS' ? (
              <div className="space-y-12">
                {MENU_CATEGORIAS.map(cat => {
                  const itemsInCat = menu.filter(item => item.categoria === cat);
                  if (itemsInCat.length === 0) return null;
                  return (
                    <div key={cat} className="space-y-4">
                      <div className="flex items-center gap-3 border-b border-[#3a3632] pb-3">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#ff7a00]" />
                        <h3 className="text-xl font-serif font-bold text-[#f5efe6] tracking-tight">{cat}</h3>
                        <span className="text-xs text-[#a8a29e] bg-[#292524] px-3 py-1 rounded-full border border-[#3a3632]">
                          {itemsInCat.length} platos
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {itemsInCat.map(product => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={addToCart}
                            cartQty={cart.find(c => c.id === product.id)?.qty || 0}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenu.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    cartQty={cart.find(c => c.id === product.id)?.qty || 0}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tables & QR Code Generator Tab */}
        {activeTab === 'tables' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-[24px] sm:text-[28px] font-serif font-extrabold tracking-tight text-[#f5efe6]">
                  Gestión de Mesas y Códigos QR
                </h2>
                <p className="text-sm text-[#a8a29e]">
                  Visualiza el consumo en tiempo real, cobra o imprime los códigos QR para cada mesa.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map(table => (
                <div key={table.id} className="bg-[#292524] border border-[#3a3632] rounded-[20px] p-6 flex flex-col justify-between gap-6 shadow-md">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#ff7a00]">
                        Mesa #{table.id}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        table.status === 'free' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 
                        table.status === 'por-pagar' ? 'bg-red-950 text-red-300 border border-red-800' : 
                        'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {table.status === 'free' ? 'Libre' : table.status === 'por-pagar' ? 'Por Pagar' : 'Ocupada'}
                      </span>
                    </div>
                    <h3 className="text-[18px] font-serif font-bold text-[#f5efe6] mt-2">{table.name}</h3>
                    <p className="text-xs text-[#a8a29e] mt-1">{table.seats} comensales</p>

                    {table.currentOrder && (
                      <div className="mt-3 p-3 rounded-xl bg-[#1c1917] border border-[#3a3632] space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#a8a29e]">Consumo en curso:</span>
                          <span className="text-[#ff7a00] font-black text-sm">Bs. {table.currentOrder.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-[#a8a29e]">
                          <span>{table.currentOrder.items.length} ítems</span>
                          <span>Hora: {table.currentOrder.time}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => setQrModalTable(table)}
                      className="w-full py-2.5 px-3 rounded-[12px] bg-[#3a3632] hover:bg-[#ff7a00] text-[13px] font-semibold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" /> Ver / Imprimir QR
                    </button>
                    {table.status !== 'free' && (
                      <button
                        onClick={() => liberateTable(table.id)}
                        className="w-full py-2.5 px-3 rounded-[12px] bg-emerald-600 hover:bg-emerald-700 text-[13px] font-semibold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow"
                      >
                        <CheckCheck className="w-4 h-4" /> Cobrar y Liberar Mesa
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kitchen KDS and Admin Protected Views */}
        {(activeTab === 'kitchen' || activeTab === 'admin') && !user ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4 bg-[#292524] border border-[#3a3632] rounded-[24px] p-8 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#ff7a00]/15 flex items-center justify-center text-[#ff7a00]">
              <ChefHat className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[#f5efe6]">Acceso de Personal Requerido</h2>
            <p className="text-sm text-[#a8a29e]">
              Inicia sesión con tu cuenta de administrador o personal de cocina para gestionar comandas e inventario.
            </p>
            <button 
              onClick={() => signInWithPopup(auth, googleProvider)}
              className="px-6 py-3 rounded-xl bg-[#ff7a00] hover:bg-[#ff8c1a] text-white font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Iniciar Sesión con Google
            </button>
          </div>
        ) : (
          <div className="animate-fadeIn">
            {/* Kitchen KDS */}
            {activeTab === 'kitchen' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[24px] sm:text-[28px] font-serif font-extrabold tracking-tight text-[#f5efe6]">
                      Comanda de Cocina (KDS)
                    </h2>
                    <p className="text-sm text-[#a8a29e]">
                      Pedidos en tiempo real sincronizados desde las mesas. Sin mesas duplicadas.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                    {orders.filter(o => o.status !== 'pagado' && o.status !== 'cancelado' && o.status !== 'servido').length} en cocina
                  </span>
                </div>

                {orders.filter(o => o.status !== 'pagado' && o.status !== 'cancelado').length === 0 ? (
                  <div className="text-center py-16 bg-[#292524] border border-[#3a3632] rounded-[24px] text-[#a8a29e]">
                    <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-40 text-[#ff7a00]" />
                    <p className="text-base font-bold text-[#f5efe6]">No hay comandas activas</p>
                    <p className="text-xs mt-1">Los pedidos enviados por los clientes aparecerán aquí automáticamente.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders
                      .filter(o => o.status !== 'pagado' && o.status !== 'cancelado')
                      .map(order => (
                      <div key={order.id} className="bg-[#292524] border border-[#3a3632] rounded-[20px] p-6 space-y-4 flex flex-col justify-between shadow-lg">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-[#ff7a00]">{order.id}</span>
                            <div className="flex items-center gap-2">
                              {order.hasAddition && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold animate-pulse">
                                  🔥 Adición {order.additionTime}
                                </span>
                              )}
                              <span className="text-xs text-[#a8a29e] flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> {order.time}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-serif font-bold text-[#f5efe6]">{order.tableName}</h4>
                            <span className="text-xs font-extrabold text-[#ff7a00]">Bs. {order.total.toFixed(2)}</span>
                          </div>
                          <div className="border-t border-[#3a3632] pt-3 space-y-2">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-[#f5efe6] font-medium">{item.qty}x {item.nombre}</span>
                                  {item.isAddition && (
                                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                                      Adición
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-[#a8a29e]">Bs. {(item.precioBs * item.qty).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="pt-4 border-t border-[#3a3632] flex flex-wrap gap-2">
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'en-preparacion')}
                            className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              order.status === 'en-preparacion' ? 'bg-amber-600 text-white font-bold' : 'bg-[#1c1917] text-[#a8a29e]'
                            }`}
                          >
                            En Fogones
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'servido')}
                            className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              order.status === 'servido' ? 'bg-emerald-600 text-white font-bold' : 'bg-[#1c1917] text-[#a8a29e]'
                            }`}
                          >
                            Servido
                          </button>
                          <button 
                            onClick={() => liberateTable(order.tableId)}
                            className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-[#3a3632] hover:bg-emerald-700 text-emerald-300 hover:text-white transition-colors cursor-pointer"
                            title="Cobrar comanda y liberar mesa"
                          >
                            Cobrar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Admin View */}
            {activeTab === 'admin' && (
              <div className="space-y-8 animate-fadeIn">
                <h2 className="text-[24px] sm:text-[28px] font-serif font-extrabold tracking-tight text-[#f5efe6]">
                  Panel de Administración y Menú
                </h2>
                
                <div className="space-y-6">
                  {/* Waiter Calls */}
                  <div className="bg-[#292524] border border-[#3a3632] rounded-[20px] p-6 space-y-4">
                    <h3 className="text-lg font-serif font-bold text-[#f5efe6]">Llamadas Activas de Clientes</h3>
                    {waiterCalls.length === 0 ? (
                      <p className="text-sm text-[#a8a29e]">No hay llamadas pendientes.</p>
                    ) : (
                      <div className="space-y-3">
                        {waiterCalls.map((call) => (
                          <div key={call.id} className="flex items-center justify-between bg-[#1c1917] p-4 rounded-xl border border-[#3a3632]">
                            <div className="flex items-center gap-3">
                              {call.type === 'mozo' ? <Bell className="w-5 h-5 text-[#ff7a00]" /> : <FileText className="w-5 h-5 text-emerald-500" />}
                              <div>
                                <p className="text-sm font-bold text-[#f5efe6]">{call.tableName}</p>
                                <span className="text-xs text-[#a8a29e]">{call.type === 'mozo' ? 'Llamada de Mozo' : 'Solicitud de Cuenta'} • {call.time}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => setWaiterCalls(prev => prev.filter(c => c.id !== call.id))} 
                              className="px-3 py-1.5 rounded-lg bg-[#3a3632] hover:bg-emerald-600 text-xs font-bold text-white cursor-pointer"
                            >
                              Atendido
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Menu Inventory */}
                  <div className="bg-[#292524] border border-[#3a3632] rounded-[20px] p-6 overflow-x-auto">
                    <h3 className="text-lg font-serif font-bold text-[#f5efe6] mb-4">Inventario de Platos y Bebidas</h3>
                    <table className="w-full text-left text-sm text-[#a8a29e]">
                      <thead className="text-xs text-[#f5efe6] uppercase border-b border-[#3a3632]">
                        <tr>
                          <th className="px-4 py-3">Artículo</th>
                          <th className="px-4 py-3">Categoría</th>
                          <th className="px-4 py-3">Precio</th>
                          <th className="px-4 py-3">Disponibilidad</th>
                          <th className="px-4 py-3">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {menu.map(item => (
                          <tr key={item.id} className="border-b border-[#3a3632]">
                            <td className="px-4 py-3 text-[#f5efe6] font-medium">{item.nombre}</td>
                            <td className="px-4 py-3 text-xs">{item.categoria}</td>
                            <td className="px-4 py-3 font-semibold text-[#f5efe6]">Bs. {item.precioBs.toFixed(2)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.disponible ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'}`}>
                                {item.disponible ? 'Disponible' : 'Agotado'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button 
                                onClick={() => toggleAvailability(item.id, item.disponible)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                  item.disponible ? 'bg-red-900/60 text-red-200 hover:bg-red-800' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }`}
                              >
                                {item.disponible ? 'Marcar Agotado' : 'Activar'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cart & Checkout Modal (Z-[1200], 100dvh, Sticky Footer with Enviar Pedido) */}
      <CartModal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        modalMode={modalMode}
        cart={cart}
        cartTotal={cartTotal}
        tables={tables}
        currentTableId={currentTableId}
        activeOrder={activeOrderForCurrentTable}
        onTableChange={(id) => setCurrentTableId(id)}
        onUpdateQty={updateCartQty}
        onRemoveItem={removeFromCart}
        onPlaceOrder={placeOrder}
        onPayment={handlePayment}
        cashAmount={cashAmount}
        setCashAmount={setCashAmount}
        onViewMenu={() => setActiveTab('menu')}
        onSwitchToBill={() => setModalMode('bill')}
      />

      {/* Floating Mobile Cart Bar (Hides when Cart Modal is Open) */}
      <FloatingCartBar
        cart={cart}
        cartTotal={cartTotal}
        isOpen={customerModalOpen}
        onOpenCart={() => {
          setModalMode('cart');
          setCustomerModalOpen(true);
        }}
      />

      {/* Mobile Bottom Dock */}
      <MobileDock
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        cart={cart}
        orders={orders}
        isCartOpen={customerModalOpen}
        onOpenCart={() => {
          setModalMode('cart');
          setCustomerModalOpen(true);
        }}
      />

      {/* QR Modal for Mesa */}
      <QrModal
        table={qrModalTable}
        onClose={() => setQrModalTable(null)}
        onPrint={printQRCode}
      />

    </div>
  );
}
