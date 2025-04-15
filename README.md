# Tesouro Direto MCP Server

A Model Context Protocol (MCP) server implementation for interacting with the Tesouro Direto API.

This server provides tools and resources for accessing Brazilian treasury bond data through MCP, allowing users to retrieve market data, bond-specific data, and search/filter bonds with natural language queries via LLMs.

## Features

- **MCP tools:**
  - `market_data`: Retrieve general market data (opening/closing times, status)
  - `bond_data`: Get detailed information about a specific bond
  - `search_bonds`: Search/filter bonds by various criteria

- **MCP resources:**
  - `tesourodireto://market`: Market data resource
  - `tesourodireto://bond/{code}`: Individual bond resources

- **Smart caching:**
  - Implements a 10-minute caching strategy based on API update timestamps
  - Reduces API calls while ensuring data freshness

## Installation

...

## Usage

Install from npm:

```bash
...
```

This server can be used with any MCP client that supports the tools and resources interfaces.

### Environment Variables

The server behavior can be customized through the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `USE_MCP_CACHE` | Enable the in-memory cache for API responses | `true` |

These variables can be set either in your environment or in the MCP client configuration.

## Development

### Project structure

```
src/
├── api/            # API client for Tesouro Direto
├── cache/          # Caching implementation (in-memory; TD API only updates every 15 minutes)
├── resources/      # MCP resources implementation
├── tools/          # MCP tools implementation
├── types/          # Type definitions
├── utils/          # Utility functions
├── index.ts        # Entry point
└── server.ts       # MCP server implementation
```

### Available scripts

- `npm run build`: Build the project
- `npm start`: Start the server
- `npm run dev`: Start the server in development mode with auto-reload

### Running the server

```bash
# Clone the repository
git clone https://github.com/AtilioA/tesouro-direto-mcp.git
cd tesouro-direto-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### Using with MCP Inspector

You can use the MCP Inspector tool to interact with the server:

```bash
npx @modelcontextprotocol/inspector dist/index.js
```

### Adding to Cursor mcp.json

To use the locally built MCP server with Cursor, add the following server to your `~/.cursor/mcp.json` file:

```json
"tesouro-direto": {
    "command": "node",
    "args": [
        "<path_to_repo>/dist/index.js"
    ],
    "env": {
        "USE_MCP_CACHE": "true"
    }
}
```

Replace `<path_to_repo>` with the absolute path to your cloned repository.
