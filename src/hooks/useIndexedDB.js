import { useEffect, useState } from 'react';
import Dexie from 'dexie';

// Initialize database
const db = new Dexie('LabASTDB');
db.version(1).stores({
  results: '++id, date, patientId, organism, antibiotic, zone, interpretation, synced',
  qcLogs: '++id, date, organism, antibiotic, zone, passed, message',
  patients: '++id, patientId, age, sex, ward'
});

export const useIndexedDB = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Save a result
const saveResult = async (result) => {
  try {
    // Auto-save patient if patientId exists
    if (result.patientId) {
      const patientData = {
        patientId: result.patientId,
        age: result.age || '',
        sex: result.sex || '',
        ward: result.ward || ''
      };
      await savePatient(patientData);
    }

    const id = await db.results.add({
      ...result,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      synced: false
    });
    return { success: true, id };
  } catch (err) {
    setError(err);
    return { success: false, error: err };
  }
};
const savePatient = async (patientData) => {
  try {
    // Check if patient exists
    const existing = await db.patients.where('patientId').equals(patientData.patientId).first();
    
    if (existing) {
      // Update existing patient
      await db.patients.update(existing.id, {
        ...patientData,
        lastVisit: new Date().toISOString()
      });
      return { success: true, id: existing.id, updated: true };
    } else {
      // Add new patient
      const id = await db.patients.add({
        ...patientData,
        lastVisit: new Date().toISOString()
      });
      return { success: true, id, updated: false };
    }
  } catch (err) {
    setError(err);
    return { success: false, error: err };
  }
};

const getPatient = async (patientId) => {
  try {
    return await db.patients.where('patientId').equals(patientId).first();
  } catch (err) {
    setError(err);
    return null;
  }
};

const getAllPatients = async () => {
  try {
    return await db.patients.toArray();
  } catch (err) {
    setError(err);
    return [];
  }
};
  // Get all results
  const getResults = async (filters = {}) => {
    try {
      let collection = db.results.toCollection();
      
      if (filters.organism) {
        collection = collection.filter(r => r.organism === filters.organism);
      }
      if (filters.antibiotic) {
        collection = collection.filter(r => r.antibiotic === filters.antibiotic);
      }
      if (filters.dateFrom) {
        collection = collection.filter(r => r.date >= filters.dateFrom);
      }
      if (filters.dateTo) {
        collection = collection.filter(r => r.date <= filters.dateTo);
      }
      
      return await collection.reverse().sortBy('id');
    } catch (err) {
      setError(err);
      return [];
    }
  };

  // Get results for antibiogram (grouped by organism-antibiotic)
  const getAntibiogramData = async (dateFrom = null, dateTo = null) => {
    try {
      let results = await db.results.toArray();
      
      // Apply date filters
      if (dateFrom) {
        results = results.filter(r => r.date >= dateFrom);
      }
      if (dateTo) {
        results = results.filter(r => r.date <= dateTo);
      }
      
      // Group by organism + antibiotic
      const grouped = {};
      results.forEach(r => {
        const key = `${r.organism}_${r.antibiotic}`;
        if (!grouped[key]) {
          grouped[key] = { total: 0, susceptible: 0, organism: r.organism, antibiotic: r.antibiotic };
        }
        grouped[key].total++;
        if (r.interpretation === 'S') {
          grouped[key].susceptible++;
        }
      });
      
      // Calculate percentages
      const result = {};
      for (const [key, data] of Object.entries(grouped)) {
        result[key] = Math.round((data.susceptible / data.total) * 100);
      }
      
      return result;
    } catch (err) {
      setError(err);
      return {};
    }
  };

  // Save QC log
  const saveQCLog = async (qcData) => {
    try {
      const id = await db.qcLogs.add({
        ...qcData,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString()
      });
      return { success: true, id };
    } catch (err) {
      setError(err);
      return { success: false, error: err };
    }
  };

  // Get QC logs
  const getQCLogs = async (limit = 50) => {
    try {
      return await db.qcLogs.reverse().sortBy('id').then(logs => logs.slice(0, limit));
    } catch (err) {
      setError(err);
      return [];
    }
  };

  // Delete all results (for testing)
  const clearAllResults = async () => {
    try {
      await db.results.clear();
      return { success: true };
    } catch (err) {
      setError(err);
      return { success: false, error: err };
    }
  };

  // Count results
  const countResults = async () => {
    try {
      return await db.results.count();
    } catch (err) {
      setError(err);
      return 0;
    }
  };

  // Count by interpretation
  const countByInterpretation = async () => {
    try {
      const results = await db.results.toArray();
      return {
        S: results.filter(r => r.interpretation === 'S').length,
        I: results.filter(r => r.interpretation === 'I').length,
        R: results.filter(r => r.interpretation === 'R').length,
        total: results.length
      };
    } catch (err) {
      setError(err);
      return { S: 0, I: 0, R: 0, total: 0 };
    }
  };

  useEffect(() => {
    const checkDB = async () => {
      try {
        await db.open();
        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    };
    checkDB();
  }, []);
// Add this function before the return statement
const getResistanceTrends = async (organism = null, antibiotic = null, months = 12) => {
  try {
    let results = await db.results.toArray();
    
    // Apply filters
    if (organism) {
      results = results.filter(r => r.organism === organism);
    }
    if (antibiotic) {
      results = results.filter(r => r.antibiotic === antibiotic);
    }
    
    // Group by month
    const now = new Date();
    const monthData = {};
    
    results.forEach(r => {
      const date = new Date(r.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthData[monthKey]) {
        monthData[monthKey] = { total: 0, resistant: 0, date: date };
      }
      monthData[monthKey].total++;
      if (r.interpretation === 'R') {
        monthData[monthKey].resistant++;
      }
    });
    
    // Convert to array and sort
    const sortedMonths = Object.keys(monthData).sort();
    const lastNMonths = sortedMonths.slice(-months);
    
    return lastNMonths.map(month => ({
      month,
      resistanceRate: monthData[month].total > 0 ? Math.round((monthData[month].resistant / monthData[month].total) * 100) : 0,
      total: monthData[month].total
    }));
  } catch (err) {
    setError(err);
    return [];
  }
};
  return {
    isLoading,
    error,
    saveResult,
    getResults,
    getAntibiogramData,
    saveQCLog,
    getQCLogs,
    clearAllResults,
    countResults,
    countByInterpretation,
savePatient,      
  getPatient,        
  getAllPatients,    
  getResistanceTrends 
  };
};
