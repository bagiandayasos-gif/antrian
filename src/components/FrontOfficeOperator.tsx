import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Megaphone, 
  RotateCcw, 
  CheckCircle, 
  SkipForward, 
  Users, 
  Accessibility, 
  UserCheck, 
  Clock, 
  ShieldAlert, 
  ChevronRight,
  User,
  Coffee,
  CircleDot
} from 'lucide-react';
import { CounterId, CounterState, QueueTicket } from '../types';
import { 
  getInitialStoreState, 
  callNextTicket, 
  recallTicket, 
  finishTicket, 
  skipTicket, 
  updateCounterOfficer,
  resetDailyQueue,
  subscribeToStore 
} from '../utils/queueStore';
import { announceTicketCall } from '../utils/audio';

interface FrontOfficeOperatorProps {
  soundEnabled: boolean;
}

export const FrontOfficeOperator: React.FC<FrontOfficeOperatorProps> = ({ soundEnabled }) => {
  const [selectedCounterId, setSelectedCounterId] = useState<CounterId>('fo1');
  const [storeState, setStoreState] = useState(getInitialStoreState());
  const [officerNameInput, setOfficerNameInput] = useState<string>('');
  const [serviceDuration, setServiceDuration] = useState<number>(0);
  const [isCalling, setIsCalling] = useState<boolean>(false);

  // Sync state with local store changes
  useEffect(() => {
    const update = () => {
      const currentState = getInitialStoreState();
      setStoreState(currentState);
    };
    update();
    const unsubscribe = subscribeToStore(update);
    return () => unsubscribe();
  }, []);

  const activeCounter = storeState.counters.find(c => c.id === selectedCounterId) || storeState.counters[0];

  // Initialize officer name input when counter changes
  useEffect(() => {
    if (activeCounter) {
      setOfficerNameInput(activeCounter.officerName || '');
    }
  }, [selectedCounterId, activeCounter?.officerName]);

  // Find active serving ticket for this counter
  const currentTicket = storeState.tickets.find(
    t => t.id === activeCounter.currentTicketId && (t.status === 'calling' || t.status === 'serving')
  );

  // Timer for active service duration
  useEffect(() => {
    let interval: any = null;
    if (currentTicket && currentTicket.calledAt) {
      const startTime = new Date(currentTicket.calledAt).getTime();
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setServiceDuration(elapsed > 0 ? elapsed : 0);
      }, 1000);
    } else {
      setServiceDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentTicket]);

  // Handle Call Next
  const handleCallNext = async () => {
    setIsCalling(true);
    const called = callNextTicket(selectedCounterId);
    if (called && soundEnabled) {
      await announceTicketCall(
        called.ticketNumber,
        activeCounter.name,
        activeCounter.categoryLabel,
        { speed: storeState.settings.voiceSpeed, volume: storeState.settings.chimeVolume }
      );
    }
    setIsCalling(false);
  };

  // Handle Recall
  const handleRecall = async () => {
    setIsCalling(true);
    const recalled = recallTicket(selectedCounterId);
    if (recalled && soundEnabled) {
      await announceTicketCall(
        recalled.ticketNumber,
        activeCounter.name,
        activeCounter.categoryLabel,
        { speed: storeState.settings.voiceSpeed, volume: storeState.settings.chimeVolume }
      );
    }
    setIsCalling(false);
  };

  // Handle Finish
  const handleFinish = () => {
    finishTicket(selectedCounterId);
    setServiceDuration(0);
  };

  // Handle Skip
  const handleSkip = () => {
    skipTicket(selectedCounterId);
    setServiceDuration(0);
  };

  // Save Officer name
  const handleSaveOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    updateCounterOfficer(selectedCounterId, officerNameInput.trim() || 'Petugas Dinsos', activeCounter.status);
  };

  // Toggle break / active status
  const handleToggleStatus = (status: 'active' | 'break' | 'offline') => {
    updateCounterOfficer(selectedCounterId, activeCounter.officerName, status);
  };

  // Waiting tickets for active counter category
  const waitingTickets = storeState.tickets
    .filter(t => t.category === activeCounter.category && t.status === 'waiting')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Completed today by this counter
  const completedToday = storeState.tickets.filter(
    t => t.assignedCounter === selectedCounterId && t.status === 'completed'
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Counter Selector Tabs */}
      <div className="bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            <span>Pilih Loket Front Office Bertugas:</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Apakah Anda yakin ingin mereset seluruh data antrean hari ini? Action ini akan mengosongkan antrean.')) {
                  resetDailyQueue();
                }
              }}
              className="px-2.5 py-1 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[11px] font-semibold rounded-lg transition-all flex items-center gap-1"
              title="Kosongkan/Reset Seluruh Antrean Hari Ini"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Antrean</span>
            </button>
            <span className="text-[11px] text-slate-400">Total 4 Loket</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {storeState.counters.map(counter => {
            const isSelected = counter.id === selectedCounterId;
            const isRentan = counter.category === 'rentan';
            const countWaiting = storeState.tickets.filter(
              t => t.category === counter.category && t.status === 'waiting'
            ).length;

            return (
              <button
                key={counter.id}
                onClick={() => setSelectedCounterId(counter.id)}
                className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? isRentan
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-lg shadow-amber-500/20 font-bold'
                      : 'bg-white text-slate-950 border-white shadow-lg font-bold'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold">{counter.code}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      isRentan ? 'bg-slate-950 text-amber-400' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {counter.category === 'rentan' ? 'Prioritas' : 'Umum'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold truncate">{counter.name.split(' - ')[0]}</h3>
                  <p className="text-[10px] opacity-80 truncate">{counter.officerName || 'Belum diisi'}</p>
                </div>

                <div className="mt-2 pt-2 border-t border-black/10 flex items-center justify-between text-[11px]">
                  <span>Menunggu:</span>
                  <span className="font-extrabold px-1.5 py-0.2 rounded bg-black/10">{countWaiting} Tiket</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace for Selected Counter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Operator Control & Active Ticket (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Calling / Serving Card */}
          <div className={`rounded-2xl p-6 shadow-xl border relative overflow-hidden ${
            activeCounter.category === 'rentan'
              ? 'bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border-amber-500/40 text-white'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950 uppercase">
                    {activeCounter.code}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {activeCounter.categoryLabel}
                  </span>
                </div>
                <h2 className="text-xl font-bold mt-1 text-white">
                  {activeCounter.name}
                </h2>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  activeCounter.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  <CircleDot className="w-3 h-3 animate-ping" />
                  {activeCounter.status === 'active' ? 'Loket Buka' : 'Loket Istirahat'}
                </span>
              </div>
            </div>

            {/* Serving Ticket Display */}
            {currentTicket ? (
              <div className="py-6 space-y-6">
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
                  
                  {/* Big Number */}
                  <div className="text-center md:text-left">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                      NOMOR ANTREAN DIPANGGIL
                    </span>
                    <div className="text-6xl font-black text-white tracking-tight my-1 drop-shadow-md">
                      {currentTicket.ticketNumber}
                    </div>
                    <div className="text-xs text-slate-300 flex items-center justify-center md:justify-start gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Durasi Pelayanan: <strong className="text-amber-400 font-mono text-sm">{formatDuration(serviceDuration)}</strong></span>
                    </div>
                  </div>

                  {/* Visitor details */}
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 text-xs space-y-2 w-full md:w-auto min-w-[260px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pengunjung:</span>
                      <span className="font-bold text-white">{currentTicket.visitorName}</span>
                    </div>
                    {currentTicket.nik && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">NIK:</span>
                        <span className="font-mono text-slate-300">{currentTicket.nik}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Keperluan:</span>
                      <span className="font-semibold text-amber-300">{currentTicket.purpose}</span>
                    </div>
                    {currentTicket.priorityDetails && (
                      <div className="pt-1.5 border-t border-slate-800 text-amber-400 font-semibold flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>{currentTicket.priorityDetails}</span>
                      </div>
                    )}
                    <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                      <span>Dipanggil: {currentTicket.callCount}x</span>
                      <span>Dibuat: {new Date(currentTicket.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={handleRecall}
                    disabled={isCalling}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    <span>Panggil Ulang (Recall)</span>
                  </button>

                  <button
                    onClick={handleFinish}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Selesai Melayani</span>
                  </button>

                  <button
                    onClick={handleSkip}
                    className="py-3 px-4 bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 text-slate-400 font-bold text-xs rounded-xl border border-slate-700 hover:border-rose-800 flex items-center justify-center gap-2 transition-all"
                  >
                    <SkipForward className="w-4 h-4" />
                    <span>Lewati (Tidak Hadir)</span>
                  </button>
                </div>

              </div>
            ) : (
              /* Empty state / Ready to call next */
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-amber-400 border border-slate-700 shadow-inner">
                  <Megaphone className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Belum Ada Antrean Dipanggil</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Terdapat <strong>{waitingTickets.length} antrean menunggu</strong> di kategori {activeCounter.categoryLabel}.
                  </p>
                </div>

                <button
                  onClick={handleCallNext}
                  disabled={waitingTickets.length === 0 || isCalling}
                  className="py-4 px-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm rounded-xl shadow-xl shadow-amber-500/20 inline-flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Megaphone className="w-5 h-5 text-slate-950" />
                  <span>{isCalling ? 'Memanggil...' : 'Panggil Antrean Berikutnya'}</span>
                </button>
              </div>
            )}

          </div>

          {/* Officer Settings Form Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-600" />
              <span>Pengaturan Petugas Loket ({activeCounter.code})</span>
            </h3>

            <form onSubmit={handleSaveOfficer} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={officerNameInput}
                onChange={(e) => setOfficerNameInput(e.target.value)}
                placeholder="Nama Petugas Loket"
                className="flex-1 w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
              >
                Simpan Nama
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleStatus('active')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    activeCounter.status === 'active'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  Buka
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus('break')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    activeCounter.status === 'break'
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  Istirahat
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Waiting Tickets List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Daftar Tunggu Kategori {activeCounter.code.includes('3') || activeCounter.code.includes('4') ? 'Rentan (B)' : 'Umum (A)'}</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                {waitingTickets.length} Tiket
              </span>
            </div>

            {waitingTickets.length > 0 ? (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {waitingTickets.map((ticket, index) => (
                  <div
                    key={ticket.id}
                    className={`p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 ${
                      index === 0
                        ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400/50'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{ticket.ticketNumber}</span>
                        {index === 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-slate-950">
                            Berikutnya
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-800 truncate max-w-[170px]">{ticket.visitorName}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[170px]">{ticket.purpose}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block">Daftar</span>
                      <span className="text-xs font-mono font-semibold text-slate-700">
                        {new Date(ticket.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
                <p className="font-medium text-slate-600">Tidak ada antrean menunggu saat ini</p>
              </div>
            )}
          </div>

          {/* Counter Performance Today */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Selesai Dilayani Hari Ini ({activeCounter.code})
            </span>
            <div className="text-3xl font-black text-amber-400">
              {completedToday.length} <span className="text-xs font-normal text-slate-300">Pengunjung</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Petugas: <strong className="text-white">{activeCounter.officerName || '-'}</strong>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
