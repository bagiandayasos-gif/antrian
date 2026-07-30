import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  Volume2, 
  VolumeX, 
  Megaphone, 
  Accessibility, 
  Users, 
  Info, 
  ShieldCheck, 
  ChevronRight,
  Tv,
  Heart,
  CheckCircle2
} from 'lucide-react';
import { QueueTicket } from '../types';
import { getInitialStoreState, subscribeToStore } from '../utils/queueStore';

interface PublicDisplayMonitorProps {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const PublicDisplayMonitor: React.FC<PublicDisplayMonitorProps> = ({
  soundEnabled,
  setSoundEnabled,
}) => {
  const [storeState, setStoreState] = useState(getInitialStoreState());
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [callingAnimation, setCallingAnimation] = useState<boolean>(false);

  // Sync state with store updates
  useEffect(() => {
    const update = () => {
      const currentState = getInitialStoreState();
      setStoreState(currentState);
    };
    update();
    const unsubscribe = subscribeToStore(update);
    return () => unsubscribe();
  }, []);

  // Live Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Service Slideshow Carousel
  const serviceSlides = [
    {
      title: 'Layanan DTKS & Cek Bansos Kemensos',
      desc: 'Pendaftaran dan pemutakhiran data warga kurang mampu untuk usul Bansos PKH, BPNT, dan KIS BPJS PBI Gratis.',
      badge: 'Bansos & DTKS',
      bg: 'from-amber-600/30 to-slate-900',
    },
    {
      title: 'Jalur Prioritas Disabilitas, Ibu Hamil & Lansia',
      desc: 'Dilayani khusus di Front Office 3 dan Front Office 4 dengan fasilitas ramah difabel dan tanpa antre lama.',
      badge: 'Layanan Inklusif',
      bg: 'from-emerald-600/30 to-slate-900',
    },
    {
      title: 'Rekomendasi KIS BPJS Kesehatan PBI',
      desc: 'Pengurusan jaminan kesehatan masyarakat tidak mampu Tanjungbalai yang ditanggung APBD / APBN.',
      badge: 'Jaminan Kesehatan',
      bg: 'from-blue-600/30 to-slate-900',
    },
    {
      title: 'Pelayanan 100% GRATIS Bebas Pungli',
      desc: 'Dinas Sosial Kota Tanjungbalai berkomitmen memberikan pelayanan cepat, terbuka, transparan, dan tanpa pemungutan biaya apapun.',
      badge: 'Bebas Pungli',
      bg: 'from-amber-500/30 to-slate-900',
    },
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % serviceSlides.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [serviceSlides.length]);

  // Find the last called ticket
  const callingTicket = storeState.tickets
    .filter((t) => t.status === 'calling' || t.status === 'serving')
    .sort((a, b) => new Date(b.calledAt || 0).getTime() - new Date(a.calledAt || 0).getTime())[0];

  // Trigger visual call flash when ticket changes
  useEffect(() => {
    if (callingTicket) {
      setCallingAnimation(true);
      const timer = setTimeout(() => setCallingAnimation(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [callingTicket?.id, callingTicket?.callCount]);

  // Waiting list splits
  const waitingUmum = storeState.tickets
    .filter((t) => t.category === 'umum' && t.status === 'waiting')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const waitingRentan = storeState.tickets
    .filter((t) => t.category === 'rentan' && t.status === 'waiting')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-slate-950 select-none">
      
      {/* 1. TV Display Top Header */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
        
        {/* Title Branding */}
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-1 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0 bg-slate-900">
            <img src="/logo-tanjungbalai.png" alt="Logo Kota Tanjungbalai" className="w-full h-full object-contain" />
          </div>

          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-widest">
                Sentra Pelayanan Kito
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-widest">
                Pelayanan Publik Gratis
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-300 bg-clip-text text-transparent">
              DINAS SOSIAL KOTA TANJUNGBALAI
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {storeState.settings.address}
            </p>
          </div>
        </div>

        {/* Live Clock & Sound Control */}
        <div className="flex items-center gap-4">
          <div className="px-5 py-2.5 bg-slate-800/90 rounded-2xl border border-slate-700/80 text-right shadow-inner">
            <div className="text-2xl font-black text-amber-400 font-mono flex items-center justify-end gap-2">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>{time}</span>
              <span className="text-xs text-slate-400 font-normal">WIB</span>
            </div>
            <div className="text-xs text-slate-300 font-medium">{dateStr}</div>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-2xl border transition-all ${
              soundEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
            }`}
            title="Toggle Master Sound"
          >
            {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        </div>

      </header>

      {/* 2. Main Content Grid (3 Columns) */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT & CENTER: Main Calling Showcase & Counter Cards (8 Cols) */}
        <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
          
          {/* Main Calling Spotlight Box */}
          <div className={`relative rounded-3xl p-8 border-2 transition-all duration-500 shadow-2xl overflow-hidden ${
            callingAnimation
              ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 border-amber-300 text-slate-950 scale-[1.01] ring-8 ring-amber-500/30'
              : callingTicket?.category === 'rentan'
              ? 'bg-gradient-to-br from-slate-900 via-amber-950/60 to-slate-900 border-amber-500/60 text-white'
              : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 text-white'
          }`}>
            
            {/* Background glowing particles */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Left Column: Number Display */}
              <div className="text-center md:text-left space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                    callingAnimation
                      ? 'bg-slate-950 text-amber-400'
                      : 'bg-amber-500 text-slate-950'
                  }`}>
                    {callingTicket ? 'SEDANG DIPANGGIL' : 'INFORMASI ANTREAN'}
                  </span>
                  {callingTicket && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                      callingTicket.category === 'rentan'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-800 text-slate-200'
                    }`}>
                      {callingTicket.category === 'rentan' ? '♿ JALUR PRIORITAS RENTAN' : '👥 MASYARAKAT UMUM'}
                    </span>
                  )}
                </div>

                <div className={`text-7xl md:text-8xl font-black tracking-tight font-mono my-2 ${
                  callingAnimation ? 'text-slate-950 drop-shadow-lg' : 'text-amber-400 drop-shadow-md'
                }`}>
                  {callingTicket ? callingTicket.ticketNumber : '----'}
                </div>

                {callingTicket && (
                  <div className="space-y-0.5">
                    <p className={`text-lg font-bold ${callingAnimation ? 'text-slate-900' : 'text-slate-200'}`}>
                      {callingTicket.visitorName}
                    </p>
                    <p className={`text-xs ${callingAnimation ? 'text-slate-800' : 'text-slate-400'}`}>
                      Keperluan: <strong>{callingTicket.purpose}</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Destination Counter */}
              <div className="text-center md:text-right space-y-2 bg-black/20 p-6 rounded-2xl border border-white/10 min-w-[280px]">
                <span className={`text-xs font-bold uppercase tracking-widest block ${
                  callingAnimation ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  SILAKAN MENUJU KE
                </span>

                <div className={`text-2xl md:text-3xl font-black uppercase tracking-tight my-1 ${
                  callingAnimation ? 'text-slate-950' : 'text-white'
                }`}>
                  {callingTicket ? (callingTicket.counterName || 'FRONT OFFICE') : 'LOKET DINSOS'}
                </div>

                <div className={`text-xs font-semibold px-3 py-1.5 rounded-xl inline-block ${
                  callingAnimation ? 'bg-slate-950 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {callingTicket?.category === 'rentan'
                    ? 'Front Office 3 atau 4 (Loket Rentan)'
                    : 'Front Office 1 atau 2 (Loket Umum)'}
                </div>
              </div>

            </div>

          </div>

          {/* 4 Counter Status Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {storeState.counters.map((counter) => {
              const currentT = storeState.tickets.find((t) => t.id === counter.currentTicketId);
              const isRentan = counter.category === 'rentan';

              return (
                <div
                  key={counter.id}
                  className={`p-4 rounded-2xl border text-center space-y-2 transition-all relative overflow-hidden shadow-lg ${
                    isRentan
                      ? 'bg-slate-900/90 border-amber-500/40 text-white'
                      : 'bg-slate-900/90 border-slate-800 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      isRentan ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {counter.code}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {isRentan ? 'Rentan' : 'Umum'}
                    </span>
                  </div>

                  <div className="py-2">
                    <div className="text-3xl md:text-4xl font-black text-amber-400 font-mono tracking-tight">
                      {currentT ? currentT.ticketNumber : '-'}
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 line-clamp-1 mt-1">
                      {currentT ? currentT.visitorName : 'Tersedia'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                    <span className="truncate">{counter.name.split(' - ')[0]}</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold ${
                      counter.status === 'active' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {counter.status === 'active' ? 'AKTIF' : 'ISTIRAHAT'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT COLUMN: Waiting List & Media Slideshow (4 Cols) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          
          {/* Waiting Queue Table Split */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Antrean Menunggu Berikutnya</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              
              {/* Category A Next List */}
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 text-[11px] font-bold text-slate-300">
                  <span>👥 Umum (A)</span>
                  <span className="text-amber-400">{waitingUmum.length}</span>
                </div>
                {waitingUmum.slice(0, 4).map((t, i) => (
                  <div key={t.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                    <span className="font-mono font-bold text-white">{t.ticketNumber}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[80px]">{t.visitorName}</span>
                  </div>
                ))}
                {waitingUmum.length === 0 && (
                  <span className="text-[11px] text-slate-500 block py-2 text-center">Kosong</span>
                )}
              </div>

              {/* Category B Next List */}
              <div className="bg-amber-950/20 p-3 rounded-xl border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5 text-[11px] font-bold text-amber-300">
                  <span>♿ Rentan (B)</span>
                  <span className="text-amber-400">{waitingRentan.length}</span>
                </div>
                {waitingRentan.slice(0, 4).map((t, i) => (
                  <div key={t.id} className="flex items-center justify-between text-xs py-1 border-b border-amber-500/10 last:border-0">
                    <span className="font-mono font-bold text-amber-400">{t.ticketNumber}</span>
                    <span className="text-[10px] text-slate-300 truncate max-w-[80px]">{t.visitorName}</span>
                  </div>
                ))}
                {waitingRentan.length === 0 && (
                  <span className="text-[11px] text-slate-500 block py-2 text-center">Kosong</span>
                )}
              </div>

            </div>
          </div>

          {/* Service Information Slideshow Card */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden flex-1 flex flex-col justify-between">
            
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                <span>Informasi Layanan Dinsos</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                {serviceSlides[activeSlide].badge}
              </span>
            </div>

            <div className="space-y-2 py-2 my-auto">
              <h4 className="text-base font-bold text-white">
                {serviceSlides[activeSlide].title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {serviceSlides[activeSlide].desc}
              </p>
            </div>

            {/* Carousel dots */}
            <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-slate-800">
              {serviceSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeSlide === idx ? 'w-6 bg-amber-400' : 'w-1.5 bg-slate-700'
                  }`}
                />
              ))}
            </div>

          </div>

        </div>

      </main>

      {/* 3. Bottom Scrolling Ticker (Running Text) */}
      <footer className="bg-amber-500 text-slate-950 px-4 py-2.5 overflow-hidden font-bold text-xs sm:text-sm border-t-2 border-amber-400 shadow-2xl flex items-center gap-3">
        <div className="px-3 py-1 bg-slate-950 text-amber-400 rounded-lg shrink-0 text-[11px] uppercase tracking-widest font-black flex items-center gap-1.5">
          <Megaphone className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>Pengumuman</span>
        </div>

        <div className="overflow-hidden whitespace-nowrap w-full">
          <div className="inline-block animate-marquee pl-10 font-medium">
            {storeState.settings.runningText}
          </div>
        </div>
      </footer>

    </div>
  );
};
