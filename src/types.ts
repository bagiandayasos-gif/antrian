export type VisitorCategory = 'umum' | 'rentan';

export type CounterId = 'fo1' | 'fo2' | 'fo3' | 'fo4';

export type TicketStatus = 'waiting' | 'calling' | 'serving' | 'completed' | 'skipped';

export interface QueueTicket {
  id: string;
  ticketNumber: string; // e.g. "A-001" or "B-002"
  prefix: 'A' | 'B';
  category: VisitorCategory;
  categoryName: string; // "Masyarakat Umum" or "Masyarakat Rentan & Prioritas"
  visitorName: string;
  nik?: string;
  purpose: string;
  priorityDetails?: string; // e.g., "Ibu Hamil", "Lansia 68 Thn", "Disabilitas Netra", "Membawa Balita"
  status: TicketStatus;
  assignedCounter?: CounterId;
  counterName?: string; // e.g., "Front Office 1 - Umum"
  createdAt: string; // ISO string
  calledAt?: string;
  completedAt?: string;
  callCount: number;
}

export interface CounterState {
  id: CounterId;
  code: string; // "FO 1", "FO 2", "FO 3", "FO 4"
  name: string; // "Front Office 1", "Front Office 2", etc.
  category: VisitorCategory;
  categoryLabel: string; // "Masyarakat Umum" or "Disabilitas, Ibu Hamil & Lansia"
  officerName: string;
  status: 'active' | 'break' | 'offline';
  currentTicketId?: string | null;
}

export interface SystemSettings {
  runningText: string;
  institutionName: string;
  subTitle: string;
  address: string;
  autoVoiceCall: boolean;
  voiceSpeed: number; // 0.8 - 1.2
  voicePitch: number; // 0.8 - 1.2
  chimeVolume: number; // 0 - 1
  announcementRepeatCount: number;
  videoUrl?: string;
}

export interface ServiceOption {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  recommendedCategory: VisitorCategory;
  iconName: string;
}

export const DINSOS_SERVICES: ServiceOption[] = [
  {
    id: 'dtks-cekbansos',
    title: 'DTKS & Cek Bansos',
    description: 'Pendaftaran, verifikasi, dan pemutakhiran data Data Terpadu Kesejahteraan Sosial (DTKS) & Cek Status Bansos.',
    requirements: ['Fotokopi KTP Tanjungbalai', 'Fotokopi Kartu Keluarga (KK)', 'Surat Keterangan Tidak Mampu (SKTM) Kelurahan'],
    recommendedCategory: 'umum',
    iconName: 'Database'
  },
  {
    id: 'pkh-sembako',
    title: 'Program Keluarga Harapan (PKH) & Sembako',
    description: 'Pengusulan dan konsultasi kepesertaan Bansos PKH serta Bantuan Sembako/BPNT.',
    requirements: ['KTP & KK Asli + Fotokopi', 'Bukti Kondisi Sosial Ekonomi / Rumah', 'Nomor HP Aktif'],
    recommendedCategory: 'umum',
    iconName: 'HeartHandshake'
  },
  {
    id: 'kis-bpjs-pbi',
    title: 'Rekomendasi KIS BPJS Kesehatan (PBI)',
    description: 'Penerbitan Surat Rekomendasi Jaminan Kesehatan Kartu Indonesia Sehat PBI APBD / APBN.',
    requirements: ['Fotokopi KTP & KK', 'Surat Keterangan Rawat Inap / Rekomendasi Puskesmas / RSUD', 'Surat Keterangan Tidak Mampu (SKTM) Kelurahan'],
    recommendedCategory: 'umum',
    iconName: 'ShieldPlus'
  },
  {
    id: 'rehabsos-disabilitas',
    title: 'Rehabilitasi Sosial & Alat Bantu Disabilitas',
    description: 'Permohonan bantuan alat bantu (kursi roda, tongkat, alat bantu dengar) & layanan rehabilitasi disabilitas.',
    requirements: ['Fotokopi KTP & KK', 'Surat Keterangan Disabilitas dari Dokter/Puskesmas', 'Foto Fisik Calon Penerima Manfaat'],
    recommendedCategory: 'rentan',
    iconName: 'Accessibility'
  },
  {
    id: 'lansia-lansiacare',
    title: 'Layanan Santunan & Perlindungan Lansia',
    description: 'Layanan bantuan sosial, perawatan, dan santunan untuk Lansia terlantar dan Lansia potensi.',
    requirements: ['KTP Tanjungbalai (Usia 60+)', 'Kartu Keluarga', 'Foto Pengunjung / Lansia'],
    recommendedCategory: 'rentan',
    iconName: 'UserCheck'
  },
  {
    id: 'bencana-logistik',
    title: 'Bantuan Bencana & Logistik Darurat',
    description: 'Penyaluran bantuan logistik, matras, dan sembako darurat bagi korban kebakaran, banjir, dan bencana alam.',
    requirements: ['Surat Bencana dari Lapor/Lurah/Camat', 'KTP/KK Korban', 'Foto Kejadian Bencana'],
    recommendedCategory: 'rentan',
    iconName: 'Flame'
  },
  {
    id: 'sktm-rekomendasi',
    title: 'Surat Keterangan / Rekomendasi Sosial',
    description: 'Penerbitan Surat Keterangan / Rekomendasi Dinas Sosial untuk beasiswa, yayasan, atau pengadilan.',
    requirements: ['Surat Pengantar dari Kelurahan', 'Fotokopi KTP & KK', 'Dokumen Pendukung Permohonan'],
    recommendedCategory: 'umum',
    iconName: 'FileText'
  }
];
