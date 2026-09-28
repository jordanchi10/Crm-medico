import React from 'react';

interface Icon3DProps {
  className?: string;
  size?: number;
}

// 3D Isometric Kanban Board Icon
export const ThreeDKanbanIcon: React.FC<Icon3DProps> = ({ className = '', size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_2px_4px_rgba(13,148,136,0.3)] transition-transform duration-200 group-hover:scale-105 ${className}`}
  >
    <defs>
      <linearGradient id="kanban-col-1" x1="4" y1="4" x2="12" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2DD4BF" />
        <stop offset="1" stopColor="#0F766E" />
      </linearGradient>
      <linearGradient id="kanban-col-2" x1="12" y1="4" x2="20" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#0369A1" />
      </linearGradient>
      <linearGradient id="kanban-col-3" x1="20" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#818CF8" />
        <stop offset="1" stopColor="#4338CA" />
      </linearGradient>
      <linearGradient id="kanban-card" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="1" stopColor="#E2E8F0" stopOpacity="0.9" />
      </linearGradient>
    </defs>
    {/* Column 1 Base */}
    <rect x="3" y="5" width="7.5" height="22" rx="2.5" fill="url(#kanban-col-1)" />
    <rect x="4.5" y="7.5" width="4.5" height="5" rx="1.5" fill="url(#kanban-card)" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.15))" />
    <rect x="4.5" y="14.5" width="4.5" height="8" rx="1.5" fill="url(#kanban-card)" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.15))" />

    {/* Column 2 Base (Elevated 3D) */}
    <rect x="12" y="3.5" width="7.5" height="24.5" rx="2.5" fill="url(#kanban-col-2)" />
    <rect x="13.5" y="6" width="4.5" height="8" rx="1.5" fill="url(#kanban-card)" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.2))" />
    <rect x="13.5" y="16" width="4.5" height="6" rx="1.5" fill="url(#kanban-card)" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.2))" />

    {/* Column 3 Base */}
    <rect x="21" y="6" width="7.5" height="20" rx="2.5" fill="url(#kanban-col-3)" />
    <rect x="22.5" y="8.5" width="4.5" height="7" rx="1.5" fill="url(#kanban-card)" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.15))" />
    <rect x="22.5" y="17.5" width="4.5" height="4.5" rx="1.5" fill="url(#kanban-card)" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.15))" />
  </svg>
);

// 3D Isometric Doctors Directory Icon
export const ThreeDProspectsIcon: React.FC<Icon3DProps> = ({ className = '', size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_2px_4px_rgba(2,132,199,0.3)] transition-transform duration-200 group-hover:scale-105 ${className}`}
  >
    <defs>
      <linearGradient id="prosp-back" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="1" stopColor="#1E40AF" />
      </linearGradient>
      <linearGradient id="prosp-front" x1="4" y1="8" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
      <linearGradient id="med-cross" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#F0FDF4" />
      </linearGradient>
    </defs>
    {/* Shadow card */}
    <rect x="8" y="3" width="18" height="23" rx="3.5" fill="url(#prosp-back)" opacity="0.6" />
    
    {/* Main card 3D */}
    <rect x="4" y="6" width="20" height="23" rx="3.5" fill="url(#prosp-front)" />
    
    {/* Card highlight shine */}
    <path d="M5.5 8C5.5 6.9 6.4 6 7.5 6H18C13 10 9 16 7 24H5.5V8Z" fill="white" opacity="0.15" />
    
    {/* Doctor Avatar / Stethoscope cross */}
    <circle cx="14" cy="13" r="4" fill="white" opacity="0.9" />
    <path d="M9 23C9 19.5 11.5 18 14 18C16.5 18 19 19.5 19 23H9Z" fill="white" opacity="0.9" />

    {/* 3D Medical Badge Badge Overlapping */}
    <circle cx="23" cy="21" r="5.5" fill="#10B981" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.25))" />
    <rect x="21.75" y="18" width="2.5" height="6" rx="0.8" fill="url(#med-cross)" />
    <rect x="20" y="19.75" width="6" height="2.5" rx="0.8" fill="url(#med-cross)" />
  </svg>
);

// 3D Isometric Analytics & Chart Icon
export const ThreeDAnalyticsIcon: React.FC<Icon3DProps> = ({ className = '', size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_2px_4px_rgba(234,88,12,0.3)] transition-transform duration-200 group-hover:scale-105 ${className}`}
  >
    <defs>
      <linearGradient id="bar-1" x1="4" y1="16" x2="10" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBF24" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="bar-2" x1="12" y1="10" x2="18" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FB923C" />
        <stop offset="1" stopColor="#EA580C" />
      </linearGradient>
      <linearGradient id="bar-3" x1="20" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34D399" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="trend-arrow" x1="4" y1="18" x2="28" y2="4" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#FDE68A" />
      </linearGradient>
    </defs>
    {/* Base plate */}
    <rect x="3" y="26" width="26" height="3" rx="1.5" fill="#334155" opacity="0.8" />

    {/* 3D Bar 1 */}
    <rect x="4.5" y="17" width="6.5" height="9" rx="2" fill="url(#bar-1)" />
    <path d="M4.5 18C4.5 17.5 5 17 5.5 17H10C10.5 17 11 17.5 11 18L10 19H5.5L4.5 18Z" fill="#FDE68A" />

    {/* 3D Bar 2 */}
    <rect x="12.5" y="11" width="6.5" height="15" rx="2" fill="url(#bar-2)" />
    <path d="M12.5 12C12.5 11.5 13 11 13.5 11H18C18.5 11 19 11.5 19 12L18 13H13.5L12.5 12Z" fill="#FED7AA" />

    {/* 3D Bar 3 */}
    <rect x="20.5" y="5" width="6.5" height="21" rx="2" fill="url(#bar-3)" />
    <path d="M20.5 6C20.5 5.5 21 5 21.5 5H26C26.5 5 27 5.5 27 6L26 7H21.5L20.5 6Z" fill="#A7F3D0" />

    {/* 3D Upward Trend Arrow */}
    <path
      d="M4 18L13 11L19 15L27 6"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="drop-shadow(0 2px 2px rgba(0,0,0,0.3))"
    />
    <path d="M22 6H27V11" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 3D Isometric WhatsApp Bubble Icon
export const ThreeDWhatsAppIcon: React.FC<Icon3DProps> = ({ className = '', size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_2px_4px_rgba(22,163,74,0.3)] transition-transform duration-200 group-hover:scale-105 ${className}`}
  >
    <defs>
      <linearGradient id="wa-3d-bg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4ADE80" />
        <stop offset="0.6" stopColor="#22C55E" />
        <stop offset="1" stopColor="#15803D" />
      </linearGradient>
      <linearGradient id="wa-inner-shine" x1="6" y1="6" x2="26" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" stopOpacity="0.4" />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
    </defs>
    {/* 3D Bubble Body */}
    <path
      d="M16 3C8.82 3 3 8.6 3 15.5C3 18.2 3.9 20.7 5.5 22.8L4 28.5L10 27C11.8 27.7 13.9 28 16 28C23.18 28 29 22.4 29 15.5C29 8.6 23.18 3 16 3Z"
      fill="url(#wa-3d-bg)"
    />
    {/* Inner highlight */}
    <path
      d="M16 5C9.9 5 5 9.7 5 15.5C5 17.7 5.7 19.8 7 21.5L6 25.5L10.2 24.4C11.9 25.4 13.9 26 16 26C22.1 26 27 21.3 27 15.5C27 9.7 22.1 5 16 5Z"
      fill="url(#wa-inner-shine)"
    />
    {/* Phone handset inside */}
    <path
      d="M21.5 19.2C21.2 19.9 19.8 20.6 19.1 20.7C18.6 20.8 17.9 20.8 15.2 19.6C12.4 18.4 10.6 15.4 10.5 15.2C10.3 15.1 9.5 14 9.5 12.8C9.5 11.6 10.1 11.1 10.3 10.8C10.5 10.6 10.8 10.5 11.1 10.5C11.2 10.5 11.4 10.5 11.5 10.5C11.8 10.5 12 10.6 12.1 10.9C12.4 11.6 13 13.1 13.1 13.3C13.2 13.5 13.2 13.7 13.1 13.9C13 14.1 12.8 14.3 12.6 14.5C12.4 14.7 12.3 14.8 12.4 15.1C12.6 15.5 13.2 16.5 14.1 17.3C15.3 18.3 16.3 18.6 16.6 18.7C16.8 18.8 17.1 18.8 17.2 18.6C17.4 18.4 17.9 17.8 18.1 17.5C18.3 17.2 18.5 17.3 18.8 17.4C19 17.5 20.5 18.2 20.8 18.4C21.1 18.5 21.3 18.6 21.4 18.8C21.4 19 21.4 19.1 21.5 19.2Z"
      fill="white"
      filter="drop-shadow(0 1px 1px rgba(0,0,0,0.2))"
    />
  </svg>
);

// 3D Isometric Services ($99 / $150 USD) Icon
export const ThreeDServicesIcon: React.FC<Icon3DProps> = ({ className = '', size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_2px_4px_rgba(20,184,166,0.3)] transition-transform duration-200 group-hover:scale-105 ${className}`}
  >
    <defs>
      <linearGradient id="tag-bg" x1="4" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#14B8A6" />
        <stop offset="1" stopColor="#0F766E" />
      </linearGradient>
      <linearGradient id="coin-gold" x1="16" y1="12" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE047" />
        <stop offset="0.6" stopColor="#EAB308" />
        <stop offset="1" stopColor="#CA8A04" />
      </linearGradient>
    </defs>
    {/* 3D Briefcase / Catalog Frame */}
    <rect x="4" y="9" width="24" height="18" rx="4" fill="url(#tag-bg)" />
    {/* Handle */}
    <path
      d="M11 9V6.5C11 5.4 11.9 4.5 13 4.5H19C20.1 4.5 21 5.4 21 6.5V9"
      stroke="#0D9488"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M12 9V7C12 6.5 12.5 6 13 6H19C19.5 6 20 6.5 20 7V9"
      stroke="#2DD4BF"
      strokeWidth="1.5"
    />
    
    {/* Latch */}
    <rect x="13" y="11" width="6" height="3" rx="1" fill="#F8FAFC" opacity="0.9" />

    {/* 3D Gold Coin with $ Sign Overlapping */}
    <circle cx="22" cy="21" r="6" fill="url(#coin-gold)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />
    <circle cx="22" cy="21" r="5" stroke="#FEF08A" strokeWidth="0.75" />
    <text
      x="22"
      y="24"
      fontSize="8.5"
      fontWeight="900"
      fontFamily="sans-serif"
      fill="#713F12"
      textAnchor="middle"
    >
      $
    </text>
  </svg>
);

// 3D Isometric "Mi Jornada de Hoy" (Dashboard Cockpit) Icon
export const ThreeDDashboardIcon: React.FC<Icon3DProps> = ({ className = '', size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_2px_4px_rgba(245,158,11,0.3)] transition-transform duration-200 group-hover:scale-105 ${className}`}
  >
    <defs>
      <linearGradient id="dash-sun" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" />
        <stop offset="1" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="dash-rocket" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    <rect x="4" y="5" width="24" height="22" rx="4.5" fill="url(#dash-sun)" />
    <rect x="7" y="8" width="8" height="6.5" rx="2" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="17" y="8" width="8" height="6.5" rx="2" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="7" y="17" width="18" height="7" rx="2" fill="#FFFFFF" fillOpacity="0.95" />
    <circle cx="10" cy="20.5" r="1.5" fill="#10B981" />
    <rect x="13.5" y="19.5" width="9" height="2" rx="1" fill="#CBD5E1" />
  </svg>
);

// 3D Isometric Calendar Icon
export const ThreeDCalendarIcon: React.FC<Icon3DProps> = ({ className = '', size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_2px_4px_rgba(14,165,233,0.3)] transition-transform duration-200 group-hover:scale-105 ${className}`}
  >
    <defs>
      <linearGradient id="cal-body" x1="4" y1="6" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
      <linearGradient id="cal-header" x1="4" y1="4" x2="28" y2="12" gradientUnits="userSpaceOnUse">
        <stop stopColor="#EF4444" />
        <stop offset="1" stopColor="#B91C1C" />
      </linearGradient>
    </defs>
    <rect x="4" y="6" width="24" height="21" rx="4" fill="url(#cal-body)" />
    <path d="M4 10C4 7.79086 5.79086 6 8 6H24C26.2091 6 28 7.79086 28 10V12H4V10Z" fill="url(#cal-header)" />
    <rect x="8" y="3" width="3" height="5" rx="1.5" fill="#F8FAFC" />
    <rect x="21" y="3" width="3" height="5" rx="1.5" fill="#F8FAFC" />
    {/* Calendar grid dots */}
    <rect x="8" y="15" width="3" height="3" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="14.5" y="15" width="3" height="3" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="21" y="15" width="3" height="3" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="8" y="20.5" width="3" height="3" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="14.5" y="20.5" width="3" height="3" rx="1" fill="#FDE047" />
    <rect x="21" y="20.5" width="3" height="3" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
  </svg>
);

// 3D Isometric Cadence / Sequence Icon
export const ThreeDCadenceIcon: React.FC<Icon3DProps> = ({ className = '', size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_2px_4px_rgba(139,92,246,0.3)] transition-transform duration-200 group-hover:scale-105 ${className}`}
  >
    <defs>
      <linearGradient id="cad-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A855F7" />
        <stop offset="1" stopColor="#6B21A8" />
      </linearGradient>
    </defs>
    <rect x="4" y="5" width="24" height="22" rx="4.5" fill="url(#cad-grad)" />
    {/* Sequence steps steps connected */}
    <circle cx="10" cy="11" r="2.5" fill="#F8FAFC" />
    <circle cx="16" cy="16" r="2.5" fill="#F8FAFC" />
    <circle cx="22" cy="21" r="2.5" fill="#34D399" />
    <path d="M12 12.5L14 14.5M18 17.5L20 19.5" stroke="#F8FAFC" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 3D Isometric Renewals / Churn Prevention Icon
export const ThreeDRenewalsIcon: React.FC<Icon3DProps> = ({ className = '', size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_2px_4px_rgba(16,185,129,0.3)] transition-transform duration-200 group-hover:scale-105 ${className}`}
  >
    <defs>
      <linearGradient id="ren-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10B981" />
        <stop offset="1" stopColor="#047857" />
      </linearGradient>
    </defs>
    <rect x="4" y="5" width="24" height="22" rx="4.5" fill="url(#ren-grad)" />
    {/* Refresh circular arrow */}
    <path
      d="M16 10C12.7 10 10 12.7 10 16C10 17.6 10.6 19.1 11.7 20.2L13.1 18.8C12.4 18.1 12 17.1 12 16C12 13.8 13.8 12 16 12C17.3 12 18.5 12.6 19.2 13.6L17.5 15.3H22V10.8L20.6 12.2C19.5 10.8 17.8 10 16 10Z"
      fill="#FFFFFF"
    />
    <path
      d="M16 22C14.7 22 13.5 21.4 12.8 20.4L14.5 18.7H10V23.2L11.4 21.8C12.5 23.2 14.2 24 16 24C19.3 24 22 21.3 22 18C22 16.4 21.4 14.9 20.3 13.8L18.9 15.2C19.6 15.9 20 16.9 20 18C20 20.2 18.2 22 16 22Z"
      fill="#A7F3D0"
    />
  </svg>
);

// 3D Isometric Official Receipt Icon
export const ThreeDReceiptIcon: React.FC<Icon3DProps> = ({ className = '', size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_2px_4px_rgba(234,88,12,0.3)] transition-transform duration-200 group-hover:scale-105 ${className}`}
  >
    <defs>
      <linearGradient id="rec-body" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F8FAFC" />
        <stop offset="1" stopColor="#E2E8F0" />
      </linearGradient>
    </defs>
    <rect x="6" y="4" width="20" height="24" rx="3" fill="url(#rec-body)" stroke="#CBD5E1" strokeWidth="1.5" />
    <path d="M10 9H22M10 13H18M10 17H22M10 21H16" stroke="#475569" strokeWidth="1.75" strokeLinecap="round" />
    <circle cx="21" cy="21" r="3.5" fill="#10B981" />
    <path d="M19.5 21L20.5 22L22.5 20" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
