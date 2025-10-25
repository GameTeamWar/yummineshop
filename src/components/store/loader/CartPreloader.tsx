import { useEffect, useState } from 'react';

export default function CartPreloader() {
  const [showLastMessage, setShowLastMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLastMessage(true);
    }, 14000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center max-w-xs w-full">
      {/* SVG Cart Animation */}
      <svg 
        className="block mx-auto mb-6 w-32 h-32" 
        viewBox="0 0 128 128" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Shopping cart line animation"
      >
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8">
          {/* Cart Track */}
          <g className="stroke-gray-300 dark:stroke-gray-700">
            <polyline points="4,4 21,4 26,22 124,22 112,64 35,64 39,80 106,80" />
            <circle cx="43" cy="111" r="13" />
            <circle cx="102" cy="111" r="13" />
          </g>
          
          {/* Animated Lines */}
          <g className="cart-color-light dark:cart-color-dark">
            <polyline 
              className="cart-top cart-lines"
              points="4,4 21,4 26,22 124,22 112,64 35,64 39,80 106,80" 
              strokeDasharray="338 338"
              strokeDashoffset="-338"
            />
            <g className="cart-wheel1 cart-lines">
              <circle 
                className="cart-wheel-stroke"
                cx="43" 
                cy="111" 
                r="13" 
                strokeDasharray="81.68 81.68" 
                strokeDashoffset="81.68" 
              />
            </g>
            <g className="cart-wheel2 cart-lines">
              <circle 
                className="cart-wheel-stroke"
                cx="102" 
                cy="111" 
                r="13" 
                strokeDasharray="81.68 81.68" 
                strokeDashoffset="81.68" 
              />
            </g>
          </g>
        </g>
      </svg>

      {/* Text Messages */}
      <div className="relative h-6">
        {!showLastMessage ? (
          <p className="msg-animation absolute w-full">
            Size ürünleri getiriyoruz…
          </p>
        ) : (
          <p className="msg-last-animation absolute w-full">
            Bu uzun sürüyor. Bir şeyler yanlış gidiyor.
          </p>
        )}
      </div>
    </div>
  );
}