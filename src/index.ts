#!/usr/bin/env node

import { startServer } from './server.js';
import { logger } from './utils/logger.js';

// Start the MCP server
startServer().catch(error => {
    logger.error('Failed to start MCP server:', error);
    process.exit(1);
});
