import React from 'react';
import { Plus } from 'lucide-react';

interface MobileFloatingActionButtonProps {
  onClick: () => void;
}

export const MobileFloatingActionButton: React.FC<MobileFloatingActionButtonProps> = ({ onClick }) => {
  return (
    <button
      id="mobile-fab-new-lead"
      type="button"
      onClick={onClick}
      className="md:hidden fixed bottom-20 right-4 z-30 w-13 h-13 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-700 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-teal-700/40 active:scale-90 hover:scale-105 transition-all cursor-pointer border-2 border-white"
      aria-label="Registrar nuevo médico"
      title="Registrar nuevo médico"
    >
      <Plus className="w-6 h-6 stroke-[2.5]" />
    </button>
  );
};
