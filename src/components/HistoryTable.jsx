import React, { useEffect, useState } from 'react';
import { useASTStore } from '../store/astStore';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { exportToCSV } from '../utils/exportHelpers';

const HistoryTable = () => {
  const { results, setResults, searchQuery, resetLocalState } = useASTStore();
  const { getResults, countByInterpretation, clearAllData } = useIndexedDB();
  const [filteredResults, setFilteredResults] = useState([]);
  const [filterOrganism, setFilterOrganism] = useState('');
  const [filterAntibiotic, setFilterAntibiotic] = useState('');
  const [filterInterpretation, setFilterInterpretation] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [results, searchQuery, filterOrganism, filterAntibiotic, filterInterpretation]);

  const loadResults = async () => {
    const data = await getResults();
    setResults(data);
    const stats = await countByInterpretation();
    useASTStore.getState().setStats(stats);
  };

  const filterResults = () => {
    let filtered = [...results];

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.patientId?.toLowerCase().includes(query) ||
        r.organism?.toLowerCase().includes(query) ||
        r.antibiotic?.toLowerCase().includes(query) ||
        r.ward?.toLowerCase().includes(query)
      );
    }

    // Organism filter
    if (filterOrganism) {
      filtered = filtered.filter(r => r.organism === filterOrganism);
    }

    // Antibiotic filter
    if (filterAntibiotic) {
      filtered = filtered.filter(r => r.antibiotic === filterAntibiotic);
    }

    // Interpretation filter
    if (filterInterpretation) {
      filtered = filtered.filter(r => r.interpretation === filterInterpretation);
    }

    setFilteredResults(filtered);
  };

  const getColorClass = (interpretation) => {
    if (interpretation === 'S') return 'bg-green-100 text-green-800';
    if (interpretation === 'I') return 'bg-yellow-100 text-yellow-800';
    if (interpretation === 'R') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleExport = () => {
    if (filteredResults.length === 0) {
      alert('No data to export');
      return;
    }
    exportToCSV(filteredResults);
  };

  const handleClearAllData = async () => {
    if (results.length === 0) return;
    const confirmed = window.confirm(
      ' This permanently deletes ALL saved results, QC logs, and patient records from this browser. This cannot be undone. Continue?'
    );
    if (!confirmed) return;

    setIsClearing(true);
    const outcome = await clearAllData();
    if (outcome.success) {
      resetLocalState();
      setFilteredResults([]);
    } else {
      alert('Failed to clear data. Please try again.');
    }
    setIsClearing(false);
  };

  // Get unique values for filters
  const organisms = [...new Set(results.map(r => r.organism).filter(Boolean))];
  const antibiotics = [...new Set(results.map(r => r.antibiotic).filter(Boolean))];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900"> History</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={loadResults} className="btn-outline text-sm">
             Refresh
          </button>
          <button onClick={handleExport} className="btn-primary text-sm">
             Export CSV
          </button>
          <button
            onClick={handleClearAllData}
            className="btn-danger text-sm"
            disabled={isClearing || results.length === 0}
            title="Permanently delete all saved data from this browser"
          >
            {isClearing ? 'Clearing…' : '🗑️ Clear All Data'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="label-text text-xs">Organism</label>
          <select
            value={filterOrganism}
            onChange={(e) => setFilterOrganism(e.target.value)}
            className="select-field text-sm"
          >
            <option value="">All</option>
            {organisms.map(org => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-text text-xs">Antibiotic</label>
          <select
            value={filterAntibiotic}
            onChange={(e) => setFilterAntibiotic(e.target.value)}
            className="select-field text-sm"
          >
            <option value="">All</option>
            {antibiotics.map(ab => (
              <option key={ab} value={ab}>{ab}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-text text-xs">Interpretation</label>
          <select
            value={filterInterpretation}
            onChange={(e) => setFilterInterpretation(e.target.value)}
            className="select-field text-sm"
          >
            <option value="">All</option>
            <option value="S">S - Susceptible</option>
            <option value="I">I - Intermediate</option>
            <option value="R">R - Resistant</option>
          </select>
        </div>
        <div>
          <label className="label-text text-xs">Total Results</label>
          <p className="text-lg font-semibold">{filteredResults.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {filteredResults.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No results found. Start entering AST data!</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th> 
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organism</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Antibiotic</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone (mm)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{result.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{result.patientId || 'N/A'}</td> 
                  <td className="px-4 py-3 text-sm text-gray-600">{result.ward || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{result.organism}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{result.antibiotic}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{result.zone}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getColorClass(result.interpretation)}`}>
                      {result.interpretation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HistoryTable;
