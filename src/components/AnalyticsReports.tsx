import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Accessibility, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Printer, 
  Search, 
  Building2, 
  FileSpreadsheet,
  AlertCircle,
  Database
} from 'lucide-react';
import { QueueTicket } from '../types';
import { 
  getInitialStoreState, 
  resetDailyQueue, 
  generateSampleTickets, 
  saveStateToStorage, 
  subscribeToStore 
} from '../utils/queueStore';

export const AnalyticsReports: React.FC = () => {
  const [storeState, setStoreState] = useState(getInitialStoreState());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const update = () => {
      const currentState = getInitialStoreState();
      setStoreState(currentState);
    };
    update();
    const unsubscribe = subscribeToStore(update);
    return () => unsubscribe();
  }, []);

  const totalTickets = storeState.tickets.length;
  const totalCompleted = storeState.tickets.filter((t) => t.status === 'completed').length;
  const totalWaiting = storeState.tickets.filter((t) => t.status === 'waiting').length;
  const totalActive = storeState.tickets.filter((t) => t.status === 'calling' || t.status === 'serving').length;
  const totalSkipped = storeState.tickets.filter((t) => t.status === 'skipped').length;

  const countUmum = storeState.tickets.filter((t) => t.category === 'umum').length;
  const countRentan = storeState.tickets.filter((t) => t.category === 'rentan').length;

  const handleResetQueue = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset seluruh data antrean hari ini? Action ini tidak dapat dibatalkan.')) {
      resetDailyQueue();
    }
  };

  const handleSeedDemoData = () => {
    const sample = generateSampleTickets();
    saveStateToStorage({ tickets: sample });
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Filter tickets
  const filteredTickets = storeState.tickets.filter((t) => {
    const matchSearch =
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.nik && t.nik.includes(searchQuery)) ||
      t.purpose.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;

    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            Laporan & Analistik Antrean
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Rekapitulasi Pelayanan Sentra Pelayanan Kito
          </h2>
          <p className="text-xs text-slate-300">
            Dinas Sosial Kota Tanjungbalai - Rekap data pendaftaran dan statistik pelayanan per lokasi front office.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            onClick={handleSeedDemoData}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
            title="Tambah Data Antrean Contoh untuk Testing"
          >
            <Database className="w-4 h-4" />
            <span>Isi Data Demo</span>
          </button>

          <button
            onClick={handleResetQueue}
            className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
            title="Kosongkan Antrean Hari Ini"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Antrean</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Pendaftaran Hari Ini
          </span>
          <div className="text-3xl font-black text-slate-900 my-1">
            {totalTickets}
          </div>
          <span className="text-xs text-slate-500 font-medium">Kategori A & B</span>
        </div>

        <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Selesai Dilayani
          </span>
          <div className="text-3xl font-black text-emerald-700 my-1">
            {totalCompleted}
          </div>
          <span className="text-xs text-emerald-800 font-medium">
            {totalTickets > 0 ? Math.round((totalCompleted / totalTickets) * 100) : 0}% Terlayani
          </span>
        </div>

        <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 shadow-sm">
          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
            Sedang Menunggu
          </span>
          <div className="text-3xl font-black text-amber-700 my-1">
            {totalWaiting}
          </div>
          <span className="text-xs text-amber-900 font-medium">Di Ruang Tunggu</span>
        </div>

        <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-200 shadow-sm">
          <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
            Masyarakat Umum (A)
          </span>
          <div className="text-3xl font-black text-blue-800 my-1">
            {countUmum}
          </div>
          <span className="text-xs text-blue-800 font-medium">Loket FO 1 & FO 2</span>
        </div>

        <div className="bg-amber-100/60 p-5 rounded-2xl border border-amber-300 shadow-sm">
          <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block">
            Jalur Rentan & Prioritas (B)
          </span>
          <div className="text-3xl font-black text-amber-900 my-1">
            {countRentan}
          </div>
          <span className="text-xs text-amber-900 font-semibold">Disabilitas, Hamil & Lansia</span>
        </div>

      </div>

      {/* Front Office Counter Performance Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-amber-600" />
          <span>Rekap Performa Per Loket Front Office</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {storeState.counters.map((c) => {
            const completedCount = storeState.tickets.filter(
              (t) => t.assignedCounter === c.id && t.status === 'completed'
            ).length;
            const isRentan = c.category === 'rentan';

            return (
              <div
                key={c.id}
                className={`p-4 rounded-xl border space-y-2 ${
                  isRentan ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    isRentan ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-white'
                  }`}>
                    {c.code}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {c.status === 'active' ? '● Aktif' : '○ Istirahat'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 truncate">{c.name.split(' - ')[0]}</h4>
                <p className="text-xs text-slate-600 truncate">Petugas: {c.officerName || '-'}</p>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Selesai Dilayani:</span>
                  <span className="font-extrabold text-slate-900">{completedCount} Tiket</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Ticket Logs Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
        
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 no-print border-b border-slate-100 pb-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No Tiket, Nama, NIK, atau Keperluan..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filter Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-700"
            >
              <option value="all">Semua Kategori</option>
              <option value="umum">👥 Umum (A)</option>
              <option value="rentan">♿ Rentan & Prioritas (B)</option>
            </select>

            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-700"
            >
              <option value="all">Semua Status</option>
              <option value="waiting">Menunggu</option>
              <option value="calling">Sedang Dipanggil</option>
              <option value="completed">Selesai</option>
              <option value="skipped">Terlewati</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold tracking-wider text-[10px]">
                <th className="py-3 px-3">No. Tiket</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Nama Pengunjung & NIK</th>
                <th className="py-3 px-3">Keperluan Layanan</th>
                <th className="py-3 px-3">Loket FO</th>
                <th className="py-3 px-3">Waktu Daftar</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => {
                  const isRentan = ticket.category === 'rentan';

                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-black text-sm text-slate-900">
                        {ticket.ticketNumber}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          isRentan ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {isRentan ? '♿ Rentan' : '👥 Umum'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{ticket.visitorName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{ticket.nik || '-'}</div>
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-800 max-w-[200px]">
                        <div>{ticket.purpose}</div>
                        {ticket.priorityDetails && (
                          <div className="text-[10px] text-amber-800 font-semibold">{ticket.priorityDetails}</div>
                        )}
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {ticket.counterName ? ticket.counterName.split(' - ')[0] : '-'}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-500">
                        {new Date(ticket.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          ticket.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ticket.status === 'calling'
                            ? 'bg-amber-400 text-slate-950 font-extrabold'
                            : ticket.status === 'skipped'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ticket.status === 'calling' ? 'Dipanggil' : ticket.status === 'completed' ? 'Selesai' : ticket.status === 'waiting' ? 'Menunggu' : 'Terlewati'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada data antrean sesuai kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
