import React, { useState } from 'react';
import { 
  UserPlus, 
  Users, 
  Accessibility, 
  Ticket, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  ShieldCheck,
  Building,
  Heart,
  Baby,
  UserCheck
} from 'lucide-react';
import { VisitorCategory, DINSOS_SERVICES, QueueTicket } from '../types';
import { createTicket } from '../utils/queueStore';
import { TicketBadgeModal } from './TicketBadgeModal';

interface RegistrationDeskProps {
  onTicketCreated?: () => void;
  onOpenAI?: () => void;
  waitingUmumCount: number;
  waitingRentanCount: number;
}

export const RegistrationDesk: React.FC<RegistrationDeskProps> = ({
  onTicketCreated,
  onOpenAI,
  waitingUmumCount,
  waitingRentanCount,
}) => {
  const [category, setCategory] = useState<VisitorCategory>('umum');
  const [visitorName, setVisitorName] = useState<string>('');
  const [nik, setNik] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>(DINSOS_SERVICES[0].title);
  const [customPurpose, setCustomPurpose] = useState<string>('');
  const [priorityDetails, setPriorityDetails] = useState<string>('');
  const [createdTicket, setCreatedTicket] = useState<QueueTicket | null>(null);
  const [isSuccessToast, setIsSuccessToast] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPurpose = customPurpose.trim() ? customPurpose.trim() : selectedService;

    const ticket = createTicket({
      category,
      visitorName: visitorName.trim() || 'Pengunjung Dinsos',
      nik: nik.trim() || '-',
      purpose: finalPurpose,
      priorityDetails: category === 'rentan' ? (priorityDetails || 'Kategori Prioritas Rentan') : undefined,
    });

    setCreatedTicket(ticket);
    setIsSuccessToast(true);

    // Reset form
    setVisitorName('');
    setNik('');
    setCustomPurpose('');
    setPriorityDetails('');

    if (onTicketCreated) onTicketCreated();

    setTimeout(() => {
      setIsSuccessToast(false);
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              Meja Registrasi / Pendaftaran
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-amber-400" />
            Penerbitan Tiket Nomor Antrean
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Input data pengunjung untuk mengarahkan ke <strong>Front Office 1 & 2 (Masyarakat Umum)</strong> atau <strong>Front Office 3 & 4 (Jalur Prioritas Rentan, Disabilitas, Ibu Hamil & Lansia)</strong>.
          </p>
        </div>

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={onOpenAI}
          className="relative z-10 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 flex items-center gap-2 transition-all group"
        >
          <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
          <span>Cek Syarat Berkas (AI Asisten)</span>
        </button>
      </div>

      {/* Main Grid: Form + Live Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Select Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>1. Pilih Kategori Pengunjung</span>
                <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category A: Umum */}
                <button
                  type="button"
                  onClick={() => setCategory('umum')}
                  className={`p-4 rounded-xl border-2 text-left transition-all relative flex items-start gap-3.5 ${
                    category === 'umum'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                      : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg shrink-0 ${
                    category === 'umum' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-200 text-slate-700'
                  }`}>
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold">Masyarakat Umum</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        category === 'umum' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                      }`}>
                        Kategori A
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${category === 'umum' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Diarahkan ke <strong>Front Office 1 & 2</strong>
                    </p>
                  </div>
                </button>

                {/* Category B: Rentan / Prioritas */}
                <button
                  type="button"
                  onClick={() => setCategory('rentan')}
                  className={`p-4 rounded-xl border-2 text-left transition-all relative flex items-start gap-3.5 ${
                    category === 'rentan'
                      ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'border-amber-200 bg-amber-50/50 text-slate-900 hover:border-amber-400'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg shrink-0 ${
                    category === 'rentan' ? 'bg-slate-950 text-amber-400' : 'bg-amber-100 text-amber-800'
                  }`}>
                    <Accessibility className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold">Disabilitas, Hamil & Lansia</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        category === 'rentan' ? 'bg-slate-950 text-white' : 'bg-amber-200 text-amber-900'
                      }`}>
                        Kategori B
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${category === 'rentan' ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                      Jalur Prioritas di <strong>Front Office 3 & 4</strong>
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Priority Tags (Visible when category is 'rentan') */}
            {category === 'rentan' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 animate-fade-in">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Kriteria Jalur Prioritas Rentan (Pilih Keterangan):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '♿ Penyandang Disabilitas', detail: 'Penyandang Disabilitas' },
                    { label: '🤰 Ibu Hamil / Menyusui', detail: 'Ibu Hamil / Menyusui' },
                    { label: '👵 Lansia (Usia 60+)', detail: 'Lansia (Usia 60+ Tahun)' },
                    { label: '👶 Ibu Membawa Balita', detail: 'Ibu Membawa Balita' },
                    { label: '🚑 Sakit / Butuh Pendampingan', detail: 'Pengunjung Sakit' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPriorityDetails(item.detail)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        priorityDetails === item.detail
                          ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-sm'
                          : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Visitor Identity Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nama Pengunjung / Penerima Manfaat
                </label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Contoh: Bapak Zulkifli / Ibu Aminah"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>NIK / Nomor KTP (Opsional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">16 Digit</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="Contoh: 127401xxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
                />
              </div>
            </div>

            {/* 3. Purpose Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Keperluan Layanan Sosial
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 border border-slate-200 p-2 rounded-xl bg-slate-50">
                {DINSOS_SERVICES.map((srv) => (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => {
                      setSelectedService(srv.title);
                      setCustomPurpose('');
                    }}
                    className={`p-2.5 rounded-lg text-left text-xs font-semibold transition-all border flex items-center justify-between ${
                      selectedService === srv.title && !customPurpose
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="line-clamp-1">{srv.title}</span>
                    {selectedService === srv.title && !customPurpose && (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Custom purpose field */}
              <div className="pt-1">
                <input
                  type="text"
                  value={customPurpose}
                  onChange={(e) => setCustomPurpose(e.target.value)}
                  placeholder="Atau ketik keperluan spesifik lainnya di sini..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 transition-all"
              >
                <Ticket className="w-5 h-5 text-amber-400" />
                <span>Terbitkan Nomor Antrean Baru</span>
              </button>
            </div>

          </form>

        </div>

        {/* Right Column: Live Queue Status & Info Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Waiting Queue Live Counters */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Status Antrean Menunggu</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Real-time</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Category A Counter */}
              <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Kategori A (Umum)
                </span>
                <span className="text-3xl font-black text-white my-1 block">
                  {waitingUmumCount}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Antrean di FO 1 & 2
                </span>
              </div>

              {/* Category B Counter */}
              <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-500/30 text-center">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Kategori B (Rentan)
                </span>
                <span className="text-3xl font-black text-amber-400 my-1 block">
                  {waitingRentanCount}
                </span>
                <span className="text-[11px] text-amber-200/80 font-medium">
                  Antrean di FO 3 & 4
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl text-xs text-slate-300 flex items-start gap-2">
              <Building className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Pengunjung kategori rentan otomatis diprioritaskan di Front Office 3 dan 4 demi kenyamanan pelayanan.
              </span>
            </div>
          </div>

          {/* Service Guide Cheat Sheet */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Panduan Penentuan Kategori</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block mb-0.5">👥 Kategori Umum (A-xxx)</strong>
                <p className="text-slate-600 text-[11px]">
                  Masyarakat umum usia produktif yang mengajukan pengurusan bansos, DTKS, KIS, atau SKTM secara mandiri.
                </p>
              </div>

              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                <strong className="text-amber-900 block mb-0.5">♿ Kategori Rentan/Prioritas (B-xxx)</strong>
                <p className="text-amber-800 text-[11px]">
                  Penyandang disabilitas fisik/sensorik, Ibu hamil/menyusui, Lansia (usia 60+), serta warga dalam kondisi darurat kesehatan/sosial.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Ticket Printable Badge Modal */}
      <TicketBadgeModal
        ticket={createdTicket}
        onClose={() => setCreatedTicket(null)}
      />

    </div>
  );
};
