import React from 'react';

interface MobileMenuButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({
  onClick,
  isOpen = false
}) => {
  return (
    <div className="lg:hidden fixed top-20 left-4 z-50">
      <button
        onClick={onClick}
        className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>
  );
};

export default MobileMenuButton;