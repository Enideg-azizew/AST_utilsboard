🤝 Contributing to LabAST Pro

---

Quick Guide

1. Pick an issue or create one
2. Fork & clone the repo
3. Create a branch: git checkout -b feature/your-feature
4. Make changes & test: npm run build
5. Commit: git commit -m "feat: add something"
6. Push & PR - Open a pull request

---

Commit Format

```
type(scope): subject

Types: feat, fix, docs, style, refactor, test, chore
Example: feat(antibiogram): add date filter
```

---

Style Guide

· Use functional components with hooks
· Use TailwindCSS for styling (no inline styles)
· Use PascalCase for components: ASTEntry.jsx
· Use camelCase for utilities: interpretZone.js
· Comment complex logic, not obvious code

---

Testing

```bash
npm run build  # Check for build errors
npm run preview # Test production build
```

Manual test: Chrome, Firefox, Safari, mobile, offline mode

---

Adding Features

New Breakpoints

→ Update src/utils/breakpoints.js

New Charts

→ Add to src/components/ResistanceChart.jsx

New Export Formats

→ Add to src/utils/exportHelpers.js

---

Bug Reports

Include:

· Steps to reproduce
· Browser/OS
· Screenshots (if applicable)
· Console errors

---

Questions?

📧 indexazacc@gmail.com

---

Thank you for contributing! 🙏 
