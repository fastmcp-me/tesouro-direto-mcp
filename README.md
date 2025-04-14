# Tesouro Direto MCP Server

A Model Context Protocol (MCP) server implementation for interacting with the Tesouro Direto API. This server provides tools and resources for accessing Brazilian treasury bond data through MCP, allowing users to retrieve market data, bond-specific data, and search/filter bonds with natural language queries to LLMs.

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

```bash
# Clone the repository
git clone https://github.com/AtilioA/tesouro-direto-mcp.git
cd tesouro-direto-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Running the Server

```bash
npm start
```

### Using the Test Client

```bash
npm run client
```

### Using with MCP Inspector

You can use the MCP Inspector tool to interact with the server:

```bash
npx @modelcontextprotocol/inspector dist/index.js
```

## Using with Claude.app or other MCP clients

This server can be used with any MCP client that supports the tools and resources interfaces. For example, to use with Claude.app:

1. Start the server
2. Configure Claude.app to connect to your server
3. Ask questions about Tesouro Direto market data or specific bonds

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
├── client.ts       # Example client
├── index.ts        # Entry point
└── server.ts       # MCP server implementation
```

### Available scripts

- `npm run build`: Build the project
- `npm start`: Start the server
- `npm run dev`: Start the server in development mode with auto-reload
- `npm run client`: Run the example client
