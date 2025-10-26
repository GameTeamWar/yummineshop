import React from 'react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose, children }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className=" inset-0 bg-black bg-opacity-50 z-40 hidden lg:block"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={` top-16 left-0 min-h-[calc(100vh-4rem)] w-96  bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50 border-r border-gray-200 dark:border-gray-700 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } hidden lg:translate-x-0 lg:static lg:inset-0 lg:w-96 lg:max-h-[calc(200vh-24rem)] lg:shadow-none lg:top-0 lg:block`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-0 border-gray-200 dark:border-gray-700">
          
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;