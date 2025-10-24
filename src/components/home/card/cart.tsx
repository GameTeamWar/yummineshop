import React from 'react';
import { X, ShoppingCart } from 'lucide-react';
import CartItem from './cartitem';

interface CartSidebarProps {
  darkMode: boolean;
  cartSidebarOpen: boolean;
  setCartSidebarOpen: (open: boolean) => void;
  cart: any[];
  cartTotal: number;
  setCart?: (cart: any[]) => void;
  setCartTotal?: (total: number) => void;
}

export default function CartSidebar({
  darkMode,
  cartSidebarOpen,
  setCartSidebarOpen,
  cart,
  cartTotal,
  setCart,
  setCartTotal
}: CartSidebarProps) {
  return (
    <>
      {/* Cart Sidebar */}
      <div className={`fixed top-[4.91rem] right-0 h-[calc(100vh-4rem)] w-80 z-50 transform transition-transform duration-300 ease-in-out cart-sidebar ${cartSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className={`h-full flex flex-col shadow-2xl ${darkMode ? 'bg-gray-900 border-l border-neutral-700' : 'bg-white border-l border-neutral-600'}`}>
          {/* Sidebar Header */}
          <div className={`flex items-center justify-between p-4 border-b border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Sepetim</h2>
            <button onClick={() => setCartSidebarOpen(false)} className={`p-2 rounded-lg transition-colors duration-300 ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'}`}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              /* Empty Cart State */
              <div className="flex flex-col items-center justify-center text-center h-full">
                <ShoppingCart className={`w-16 h-16 mb-4 ${darkMode ? 'text-neutral-600' : 'text-neutral-400'}`} />
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Sepetiniz Boş</h3>
                <p className={`text-sm mb-4 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Henüz ürün eklemediniz</p>
                <button className="px-6 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300">
                  Alışverişe Başla
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <CartItem
                    key={index}
                    item={item}
                    index={index}
                    darkMode={darkMode}
                    cart={cart}
                    setCart={setCart}
                    setCartTotal={setCartTotal}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cart Total - Below */}
          {cart.length > 0 && (
            <div className={`p-4 border-t ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
              {/* Fiyat Detayları */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span>Ürün Ücreti:</span>
                  <span>₺{cartTotal.toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Teslimat Ücreti:</span>
                  <span className="text-green-600">Ücretsiz</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>KDV (%18):</span>
                  <span>₺{(cartTotal * 0.18).toLocaleString('tr-TR')}</span>
                </div>
                <div className={`border-t pt-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Toplam:</span>
                    <span className="text-xl font-bold text-green-600">
                      ₺{(cartTotal + (cartTotal * 0.18)).toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
              <button className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                Siparişi Tamamla
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {cartSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setCartSidebarOpen(false)}></div>
      )}
    </>
  );
}
