import React, { useEffect, useState } from 'react';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { exportAntibiogramPDF } from '../utils/exportHelpers';

const Antibiogram = () => {
  const { getAntibiogramData } = useIndexedDB();
  const [data, setData] = useState({});
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const result = await getAntibiogramData(dateFrom || undefined, dateTo || undefined);
    setData(result);
    setIsLoading(false);
  };

  const MIN_RELIABLE_N = 30; // CLSI M39 guidance: interpret antibiograms below this cautiously

  const getColorForPercentage = (pct) => {
    if (pct >= 80) return 'bg-green-600 text-white';
    if (pct >= 60) return 'bg-yellow-500 text-white';
    if (pct >= 40) return 'bg-orange-500 text-white';
    return 'bg-red-600 text-white';
  };

  const handleExportPDF = () => {
    if (Object.keys(data).length === 0) {
      alert('No data to export');
      return;
    }
    exportAntibiogramPDF(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Antibiogram</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={loadData} className="btn-outline text-sm">
             Refresh
          </button>
          <button onClick={handleExportPDF} className="btn-primary text-sm">
             Export PDF
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="card grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label-text text-sm">From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input-field text-sm"
          />
        </div>
        <div>
          <label className="label-text text-sm">To Date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input-field text-sm"
          />
        </div>
        <div className="flex items-end">
          <button onClick={loadData} className="btn-primary w-full">
            Apply Filter
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="card flex flex-wrap items-center gap-4 text-sm">
        <span className="font-medium">Color Legend:</span>
        <span className="inline-flex items-center gap-1"><span className="w-4 h-4 bg-green-600 rounded"></span> ≥80% (Good)</span>
        <span className="inline-flex items-center gap-1"><span className="w-4 h-4 bg-yellow-500 rounded"></span> 60-79% (Moderate)</span>
        <span className="inline-flex items-center gap-1"><span className="w-4 h-4 bg-orange-500 rounded"></span> 40-59% (Low)</span>
        <span className="inline-flex items-center gap-1"><span className="w-4 h-4 bg-red-600 rounded"></span> {'<40%'} (Critical)</span>
        <span className="inline-flex items-center gap-1 text-amber-600"> n &lt; {MIN_RELIABLE_N} isolates — interpret with caution</span>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {isLoading ? (
          <p className="text-center text-gray-500 py-8">Loading data...</p>
        ) : Object.keys(data).length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No data available. Enter some AST results to generate an antibiogram.
          </p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organism</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Antibiotic</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Susceptible</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">n</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(data)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([key, { percentage, total }]) => {
                  const [organism, antibiotic] = key.split('_');
                  const lowN = total < MIN_RELIABLE_N;
                  return (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{organism}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{antibiotic}</td>
                      <td className="px-4 py-3 text-sm font-bold">{percentage}%</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {total}
                        {lowN && (
                          <span className="ml-1 text-amber-600" title={`Fewer than ${MIN_RELIABLE_N} isolates — interpret with caution (CLSI M39)`}>
                            
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getColorForPercentage(percentage)}`}>
                          {percentage >= 80 ? ' Good' :
                           percentage >= 60 ? ' Moderate' :
                           percentage >= 40 ? 'Low' : ' Critical'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Antibiogram;

