# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server on port 3012
npm run build      # Production build
npm test -- --env=jsdom                          # Run all tests
npm test -- --env=jsdom --testPathPattern=path/to/file  # Run a single test file
npm run lint       # TypeScript check + ESLint (no warnings allowed)
npm run lint:fix   # ESLint auto-fix
```

## Architecture

**"The Book"** is a Quran reading and search web app. Core features: verse browsing by chapter, full-text search with regex, verse-to-video timeline binding, tafsir (commentary) display, AI chat via Google Gemini, and Firebase-backed user authentication.

### Key directories

- `src/components/` — Feature-level React components (sura-list, video-text-binding, auth, playground, ai-prompt-test, word-game)
- `src/data/` — React Query custom hooks for all external data (`useVerses`, `useChapters`, `useSearch`, `useTafsirs`, `useTranslations`, `useRemoteConfig`)
- `src/router/` — React Router v6 config and protected route wrapper
- `src/auth/` — Firebase auth context (`UserAuthProvider`, `UserAuthContext`)
- `src/context/` — Additional React Context providers (translation visibility)
- `src/utils/` — Firebase init, Firestore CRUD helpers, search logic (`search-utils.ts`)
- `src/types/` — Shared TypeScript types

### Data flow

- **Quran text**: fetched from the quran.com API via axios, cached by React Query
- **User data / projects**: stored in Firebase Firestore, read/written via hooks in `src/data/`
- **Auth state**: Firebase Authentication (email+password and Google OAuth), surfaced via `UserAuthContext`
- **Feature flags**: Firebase Remote Config (e.g., `verse-bind-save-enabled-users`)
- **AI**: Google Generative AI (Gemini) SDK, used in the AI prompt playground component

### State management

- **Server state**: React Query (caching, refetch, loading/error states)
- **Global client state**: React Context — `UserAuthContext` (auth), `TranslationVisibilityContext`
- **Local UI state**: component-level `useState`
- **Persistence**: Firestore for user projects; React Query's built-in cache for API responses

### Search

Advanced search in `src/utils/search-utils.ts` supports regex, full-word matching, case sensitivity, and verse-key patterns (`1:1`, `2:5-10`).

### Video binding

`VideoTextBinding` component manages a per-chapter timeline that maps verse keys to YouTube video timestamps. Projects are persisted to Firestore.

### Tech stack

| Layer | Library |
|---|---|
| UI | React 18, Ant Design 5, styled-components |
| Routing | React Router DOM 6 |
| Data fetching | React Query 3, axios |
| Backend | Firebase (Auth, Firestore, Remote Config, Analytics) |
| AI | Google Generative AI (Gemini) |
| Tables | AG Grid |
| Video | react-youtube |

### Environment

Firebase credentials and the Gemini API key are loaded from `.env` at build time. Copy `.env.example` (if present) or supply the variables directly — the app will not start without them.
