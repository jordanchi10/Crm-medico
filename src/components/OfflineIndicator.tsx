import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 flex items-center justify-center gap-2 shadow-xs transition-all">
      <WifiOff className="w-3.5 h-3.5 animate-pulse" />
      <span>Modo sin conexión: Trabajando en almacenamiento local seguro</span>
    </div>
  );
};
