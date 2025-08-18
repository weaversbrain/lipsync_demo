# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a proof-of-concept for lip-sync animation using Rive animations with Text-to-Speech (TTS) services. The project demonstrates real-time viseme-driven facial animations synchronized with speech from Azure Cognitive Services and ElevenLabs.

## Architecture

The project consists of two main components:

### Frontend (`/frontend/`)
- React + TypeScript + Vite application
- Uses `@rive-app/react-canvas` for Rive animation rendering
- Integrates with Azure Speech SDK and ElevenLabs for TTS
- Features real-time viseme mapping for lip-sync animation
- Located in `src/App.tsx` - main application component
- NLP utilities in `src/nlp/` for phoneme-to-viseme conversion

### Notebook (`/notebook/`)
- Python-based research and development environment
- Contains experiments for viseme conversion algorithms
- Uses `pronouncing` library for phoneme extraction
- ElevenLabs integration for timestamp alignment

## Key Components

### Viseme System
- **Phoneme-to-Viseme Mapping**: `src/nlp/constants.ts` contains mapping tables for converting phonemes to custom viseme IDs
- **Azure Integration**: Real-time viseme events from Azure Speech SDK
- **ElevenLabs Integration**: Character-level timestamp alignment for phoneme-based viseme generation

### Animation Control
The Rive animation (`/public/viseme_animation/demo_v10.riv`) supports multiple state machines:
- `mouth-movement`: Viseme-driven lip animation (0-11 viseme IDs)
- `eye-movement`: Blinking and expression control
- `head-movement`: Head nodding animations
- `bounce`: Additional character animations

## Development Commands

### Frontend Development
```bash
cd frontend
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run lint        # Run ESLint
npm run preview     # Preview production build
```

### Notebook Environment
```bash
cd notebook
uv sync            # Install Python dependencies
jupyter lab        # Start Jupyter Lab
```

## Environment Configuration

The frontend requires environment variables in `frontend/.env`:
- `VITE_AZURE_KEY`: Azure Speech Services API key
- `VITE_ELEVENLABS_KEY`: ElevenLabs API key
- `VITE_AITUTOR_ENGINE_URL`: Backend service URL for viseme processing

## Key Development Patterns

### Viseme Processing
- Azure provides real-time viseme events via `speechSynthesizer.visemeReceived`
- ElevenLabs requires post-processing character timestamps through phoneme mapping
- Custom viseme IDs (0-11) map to specific mouth shapes in the Rive animation

### State Management
- Animation inputs are managed via `useStateMachineInput` hooks
- Timing is critical - viseme changes are scheduled using `setTimeout`
- Multiple animation layers (mouth, eyes, head) operate independently

### TTS Integration
Both Azure and ElevenLabs follow similar patterns:
1. Convert text to speech with timing data
2. Generate viseme sequence from timing information
3. Schedule viseme changes synchronized with audio playback
4. Reset animation state when audio completes

## Testing and Quality

Run linting before committing changes:
```bash
cd frontend && npm run lint
```

The TypeScript configuration includes strict type checking across multiple config files (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`).