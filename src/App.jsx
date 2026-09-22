import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import DashboardStats from './components/DashboardStats';
import ASTEntry from './components/ASTEntry';
import HistoryTable from './components/HistoryTable';
import Antibiogram from './components/Antibiogram';
import QCModule from './components/QCModule';
import { useASTStore } from './store/astStore';
import { useIndexedDB } from './hooks/useIndexedDB';
import ResistanceChart from './components/ResistanceChart'; 
import PortfolioFooter from './components/PortfolioFooter'; 
import { breakpointsMeta } from './utils/breakpoints';

function App() {
  const [activeTab, setActiveTab] = useState('entry');
  const { stats, setStats, searchQuery, setSearchQuery, dateRange, setDateRange } = useASTStore();
  const { countByInterpretation, getResults } = useIndexedDB();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const statsData = await countByInterpretation();
    setStats(statsData);
    
    const results = await getResults();
    useASTStore.getState().setResults(results);
  };

const handleSearchChange = (e) => {
  setSearchQuery(e.target.value);
};

const handleDateRangeChange = (field, value) => {
  setDateRange(field, value);
};

const applyFilters = async () => {
  const filters = {
    dateFrom: dateRange.from || undefined,
    dateTo: dateRange.to || undefined
  };
  const results = await getResults(filters);
  useASTStore.getState().setResults(results);
};
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-xs text-amber-800">
          ⚠️ Educational/reference tool only — not for clinical decision-making. Breakpoints: {breakpointsMeta.source}.
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
 {/* filters */}
{activeTab !== 'entry' && (
  <div className="mb-6 card">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-2">
        <label className="label-text text-sm">🔍 Search</label>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          className="input-field text-sm"
          placeholder="Search by patient, organism, antibiotic, or ward..."
        />
      </div>
      <div>
        <label className="label-text text-sm">From Date</label>
        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => handleDateRangeChange('from', e.target.value)}
          className="input-field text-sm"
        />
      </div>
      <div>
        <label className="label-text text-sm">To Date</label>
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => handleDateRangeChange('to', e.target.value)}
          className="input-field text-sm"
        />
      </div>
    </div>
    <div className="mt-3 flex justify-end gap-2">
      <button onClick={applyFilters} className="btn-primary text-sm">
        Apply Filters
      </button>
      <button 
        onClick={() => {
          setSearchQuery('');
          setDateRange('from', '');
          setDateRange('to', '');
          applyFilters();
        }} 
        className="btn-outline text-sm"
      >
        Clear Filters
      </button>
    </div>
  </div>
)}
       {/* Stats Bar - Show on all tabs */}
        <div className="mb-6">
          <DashboardStats stats={stats} />
        </div>
{/* resistance chart for both */}
{(activeTab === 'history' || activeTab === 'antibiogram') && (
  <div className="mb-6">
    <ResistanceChart />
  </div>
)}
        {/* Content based on active tab */}
        {activeTab === 'entry' && <ASTEntry />}
        {activeTab === 'history' && <HistoryTable />}
        {activeTab === 'antibiogram' && <Antibiogram />}
        {activeTab === 'qc' && <QCModule />}
      </main>

      {/* Footer */}
      <PortfolioFooter/>
    </div>
  );
}

export default App;
