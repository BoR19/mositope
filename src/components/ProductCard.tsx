import React from 'react';
import { Plus, Check, Clock } from 'lucide-react';
import { MenuItem } from '../types/index.ts';

interface ProductCardProps {
  product: MenuItem;
  onAddToCart: (product: MenuItem) => void;
  cartQty?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  cartQty = 0
}) => {
  return (
    <div className="group bg-[#292524] border border-[#3a3632] rounded-[20px] overflow-hidden flex flex-col justify-between hover:border-[#ff7a00]/50 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      {/* Product Image */}
      <div className="relative h-[180px] overflow-hidden bg-[#1c1917]">
        <img
          src={product.image}
          alt={product.nombre}
          loading="lazy"
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            product.disponible ? 'opacity-90' : 'opacity-30 grayscale'
          }`}
        />
        {!product.disponible && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
              Agotado
            </span>
          </div>
        )}
        {product.prepTime && product.disponible && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] text-[#f5efe6] font-medium border border-white/10">
            <Clock className="w-3 h-3 text-[#ff7a00]" />
            <span>{product.prepTime}</span>
          </div>
        )}
      </div>

      {/* Product Info & Action */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff7a00]">
              {product.categoria}
            </span>
            {product.notas && (
              <span className="text-[10px] text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium">
                {product.notas}
              </span>
            )}
          </div>
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
          <div className="text-xs text-[#a8a29e]">
            {cartQty > 0 && (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40">
                <Check className="w-3 h-3" /> {cartQty} en carrito
              </span>
            )}
          </div>
          <button
            onClick={() => onAddToCart(product)}
            disabled={!product.disponible}
            className="px-4 py-2 rounded-[12px] bg-[#ff7a00] hover:bg-[#ff8c1a] active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white text-[13px] font-semibold transition-all flex items-center gap-1.5 shadow-[0_4px_15px_rgba(255,122,0,0.3)] cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>
      </div>
    </div>
  );
};
