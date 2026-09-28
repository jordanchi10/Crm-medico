import React, { useState } from 'react';
import { Download, Smartphone, Share2, PlusSquare, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'menu-item' | 'banner';
  onInstalled?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar', onInstalled }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as an installed standalone PWA, hide install triggers
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      const success = await install();
      setIsInstalling(false);
      if (success && onInstalled) {
        onInstalled();
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // If not installable and not iOS (e.g. desktop browser that doesn't support or already prompted), only show in menu if explicitly wanted
  if (!isInstallable && !isIOS && variant !== 'menu-item') {
    return null;
  }

  return (
    <>
      {variant === 'navbar' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-800 border border-teal-200/80 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
          title="Instalar MedCRM en tu teléfono o computadora"
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="hidden xs:inline">Instalar App</span>
          <span className="xs:hidden">App</span>
        </button>
      )}

      {variant === 'menu-item' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 hover:bg-teal-50 text-slate-800 font-semibold transition-colors cursor-pointer border-t border-slate-100"
        >
          <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span>Instalar como App Móvil</span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.2 rounded">
                PWA
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-normal">
              Accede a pantalla completa sin barras de navegador
            </div>
          </div>
        </button>
      )}

      {/* iOS Safari Guided Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            {/* Mobile Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden mb-2" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-red-400 flex items-center justify-center text-white shadow-md shadow-red-500/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Instalar MedCRM en iPhone / iPad</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Úsalo como app nativa a pantalla completa</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Presiona el botón "Compartir" en Safari</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    Es el icono del cuadro con flecha hacia arriba (<Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 inline" />) en la barra inferior o superior de Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Selecciona "Agregar a pantalla de inicio"</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    Baja en las opciones y toca (<PlusSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 inline" />) <strong>"Agregar a inicio"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300">
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  ¡Listo! Se creará el acceso directo con icono médico en tu pantalla principal y funcionará rápido y a pantalla completa.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
