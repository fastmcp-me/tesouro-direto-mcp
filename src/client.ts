import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  ReadResourceResultSchema,
  ListResourcesResultSchema,
  CallToolResultSchema
} from "@modelcontextprotocol/sdk/types.js";

async function main() {
  console.log('Starting client...');

  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"]
  });

  const client = new Client({
    name: "tesouro-direto-client",
    version: "1.0.0",
  }, {
    capabilities: {}
  });

  try {
    console.log('Connecting to server...');
    await client.connect(transport);
    console.log('Connected to server!');

    // List available resources
    console.log('Requesting resources list...');
    const resources = await client.request(
      { method: "resources/list" },
      ListResourcesResultSchema
    );
    console.log('Resources:', resources);

    // Read the market data resource
    console.log('Reading market data resource...');
    const marketResource = await client.request(
      {
        method: "resources/read",
        params: {
          uri: "tesourodireto://market"
        }
      },
      ReadResourceResultSchema
    );
    console.log('Market data:', marketResource);

    // If we have at least one bond resource, read it
    if (resources.resources.length > 1) {
      const bondUri = resources.resources[1].uri;
      console.log(`Reading bond resource: ${bondUri}...`);
      const bondResource = await client.request(
        {
          method: "resources/read",
          params: {
            uri: bondUri
          }
        },
        ReadResourceResultSchema
      );
      console.log('Bond data:', bondResource);
    }

    // Call the market_data tool
    console.log('Calling market_data tool...');
    const marketData = await client.request(
      {
        method: "tools/call",
        params: {
          name: "market_data",
          arguments: {}
        }
      },
      CallToolResultSchema
    );
    console.log('Market data tool result:', marketData);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the transport
    await transport.close();
    console.log('Disconnected from server.');
  }
}

main().catch(console.error);
