import { ShoppingBag, FileText } from 'lucide-react';

interface ModeToggleProps {
  darkMode: boolean;
  heroMode: string;
  setHeroMode: (mode: string) => void;
  user: any;
}

export default function ModeToggle({ darkMode, heroMode, setHeroMode, user }: ModeToggleProps) {
  if (!user) return null;

  return (
    <div className="relative">
      {/* Compact Tab Design */}
      <div className={`relative flex rounded-xl overflow-hidden border transition-all duration-300 ${darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/90 border-gray-200/50'} backdrop-blur-sm shadow-lg`}>

        {/* Sliding Indicator */}
        <div
          className={`absolute top-0 bottom-0 w-1/2 rounded-lg transition-all duration-300 ease-out ${
            heroMode === 'shopping'
              ? 'left-0 bg-linear-to-r from-blue-500 to-purple-500'
              : 'left-1/2 bg-linear-to-r from-green-500 to-teal-500'
          }`}
        ></div>

        {/* Shopping Tab */}
        <button
          onClick={() => setHeroMode('shopping')}
          className={`relative flex-1 px-3 sm:px-4 py-2.5 font-semibold transition-all duration-300 flex items-center justify-center gap-2 z-10 ${
            heroMode === 'shopping'
              ? 'text-white'
              : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
          }`}
        >
          <ShoppingBag className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${heroMode === 'shopping' ? 'animate-pulse' : ''}`} />
          <span className="text-xs sm:text-sm font-medium">Market</span>
        </button>

        {/* Documents Tab */}
        <button
          onClick={() => setHeroMode('documents')}
          className={`relative flex-1 px-3 sm:px-4 py-2.5 font-semibold transition-all duration-300 flex items-center justify-center gap-2 z-10 ${
            heroMode === 'documents'
              ? 'text-white'
              : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
          }`}
        >
          <FileText className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${heroMode === 'documents' ? 'animate-pulse' : ''}`} />
          <span className="text-xs sm:text-sm font-medium">Belge</span>
        </button>
      </div>
    </div>
  );
}