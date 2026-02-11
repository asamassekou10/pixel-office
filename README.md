# Pixel Office

A real-time visualization platform that renders AI agents as pixel-art characters working in a virtual office. Built with Three.js and Socket.io, it provides both a visual dashboard and a REST API for integrating external AI agents.

## Overview

Pixel Office displays AI agents as animated chibi sprites in a top-down pixel-art office environment. Each agent has a position, state, job type, skills, metrics, and task progress -- all rendered in real time with a cyberpunk aesthetic.

The platform is designed for teams building multi-agent AI systems who want a visual representation of what their agents are doing. Connect your agents through the REST API and watch them appear in the office.

## Architecture

The project is a monorepo with three packages:

```
packages/
  shared/    Shared TypeScript types and Socket.io event definitions
  server/    Express + Socket.io server with REST API
  client/    Three.js visualization (Vite + TypeScript)
```

- **Server** broadcasts agent state to all connected clients via Socket.io at 100ms intervals.
- **Client** renders the office scene using an orthographic camera with canvas-generated pixel-art textures.
- **Shared** defines the `IAgent` interface and event contracts used by both.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/asamassekou10/pixel-office.git
cd pixel-office
npm install
```

### Development

Start all three packages concurrently:

```bash
npm run dev
```

This launches:
- Server on `http://localhost:3001`
- Client on `http://localhost:5173`

Without an API key configured, the server runs in dev mode with simulated mock agents. If the server is unreachable, the client falls back to its own demo simulation.

### Production Build

```bash
npm run build
```

## REST API

The server exposes a REST API for managing agents externally.

**Base URL:** `http://localhost:3001/api/agents`

### Authentication

Set the `PIXEL_OFFICE_API_KEY` environment variable to require Bearer token authentication. When unset, the API is open (dev mode).

```bash
PIXEL_OFFICE_API_KEY=your-secret-key npm run dev
```

All authenticated requests must include the header:

```
Authorization: Bearer your-secret-key
```

### Endpoints

#### List all agents

```
GET /api/agents
```

Returns `{ agents: IAgent[], count: number }`.

#### Get a single agent

```
GET /api/agents/:id
```

Returns the agent object or `404`.

#### Create or update an agent

```
POST /api/agents
Content-Type: application/json
```

**Request body:**

| Field         | Type     | Required | Description                              |
|---------------|----------|----------|------------------------------------------|
| `id`          | string   | Yes      | Unique agent identifier                  |
| `x`           | number   | No       | X position (0-800), defaults to 0        |
| `y`           | number   | No       | Y position (0-600), defaults to 0        |
| `state`       | string   | No       | IDLE, WORKING, MOVING, or ERROR          |
| `jobType`     | string   | No       | Agent role (e.g., "python-dev")          |
| `skills`      | string[] | No       | List of skills                           |
| `currentTask` | object   | No       | Task with id, name, type, progress (0-100), startedAt |
| `metrics`     | object   | No       | Performance metrics (tasksCompleted, successRate, etc.) |
| `connections` | string[] | No       | IDs of collaborating agents              |

If an agent with the given `id` already exists, it is updated. Otherwise, a new agent is created.

#### Delete an agent

```
DELETE /api/agents/:id
```

Returns `{ deleted: id }` or `404`.

### Integration Examples

**Python**

```python
import requests

SERVER_URL = "http://localhost:3001"
API_KEY = "your-secret-key"

requests.post(
    f"{SERVER_URL}/api/agents",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "id": "agent-001",
        "x": 400,
        "y": 300,
        "state": "WORKING",
        "jobType": "python-dev",
        "skills": ["python", "fastapi"],
        "currentTask": {
            "id": "task-1",
            "name": "Reviewing PR #42",
            "type": "code-review",
            "progress": 65,
            "startedAt": 1700000000000
        }
    }
)
```

**Node.js**

```javascript
await fetch("http://localhost:3001/api/agents", {
  method: "POST",
  headers: {
    "Authorization": "Bearer your-secret-key",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    id: "agent-001",
    x: 400,
    y: 300,
    state: "WORKING",
    jobType: "node-dev",
    skills: ["typescript", "react"]
  })
});
```

**curl**

```bash
curl -X POST http://localhost:3001/api/agents \
  -H "Authorization: Bearer your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"id": "agent-001", "x": 400, "y": 300, "state": "WORKING"}'
```

## Control Panel

The client includes a built-in control panel accessible via the gear button in the top-left corner of the HUD. It provides three tabs:

- **Dashboard** -- Real-time agent counts, state breakdown, and job type distribution.
- **Manage** -- Create, edit, and delete agents through a form interface without writing code.
- **Integrate** -- Copy-paste code snippets for Python, Node.js, and curl.

## Environment Variables

| Variable               | Default         | Description                              |
|------------------------|-----------------|------------------------------------------|
| `PORT`                 | `3001`          | Server port                              |
| `CORS_ORIGIN`          | `*`             | Allowed CORS origins                     |
| `PIXEL_OFFICE_API_KEY` | (empty)         | API key for authentication; empty = open |

## Tech Stack

- **Client:** Three.js, Vite, TypeScript, Socket.io Client, EventEmitter3
- **Server:** Express, Socket.io, TypeScript, tsx
- **Shared:** TypeScript with project references

## License

MIT
