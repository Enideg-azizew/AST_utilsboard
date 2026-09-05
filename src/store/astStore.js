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
      
      // Auto-interpret if organism, antibiotic, and zone are present
      if (newResult.organism && newResult.antibiotic && newResult.zone) {
        const interpretation = interpretZone(
          newResult.organism,
          newResult.antibiotic,
          parseFloat(newResult.zone)
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
  clearAllData: () => {
    if (confirm('⚠️ This will delete ALL saved results. Are you sure?')) {
      set({ results: [], stats: { S: 0, I: 0, R: 0, total: 0 } });
      return true;
    }
    return false;
  }
}));
