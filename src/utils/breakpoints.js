// Zone diameter breakpoints (disk diffusion), referenced from CLSI M100, 33rd Edition (2023).
// This is a small reference subset for demonstration only — it has not been independently
// re-verified against the published tables and MUST be checked against the current CLSI
// M100 (or EUCAST) document before any real interpretive use.
export const breakpointsMeta = {
  source: 'CLSI M100, 33rd Edition (2023) — reference subset, not independently re-verified',
  lastReviewed: '2024-01-15',
  disclaimer:
    'For educational / reference use only. Not a substitute for the current published ' +
    'CLSI or EUCAST breakpoint tables, and not intended to guide real patient care.'
};

// Organism/antibiotic combinations where disk diffusion is not considered reliable and
// CLSI recommends an MIC method (broth microdilution or gradient diffusion) instead.
export const micOnlyCombos = {
  'Staphylococcus aureus': ['Vancomycin'],
  'Enterococcus faecalis': ['Vancomycin']
};

export const breakpoints = {
  'E. coli': {
    'Ampicillin': { S: 17, R: 13 },        // >=17 = S, 14-16 = I, <=13 = R
    'Amoxicillin-Clavulanate': { S: 18, R: 13 },
    'Ceftriaxone': { S: 23, R: 19 },
    'Ciprofloxacin': { S: 21, R: 15 },
    'Gentamicin': { S: 15, R: 12 },
    'Meropenem': { S: 23, R: 19 },
    'Nitrofurantoin': { S: 17, R: 14 },
    'Trimethoprim-Sulfamethoxazole': { S: 16, R: 10 }
  },
  'Klebsiella pneumoniae': {
    'Ampicillin': { S: 17, R: 13 },
    'Ceftriaxone': { S: 23, R: 19 },
    'Ciprofloxacin': { S: 21, R: 15 },
    'Gentamicin': { S: 15, R: 12 },
    'Meropenem': { S: 23, R: 19 }
  },
  'Pseudomonas aeruginosa': {
    'Ceftazidime': { S: 18, R: 14 },
    'Ciprofloxacin': { S: 21, R: 15 },
    'Gentamicin': { S: 15, R: 12 },
    'Meropenem': { S: 19, R: 15 },
    'Piperacillin-Tazobactam': { S: 21, R: 17 }
  },
  'Staphylococcus aureus': {
    'Oxacillin': { S: 18, R: 14 },         // Oxacillin R = MRSA
    'Penicillin': { S: 29, R: 28 },
    'Ciprofloxacin': { S: 21, R: 15 },
    'Gentamicin': { S: 15, R: 12 },
    'Trimethoprim-Sulfamethoxazole': { S: 16, R: 10 }
    // Vancomycin intentionally excluded — see micOnlyCombos (MIC method required)
  },
  'Enterococcus faecalis': {
    'Ampicillin': { S: 17, R: 13 },
    'Gentamicin': { S: 15, R: 12 },
    'Linezolid': { S: 21, R: 19 }
    // Vancomycin intentionally excluded — see micOnlyCombos (MIC method required)
  },
  'Streptococcus pneumoniae': {
    'Penicillin': { S: 19, R: 18 },
    'Ceftriaxone': { S: 23, R: 19 },
    'Vancomycin': { S: 17, R: 14 }
  }
};

// QC ranges for ATCC strains (zone diameters in mm)
export const qcRanges = {
  'E. coli ATCC 25922': {
    'Ampicillin': { min: 16, max: 22 },
    'Ceftriaxone': { min: 29, max: 35 },
    'Ciprofloxacin': { min: 30, max: 40 },
    'Gentamicin': { min: 19, max: 26 },
    'Meropenem': { min: 28, max: 34 }
  },
  'S. aureus ATCC 25923': {
    'Oxacillin': { min: 18, max: 24 },
    'Penicillin': { min: 26, max: 37 },
    'Ciprofloxacin': { min: 22, max: 30 },
    'Vancomycin': { min: 17, max: 21 }
  },
  'P. aeruginosa ATCC 27853': {
    'Ceftazidime': { min: 22, max: 29 },
    'Ciprofloxacin': { min: 25, max: 33 },
    'Gentamicin': { min: 19, max: 26 },
    'Meropenem': { min: 27, max: 33 }
  }
};

// Clinical notes for resistant results
export const clinicalNotes = {
  'MRSA': 'MRSA detected - contact infection control. Consider Vancomycin or Linezolid.',
  'ESBL': 'ESBL suspected - avoid cephalosporins. Consider Carbapenems.',
  'CRE': 'Carbapenem-resistant Enterobacteriaceae - consult ID specialist immediately.',
  'VRE': 'Vancomycin-resistant Enterococci - consider Linezolid or Daptomycin.',
  'default': 'Resistant - consider alternative therapy based on local guidelines.'
};

// Get available organisms
export const getOrganisms = () => Object.keys(breakpoints);

// Get available antibiotics for a specific organism (includes MIC-only combos,
// which are still selectable but interpreted differently — see interpreter.js)
export const getAntibiotics = (organism) => {
  const diskDiffusion = breakpoints[organism] ? Object.keys(breakpoints[organism]) : [];
  const micOnly = micOnlyCombos[organism] || [];
  return [...new Set([...diskDiffusion, ...micOnly])].sort();
};

// Get QC organisms
export const getQCOrganisms = () => Object.keys(qcRanges);
