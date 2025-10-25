import React from 'react';
import { X } from 'lucide-react';

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    image: string;
    store: string;
    total: number;
  };
  index: number;
  darkMode: boolean;
  cart: any[];
  setCart?: (cart: any[]) => void;
  setCartTotal?: (total: number) => void;
  addToCart?: (productId: string) => void;
  removeFromCart?: (productId: string) => void;
  deleteItemFromCart?: (productId: string) => void;
}

export default function CartItem({ item, index, darkMode, cart, setCart, setCartTotal, addToCart, removeFromCart, deleteItemFromCart }: CartItemProps) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg shrink-0" />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{item.name}</h4>
        <p className="text-xs text-gray-600">{item.store}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col ">
            {item.originalPrice && item.originalPrice > item.price ? (
              <>
                <span className={`text-xs line-through ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  ₺{(item.originalPrice * item.quantity).toLocaleString('tr-TR')}
                </span>
                <span className="text-sm font-semibold text-green-600">
                  ₺{item.total.toLocaleString('tr-TR')}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-green-600">
                ₺{item.total.toLocaleString('tr-TR')}
              </span>
            )}
          </div>
          {/* Adet Kontrolü */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (item.quantity > 1 && removeFromCart) {
                  removeFromCart(item.id);
                }
              }}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } ${item.quantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={item.quantity <= 1}
            >
              -
            </button>
            <span className="text-sm font-medium min-w-6 text-center">{item.quantity}</span>
            <button
              onClick={() => {
                if (addToCart) addToCart(item.id);
              }}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
