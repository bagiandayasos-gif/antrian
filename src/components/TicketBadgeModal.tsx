import React from 'react';
import { QueueTicket } from '../types';
import { Printer, CheckCircle, ShieldAlert, X, Building, ArrowRight } from 'lucide-react';

interface TicketBadgeModalProps {
  ticket: QueueTicket | null;
  onClose: () => void;
}

export const TicketBadgeModal: React.FC<TicketBadgeModalProps> = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const isRentan = ticket.category === 'rentan';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 printable-badge-container">
        
        {/* Modal Close Button (hidden when printing) */}
        <button
          onClick={onClose}
          className="no-print absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className={`p-5 text-center border-b ${isRentan ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-white'}`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <img src="/logo-tanjungbalai.png" alt="Logo Kota Tanjungbalai" className="w-7 h-7 object-contain drop-shadow" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Dinas Sosial Kota Tanjungbalai
            </span>
          </div>
          <h2 className="text-lg font-extrabold tracking-tight">
            SENTRA PELAYANAN KITO
          </h2>
          <p className="text-[11px] opacity-90">
            Jln. Jend. Sudirman Km. 1,5 Kota Tanjungbalai
          </p>
        </div>

        {/* Ticket Content */}
        <div className="p-6 text-center space-y-4">
          
          {/* Category Badge */}
          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isRentan
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-800 border border-slate-300'
            }`}>
              {isRentan ? '♿ MASYARAKAT RENTAN & PRIORITAS' : '👥 MASYARAKAT UMUM'}
            </span>
          </div>

          {/* Ticket Number Large */}
          <div className="py-2 bg-slate-50 border-y border-slate-200 rounded-xl my-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              NOMOR ANTREAN ANDA
            </div>
            <div className={`text-5xl font-black tracking-tight my-1 ${
              isRentan ? 'text-amber-600' : 'text-slate-900'
            }`}>
              {ticket.ticketNumber}
            </div>
            <div className="text-xs font-semibold text-slate-600 flex items-center justify-center gap-1">
              <span>Tujuan:</span>
              <span className="font-bold text-slate-900 underline decoration-amber-500 decoration-2">
                {isRentan ? 'Front Office 3 & 4 (Loket Rentan)' : 'Front Office 1 & 2 (Loket Umum)'}
              </span>
            </div>
          </div>

          {/* Visitor Details */}
          <div className="text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Nama Pengunjung:</span>
              <span className="font-bold text-slate-900">{ticket.visitorName}</span>
            </div>
            {ticket.nik && ticket.nik !== '-' && (
              <div className="flex justify-between">
                <span className="text-slate-500">NIK / No. KTP:</span>
                <span className="font-mono font-semibold text-slate-800">{ticket.nik}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Keperluan Layanan:</span>
              <span className="font-semibold text-slate-900 text-right max-w-[200px]">{ticket.purpose}</span>
            </div>
            {ticket.priorityDetails && (
              <div className="pt-1.5 border-t border-slate-200 text-amber-800 font-medium flex items-start gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>Catatan: {ticket.priorityDetails}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-slate-200 text-[11px] text-slate-500">
              <span>Waktu Pendaftaran:</span>
              <span>{new Date(ticket.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
            </div>
          </div>

          {/* Notice */}
          <div className="text-xs text-slate-600 bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-center gap-2 text-left">
            <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mohon memperhatikan panggilan suara dan nomor pada Layar Monitor Informasi Utama.</span>
          </div>

          {/* Printable Barcode Simulation */}
          <div className="pt-1 flex flex-col items-center justify-center opacity-80">
            <div className="h-8 w-48 bg-slate-800 rounded flex items-center justify-around px-2 py-1">
              {Array.from({ length: 32 }).map((_, i) => (
                <div key={i} className={`h-full bg-white ${i % 3 === 0 ? 'w-1' : 'w-0.5'}`} />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1">{ticket.id}</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="no-print p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Printer className="w-4 h-4" />
            Cetak Tiket (Print)
          </button>
        </div>

      </div>
    </div>
  );
};
