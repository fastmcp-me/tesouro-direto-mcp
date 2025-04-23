// Simple client to interact with the MCP server using the Model Context Protocol (MCP) via stdio

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  ReadResourceResultSchema,
  ListResourcesResultSchema,
  CallToolResultSchema,
  ListToolsResultSchema
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

    // List available tools
    console.log('Requesting tools list...');
    const tools = await client.request(
      { method: "tools/list" },
      ListToolsResultSchema
    );
    console.log('Available tools:', tools);

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

    // Call the search_bonds tool to find IPCA bonds with maturity in 2029
    console.log('Searching for IPCA+ 2029 bonds...');
    try {
      const searchResultsIPCA = await client.request(
        {
          method: "tools/call",
          params: {
            name: "search_bonds",
            arguments: {
              bondType: "IPCA",
              maturityAfter: "2029-01-01",
              maturityBefore: "2029-12-31"
            }
          }
        },
        CallToolResultSchema
      );

      // Check if result has isError flag
      if (searchResultsIPCA.isError) {
        console.error('Error in search_bonds tool response:', searchResultsIPCA.content);
      } else {
        console.log('IPCA+ 2029 bonds search result:', searchResultsIPCA);

        // Parse the JSON string from the text content to extract return rates
        if (searchResultsIPCA.content && searchResultsIPCA.content.length > 0) {
          const resultContent = JSON.parse(searchResultsIPCA.content[0].text as string);

          console.log(`Found ${resultContent.total_results} bonds matching the criteria`);

          // Show return rates for each bond
          if (resultContent.bonds && resultContent.bonds.length > 0) {
            resultContent.bonds.forEach((bond: {
              name: string;
              investment_rate: string;
              redemption_rate: string;
            }) => {
              console.log(`Bond: ${bond.name}, Investment Rate: ${bond.investment_rate}, Redemption Rate: ${bond.redemption_rate}`);
            });
          }
        }
      }
    } catch (toolError) {
      console.error('Failed to execute search_bonds tool:', toolError);
    }

    // Call the search_bonds tool to find all SELIC bonds
    console.log('Searching for all SELIC bonds...');
    try {
      const searchResultsSELIC = await client.request(
        {
          method: "tools/call",
          params: {
            name: "search_bonds",
            arguments: {
              bondType: "SELIC"
            }
          }
        },
        CallToolResultSchema
      );

      // Check if result has isError flag
      if (searchResultsSELIC.isError) {
        console.error('Error in search_bonds tool response:', searchResultsSELIC.content);
      } else {
        console.log('SELIC bonds search result:', searchResultsSELIC);

        // Parse the JSON string from the text content to extract return rates
        if (searchResultsSELIC.content && searchResultsSELIC.content.length > 0) {
          const resultContent = JSON.parse(searchResultsSELIC.content[0].text as string);

          console.log(`Found ${resultContent.total_results} SELIC bonds`);

          // Show return rates for each bond
          if (resultContent.bonds && resultContent.bonds.length > 0) {
            resultContent.bonds.forEach((bond: {
              name: string;
              investment_rate: string;
              redemption_rate: string;
            }) => {
              console.log(`Bond: ${bond.name}, Investment Rate: ${bond.investment_rate}, Redemption Rate: ${bond.redemption_rate}`);
            });
          }
        }
      }
    } catch (toolError) {
      console.error('Failed to execute search_bonds tool:', toolError);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the transport
    await transport.close();
    console.log('Disconnected from server.');
  }
}

main().catch(console.error);
