import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  CheckCircle, 
  HelpCircle, 
  FileText, 
  ShieldCheck, 
  Send, 
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { DINSOS_SERVICES } from '../types';

interface AIAssistantTabProps {
  onSelectRequirement?: (serviceTitle: string) => void;
}

export const AIAssistantTab: React.FC<AIAssistantTabProps> = ({ onSelectRequirement }) => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const quickPrompts = [
    'Syarat pengurusan KIS BPJS Kesehatan PBI gratis di Tanjungbalai',
    'Bagaimana alur usul data ke DTKS & Cek Bansos Kemensos?',
    'Persyaratan penerima bantuan PKH dan Sembako/BPNT',
    'Syarat permohonan bantuan alat bantu untuk penyandang disabilitas',
    'Persyaratan layanan perlindungan dan santunan Lansia',
    'Dokumen wajib untuk penerbitan SKTM / Rekomendasi Sosial',
  ];

  const handleAskAI = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setResultText(null);
    setQuery(searchQuery);

    try {
      const response = await fetch('/api/ai/service-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();
      if (data.result) {
        setResultText(data.result);
      } else if (data.fallbackResponse) {
        setResultText(data.fallbackResponse);
      } else {
        setResultText('Maaf, informasi tidak dapat ditemukan. Silakan merujuk pada standar pelayanan resmi Dinas Sosial Kota Tanjungbalai.');
      }
    } catch (err) {
      console.error('Error fetching AI service info:', err);
      setResultText('Terjadi kendala koneksi. Dokumen utama secara umum: KTP Kota Tanjungbalai, Kartu Keluarga (KK), dan Surat Keterangan Tidak Mampu (SKTM) dari Kelurahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              AI Asisten Persyaratan Service
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Cek Syarat & Alur Layanan Dinsos Tanjungbalai
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Bantu petugas registrasi dan masyarakat memeriksa kelengkapan berkas serta syarat penerimaan bansos, rekomendasi KIS, DTKS, maupun alat bantu disabilitas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Search & Prompt Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
              Ketik Pertanyaan atau Pilih Jenis Layanan
            </label>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAI(query);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Contoh: Apa saja syarat pengurusan KIS BPJS gratis?"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-amber-400" />}
                <span>Tanyakan AI</span>
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Pertanyaan Cepat Sering Ditanyakan (Pilih Saja):
              </span>

              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAskAI(prompt)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-900 border border-slate-200 transition-all text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Catalog of Pre-defined Services */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Daftar Syarat Ringkas Layanan Dinsos Tanjungbalai</span>
            </h3>

            <div className="space-y-3">
              {DINSOS_SERVICES.map((srv) => (
                <div key={srv.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">{srv.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      srv.recommendedCategory === 'rentan' ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {srv.recommendedCategory === 'rentan' ? 'Jalur Rentan' : 'Jalur Umum'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{srv.description}</p>
                  <div className="pt-1.5 flex flex-wrap gap-1.5">
                    {srv.requirements.map((req, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700 font-mono">
                        ✓ {req}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* AI Answer Output Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4 min-h-[480px] flex flex-col justify-between">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Jawaban Penjelasan Asisten AI</span>
                </h3>

                {resultText && (
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Menganalisis syarat dan regulasi pelayanan...</p>
                </div>
              ) : resultText ? (
                <div className="prose prose-invert max-w-none text-xs text-slate-200 leading-relaxed space-y-2 whitespace-pre-wrap bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
                  {resultText}
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400 space-y-2">
                  <HelpCircle className="w-10 h-10 text-amber-400/60 mx-auto" />
                  <p className="text-xs font-medium">Pilih pertanyaan atau ketik topik layanan di sebelah kiri untuk melihat persyaratan resmi.</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl text-[11px] text-slate-400 border border-slate-700 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Seluruh pengurusan pelayanan di Sentra Pelayanan Kito Dinas Sosial Kota Tanjungbalai tidak dipungut biaya (GRATIS).
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
