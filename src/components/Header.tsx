import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  UserPlus, 
  Building2, 
  Sparkles, 
  BarChart3, 
  ExternalLink, 
  Clock, 
  Volume2, 
  VolumeX,
  ShieldCheck,
  Building,
  RotateCcw,
  CheckCircle2,
  Download,
  Smartphone,
  X,
  Check,
  Share2,
  Copy,
  QrCode,
  Trash2
} from 'lucide-react';
import { SystemSettings } from '../types';
import { playChime } from '../utils/audio';
import { resetDailyQueue } from '../utils/queueStore';

interface HeaderProps {
  activeTab: 'display' | 'register' | 'operator' | 'ai' | 'analytics';
  setActiveTab: (tab: 'display' | 'register' | 'operator' | 'ai' | 'analytics') => void;
  settings: SystemSettings;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  soundEnabled,
  setSoundEnabled,
}) => {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetNotification, setResetNotification] = useState<string | null>(null);
  
  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic public URL derived directly from current active host
  const publicUrl = typeof window !== 'undefined' ? (window.location.origin + window.location.pathname) : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  useEffect(() => {
    // Check if already running in standalone mode (installed app)
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsStandalone(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  useEffect(() => {
    const updateTime = () => {
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

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTestSound = async () => {
    setSoundEnabled(true);
    await playChime(0.8);
  };

  const openDisplayInNewTab = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'display');
    window.open(url.toString(), '_blank');
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      {/* Top Banner Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Institution Logo & Title */}
          <div className="flex items-center gap-3.5 text-center lg:text-left">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-1 shadow-lg shadow-amber-500/20 flex items-center justify-center bg-slate-900">
                <img src="/logo-tanjungbalai.png" alt="Logo Kota Tanjungbalai" className="w-full h-full object-contain" />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-slate-900" title="Sistem Online & Terhubung" />
            </div>

            <div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  Pemerintah Kota Tanjungbalai
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                Antrean Sentra Pelayanan Kito
              </h1>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 justify-center lg:justify-start">
                <span className="text-amber-400 font-semibold">{settings.institutionName}</span>
                <span>•</span>
                <span className="text-emerald-400">Inklusif & Ramah Rentan</span>
              </p>
            </div>
          </div>

          {/* Clock & Sound Control & New Tab Trigger */}
          <div className="flex items-center gap-3">
            {/* Live Clock Card */}
            <div className="hidden sm:flex flex-col items-end px-3.5 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60 text-right">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{time} WIB</span>
              </div>
              <div className="text-[11px] text-slate-400">{dateStr}</div>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={handleTestSound}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                soundEnabled
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Aktifkan / Tes Suara Pemanggilan"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline">{soundEnabled ? 'Suara Aktif' : 'Suara Mati'}</span>
            </button>

            {/* Tombol Unduh / Instal Aplikasi */}
            {!isStandalone && (
              <button
                onClick={handleInstallApp}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 active:scale-95 shadow-md shadow-indigo-600/30 border border-indigo-400/30"
                title="Unduh & Instal Aplikasi Antrean di Komputer / Laptop / HP"
              >
                <Download className="w-4 h-4 text-amber-300 animate-bounce shrink-0" />
                <span>Unduh App</span>
              </button>
            )}

            {/* Reset / Hapus Data Button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              title="Hapus / Kosongkan Seluruh Data Antrean Hari Ini"
            >
              <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="hidden sm:inline">Hapus Data Antrean</span>
            </button>

            {/* Open Display in New Window */}
            <button
              onClick={openDisplayInNewTab}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-amber-500/10 flex items-center gap-1.5 transition-all"
              title="Buka Layar Monitor TV di Tab Baru untuk Ruang Tunggu"
            >
              <Tv className="w-4 h-4" />
              <span className="hidden sm:inline">Display Monitor TV</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-left space-y-4">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Hapus Seluruh Data Antrean?</h3>
                  <p className="text-xs text-slate-400">Konfirmasi Penghapusan Seluruh Tiket Hari Ini</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                Tindakan ini akan <strong>menghapus &amp; mengosongkan seluruh daftar data antrean</strong> (baik antrean menunggu maupun yang telah selesai dilayani) serta mengembalikan nomor panggilan loket ke posisi awal untuk hari baru.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    resetDailyQueue();
                    setShowResetConfirm(false);
                    setResetNotification('Seluruh data antrean berhasil dihapus!');
                    setTimeout(() => setResetNotification(null), 4000);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus Data</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Install & Share Guide Modal */}
        {showInstallGuide && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl text-left space-y-4 relative my-8">
              <button
                onClick={() => setShowInstallGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 text-indigo-400">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Share2 className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Bagikan &amp; Pasang Aplikasi</h3>
                  <p className="text-xs text-slate-400">Sentra Pelayanan Kito - Dinsos Kota Tanjungbalai</p>
                </div>
              </div>

              {/* Share URL & QR Code */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Link Aplikasi (Siap Kirim via WA / Email):</span>
                  {copiedLink && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Tersalin!
                    </span>
                  )}
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-indigo-600/30"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="bg-white p-1.5 rounded-lg shrink-0 shadow">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(publicUrl)}`} 
                      alt="QR Code Akses Aplikasi"
                      className="w-20 h-20" 
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-200 flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5 text-amber-400" /> Scan QR untuk Buka di HP / Tablet
                    </p>
                    <p>Buka kamera HP Anda, arahkan ke QR Code di samping untuk membuka &amp; menginstal aplikasi antrean secara instan.</p>
                  </div>
                </div>
              </div>

              {/* Installation steps */}
              <div className="space-y-3 text-xs text-slate-300 max-h-[300px] overflow-y-auto pr-1">
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-1.5">
                  <div className="font-bold text-amber-400 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>Cara 1: Instal Langsung di Komputer (Windows / Mac)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-300 text-[11px]">
                    <li>Buka link aplikasi di Google Chrome atau Microsoft Edge.</li>
                    <li>Klik tombol <strong>"Instal App"</strong> di kanan atas header (atau icon ⊕ / 📥 di address bar).</li>
                    <li>Aplikasi akan langsung muncul di Desktop &amp; Start Menu sebagai aplikasi resmi tanpa perlu browser!</li>
                  </ol>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-1.5">
                  <div className="font-bold text-emerald-400 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>Cara 2: Pasang di HP Android / iPhone</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-300 text-[11px]">
                    <li>Scan QR Code di atas menggunakan kamera HP.</li>
                    <li>Di Chrome (Android): Klik titik 3 (⋮) &gt; pilih <strong>"Tambahkan ke Layar Utama"</strong>.</li>
                    <li>Di Safari (iPhone): Klik tombol <strong>Share (Bagikan)</strong> &gt; pilih <strong>"Tambah ke Layar Utama"</strong>.</li>
                  </ol>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-1.5">
                  <div className="font-bold text-indigo-400 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>Cara 3: Download Source Code &amp; Buat File .exe Installer (Electron)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    1. Klik menu <strong>tiga titik (⋮) / Settings</strong> di pojok kanan atas AI Studio &gt; pilih <strong>"Export as ZIP"</strong>.<br />
                    2. Ekstrak folder ZIP di komputer Windows Anda.<br />
                    3. Buka Terminal/CMD di folder tersebut dan jalankan command:<br />
                    <code className="block bg-slate-950 p-2 rounded text-indigo-300 font-mono mt-1 text-[10px] border border-slate-800">
                      npm install<br />
                      npm run build<br />
                      npx electron-builder --win
                    </code>
                    4. File installer <strong>Setup.exe</strong> akan otomatis terbentuk di folder <code className="text-amber-300">dist/</code> siap dibagikan!
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                {deferredPrompt ? (
                  <button
                    onClick={async () => {
                      deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      if (outcome === 'accepted') {
                        setDeferredPrompt(null);
                        setIsStandalone(true);
                        setShowInstallGuide(false);
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Download className="w-4 h-4 text-emerald-200 animate-bounce" />
                    <span>Pasang Aplikasi Sekarang (1-Klik)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      window.open(publicUrl, '_blank');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Download className="w-4 h-4 text-emerald-200 animate-bounce" />
                    <span>Buka Publik (Siap Instal App)</span>
                  </button>
                )}

                <button
                  onClick={() => setShowInstallGuide(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <nav className="mt-4 flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2 pb-1 pt-1 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('display')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'display'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" />
            Layar Monitor Utama
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'register'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Meja Registrasi & Tiket
          </button>

          <button
            onClick={() => setActiveTab('operator')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'operator'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Loket Front Office (FO 1-4)
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ai'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            AI Asisten Syarat Layanan
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Laporan & Data
          </button>
        </nav>
      </div>
    </header>
  );
};
