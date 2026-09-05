import React, { useState, useEffect } from 'react';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { getQCOrganisms, qcRanges } from '../utils/breakpoints';
import { checkQC } from '../utils/interpreter';

const QCModule = () => {
  const { saveQCLog, getQCLogs } = useIndexedDB();
  const [qcLogs, setQCLogs] = useState([]);
  const [selectedOrganism, setSelectedOrganism] = useState('');
  const [selectedAntibiotic, setSelectedAntibiotic] = useState('');
  const [zoneValue, setZoneValue] = useState('');
  const [qcResult, setQcResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const qcOrganisms = getQCOrganisms();

  useEffect(() => {
    loadQCLogs();
  }, []);

  const loadQCLogs = async () => {
    const logs = await getQCLogs(50);
    setQCLogs(logs);
  };

  const handleOrganismChange = (org) => {
    setSelectedOrganism(org);
    setSelectedAntibiotic('');
    setZoneValue('');
    setQcResult(null);
  };

  const handleCheckQC = () => {
    if (!selectedOrganism || !selectedAntibiotic || !zoneValue) {
      alert('Please select organism, antibiotic, and enter zone diameter');
      return;
    }

    const result = checkQC(selectedOrganism, selectedAntibiotic, zoneValue);
    setQcResult(result);
  };

  const handleSaveQC = async () => {
    if (!qcResult) return;

    setIsSaving(true);
    const logData = {
      organism: selectedOrganism,
      antibiotic: selectedAntibiotic,
      zone: parseFloat(zoneValue),
      passed: qcResult.pass,
      message: qcResult.message
    };

    const saved = await saveQCLog(logData);
    if (saved.success) {
      alert(' QC result saved!');
      setQcResult(null);
      setZoneValue('');
      await loadQCLogs();
    } else {
      alert(' Failed to save QC result');
    }
    setIsSaving(false);
  };

  const getAvailableAntibiotics = () => {
    if (!selectedOrganism) return [];
    return Object.keys(qcRanges[selectedOrganism] || {});
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900"> QC Module</h2>

      <div className="card grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QC Check Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">QC Check</h3>
          
          <div>
            <label className="label-text">ATCC Organism</label>
            <select
              value={selectedOrganism}
              onChange={(e) => handleOrganismChange(e.target.value)}
              className="select-field"
            >
              <option value="">Select Organism</option>
              {qcOrganisms.map(org => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text">Antibiotic</label>
            <select
              value={selectedAntibiotic}
              onChange={(e) => setSelectedAntibiotic(e.target.value)}
              className="select-field"
              disabled={!selectedOrganism}
            >
              <option value="">Select Antibiotic</option>
              {getAvailableAntibiotics().map(ab => (
                <option key={ab} value={ab}>{ab}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text">Zone Diameter (mm)</label>
            <input
              type="number"
              value={zoneValue}
              onChange={(e) => setZoneValue(e.target.value)}
              className="input-field"
              placeholder="Enter zone diameter"
              step="0.1"
              disabled={!selectedAntibiotic}
            />
          </div>

          <button onClick={handleCheckQC} className="btn-primary w-full" disabled={!selectedAntibiotic}>
            Check QC
          </button>

          {/* QC Result Display */}
          {qcResult && (
            <div className={`p-4 rounded-md ${qcResult.pass ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'}`}>
              <p className={`font-bold text-lg ${qcResult.pass ? 'text-green-800' : 'text-red-800'}`}>
                {qcResult.message}
              </p>
              {qcResult.pass ? (
                <button
                  onClick={handleSaveQC}
                  className="btn-success mt-3 text-sm w-full"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : '💾 Save QC Result'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setZoneValue('');
                    setQcResult(null);
                  }}
                  className="btn-outline mt-3 text-sm w-full"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>

        {/* QC History */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Recent QC Logs</h3>
          <div className="max-h-96 overflow-y-auto">
            {qcLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No QC logs yet</p>
            ) : (
              <div className="space-y-2">
                {qcLogs.map((log) => (
                  <div key={log.id} className={`p-3 rounded-md border ${log.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{log.organism}</p>
                        <p className="text-xs text-gray-600">{log.antibiotic}: {log.zone} mm</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.passed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {log.passed ? ' PASS' : ' FAIL'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{log.date} {log.timestamp?.split('T')[1]?.slice(0, 5)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QC Statistics */}
      {qcLogs.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-lg mb-3">QC Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total QC Tests</p>
              <p className="text-2xl font-bold text-gray-900">{qcLogs.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Passed</p>
              <p className="text-2xl font-bold text-green-600">{qcLogs.filter(l => l.passed).length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-red-600">{qcLogs.filter(l => !l.passed).length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pass Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round((qcLogs.filter(l => l.passed).length / qcLogs.length) * 100)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QCModule;

