# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite, http://localhost:5173)
npm run build     # Type-check + production build (tsc -b && vite build)
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

There are no tests configured in this project.

## Architecture

This is a single-page React 19 + TypeScript + Vite application — a chat interface for interacting with backend AI/Graph API agents.

### Data Flow

1. **`src/context/ChatContext.tsx`** is the central state hub. It holds all chats, the selected chat, and user info. All message sending logic lives here (`sendMessage`, `formatApiResult`, `getDisplayMessage`).
2. **`src/services/api.ts`** makes a single `POST /api/chat` call via Axios (30s timeout). The base URL defaults to `http://127.0.0.1:8000`; the production URL is commented out in that file.
3. **`src/components/Sidebar/Sidebar.tsx`** lets users create new chats (type `'ai'` or `'graph'`) and switch between them.
4. **`src/components/ChatArea/ChatArea.tsx`** renders the message thread and input box for the active chat.

### Chat Types

There are two chat types (`ChatType = 'ai' | 'graph'`), reflected in the sidebar sections ("AI Services" and "Graph APIs"). The type determines which `api_base` value is sent to the backend (`azurenlp` or `msgraph`).

### API Request/Response Shape

**Request** (`POST /api/chat`):
```ts
{ session_id, message, jwt_token, api_base }
```

**Response**:
```ts
{
  assistant_summary: string;
  assistant_dev_info: string;
  api_response: {
    status_code: number | null;
    response_body: ApiCallResult[];
  };
}
```

The context's `getDisplayMessage` decides whether to show `assistant_summary` or the formatted `api_response.response_body` based on `status_code`.

### Key Types

All shared types are in `src/types/index.ts`: `Message`, `Chat`, `ChatType`, `ChatApiRequest`, `ChatApiResponse`, `ApiCallResult`.

### State Persistence

Chat history is in-memory only (React state via Context). There is no localStorage or backend persistence — all chats are lost on page refresh.

### UI Placeholders

The emoji, attachment, and forward-icon buttons in `ChatArea` are UI-only — they have no functionality wired up.
