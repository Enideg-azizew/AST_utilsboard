 LabAST Pro

Offline-first Antimicrobial Susceptibility Testing (AST) Dashboard for Medical Labs

https://img.shields.io/badge/React-18.2-61DAFB
https://img.shields.io/badge/PWA-Enabled-5A0FC8
https://img.shields.io/badge/License-MIT-blue.svg

---

✨ Features

· AST Entry - Enter patient data, organism, antibiotic & zone diameter with auto S/I/R interpretation
· Antibiogram - Visual susceptibility patterns with color-coded percentages
· History - Searchable, filterable results with CSV export
· QC Module - Validate results against ATCC strain reference ranges
· Charts - Resistance trends, organism comparisons, and distribution
· Offline-First PWA - Works without internet, installable on devices

---

🚀 Quick Start

```bash
git clone https://github.com/Enideg-azizew/labast-pro.git
cd labast-pro
npm install
npm run dev
```

Open http://localhost:3000

Build for Production

```bash
npm run build
npm run preview
```

---

🛠️ Tech Stack

· React 18 + TailwindCSS + Zustand
· Dexie.js (IndexedDB) - All data stored locally
· Chart.js - Data visualization
· jsPDF - PDF reports
· Vite + PWA - Build & offline support

---

📁 Project Structure

```
src/
├── components/     # UI components (ASTEntry, Antibiogram, QCModule, etc.)
├── hooks/         # useIndexedDB - Database operations
├── store/         # Zustand state management
├── utils/         # Breakpoints, interpreter, export helpers
├── App.jsx        # Main app
└── main.jsx       # Entry point
```

---

🔧 Adding New Breakpoints

Edit src/utils/breakpoints.js:

```javascript
export const breakpoints = {
  'Your Organism': {
    'Antibiotic': { S: 20, R: 15 }  // >=20 S, <=15 R
  }
};
```

🤝 Contributing

1. Fork the repo
2. Create a branch (git checkout -b feature/amazing)
3. Commit changes (git commit -m 'Add amazing feature')
4. Push (git push origin feature/amazing)
5. Open a Pull Request

---

📄 License

MIT © Enideg Azizew

---

📞 Contact

Enideg Azizew
https://img.shields.io/badge/GitHub-Enideg--azizew-181717?logo=github
https://img.shields.io/badge/LinkedIn-enidegazizew-0A66C2?logo=linkedin
📧 indexazacc@gmail.com

---

⭐ Star this repo if you find it useful!
