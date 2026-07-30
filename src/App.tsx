import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RegistrationDesk } from './components/RegistrationDesk';
import { FrontOfficeOperator } from './components/FrontOfficeOperator';
import { PublicDisplayMonitor } from './components/PublicDisplayMonitor';
import { AIAssistantTab } from './components/AIAssistantTab';
import { AnalyticsReports } from './components/AnalyticsReports';
import { getInitialStoreState, subscribeToStore } from './utils/queueStore';

export default function App() {
  const [activeTab, setActiveTab] = useState<'display' | 'register' | 'operator' | 'ai' | 'analytics'>('display');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [storeState, setStoreState] = useState(getInitialStoreState());

  // Check URL query param e.g. ?view=display or ?view=operator
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view && ['display', 'register', 'operator', 'ai', 'analytics'].includes(view)) {
      setActiveTab(view as any);
    }
  }, []);

  // Sync store updates
  useEffect(() => {
    const update = () => {
      setStoreState(getInitialStoreState());
    };
    update();
    const unsubscribe = subscribeToStore(update);
    return () => unsubscribe();
  }, []);

  const waitingUmumCount = storeState.tickets.filter(
    (t) => t.category === 'umum' && t.status === 'waiting'
  ).length;

  const waitingRentanCount = storeState.tickets.filter(
    (t) => t.category === 'rentan' && t.status === 'waiting'
  ).length;

  // If view is 'display' in isolated TV mode (or selected tab)
  if (activeTab === 'display') {
    return (
      <div className="min-h-screen bg-slate-950 font-sans antialiased">
        {/* TV Display with Navigation Bar Overlay */}
        <div className="no-print bg-slate-900 border-b border-slate-800 text-slate-300 py-1.5 px-4 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">Modus Monitor TV Ruang Tunggu</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('register')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold"
            >
              Ke Meja Registrasi
            </button>
            <button
              onClick={() => setActiveTab('operator')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold"
            >
              Ke Loket FO
            </button>
          </div>
        </div>

        <PublicDisplayMonitor
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={storeState.settings}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'register' && (
          <RegistrationDesk
            waitingUmumCount={waitingUmumCount}
            waitingRentanCount={waitingRentanCount}
            onOpenAI={() => setActiveTab('ai')}
          />
        )}

        {activeTab === 'operator' && (
          <FrontOfficeOperator soundEnabled={soundEnabled} />
        )}

        {activeTab === 'ai' && <AIAssistantTab />}

        {activeTab === 'analytics' && <AnalyticsReports />}
      </main>

      {/* Footer */}
      <footer className="no-print bg-slate-900 text-slate-400 text-xs py-4 px-6 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <img src="/logo-tanjungbalai.png" alt="Logo Kota Tanjungbalai" className="w-5 h-5 object-contain" />
          <span className="font-bold text-amber-400">Antrean Sentra Pelayanan Kito</span>
          <span>•</span>
          <span>Dinas Sosial Kota Tanjungbalai</span>
        </div>
        <div className="text-[11px] text-slate-400">
          <span>Jln. Jend. Sudirman Km. 1,5 Kota Tanjungbalai</span>
        </div>
      </footer>

    </div>
  );
}
