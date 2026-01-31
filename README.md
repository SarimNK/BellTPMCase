# Bell AI Slide Generator

An enterprise AI-powered slide generation tool that transforms existing content (PDFs, Word documents, spreadsheets, images) into compliant first-draft PowerPoint presentations.

## Features

- **Document Upload**: Support for PDF, Word, Excel, and Image files
- **Template Selection**: Choose from Bell-approved presentation templates
- **AI Slide Generation**: Automatically generates slide titles, bullet points, and content structure
- **Slide Editor**: Edit individual slides with live preview
- **Version History**: Track and compare different versions of your presentation
- **Visual Variations**: Choose from different layout styles per slide
- **PPTX Export**: Export as editable PowerPoint files with Bell Confidential watermark toggle
- **Compliance**: Built-in compliance checks and data handling notices

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Zustand (State Management)
- pptxgenjs (PowerPoint Export)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
cd BellTPMCase
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## Building for Production

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

## Netlify Deployment

### Option 1: Automatic Deployment via Git

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Connect your repository to Netlify
3. Netlify will automatically detect the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Option 2: Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify:
   - Drag and drop the `dist` folder to Netlify's deploy interface, or
   - Use Netlify CLI: `netlify deploy --prod --dir=dist`

### Netlify Configuration

The `netlify.toml` file is already configured with:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect rules for React Router

## Project Structure

```
BellTPMCase/
├── src/
│   ├── pages/           # Page components
│   │   ├── Step1Upload.jsx
│   │   ├── Step2Template.jsx
│   │   ├── Step3Generate.jsx
│   │   ├── Processing.jsx
│   │   ├── DraftDeckEditor.jsx
│   │   ├── SlideEditor.jsx
│   │   ├── VisualVariations.jsx
│   │   └── ExportManagement.jsx
│   ├── utils/           # Utility functions
│   │   └── pptxExporter.js
│   ├── store.js         # Zustand state management
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── netlify.toml
```

## Usage

1. **Upload Content**: Start by uploading your source documents (PDF, Word, Excel, Images)
2. **Select Template**: Choose a Bell-approved presentation template
3. **Generate Draft**: Let the AI create an initial draft of your presentation
4. **Edit Slides**: Refine individual slides, add/remove bullet points, adjust titles
5. **Compare Versions**: Use version history to compare different iterations
6. **Visual Variations**: Choose different layout styles for slides
7. **Export**: Export as editable PPTX with optional Bell Confidential watermark

## Notes

- This is a prototype/demo application
- AI generation is currently mocked but functional
- All data is stored in browser localStorage (Zustand)
- For production, you would need to integrate with actual AI APIs and backend services

## License

Internal Bell Canada project - Not for public distribution

