import React, { useState } from 'react';
import { useASTStore } from '../store/astStore';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { getOrganisms, getAntibiotics } from '../utils/breakpoints';
import { interpretZone } from '../utils/interpreter';

const ASTEntry = () => {
  const { currentResult, setCurrentResult, resetCurrentResult } = useASTStore();
  const { saveResult, getResults, countByInterpretation } = useIndexedDB();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const organisms = getOrganisms();
  const antibiotics = currentResult.organism ? getAntibiotics(currentResult.organism) : [];
  const isMicOnly = currentResult.interpretation === 'MIC';

  const handleChange = (field, value) => {
    setCurrentResult(field, value);
  };

  const handleZoneChange = (e) => {
    const value = e.target.value;
    setCurrentResult('zone', value);
    
    // Auto-interpret on zone change
    if (currentResult.organism && currentResult.antibiotic && value) {
      const result = interpretZone(currentResult.organism, currentResult.antibiotic, parseFloat(value));
      setCurrentResult('interpretation', result.interpretation);
      setCurrentResult('note', result.note);
      setCurrentResult('color', result.color);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!currentResult.organism || !currentResult.antibiotic) {
      setMessage({ type: 'error', text: 'Please select an organism and antibiotic' });
      return;
    }
    if (!isMicOnly && !currentResult.zone) {
      setMessage({ type: 'error', text: 'Please enter a zone diameter' });
      return;
    }
    if (['N/A', 'Invalid', '—', ''].includes(currentResult.interpretation)) {
      setMessage({ type: 'error', text: 'This combination could not be interpreted — check the entry before saving' });
      return;
    }

    setIsSaving(true);
    
    const resultData = {
      ...currentResult,
      zone: currentResult.zone ? parseFloat(currentResult.zone) : null
    };

    const result = await saveResult(resultData);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Result saved successfully!' });
      resetCurrentResult();
      
      // Update stats
      const stats = await countByInterpretation();
      useASTStore.getState().setStats(stats);
      
      // Refresh history
      const results = await getResults();
      useASTStore.getState().setResults(results);
    } else {
      setMessage({ type: 'error', text: 'Failed to save result. Please try again.' });
    }
    
    setIsSaving(false);
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">New AST Entry</h2>
        <button
          onClick={resetCurrentResult}
          className="btn-outline text-sm"
        >
          Clear Form
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Patient Information */}
          <div>
            <label className="label-text">Patient ID (optional)</label>
            <input
              type="text"
              value={currentResult.patientId || ''}
              onChange={(e) => handleChange('patientId', e.target.value)}
              className="input-field"
              placeholder="e.g., an anonymized code — avoid real names"
            />
          </div>
          <div>
            <label className="label-text">Age</label>
            <input
              type="number"
              value={currentResult.age || ''}
              onChange={(e) => handleChange('age', e.target.value)}
              className="input-field"
              placeholder="e.g., 45"
            />
          </div>
          <div>
            <label className="label-text">Sex</label>
            <select
              value={currentResult.sex || ''}
              onChange={(e) => handleChange('sex', e.target.value)}
              className="select-field"
            >
              <option value="">Select</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          <div>
            <label className="label-text">Ward</label>
            <select
              value={currentResult.ward || ''}
              onChange={(e) => handleChange('ward', e.target.value)}
              className="select-field"
            >
              <option value="">Select</option>
              <option value="Outpatient">Outpatient</option>
              <option value="Inpatient">Inpatient</option>
              <option value="ICU">ICU</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Maternity">Maternity</option>
              <option value="Surgery">Surgery</option>
            </select>
          </div>
          <div>
            <label className="label-text">Specimen Type</label>
            <select
              value={currentResult.specimen || ''}
              onChange={(e) => handleChange('specimen', e.target.value)}
              className="select-field"
            >
              <option value="">Select</option>
              <option value="Urine">Urine</option>
              <option value="Blood">Blood</option>
              <option value="Sputum">Sputum</option>
              <option value="CSF">CSF</option>
              <option value="Wound Swab">Wound Swab</option>
              <option value="Throat Swab">Throat Swab</option>
              <option value="Stool">Stool</option>
            </select>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Microbiology Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label-text">Organism *</label>
            <select
              value={currentResult.organism || ''}
              onChange={(e) => {
                handleChange('organism', e.target.value);
                handleChange('antibiotic', '');
                handleChange('zone', '');
                handleChange('interpretation', '');
                handleChange('note', '');
              }}
              className="select-field"
              required
            >
              <option value="">Select Organism</option>
              {organisms.map((org) => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text">Antibiotic *</label>
            <select
              value={currentResult.antibiotic || ''}
              onChange={(e) => {
                handleChange('antibiotic', e.target.value);
                handleChange('zone', '');
                handleChange('interpretation', '');
                handleChange('note', '');
              }}
              className="select-field"
              disabled={!currentResult.organism}
              required
            >
              <option value="">Select Antibiotic</option>
              {antibiotics.map((ab) => (
                <option key={ab} value={ab}>{ab}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text">Zone Diameter (mm) {!isMicOnly && '*'}</label>
            <input
              type="number"
              value={currentResult.zone || ''}
              onChange={handleZoneChange}
              className="input-field"
              placeholder={isMicOnly ? 'Not used — MIC method required' : 'e.g., 22'}
              step="0.1"
              disabled={!currentResult.antibiotic || isMicOnly}
              required={!isMicOnly}
            />
          </div>
        </div>

        {/* Interpretation Display */}
        {currentResult.interpretation && (
          <div className={`p-4 rounded-md text-center font-bold text-lg ${
            currentResult.color === 'green' ? 'bg-green-100 text-green-800 border border-green-200' :
            currentResult.color === 'red' ? 'bg-red-100 text-red-800 border border-red-200' :
            currentResult.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            currentResult.color === 'purple' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
            'bg-gray-100 text-gray-800 border border-gray-200'
          }`}>
            <p>
              Interpretation: <span className="text-2xl">{currentResult.interpretation}</span>
            </p>
            {currentResult.note && (
              <p className="text-sm font-normal mt-1">{currentResult.note}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary w-full py-3 text-lg"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Result'}
        </button>
      </form>
    </div>
  );
};

export default ASTEntry;
