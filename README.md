# Resumind — AI Resume Analyzer

A working Vite + React + TypeScript SPA. No React Router framework, no SSR, no complex config.
Just `npm install && npm run dev`.

---

## Quick Start

```bash
# 1. Install dependencies (only once)
npm install

# 2. Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Get Your Mistral API Key (free)

1. Go to **https://console.mistral.ai** and sign up / log in
2. Left sidebar → **API Keys** → **Create new key**
3. Copy the key (shown only once)
4. When you open the Upload page in the app, paste it into the key field and click **Save**
5. The key is stored only in your browser's localStorage — never sent anywhere except Mistral

---

## Get a Puter Account (free, no credit card)

1. Go to **https://puter.com** and sign up
2. That's it — the app uses your Puter account for file storage and KV data
3. When you click **Log In** in the app, a Puter popup will appear

---

## How it works

1. **Auth** — Puter.js handles login via popup (free account at puter.com)
2. **Upload** — PDF uploaded to your personal Puter cloud storage
3. **PDF → PNG** — First page converted to image in your browser via pdfjs
4. **AI Analysis** — PNG sent as base64 directly to Mistral API (mistral-small-latest)
5. **Results** — Feedback JSON saved to Puter KV store, displayed on resume detail page

---

## Project Structure

```
resumind/
├── index.html              # Entry HTML, loads Puter.js CDN script
├── src/
│   ├── main.tsx            # React root
│   ├── App.tsx             # Router setup
│   ├── index.css           # All styles (Tailwind v3)
│   ├── lib/
│   │   ├── router.tsx      # Simple hash-based client router
│   │   ├── puter.ts        # Zustand store wrapping Puter.js APIs
│   │   ├── mistral.ts      # Mistral API caller
│   │   ├── pdf2img.ts      # PDF → PNG via pdfjs-dist
│   │   ├── utils.ts        # cn(), formatSize(), generateUUID()
│   │   └── constants.ts    # AI prompt builder
│   ├── components/         # Navbar, FileUploader, ResumeCard, Score*, Summary, ATS, Details, Accordion
│   ├── pages/              # Auth, Home, Upload, ResumePage
│   └── types/index.d.ts    # Global types (Resume, Feedback, FSItem, etc.)
├── public/
│   ├── pdf.worker.min.mjs  # Required pdfjs web worker
│   ├── icons/              # SVG icons (check, warning, back, cross, ats-*)
│   └── images/             # Background SVGs, GIFs, PNG assets
└── package.json
```

---

## Stack

- **React 18** + **TypeScript** + **Vite 6**
- **Tailwind CSS v3** for styling
- **Zustand** for Puter state
- **pdfjs-dist** for in-browser PDF conversion
- **react-dropzone** for file upload UI
- **Puter.js** (CDN) for auth + file storage + KV
- **Mistral API** (mistral-small-latest) for AI resume analysis
