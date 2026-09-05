import { breakpoints, clinicalNotes, qcRanges } from './breakpoints';

// Interpret zone diameter for a given organism and antibiotic
export const interpretZone = (organism, antibiotic, zone) => {
  if (!organism || !antibiotic || zone === undefined || zone === null || zone === '') {
    return { interpretation: '—', color: 'gray', note: 'Please enter a zone diameter' };
  }

  const zoneNum = parseFloat(zone);
  if (isNaN(zoneNum)) {
    return { interpretation: 'Invalid', color: 'gray', note: 'Please enter a valid number' };
  }

  const rules = breakpoints[organism]?.[antibiotic];
  if (!rules) {
    return { interpretation: 'N/A', color: 'gray', note: 'No breakpoint found' };
  }

  let interpretation, color, note = '';

  if (zoneNum >= rules.S) {
    interpretation = 'S';
    color = 'green';
    note = 'Susceptible - standard therapy recommended';
  } else if (zoneNum <= rules.R) {
    interpretation = 'R';
    color = 'red';
    // Check for special resistance patterns
    if (organism === 'Staphylococcus aureus' && antibiotic === 'Oxacillin') {
      note = clinicalNotes.MRSA;
    } else if (antibiotic === 'Meropenem' && ['E. coli', 'Klebsiella pneumoniae'].includes(organism)) {
      note = clinicalNotes.CRE;
    } else {
      note = clinicalNotes.default;
    }
  } else {
    interpretation = 'I';
    color = 'yellow';
    note = 'Intermediate - may be effective at higher doses or in certain body sites';
  }

  return { interpretation, color, note };
};

// Check if QC result passes
export const checkQC = (organism, antibiotic, zone) => {
  const zoneNum = parseFloat(zone);
  if (isNaN(zoneNum)) return { pass: false, message: 'Invalid zone diameter' };

  const ranges = qcRanges[organism]?.[antibiotic];
  if (!ranges) {
    return { pass: false, message: 'QC range not available for this combination' };
  }

  if (zoneNum >= ranges.min && zoneNum <= ranges.max) {
    return { pass: true, message: `PASS ✅ (Expected: ${ranges.min}-${ranges.max} mm)` };
  } else {
    return { 
      pass: false, 
      message: `FAIL ❌ (Expected: ${ranges.min}-${ranges.max} mm, Got: ${zoneNum} mm)` 
    };
  }
};
