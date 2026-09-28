import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AppTab, MedicalLead, StageId, WhatsAppTemplate, MedicalService, PipelineSubView, WhatsAppSubView } from './types';
import { 
  loadLeads, 
  saveLeads, 
  resetLeadsToDefault, 
  loadTemplates, 
  saveTemplates, 
  resetTemplatesToDefault,
  performDailyAutoBackup,
  PlatformConfig,
  savePlatformConfig
} from './utils/storage';
import { loadServices, saveServices } from './data/servicesData';
import { STAGES } from './data/stages';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PipelineWorkspace } from './components/PipelineWorkspace';
import { WhatsAppWorkspace } from './components/WhatsAppWorkspace';
import { AnalyticsReport } from './components/AnalyticsReport';
import { DailyCockpitView } from './components/DailyCockpitView';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';
import { LeadModal } from './components/LeadModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { LocalHostingModal } from './components/LocalHostingModal';
import { ServicesManagerModal } from './components/ServicesManagerModal';
import { BulkLeadsModal } from './components/BulkLeadsModal';
import { NotificationCenter } from './components/NotificationCenter';
import { getOverdueLeads, notifyStaleLeadsBrowserAlert } from './utils/notificationService';
import { MobileAppInstallBanner } from './components/MobileAppInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [leads, setLeads] = useState<MedicalLead[]>(() => loadLeads());
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(() => loadTemplates());
  const [services, setServices] = useState<MedicalService[]>(() => loadServices());
  const [currentTab, setCurrentTab] = useState<AppTab>('today');
  const [pipelineSubView, setPipelineSubView] = useState<PipelineSubView>('kanban');
  const [whatsappSubView, setWhatsappSubView] = useState<WhatsAppSubView>('cadence');

  // Dark Mode State with LocalStorage Persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('medcrm_theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Apply dark mode class to html element
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('medcrm_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('medcrm_theme', 'light');
      }
    } catch (e) {
      console.error('Error toggling theme', e);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Unified tab navigation handler with subview routing
  const handleNavigateTab = (targetTab: AppTab) => {
    if (targetTab === 'kanban' || targetTab === 'table' || targetTab === 'calendar' || targetTab === 'renewals') {
      setCurrentTab('pipeline');
      setPipelineSubView(targetTab);
    } else if (targetTab === 'cadence' || targetTab === 'templates') {
      setCurrentTab('whatsapp');
      setWhatsappSubView(targetTab);
    } else {
      setCurrentTab(targetTab);
    }
  };

  // Modals state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<MedicalLead | null>(null);
  const [defaultStageForNew, setDefaultStageForNew] = useState<StageId>('prospecto');

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [leadForWhatsApp, setLeadForWhatsApp] = useState<MedicalLead | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [leadForReceipt, setLeadForReceipt] = useState<MedicalLead | null>(null);

  const [isLocalHostingModalOpen, setIsLocalHostingModalOpen] = useState(false);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [thresholdHours, setThresholdHours] = useState(48);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const handleOpenReceipt = (lead: MedicalLead) => {
    setLeadForReceipt(lead);
    setIsReceiptModalOpen(true);
  };

  // Compute overdue leads (+48h without contact)
  const overdueLeads = getOverdueLeads(leads, thresholdHours);

  // Check and trigger background browser notification if overdue
  useEffect(() => {
    if (overdueLeads.length > 0) {
      notifyStaleLeadsBrowserAlert(overdueLeads);
    }
    const interval = setInterval(() => {
      const stale = getOverdueLeads(leads, thresholdHours);
      if (stale.length > 0) {
        notifyStaleLeadsBrowserAlert(stale);
      }
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [leads.length, thresholdHours]);

  // Sync leads to storage whenever leads state changes
  useEffect(() => {
    saveLeads(leads);
  }, [leads]);

  // Sync templates to storage
  useEffect(() => {
    saveTemplates(templates);
  }, [templates]);

  // Sync services to storage
  useEffect(() => {
    saveServices(services);
  }, [services]);

  // Periodic automatic backup scheduler (checks every 60 seconds against configured interval or daily hour)
  useEffect(() => {
    if (leads.length > 0) {
      performDailyAutoBackup(leads, templates);
    }
    const autoBackupInterval = setInterval(() => {
      if (leads.length > 0) {
        performDailyAutoBackup(leads, templates);
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(autoBackupInterval);
  }, [leads, templates]);

  // Manual save trigger for the user (guarantees local persistence and takes an instant snapshot)
  const handleManualSave = () => {
    saveLeads(leads);
    saveTemplates(templates);
    saveServices(services);
    performDailyAutoBackup(leads, templates, true, 'manual');
  };

  // Celebration confetti when closing a deal
  const fireConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Stage change handler
  const handleStageChange = (leadId: string, newStage: StageId) => {
    const stageConfig = STAGES.find((s) => s.id === newStage);
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);

    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === leadId) {
          const wasWon = lead.stage === 'ganado';
          const isNowWon = newStage === 'ganado';

          if (!wasWon && isNowWon) {
            fireConfetti();
          }

          const newHistory = [
            {
              id: `act-${Date.now()}`,
              date: dateStr,
              type: 'etapa' as const,
              description: `Movido a la etapa: ${stageConfig?.name || newStage}`
            },
            ...(lead.history || [])
          ];

          return {
            ...lead,
            stage: newStage,
            lastContactDate: now.toISOString().split('T')[0],
            history: newHistory
          };
        }
        return lead;
      })
    );
  };

  // Save or update lead
  const handleSaveLead = (savedLead: MedicalLead) => {
    setLeads((prev) => {
      const exists = prev.some((l) => l.id === savedLead.id);
      if (exists) {
        return prev.map((l) => (l.id === savedLead.id ? savedLead : l));
      } else {
        return [savedLead, ...prev];
      }
    });

    if (savedLead.stage === 'ganado') {
      fireConfetti();
    }
  };

  // Delete lead
  const handleDeleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
  };

  // Log activity (e.g. from WhatsApp sending or notes)
  const handleLogActivity = (leadId: string, description: string) => {
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);

    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === leadId) {
          const newHistory = [
            {
              id: `act-${Date.now()}`,
              date: dateStr,
              type: 'whatsapp' as const,
              description
            },
            ...(lead.history || [])
          ];
          return {
            ...lead,
            lastContactDate: now.toISOString().split('T')[0],
            history: newHistory
          };
        }
        return lead;
      })
    );
  };

  // Open modals
  const handleOpenNewLead = (stage: StageId = 'prospecto') => {
    setLeadToEdit(null);
    setDefaultStageForNew(stage);
    setIsLeadModalOpen(true);
  };

  const handleOpenEditLead = (lead: MedicalLead) => {
    setLeadToEdit(lead);
    setIsLeadModalOpen(true);
  };

  const handleOpenWhatsApp = (lead: MedicalLead) => {
    setLeadForWhatsApp(lead);
    setIsWhatsAppModalOpen(true);
  };

  // Reset to defaults
  const handleResetData = () => {
    if (window.confirm('¿Deseas restaurar la lista de médicos especialistas a los datos iniciales de demostración?')) {
      const initial = resetLeadsToDefault();
      setLeads([...initial]);
    }
  };

  const handleResetTemplates = () => {
    if (window.confirm('¿Deseas restaurar las plantillas de WhatsApp predeterminadas?')) {
      const initial = resetTemplatesToDefault();
      setTemplates([...initial]);
    }
  };

  const handleSaveTemplates = (newTemplates: WhatsAppTemplate[]) => {
    setTemplates(newTemplates);
    saveTemplates(newTemplates);
  };

  const handleImportBackup = (
    importedLeads: MedicalLead[], 
    importedTemplates?: WhatsAppTemplate[],
    importedConfig?: PlatformConfig,
    importedServices?: MedicalService[]
  ) => {
    setLeads(importedLeads);
    saveLeads(importedLeads);
    if (importedTemplates && importedTemplates.length > 0) {
      setTemplates(importedTemplates);
      saveTemplates(importedTemplates);
    }
    if (importedServices && importedServices.length > 0) {
      setServices(importedServices);
      saveServices(importedServices);
    }
    if (importedConfig) {
      savePlatformConfig(importedConfig);
    }
  };

  const handleImportBulkLeads = (newLeads: MedicalLead[]) => {
    setLeads((prev) => [...newLeads, ...prev]);
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleQuickMarkContacted = (leadId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const newHistory = [
            {
              id: `act-${Date.now()}`,
              date: `${today} ${timeStr}`,
              type: 'nota' as const,
              description: `Contacto registrado y verificado en CRM.`
            },
            ...(l.history || [])
          ];
          return {
            ...l,
            lastContactDate: today,
            history: newHistory
          };
        }
        return l;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row font-['Plus_Jakarta_Sans',sans-serif] selection:bg-teal-500 selection:text-white transition-colors duration-200">
      {/* Offline Alert Strip */}
      <OfflineIndicator />

      {/* PWA Mobile App Install Suggestion Banner */}
      <MobileAppInstallBanner />

      {/* Compact Left Sidebar for Desktop */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleNavigateTab}
        pipelineSubView={pipelineSubView}
        onPipelineSubViewChange={(sub) => {
          setCurrentTab('pipeline');
          setPipelineSubView(sub);
        }}
        whatsappSubView={whatsappSubView}
        onWhatsAppSubViewChange={(sub) => {
          setCurrentTab('whatsapp');
          setWhatsappSubView(sub);
        }}
        leads={leads}
        onNewLeadClick={() => handleOpenNewLead('prospecto')}
        onOpenServicesModal={() => setIsServicesModalOpen(true)}
        onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        onManualSave={handleManualSave}
        onOpenLocalHostingModal={() => setIsLocalHostingModalOpen(true)}
        overdueCount={overdueLeads.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        {/* Top Header Bar */}
        <Navbar
          currentTab={currentTab}
          setCurrentTab={handleNavigateTab}
          leads={leads}
          onNewLeadClick={() => handleOpenNewLead('prospecto')}
          onResetData={handleResetData}
          onOpenLocalHostingModal={() => setIsLocalHostingModalOpen(true)}
          onManualSave={handleManualSave}
          onOpenServicesModal={() => setIsServicesModalOpen(true)}
          overdueCount={overdueLeads.length}
          onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
          onOpenBulkModal={() => setIsBulkModalOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        {/* Main View Area: 4 High-Value Workspaces */}
        <main className="flex-1">
          {currentTab === 'today' && (
            <DailyCockpitView
              leads={leads}
              onOpenWhatsApp={handleOpenWhatsApp}
              onOpenEdit={handleOpenEditLead}
              onQuickMarkContacted={handleQuickMarkContacted}
              onNavigateTab={handleNavigateTab}
              onOpenReceipt={handleOpenReceipt}
              onOpenNewLead={() => handleOpenNewLead('prospecto')}
            />
          )}

          {(currentTab === 'pipeline' || currentTab === 'kanban' || currentTab === 'table' || currentTab === 'calendar' || currentTab === 'renewals') && (
            <PipelineWorkspace
              leads={leads}
              subView={
                currentTab === 'kanban' || currentTab === 'table' || currentTab === 'calendar' || currentTab === 'renewals'
                  ? currentTab
                  : pipelineSubView
              }
              onSubViewChange={(view) => {
                setPipelineSubView(view);
                if (currentTab !== 'pipeline') setCurrentTab('pipeline');
              }}
              onOpenEdit={handleOpenEditLead}
              onOpenWhatsApp={handleOpenWhatsApp}
              onDeleteLead={handleDeleteLead}
              onStageChange={handleStageChange}
              onAddNewLeadInStage={(stage) => handleOpenNewLead(stage)}
              onOpenNewLead={() => handleOpenNewLead('prospecto')}
              onOpenReceipt={handleOpenReceipt}
              onOpenServicesModal={() => setIsServicesModalOpen(true)}
              onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
              onSaveLead={handleSaveLead}
            />
          )}

          {(currentTab === 'whatsapp' || currentTab === 'cadence' || currentTab === 'templates') && (
            <WhatsAppWorkspace
              leads={leads}
              templates={templates}
              subView={
                currentTab === 'cadence' || currentTab === 'templates'
                  ? currentTab
                  : whatsappSubView
              }
              onSubViewChange={(view) => {
                setWhatsappSubView(view);
                if (currentTab !== 'whatsapp') setCurrentTab('whatsapp');
              }}
              onOpenWhatsApp={handleOpenWhatsApp}
              onOpenEdit={handleOpenEditLead}
              onStageChange={handleStageChange}
              onLogActivity={handleLogActivity}
              onSaveTemplates={handleSaveTemplates}
              onResetTemplates={handleResetTemplates}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsReport leads={leads} />
          )}
        </main>
      </div>

      {/* Lead Create / Edit Modal (With Sector Location & Base Services Selection) */}
      <LeadModal
        isOpen={isLeadModalOpen}
        leadToEdit={leadToEdit}
        defaultStage={defaultStageForNew}
        services={services}
        onClose={() => setIsLeadModalOpen(false)}
        onSaveLead={handleSaveLead}
        onDeleteLead={handleDeleteLead}
        onOpenWhatsApp={handleOpenWhatsApp}
        onOpenReceipt={handleOpenReceipt}
        onOpenServicesModal={() => setIsServicesModalOpen(true)}
        onOpenBulkModal={() => {
          setIsLeadModalOpen(false);
          setIsBulkModalOpen(true);
        }}
      />

      {/* Official Digital Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        lead={leadForReceipt}
        onLogActivity={handleLogActivity}
      />

      {/* Bulk Lead Registration Modal (Excel / CSV / Google Maps Mass Parser) */}
      <BulkLeadsModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onImportBulkLeads={handleImportBulkLeads}
        services={services}
      />

      {/* Inactivity Notifications & Desk Alerts Center */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        overdueLeads={overdueLeads}
        allLeads={leads}
        onOpenWhatsApp={handleOpenWhatsApp}
        onOpenEditLead={handleOpenEditLead}
        onQuickMarkContacted={handleQuickMarkContacted}
        onFilterOverdueInView={() => {
          setIsNotificationCenterOpen(false);
          setCurrentTab('table');
        }}
        thresholdHours={thresholdHours}
        onThresholdChange={setThresholdHours}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={() => setIsSoundEnabled(!isSoundEnabled)}
      />

      {/* Services Manager Modal (Base services $99 / $150 and custom additions) */}
      {isServicesModalOpen && (
        <ServicesManagerModal
          services={services}
          leads={leads}
          onUpdateServices={setServices}
          onClose={() => setIsServicesModalOpen(false)}
        />
      )}

      {/* WhatsApp Quick Sender Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        lead={leadForWhatsApp}
        templates={templates}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onLogActivity={handleLogActivity}
      />

      {/* Local Hosting & cPanel Controller Modal */}
      <LocalHostingModal
        isOpen={isLocalHostingModalOpen}
        onClose={() => setIsLocalHostingModalOpen(false)}
        leads={leads}
        templates={templates}
        onImportBackup={handleImportBackup}
        onManualSave={handleManualSave}
      />
    </div>
  );
}
