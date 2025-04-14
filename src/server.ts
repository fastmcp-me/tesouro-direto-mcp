import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { marketDataTool, handleMarketDataTool } from "./tools/marketData.js";
import { bondDataTool, handleBondDataTool } from "./tools/bondData.js";
import { searchBondsTool, handleSearchBondsTool } from "./tools/searchBonds.js";
import { getResourcesList, getResourceContent } from "./resources/index.js";
import { logger } from "./utils/logger.js";

export async function startServer() {
  // Initialize MCP server
  const server = new Server({
    name: "tesouro-direto-mcp",
    version: "1.0.0"
  }, {
    capabilities: {
      tools: {},
      resources: {}
    }
  });

  // Register resources handlers
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return await getResourcesList();
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    return await getResourceContent(request.params.uri);
  });

  // Register tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        marketDataTool,
        bondDataTool,
        searchBondsTool
      ]
    };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "market_data":
          return await handleMarketDataTool();
        case "bond_data":
          return await handleBondDataTool(args);
        case "search_bonds":
          return await handleSearchBondsTool(args);
        default:
          throw new Error(`Tool not found: ${name}`);
      }
    } catch (error) {
      logger.error(`Error executing tool ${name}:`, error);
      throw error;
    }
  });

  // Connect using stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info("Tesouro Direto MCP server started successfully");

  return server;
}
