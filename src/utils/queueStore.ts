import { 
  QueueTicket, 
  CounterState, 
  SystemSettings, 
  VisitorCategory, 
  CounterId 
} from '../types';

const TICKETS_KEY = 'dinsos_queue_tickets_v1';
const COUNTERS_KEY = 'dinsos_queue_counters_v1';
const SETTINGS_KEY = 'dinsos_queue_settings_v1';
const BROADCAST_CHANNEL_NAME = 'antrean_sentra_pelayanan_kito';

// BroadcastChannel for real-time synchronization across browser tabs
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
}

export interface StoreState {
  tickets: QueueTicket[];
  counters: CounterState[];
  settings: SystemSettings;
  lastCalledTicket?: QueueTicket | null;
}

export const INITIAL_COUNTERS: CounterState[] = [
  {
    id: 'fo1',
    code: 'FO 1',
    name: 'Front Office 1 - Umum',
    category: 'umum',
    categoryLabel: 'Masyarakat Umum',
    officerName: 'Siti Rahmah, S.Tr.Sos',
    status: 'active',
    currentTicketId: null,
  },
  {
    id: 'fo2',
    code: 'FO 2',
    name: 'Front Office 2 - Umum',
    category: 'umum',
    categoryLabel: 'Masyarakat Umum',
    officerName: 'Budi Santoso, S.Sos',
    status: 'active',
    currentTicketId: null,
  },
  {
    id: 'fo3',
    code: 'FO 3',
    name: 'Front Office 3 - Rentan & Prioritas',
    category: 'rentan',
    categoryLabel: 'Disabilitas, Ibu Hamil & Lansia',
    officerName: 'Aisyah Putri, A.Md.Sos',
    status: 'active',
    currentTicketId: null,
  },
  {
    id: 'fo4',
    code: 'FO 4',
    name: 'Front Office 4 - Rentan & Prioritas',
    category: 'rentan',
    categoryLabel: 'Disabilitas, Ibu Hamil & Lansia',
    officerName: 'Hendra Wijaya, S.IP',
    status: 'active',
    currentTicketId: null,
  },
];

export const INITIAL_SETTINGS: SystemSettings = {
  institutionName: 'Dinas Sosial Kota Tanjungbalai',
  subTitle: 'Sentra Pelayanan Kito - Layanan Inklusif, Cepat & Transparan',
  address: 'Jln. Jend. Sudirman Km. 1,5 Kota Tanjungbalai',
  runningText: 'Selamat datang di Sentra Pelayanan Kito Dinas Sosial Kota Tanjungbalai. Seluruh pelayanan di tempat ini TIDAK DIPUNGUT BIAYA (GRATIS). Bagi masyarakat Disabilitas, Ibu Hamil, dan Lansia disediakan jalur prioritas di Front Office 3 dan Front Office 4.',
  autoVoiceCall: true,
  voiceSpeed: 0.95,
  voicePitch: 1.0,
  chimeVolume: 0.85,
  announcementRepeatCount: 1,
};

const storeListeners: Array<() => void> = [];
const INITIALIZED_KEY = 'dinsos_queue_initialized_v2';

// Default initial state generator
export function getInitialStoreState(): StoreState {
  const savedTickets = localStorage.getItem(TICKETS_KEY);
  const savedCounters = localStorage.getItem(COUNTERS_KEY);
  const savedSettings = localStorage.getItem(SETTINGS_KEY);
  const isInitialized = localStorage.getItem(INITIALIZED_KEY);

  let tickets: QueueTicket[] = savedTickets ? JSON.parse(savedTickets) : [];
  let counters: CounterState[] = savedCounters ? JSON.parse(savedCounters) : INITIAL_COUNTERS;
  let settings: SystemSettings = savedSettings ? JSON.parse(savedSettings) : INITIAL_SETTINGS;

  // Always update address to the official address if outdated
  if (settings.address !== 'Jln. Jend. Sudirman Km. 1,5 Kota Tanjungbalai') {
    settings.address = 'Jln. Jend. Sudirman Km. 1,5 Kota Tanjungbalai';
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  // Seed sample data ONLY on very first initialization if no storage exists
  if (!isInitialized) {
    localStorage.setItem(INITIALIZED_KEY, 'true');
    if (!savedTickets) {
      tickets = generateSampleTickets();
      localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
    }
  }

  return {
    tickets,
    counters,
    settings,
    lastCalledTicket: tickets.find(t => t.status === 'calling' || t.status === 'serving') || null,
  };
}

export function saveStateToStorage(state: Partial<StoreState>) {
  if (state.tickets !== undefined) localStorage.setItem(TICKETS_KEY, JSON.stringify(state.tickets));
  if (state.counters !== undefined) localStorage.setItem(COUNTERS_KEY, JSON.stringify(state.counters));
  if (state.settings !== undefined) localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'QUEUE_UPDATED', timestamp: Date.now() });
  }

  // Notify local in-memory subscribers in current tab
  storeListeners.forEach(cb => {
    try {
      cb();
    } catch (err) {
      console.error('Subscriber callback error:', err);
    }
  });
}

export function subscribeToStore(callback: () => void) {
  storeListeners.push(callback);

  const handleStorage = (e: StorageEvent) => {
    if ([TICKETS_KEY, COUNTERS_KEY, SETTINGS_KEY].includes(e.key || '')) {
      callback();
    }
  };

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === 'QUEUE_UPDATED') {
      callback();
    }
  };

  window.addEventListener('storage', handleStorage);
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    const idx = storeListeners.indexOf(callback);
    if (idx >= 0) storeListeners.splice(idx, 1);
    window.removeEventListener('storage', handleStorage);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
  };
}

/**
 * Creates new queue ticket from Registration Desk
 */
export function createTicket(data: {
  category: VisitorCategory;
  visitorName: string;
  nik?: string;
  purpose: string;
  priorityDetails?: string;
}): QueueTicket {
  const state = getInitialStoreState();
  const prefix = data.category === 'umum' ? 'A' : 'B';
  const categoryName = data.category === 'umum' ? 'Masyarakat Umum' : 'Masyarakat Rentan & Prioritas';

  // Find max number for this prefix
  const sameCategoryTickets = state.tickets.filter(t => t.prefix === prefix);
  let maxSeq = 0;
  sameCategoryTickets.forEach(t => {
    const numPart = parseInt(t.ticketNumber.replace(`${prefix}-`, ''), 10);
    if (!isNaN(numPart) && numPart > maxSeq) {
      maxSeq = numPart;
    }
  });

  const nextSeq = maxSeq + 1;
  const formattedSeq = nextSeq.toString().padStart(3, '0');
  const ticketNumber = `${prefix}-${formattedSeq}`;

  const newTicket: QueueTicket = {
    id: `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ticketNumber,
    prefix,
    category: data.category,
    categoryName,
    visitorName: data.visitorName || 'Pengunjung Dinsos',
    nik: data.nik || '-',
    purpose: data.purpose,
    priorityDetails: data.priorityDetails,
    status: 'waiting',
    createdAt: new Date().toISOString(),
    callCount: 0,
  };

  const updatedTickets = [...state.tickets, newTicket];
  saveStateToStorage({ tickets: updatedTickets });
  return newTicket;
}

/**
 * Operator at Front Office calls next ticket
 */
export function callNextTicket(counterId: CounterId): QueueTicket | null {
  const state = getInitialStoreState();
  const counter = state.counters.find(c => c.id === counterId);
  if (!counter) return null;

  // Find waiting tickets for this counter's category
  const waitingTicket = state.tickets
    .filter(t => t.category === counter.category && t.status === 'waiting')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

  if (!waitingTicket) return null;

  const now = new Date().toISOString();

  // If this counter had a previous active ticket, mark it completed
  const updatedTickets = state.tickets.map(t => {
    if (t.id === waitingTicket.id) {
      return {
        ...t,
        status: 'calling' as const,
        assignedCounter: counterId,
        counterName: counter.name,
        calledAt: now,
        callCount: (t.callCount || 0) + 1,
      };
    }
    // Complete previously serving ticket on this counter
    if (t.assignedCounter === counterId && (t.status === 'calling' || t.status === 'serving')) {
      return {
        ...t,
        status: 'completed' as const,
        completedAt: now,
      };
    }
    return t;
  });

  const updatedCounters = state.counters.map(c => {
    if (c.id === counterId) {
      return { ...c, currentTicketId: waitingTicket.id };
    }
    return c;
  });

  saveStateToStorage({ tickets: updatedTickets, counters: updatedCounters });
  
  // Return the called ticket
  return updatedTickets.find(t => t.id === waitingTicket.id) || null;
}

/**
 * Recall active ticket
 */
export function recallTicket(counterId: CounterId): QueueTicket | null {
  const state = getInitialStoreState();
  const counter = state.counters.find(c => c.id === counterId);
  if (!counter || !counter.currentTicketId) return null;

  let recalledTicket: QueueTicket | null = null;
  const updatedTickets = state.tickets.map(t => {
    if (t.id === counter.currentTicketId) {
      const updated = {
        ...t,
        status: 'calling' as const,
        calledAt: new Date().toISOString(),
        callCount: (t.callCount || 0) + 1,
      };
      recalledTicket = updated;
      return updated;
    }
    return t;
  });

  saveStateToStorage({ tickets: updatedTickets });
  return recalledTicket;
}

/**
 * Mark ticket completed
 */
export function finishTicket(counterId: CounterId): void {
  const state = getInitialStoreState();
  const counter = state.counters.find(c => c.id === counterId);
  if (!counter || !counter.currentTicketId) return;

  const now = new Date().toISOString();
  const updatedTickets = state.tickets.map(t => {
    if (t.id === counter.currentTicketId) {
      return {
        ...t,
        status: 'completed' as const,
        completedAt: now,
      };
    }
    return t;
  });

  const updatedCounters = state.counters.map(c => {
    if (c.id === counterId) {
      return { ...c, currentTicketId: null };
    }
    return c;
  });

  saveStateToStorage({ tickets: updatedTickets, counters: updatedCounters });
}

/**
 * Skip ticket (Mark absent)
 */
export function skipTicket(counterId: CounterId): void {
  const state = getInitialStoreState();
  const counter = state.counters.find(c => c.id === counterId);
  if (!counter || !counter.currentTicketId) return;

  const updatedTickets = state.tickets.map(t => {
    if (t.id === counter.currentTicketId) {
      return {
        ...t,
        status: 'skipped' as const,
      };
    }
    return t;
  });

  const updatedCounters = state.counters.map(c => {
    if (c.id === counterId) {
      return { ...c, currentTicketId: null };
    }
    return c;
  });

  saveStateToStorage({ tickets: updatedTickets, counters: updatedCounters });
}

/**
 * Update Counter Officer
 */
export function updateCounterOfficer(counterId: CounterId, officerName: string, status: 'active' | 'break' | 'offline') {
  const state = getInitialStoreState();
  const updatedCounters = state.counters.map(c => {
    if (c.id === counterId) {
      return { ...c, officerName, status };
    }
    return c;
  });
  saveStateToStorage({ counters: updatedCounters });
}

/**
 * Update System Settings
 */
export function updateSettings(newSettings: Partial<SystemSettings>) {
  const state = getInitialStoreState();
  const updated = { ...state.settings, ...newSettings };
  saveStateToStorage({ settings: updated });
}

/**
 * Delete a specific ticket by ID
 */
export function deleteTicket(ticketId: string): void {
  const state = getInitialStoreState();
  const updatedTickets = state.tickets.filter(t => t.id !== ticketId);
  const updatedCounters = state.counters.map(c => {
    if (c.currentTicketId === ticketId) {
      return { ...c, currentTicketId: null };
    }
    return c;
  });
  saveStateToStorage({ tickets: updatedTickets, counters: updatedCounters });
}

/**
 * Reset Queue for a new day / Hapus seluruh data antrean
 */
export function resetDailyQueue(): void {
  localStorage.setItem(INITIALIZED_KEY, 'true');
  const resetCounters = INITIAL_COUNTERS.map(c => ({ 
    ...c, 
    currentTicketId: null,
    status: 'active' as const
  }));
  saveStateToStorage({ tickets: [], counters: resetCounters });
}

/**
 * Seed initial sample tickets for demonstration
 */
export function generateSampleTickets(): QueueTicket[] {
  const today = new Date().toISOString();
  return [
    {
      id: 't_001',
      ticketNumber: 'A-001',
      prefix: 'A',
      category: 'umum',
      categoryName: 'Masyarakat Umum',
      visitorName: 'Zulkifli Nasution',
      nik: '1274011203850001',
      purpose: 'DTKS & Cek Bansos',
      status: 'completed',
      assignedCounter: 'fo1',
      counterName: 'Front Office 1 - Umum',
      createdAt: today,
      calledAt: today,
      completedAt: today,
      callCount: 1,
    },
    {
      id: 't_002',
      ticketNumber: 'B-001',
      prefix: 'B',
      category: 'rentan',
      categoryName: 'Masyarakat Rentan & Prioritas',
      visitorName: 'Hj. Aminah Marpaung',
      nik: '1274025508480002',
      purpose: 'Layanan Santunan & Perlindungan Lansia',
      priorityDetails: 'Lansia 78 Tahun (Prioritas Utama)',
      status: 'completed',
      assignedCounter: 'fo3',
      counterName: 'Front Office 3 - Rentan & Prioritas',
      createdAt: today,
      calledAt: today,
      completedAt: today,
      callCount: 1,
    },
    {
      id: 't_003',
      ticketNumber: 'A-002',
      prefix: 'A',
      category: 'umum',
      categoryName: 'Masyarakat Umum',
      visitorName: 'Rudi Hermawan',
      nik: '1274031905920003',
      purpose: 'Rekomendasi KIS BPJS Kesehatan (PBI)',
      status: 'calling',
      assignedCounter: 'fo2',
      counterName: 'Front Office 2 - Umum',
      createdAt: today,
      calledAt: today,
      callCount: 2,
    },
    {
      id: 't_004',
      ticketNumber: 'B-002',
      prefix: 'B',
      category: 'rentan',
      categoryName: 'Masyarakat Rentan & Prioritas',
      visitorName: 'Nurhayati Batubara',
      nik: '1274016109960004',
      purpose: 'Rehabilitasi Sosial & Alat Bantu Disabilitas',
      priorityDetails: 'Pengguna Kursi Roda',
      status: 'calling',
      assignedCounter: 'fo4',
      counterName: 'Front Office 4 - Rentan & Prioritas',
      createdAt: today,
      calledAt: today,
      callCount: 1,
    },
    {
      id: 't_005',
      ticketNumber: 'A-003',
      prefix: 'A',
      category: 'umum',
      categoryName: 'Masyarakat Umum',
      visitorName: 'Dewi Sartika',
      nik: '1274024810900005',
      purpose: 'Program Keluarga Harapan (PKH) & Sembako',
      status: 'waiting',
      createdAt: today,
      callCount: 0,
    },
    {
      id: 't_006',
      ticketNumber: 'B-003',
      prefix: 'B',
      category: 'rentan',
      categoryName: 'Masyarakat Rentan & Prioritas',
      visitorName: 'Sri Wahyuni',
      nik: '1274036602980006',
      purpose: 'Rekomendasi KIS BPJS Kesehatan (PBI)',
      priorityDetails: 'Ibu Hamil Trimester 3',
      status: 'waiting',
      createdAt: today,
      callCount: 0,
    },
    {
      id: 't_007',
      ticketNumber: 'A-004',
      prefix: 'A',
      category: 'umum',
      categoryName: 'Masyarakat Umum',
      visitorName: 'Muhammad Syafi\'i',
      nik: '1274010804880007',
      purpose: 'Surat Keterangan / Rekomendasi Sosial',
      status: 'waiting',
      createdAt: today,
      callCount: 0,
    }
  ];
}
