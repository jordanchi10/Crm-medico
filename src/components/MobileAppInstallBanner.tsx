import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const MobileAppInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('medcrm_pwa_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  if (isInstalled || isDismissed || (!isInstallable && !isIOS)) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('medcrm_pwa_banner_dismissed', 'true');
  };

  const handleAction = async () => {
    if (isInstallable) {
      await install();
    }
  };

  return (
    <div className="md:hidden bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-inner text-xs border-b border-teal-700/50">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shrink-0 shadow-sm text-white font-black text-sm">
          🩺
        </div>
        <div className="min-w-0">
          <div className="font-bold text-[12px] truncate flex items-center gap-1.5">
            <span>Usar como Aplicación Móvil</span>
            <span className="text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider">
              PWA
            </span>
          </div>
          <p className="text-[10px] text-teal-200/90 truncate">
            Pantalla completa, más rápida y acceso desde tu inicio
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {isInstallable && (
          <button
            type="button"
            onClick={handleAction}
            className="px-2.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 font-black text-[11px] shadow-sm transition-all cursor-pointer flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar</span>
          </button>
        )}
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded-lg text-teal-300/80 hover:text-white hover:bg-teal-800/50 cursor-pointer"
          aria-label="Cerrar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
