import fs from 'fs';
import path from 'path';

// Necessary since MCP uses stdio
const LOG_FILE = path.join(process.cwd(), 'mcp-server.log');

export const logger = {
    info: (message: string, ...args: any[]) => {
        const logMessage = `[INFO] ${message} ${args.map(arg => JSON.stringify(arg)).join(' ')}\n`;
        fs.appendFileSync(LOG_FILE, logMessage);
    },
    warn: (message: string, ...args: any[]) => {
        const logMessage = `[WARN] ${message} ${args.map(arg => JSON.stringify(arg)).join(' ')}\n`;
        fs.appendFileSync(LOG_FILE, logMessage);
    },
    error: (message: string, ...args: any[]) => {
        console.error(`[ERROR] ${message}`, ...args);
    }
};
