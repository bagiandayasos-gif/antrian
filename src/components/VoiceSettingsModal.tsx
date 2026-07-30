import React, { useState, useEffect } from 'react';
import { Volume2, Check, Settings, X, Info, Sparkles, HelpCircle } from 'lucide-react';
import { 
  getAvailableVoices, 
  getSavedVoiceName, 
  saveVoiceName, 
  announceTicketCall,
  getBestIndonesianVoice 
} from '../utils/audio';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({ isOpen, onClose }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [testing, setTesting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getAvailableVoices().then((loadedVoices) => {
        setVoices(loadedVoices);
        
        const saved = getSavedVoiceName();
        if (saved && loadedVoices.some(v => v.name === saved)) {
          setSelectedVoice(saved);
        } else {
          getBestIndonesianVoice().then((best) => {
            if (best) setSelectedVoice(best.name);
          });
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectVoice = (voiceName: string) => {
    setSelectedVoice(voiceName);
    saveVoiceName(voiceName);
  };

  const handleTestCall = async (voiceName?: string) => {
    setTesting(true);
    if (voiceName) {
      saveVoiceName(voiceName);
      setSelectedVoice(voiceName);
    }
    try {
      await announceTicketCall('A-001', 'Front Office 1', 'Umum');
    } finally {
      setTesting(false);
    }
  };

  const idVoices = voices.filter(v => 
    (v.lang || '').toLowerCase().includes('id') || 
    (v.name || '').toLowerCase().includes('indonesia') ||
    (v.name || '').toLowerCase().includes('gadis') ||
    (v.name || '').toLowerCase().includes('andika')
  );

  const hasIndonesianVoice = idVoices.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 text-slate-100 shadow-2xl relative space-y-5 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Pengaturan Suara Panggilan Antrean
            </h3>
            <p className="text-xs text-slate-400">Pilih suara mesin pengucapan (Text-to-Speech) Bahasa Indonesia</p>
          </div>
        </div>

        {/* Status Alert if no Indonesian voice */}
        {!hasIndonesianVoice ? (
          <div className="bg-amber-950/50 border border-amber-500/40 rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-2.5 text-amber-300 font-bold text-xs">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Suara Bahasa Indonesia Belum Terpasang di Windows Anda</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pl-6">
              Windows saat ini menggunakan suara default (berbahasa Inggris). Supaya panggilan bersuara Bahasa Indonesia yang jernih &amp; fasih (*Microsoft Gadis* / *Microsoft Andika*), Anda dapat menambahkan paket suara bahasa Indonesia di Windows dengan mudah.
            </p>
            <div className="pl-6 pt-1">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold border border-amber-500/30 transition-all flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showGuide ? 'Sembunyikan Cara Pasang' : 'Lihat Cara Pasang Suara Indo di Windows'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Tersedia {idVoices.length} pilihan suara Bahasa Indonesia di komputer ini!</span>
          </div>
        )}

        {/* Windows Speech Pack Guide */}
        {showGuide && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
            <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Cara Aktifkan Suara Bahasa Indonesia di Windows 10 / 11:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1 text-[11px] leading-relaxed">
              <li>Tekan tombol <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">Windows + I</code> untuk membuka <strong>Settings (Pengaturan)</strong>.</li>
              <li>Pilih menu <strong>Time &amp; Language (Waktu &amp; Bahasa)</strong> &gt; lalu klik <strong>Speech (Pengucapan)</strong>.</li>
              <li>Pada bagian <em>Manage voices (Kelola Suara)</em>, klik tombol <strong>Add voices (Tambah suara)</strong>.</li>
              <li>Cari kata kunci <strong>"Indonesian"</strong> atau <strong>"Bahasa Indonesia"</strong>, centang dan klik <strong>Add</strong>.</li>
              <li>Buka kembali aplikasi ini, maka suara <strong>Microsoft Gadis</strong> atau <strong>Microsoft Andika</strong> akan muncul &amp; siap digunakan!</li>
            </ol>
          </div>
        )}

        {/* Voice Selection List */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Pilih Suara Terpasang ({voices.length} Terdeteksi):</span>
            <button
              onClick={() => handleTestCall()}
              disabled={testing}
              className="text-amber-400 hover:text-amber-300 font-semibold text-[11px] flex items-center gap-1 disabled:opacity-50"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{testing ? 'Memutar...' : 'Tes Suara Terpilih'}</span>
            </button>
          </label>

          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 text-xs">
            {voices.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs bg-slate-950 rounded-xl border border-slate-800">
                Memuat daftar suara sistem...
              </div>
            ) : (
              voices.map((v) => {
                const isIndo = 
                  (v.lang || '').toLowerCase().includes('id') || 
                  (v.name || '').toLowerCase().includes('indonesia') ||
                  (v.name || '').toLowerCase().includes('gadis') ||
                  (v.name || '').toLowerCase().includes('andika');
                const isSelected = selectedVoice === v.name;

                return (
                  <div
                    key={v.name}
                    onClick={() => handleSelectVoice(v.name)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-3 h-3 rounded-full border shrink-0 ${isSelected ? 'bg-amber-400 border-amber-300' : 'border-slate-600'}`} />
                      <div className="min-w-0">
                        <div className="font-semibold text-xs truncate flex items-center gap-1.5">
                          <span>{v.name}</span>
                          {isIndo && (
                            <span className="px-1.5 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold">
                              Bahasa Indonesia
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{v.lang} {v.default ? '• Default Sistem' : ''}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestCall(v.name);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold border border-slate-700 shrink-0 flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3 text-amber-400" />
                      <span>Tes</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Cara pasang suara Indo di Windows</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
          >
            Simpan &amp; Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
