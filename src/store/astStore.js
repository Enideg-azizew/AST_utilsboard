import { create } from 'zustand';
import { interpretZone } from '../utils/interpreter';

export const useASTStore = create((set, get) => ({
  // State
  currentResult: {
    patientId: '',
    age: '',
    sex: '',
    ward: '',
    specimen: '',
    organism: '',
    antibiotic: '',
    zone: '',
    interpretation: '',
    note: ''
  },
  results: [],
  qcLogs: [],
  stats: { S: 0, I: 0, R: 0, total: 0 },
  isLoading: false,
  searchQuery: '',
  dateRange: { from: '', to: '' },

  // Actions
  setCurrentResult: (field, value) => {
    set((state) => {
      const newResult = { ...state.currentResult, [field]: value };
      
      // Auto-interpret once organism + antibiotic are chosen. interpretZone handles a
      // missing zone itself (some combos, like MIC-only ones, don't need one at all).
      if (newResult.organism && newResult.antibiotic) {
        const interpretation = interpretZone(
          newResult.organism,
          newResult.antibiotic,
          newResult.zone === '' ? '' : parseFloat(newResult.zone)
        );
        newResult.interpretation = interpretation.interpretation;
        newResult.note = interpretation.note;
        newResult.color = interpretation.color;
      }
      
      return { currentResult: newResult };
    });
  },

  resetCurrentResult: () => {
    set({
      currentResult: {
        patientId: '',
        age: '',
        sex: '',
        ward: '',
        specimen: '',
        organism: '',
        antibiotic: '',
        zone: '',
        interpretation: '',
        note: ''
      }
    });
  },

  setResults: (results) => set({ results }),

  setQCLogs: (logs) => set({ qcLogs: logs }),

  setStats: (stats) => set({ stats }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setDateRange: (field, value) => {
  set((state) => ({
    dateRange: { ...state.dateRange, [field]: value }
  }));
},
  // Resets in-memory state only — actually deleting stored data goes through
  // useIndexedDB's clearAllData, which this is called alongside (see HistoryTable).
  resetLocalState: () => {
    set({ results: [], qcLogs: [], stats: { S: 0, I: 0, R: 0, total: 0 } });
  }
}));
