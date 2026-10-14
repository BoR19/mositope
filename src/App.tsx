import React, { useState, useEffect, useRef } from 'react';
import { 
  Utensils, QrCode, ShoppingBag, Clock, CheckCircle2, AlertCircle, 
  Plus, Minus, Trash2, Printer, Search, ArrowRight, UserCheck, 
  DollarSign, RefreshCw, ChefHat, Layers, Award, ChevronRight, 
  Sparkles, Check, X, ShieldAlert, FileText, Smartphone, Bell, CheckCheck
} from 'lucide-react';

export const MENU_CATEGORIAS = [
  "PARRILLA Y CRUZ",
  "CORTES A LA PARRILLA",
  "MENU CRIOLLO",
  "SOPAS",
  "GUARNICIONES",
  "EXTRAS",
  "POSTRES",
  "JUGOS DE LA CASA",
  "COCTELES",
  "BEBIDAS GASEOSAS Y AGUA",
  "VINOS DE LA CASA"
];

export const INITIAL_MENU = [
  {
    id: "pxc-1",
    categoria: "PARRILLA Y CRUZ",
    nombre: "Pollo a la Leña",
    descripcion: "Acompañado con arroz graneado, papa, oca, yuca y camote.",
    precioBs: 35,
    disponible: true,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    prepTime: '20 min',
    spicy: 0
  },
  {
    id: "pxc-2",
    categoria: "PARRILLA Y CRUZ",
    nombre: "Pacú o Sábalo a la Leña o Parrilla",
    descripcion: "Pescado a la leña o parrilla según elección.",
    precioBs: 64,
    notas: "20 a 30 min. de preparación",
    disponible: true,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    prepTime: '25 min',
    spicy: 0
  },
  {
    id: "pxc-3",
    categoria: "PARRILLA Y CRUZ",
    nombre: "Costillar a la Cruz",
    descripcion: "Tradicional costillar asado a la cruz.",
    precioBs: 70,
    disponible: true,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    prepTime: '15 min',
    spicy: 1
  },
  {
    id: "pxc-4",
    categoria: "PARRILLA Y CRUZ",
    nombre: "Lechón a la Cruz",
    descripcion: "Jugoso lechón con cuero crujiente a la cruz.",
    precioBs: 70,
    disponible: true,
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80',
    prepTime: '15 min',
    spicy: 1
  },
  {
    id: "pxc-5",
    categoria: "PARRILLA Y CRUZ",
    nombre: "Mixto (Lechón y Costillar)",
    descripcion: "Acompañado con choclo, mote, papa, oca, yuca y camotes morados.",
    precioBs: 140,
    notas: "Para 2 personas",
    disponible: true,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    prepTime: '20 min',
    spicy: 1
  },
  {
    id: "cap-1",
    categoria: "CORTES A LA PARRILLA",
    nombre: "La Mosita",
    descripcion: "4 cortes a elección: Bife de chorizo, tira de asado, jiba y ubre o entraña.",
    precioBs: 199,
    notas: "Para 3 personas",
    disponible: true,
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    prepTime: '25 min',
    spicy: 0
  },
  {
    id: "cap-2",
    categoria: "CORTES A LA PARRILLA",
    nombre: "Bife de Chorizo",
    descripcion: "Corte selecto de Bife de Chorizo (350 gr.).",
    precioBs: 69,
    disponible: true,
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    prepTime: '20 min',
    spicy: 0
  },
  {
    id: "cap-3",
    categoria: "CORTES A LA PARRILLA",
    nombre: "Tira de Asado",
    descripcion: "Clásica tira de asado a la parrilla con jugosos cortes.",
    precioBs: 65,
    disponible: true,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    prepTime: '20 min',
    spicy: 0
  },
  {
    id: "cap-4",
    categoria: "CORTES A LA PARRILLA",
    nombre: "Picaña",
    descripcion: "Tierno y jugoso corte de picaña vacuna con costra dorada.",
    precioBs: 75,
    disponible: true,
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    prepTime: '20 min',
    spicy: 0
  },
  {
    id: "mc-1",
    categoria: "MENU CRIOLLO",
    nombre: "Plato Criollo",
    descripcion: "Combinación de Saice, Ranga y Picante Mixto Criollo, chancho a la olla o costillitas.",
    precioBs: 126,
    notas: "Para 2 personas",
    disponible: true,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    prepTime: '15 min',
    spicy: 3
  },
  {
    id: "mc-2",
    categoria: "MENU CRIOLLO",
    nombre: "Saice Tarijeño",
    descripcion: "Tradicional guiso de carne picada con arvejas, papa y fideo.",
    precioBs: 38,
    disponible: true,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    prepTime: '10 min',
    spicy: 2
  },
  {
    id: "sop-1",
    categoria: "SOPAS",
    nombre: "Sopa de Gallina Criolla (Arroz) Completa",
    descripcion: "Sopa reconfortante de gallina criolla con arroz y presa.",
    precioBs: 19,
    disponible: true,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
    prepTime: '8 min',
    spicy: 0
  },
  {
    id: "guar-1",
    categoria: "GUARNICIONES",
    nombre: "Papas Fritas",
    descripcion: "Papas doradas y crujientes.",
    precioBs: 15,
    disponible: true,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    prepTime: '10 min',
    spicy: 0
  },
  {
    id: "ext-1",
    categoria: "EXTRAS",
    nombre: "Llajua Tarijeña",
    descripcion: "Salsa picante tradicional de locoto, tomate y quirquiña.",
    precioBs: 5,
    disponible: true,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    prepTime: '2 min',
    spicy: 3
  },
  {
    id: "pos-1",
    categoria: "POSTRES",
    nombre: "Helado Artesanal de Canela",
    descripcion: "Clásico helado tarijeño de canela con copcop.",
    precioBs: 15,
    disponible: true,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    prepTime: '3 min',
    spicy: 0
  },
  {
    id: "jug-1",
    categoria: "JUGOS DE LA CASA",
    nombre: "Jugo de Mocochinchi",
    descripcion: "Refrescante infusión de durazno deshidratado con canela y clavo.",
    precioBs: 10,
    disponible: true,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    prepTime: '3 min',
    spicy: 0
  },
  {
    id: "coc-1",
    categoria: "COCTELES",
    nombre: "Singani Sour Tarijeño",
    descripcion: "El clásico trago boliviano con Singani de altura, limón y clara de huevo.",
    precioBs: 28,
    disponible: true,
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80',
    prepTime: '5 min',
    spicy: 0
  },
  {
    id: "beb-1",
    categoria: "BEBIDAS GASEOSAS Y AGUA",
    nombre: "Coca-Cola / Sprite / Fanta 2L",
    descripcion: "Botella grande familiar de 2 litros.",
    precioBs: 22,
    disponible: true,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    prepTime: '2 min',
    spicy: 0
  },
  {
    id: "vin-1",
    categoria: "VINOS DE LA CASA",
    nombre: "Vino Tinto Tannat Aranjuez / Kolberg",
    descripcion: "Exquisito vino de altura tarijeño 750ml.",
    precioBs: 75,
    disponible: true,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
    prepTime: '3 min',
    spicy: 0
  }
];

export const INITIAL_TABLES = [
  { id: 1, name: 'Mesa 1 - Terraza Principal', seats: 4, status: 'free', currentOrder: null },
  { id: 2, name: 'Mesa 2 - Terraza Vista', seats: 2, status: 'occupied', currentOrder: { id: 'ORD-101', items: [{...INITIAL_MENU[0], qty: 2}], total: 70, time: '12:40' } },
  { id: 3, name: 'Mesa 3 - Salón Central', seats: 6, status: 'reserved', currentOrder: null },
  { id: 4, name: 'Mesa 4 - Salón Central', seats: 4, status: 'free', currentOrder: null },
  { id: 5, name: 'Mesa 5 - VIP Bodega', seats: 8, status: 'occupied', currentOrder: { id: 'ORD-102', items: [{...INITIAL_MENU[2], qty: 2}], total: 140, time: '13:05' } },
  { id: 6, name: 'Mesa 6 - Patio Colonial', seats: 4, status: 'free', currentOrder: null },
  { id: 7, name: 'Mesa 7 - Terraza Lateral', seats: 4, status: 'free', currentOrder: null },
  { id: 8, name: 'Mesa 8 - Terraza Lateral', seats: 4, status: 'free', currentOrder: null },
  { id: 9, name: 'Mesa 9 - Salón Interior', seats: 2, status: 'free', currentOrder: null },
  { id: 10, name: 'Mesa 10 - Salón Interior', seats: 2, status: 'free', currentOrder: null },
  { id: 11, name: 'Mesa 11 - Salón Interior', seats: 4, status: 'free', currentOrder: null },
  { id: 12, name: 'Mesa 12 - Salón Interior', seats: 6, status: 'free', currentOrder: null },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('menu'); 
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([
    { id: 'ORD-101', tableId: 2, tableName: 'Mesa 2 - Terraza Vista', items: [{...INITIAL_MENU[0], qty: 2}], total: 70, status: 'servido', time: '12:40' },
    { id: 'ORD-102', tableId: 5, tableName: 'Mesa 5 - VIP Bodega', items: [{...INITIAL_MENU[2], qty: 2}], total: 140, status: 'en-preparacion', time: '13:05' }
  ]);
  const [menu, setMenu] = useState(INITIAL_MENU);
  const [tables, setTables] = useState(INITIAL_TABLES);
  
  const [currentTableId, setCurrentTableId] = useState(2);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('cart'); // 'cart' or 'bill'
  const [paymentMethod, setPaymentMethod] = useState(null); // 'QR' or 'EFECTIVO'
  const [cashAmount, setCashAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [qrModalTable, setQrModalTable] = useState(null);
  const [waiterCalls, setWaiterCalls] = useState([]);

  // Detectar mesa desde la URL
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

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const addToCart = (product) => {
    if (!product.disponible) {
      showToast('Este producto no está disponible temporalmente.', 'error');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? {...item, qty: item.qty + 1} : item);
      }
      return [...prev, {...product, qty: 1}];
    });
    showToast(`Agregado: ${product.nombre}`);
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? {...item, qty: newQty} : null;
      }
      return item;
    }).filter(Boolean));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.precioBs * item.qty), 0);

  const placeOrder = () => {
    if (cart.length === 0) return;
    const tableObj = tables.find(t => t.id === Number(currentTableId)) || tables[0];
    const newOrderId = `ORD-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder = {
      id: newOrderId,
      tableId: tableObj.id,
      tableName: tableObj.name,
      items: [...cart],
      total: cartTotal,
      status: 'pendiente',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setOrders(prev => [newOrder, ...prev]);
    setTables(prev => prev.map(t => t.id === tableObj.id ? {...t, status: 'occupied', currentOrder: newOrder} : t));

    setCart([]);
    setCustomerModalOpen(false);
    showToast(`¡Pedido ${newOrderId} enviado a cocina con éxito! 🍲`);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? {...o, status: newStatus} : o));
    showToast(`Pedido ${orderId} actualizado a: ${newStatus}`);
  };

  const toggleAvailability = (id) => {
    setMenu(prev => prev.map(item => item.id === id ? {...item, disponible: !item.disponible} : item));
    showToast(`Estado actualizado correctamente.`);
  };

  const callWaiter = (tableObj) => {
    const callId = `W-${Math.floor(10 + Math.random() * 90)}`;
    setWaiterCalls(prev => [{ id: callId, type: 'mozo', tableName: tableObj.name, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev]);
    showToast(`¡Mozo llamado para ${tableObj.name}! En camino.`);
  };

  const requestBill = (tableObj) => {
    const callId = `B-${Math.floor(10 + Math.random() * 90)}`;
    setWaiterCalls(prev => [{ id: callId, type: 'cuenta', tableName: tableObj.name, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev]);
    showToast(`¡Solicitud de cuenta enviada para ${tableObj.name}!`);
    setModalMode('bill');
    setCustomerModalOpen(true);
  };

  const handlePayment = (method) => {
    const tableObj = tables.find(t => t.id === Number(currentTableId)) || tables[0];
    setTables(prev => prev.map(t => t.id === tableObj.id ? {...t, status: 'por-pagar'} : t));
    showToast(`Pago con ${method} iniciado para ${tableObj.name}. El administrador fue notificado.`);
    setCustomerModalOpen(false);
  };

  const categoriesWithAll = ['TODOS', ...MENU_CATEGORIAS];

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'TODOS' || item.categoria === selectedCategory;
    const matchesSearch = item.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#1c1917] text-[#f5efe6] font-sans antialiased selection:bg-[#ff7a00] selection:text-white">
      
      {notification && (
        <div className={`fixed top-5 right-5 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-[16px] shadow-2xl backdrop-blur-md border animate-bounce ${
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
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[14px] bg-gradient-to-tr from-[#ff7a00] to-amber-500 flex items-center justify-center shadow-[0_8px_30px_rgba(255,122,0,0.4)]">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-[#f5efe6] font-serif leading-tight">
                El Churo Mosito
              </h1>
              <p className="text-[11px] text-[#a8a29e] tracking-[0.06em] uppercase font-medium">
                Gastronomía de Altura • Tarija
              </p>
            </div>
          </div>

          <nav className="fixed bottom-0 left-0 right-0 bg-[#1c1917] border-t border-[#3a3632] flex md:static md:bg-transparent md:border-t-0 md:p-1.5 md:rounded-[16px] md:border md:border-[#3a3632] md:bg-[#292524] z-50">
            {[
              { id: 'menu', label: 'Menú', icon: Utensils },
              { id: 'tables', label: 'Mesas', icon: QrCode },
              { id: 'kitchen', label: 'Cocina', icon: ChefHat },
              { id: 'admin', label: 'Admin', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center justify-center py-3 md:flex-row md:px-4 md:py-2 md:rounded-[12px] md:gap-2 text-[10px] md:text-[13px] font-semibold transition-all ${
                    isActive ? 'text-[#ff7a00] md:bg-[#ff7a00] md:text-white md:shadow-lg' : 'text-[#a8a29e] hover:text-[#f5efe6]'
                  }`}
                >
                  <Icon className="w-5 h-5 md:w-4 md:h-4 mb-1 md:mb-0" />
                  {tab.label}
                  {tab.id === 'kitchen' && orders.filter(o => o.status !== 'servido').length > 0 && (
                    <span className="absolute top-1 right-1 md:top-auto md:right-auto md:relative md:ml-2 w-4 h-4 md:w-5 md:h-5 bg-amber-500 text-black rounded-full text-[9px] font-bold flex items-center justify-center">
                      {orders.filter(o => o.status !== 'servido').length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setModalMode('cart'); setCustomerModalOpen(true); }}
              className="relative p-2.5 rounded-[14px] bg-[#ff7a00] text-white hover:bg-[#ff8c1a] transition-all shadow-[0_4px_20px_rgba(255,122,0,0.3)] flex items-center gap-2 px-4"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="font-bold text-[14px]">{cart.reduce((s, i) => s + i.qty, 0)}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'menu' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="relative rounded-[24px] overflow-hidden bg-gradient-to-r from-[#292524] to-[#1c1917] border border-[#3a3632] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 z-10 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff7a00]/20 text-[#ff7a00] text-[12px] font-semibold tracking-wide uppercase">
                  <Award className="w-3.5 h-3.5" /> Sabor Auténtico Tarijeño
                </span>
                <h2 className="text-[28px] sm:text-[36px] font-serif font-extrabold tracking-tight text-[#f5efe6] leading-[1.1]">
                  Disfruta sin esperas escaneando tu código QR en mesa
                </h2>
                <p className="text-[14px] sm:text-[15px] text-[#a8a29e] leading-relaxed">
                  Pide directamente desde tu smartphone, llama al mozo con un solo toque y solicita tu cuenta al instante.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <select 
                    value={currentTableId}
                    onChange={(e) => setCurrentTableId(Number(e.target.value))}
                    className="bg-[#1c1917] border border-[#3a3632] rounded-xl px-4 py-2.5 text-sm font-medium text-[#f5efe6] focus:outline-none focus:border-[#ff7a00]"
                  >
                    {tables.map(t => (
                      <option key={t.id} value={t.id}>Simulando: {t.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => callWaiter(tables.find(t => t.id === Number(currentTableId)) || tables[0])}
                    className="px-4 py-2.5 rounded-xl bg-[#3a3632] hover:bg-[#ff7a00] text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" /> Llamar Mozo
                  </button>
                  <button 
                    onClick={() => requestBill(tables.find(t => t.id === Number(currentTableId)) || tables[0])}
                    className="px-4 py-2.5 rounded-xl bg-[#3a3632] hover:bg-emerald-600 text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> Pedir Cuenta
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                {categoriesWithAll.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-[14px] text-[13px] font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === category 
                        ? 'bg-[#ff7a00] text-white shadow-lg' 
                        : 'bg-[#292524] text-[#a8a29e] hover:bg-[#3a3632] hover:text-[#f5efe6] border border-[#3a3632]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenu.map(product => (
                <div 
                  key={product.id}
                  className="group bg-[#292524] border border-[#3a3632] rounded-[20px] overflow-hidden flex flex-col justify-between hover:border-[#ff7a00]/50 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                >
                  <div className="relative h-[180px] overflow-hidden bg-[#1c1917]">
                    <img 
                      src={product.image} 
                      alt={product.nombre}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${product.disponible ? 'opacity-90' : 'opacity-30 grayscale'}`}
                    />
                    {!product.disponible && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded-full">Agotado</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff7a00]">
                        {product.categoria}
                      </span>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[16px] sm:text-[18px] font-bold font-serif text-[#f5efe6] leading-tight">
                          {product.nombre}
                        </h3>
                        <span className="text-[16px] sm:text-[18px] font-extrabold text-[#ff7a00] shrink-0">
                          Bs. {product.precioBs.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#a8a29e] line-clamp-2 leading-relaxed">
                        {product.descripcion}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#3a3632] flex items-center justify-between">
                      <button
                        onClick={() => addToCart(product)}
                        className="px-4 py-2 rounded-[12px] bg-[#ff7a00] hover:bg-[#ff8c1a] text-white text-[13px] font-semibold transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(255,122,0,0.3)]"
                      >
                        <Plus className="w-4 h-4" /> Agregar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-[24px] sm:text-[28px] font-serif font-extrabold tracking-tight text-[#f5efe6]">
              Gestión de Mesas y Generador QR
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map(table => (
                <div key={table.id} className="bg-[#292524] border border-[#3a3632] rounded-[20px] p-6 flex flex-col justify-between gap-6">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#ff7a00]">Mesa #{table.id}</span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        table.status === 'free' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 
                        table.status === 'por-pagar' ? 'bg-red-950 text-red-300 border border-red-800' : 
                        'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {table.status === 'free' ? 'Libre' : table.status === 'por-pagar' ? 'Por Pagar' : 'Ocupada'}
                      </span>
                    </div>
                    <h3 className="text-[18px] font-serif font-bold text-[#f5efe6] mt-2">{table.name}</h3>
                  </div>
                  <button
                    onClick={() => setQrModalTable(table)}
                    className="w-full py-2.5 px-3 rounded-[12px] bg-[#3a3632] hover:bg-[#ff7a00] text-[13px] font-semibold text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" /> Ver Código QR
                  </button>
                  {table.status === 'por-pagar' && (
                    <button
                      onClick={() => setTables(prev => prev.map(t => t.id === table.id ? {...t, status: 'free', currentOrder: null} : t))}
                      className="w-full py-2.5 px-3 rounded-[12px] bg-emerald-600 hover:bg-emerald-700 text-[13px] font-semibold text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCheck className="w-4 h-4" /> Marcar como Pagada
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'kitchen' && (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-[24px] sm:text-[28px] font-serif font-extrabold tracking-tight text-[#f5efe6]">
              Comanda de Cocina (KDS)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map(order => (
                <div key={order.id} className="bg-[#292524] border border-[#3a3632] rounded-[20px] p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-[#ff7a00]">{order.id}</span>
                      <span className="text-xs text-[#a8a29e] flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {order.time}</span>
                    </div>
                    <h4 className="text-base font-serif font-bold text-[#f5efe6]">{order.tableName}</h4>
                    <div className="border-t border-[#3a3632] pt-3 space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-[#f5efe6] font-medium">{item.qty}x {item.nombre}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#3a3632] flex gap-2">
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'en-preparacion')}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                        order.status === 'en-preparacion' ? 'bg-amber-600 text-white' : 'bg-[#1c1917] text-[#a8a29e]'
                      }`}
                    >
                      En Proceso
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'servido')}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                        order.status === 'servido' ? 'bg-emerald-600 text-white' : 'bg-[#1c1917] text-[#a8a29e]'
                      }`}
                    >
                      Servido
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-[24px] sm:text-[28px] font-serif font-extrabold tracking-tight text-[#f5efe6]">
              Panel de Administración y Menú
            </h2>
            
            <div className="space-y-6">
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
                        <button onClick={() => setWaiterCalls(prev => prev.filter(c => c.id !== call.id))} className="px-3 py-1.5 rounded-lg bg-[#3a3632] hover:bg-emerald-600 text-xs font-bold text-white">Atendido</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#292524] border border-[#3a3632] rounded-[20px] p-6 overflow-x-auto">
                <h3 className="text-lg font-serif font-bold text-[#f5efe6] mb-4">Inventario de Platos y Bebidas</h3>
                <table className="w-full text-left text-sm text-[#a8a29e]">
                  <thead className="text-xs text-[#f5efe6] uppercase border-b border-[#3a3632]">
                    <tr>
                      <th className="px-4 py-3">Artículo</th>
                      <th className="px-4 py-3">Precio</th>
                      <th className="px-4 py-3">Disponibilidad</th>
                      <th className="px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menu.map(item => (
                      <tr key={item.id} className="border-b border-[#3a3632]">
                        <td className="px-4 py-3 text-[#f5efe6] font-medium">{item.nombre}</td>
                        <td className="px-4 py-3">Bs. {item.precioBs}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.disponible ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'}`}>
                            {item.disponible ? 'Disponible' : 'Agotado'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => toggleAvailability(item.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${item.disponible ? 'bg-red-900 text-red-200 hover:bg-red-800' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
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
      </main>

      {/* Cart Modal */}
      {customerModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-[520px] bg-[#1c1917] h-full flex flex-col justify-between border-l border-[#3a3632] shadow-2xl">
            <div className="p-6 border-b border-[#3a3632] flex items-center justify-between bg-[#292524]">
              <h3 className="text-[18px] font-serif font-bold text-[#f5efe6]">{modalMode === 'bill' ? 'Tu Cuenta' : 'Tu Pedido en Carrito'}</h3>
              <button onClick={() => setCustomerModalOpen(false)} className="p-2 rounded-xl bg-[#1c1917] text-[#a8a29e]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {(() => {
                const activeOrder = tables.find(t => t.id === Number(currentTableId))?.currentOrder;
                const itemsToShow = modalMode === 'bill' ? (activeOrder?.items || []) : cart;
                const totalToShow = modalMode === 'bill' ? (activeOrder?.total || 0) : cartTotal;

                if (itemsToShow.length === 0) {
                  return (
                    <div className="text-center py-20 text-[#a8a29e]">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p>{modalMode === 'bill' ? 'No hay pedidos activos.' : 'Tu carrito está vacío.'}</p>
                    </div>
                  );
                }
                
                return (
                  <>
                    <div className="space-y-3">
                      {itemsToShow.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-[#292524] p-4 rounded-[16px] border border-[#3a3632]">
                          <div>
                            <h4 className="text-[14px] font-bold text-[#f5efe6]">{item.nombre}</h4>
                            <span className="text-xs text-[#ff7a00]">Bs. {(item.precioBs * item.qty).toFixed(2)}</span>
                          </div>
                          {modalMode === 'cart' ? (
                            <div className="flex items-center gap-2 bg-[#1c1917] px-2.5 py-1.5 rounded-xl border border-[#3a3632]">
                              <button onClick={() => updateCartQty(item.id, -1)}><Minus className="w-3.5 h-3.5" /></button>
                              <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                              <button onClick={() => updateCartQty(item.id, 1)}><Plus className="w-3.5 h-3.5" /></button>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-[#a8a29e]">{item.qty}x</span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-[#3a3632] flex justify-between text-lg font-bold text-[#f5efe6]">
                      <span>Total</span>
                      <span className="text-[#ff7a00]">Bs. {totalToShow.toFixed(2)}</span>
                    </div>

                    {modalMode === 'bill' && (
                      <div className="pt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => setPaymentMethod('QR')} className={`py-3 rounded-[12px] font-bold text-[14px] ${paymentMethod === 'QR' ? 'bg-[#ff7a00] text-white' : 'bg-[#3a3632] text-white'}`}>QR Banco Sol</button>
                          <button onClick={() => setPaymentMethod('EFECTIVO')} className={`py-3 rounded-[12px] font-bold text-[14px] ${paymentMethod === 'EFECTIVO' ? 'bg-[#ff7a00] text-white' : 'bg-[#3a3632] text-white'}`}>Efectivo</button>
                        </div>
                        
                        {paymentMethod === 'QR' && (
                          <div className="text-center space-y-3">
                            <img src="URL_DE_TU_QR_BANCO_SOL" alt="QR Banco Sol" className="w-40 h-40 mx-auto border-4 border-white" />
                            <button onClick={() => handlePayment('QR')} className="w-full py-3 rounded-[12px] bg-emerald-600 text-white font-bold">Confirmar Pago</button>
                          </div>
                        )}
                        
                        {paymentMethod === 'EFECTIVO' && (
                          <div className="space-y-3">
                            <input type="number" placeholder="Monto entregado (Bs.)" value={cashAmount} onChange={(e) => setCashAmount(e.target.value)} className="w-full bg-[#292524] border border-[#3a3632] rounded-xl px-4 py-3 text-[#f5efe6]" />
                            {cashAmount && Number(cashAmount) >= totalToShow && <p className="text-emerald-400 font-bold text-center">Cambio: Bs. {(Number(cashAmount) - totalToShow).toFixed(2)}</p>}
                            <button onClick={() => handlePayment('EFECTIVO')} disabled={!cashAmount || Number(cashAmount) < totalToShow} className="w-full py-3 rounded-[12px] bg-emerald-600 disabled:opacity-50 text-white font-bold">Confirmar Pago</button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            {modalMode === 'cart' && (
              <div className="p-6 bg-[#292524] border-t border-[#3a3632]">
                <button onClick={placeOrder} disabled={cart.length === 0} className="w-full py-3.5 rounded-[16px] bg-[#ff7a00] hover:bg-[#ff8c1a] disabled:opacity-50 text-white font-bold text-[15px]">Enviar Pedido</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrModalTable && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#292524] border border-[#3a3632] rounded-[24px] max-w-md w-full p-6 space-y-6 text-center shadow-2xl">
            <h3 className="text-[22px] font-serif font-extrabold text-[#f5efe6]">{qrModalTable.name}</h3>
            <div className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center space-y-3">
              <QrCode className="w-32 h-32 text-black" />
              <span className="text-xs text-black font-bold">Mesa #{qrModalTable.id} • El Churo Mosito</span>
            </div>
            <button onClick={() => setQrModalTable(null)} className="w-full py-3 rounded-[14px] bg-[#ff7a00] text-white font-bold">Cerrar</button>
          </div>
        </div>
      )}

    </div>
  );
}
