import { z } from 'zod';
import { getApiDataWithCache } from '../cache/apiCache.js';
import { logger } from '../utils/logger.js';

const VALID_BOND_TYPES = ['ANY', 'SELIC', 'IPCA', 'PREFIXADO'] as const;

// Zod schema for the tool input
const searchBondsSchema = z.object({
  bondType: z.enum(VALID_BOND_TYPES).optional().describe('Filter by bond type (ANY, SELIC, IPCA, or PREFIXADO)'),
  maturityAfter: z.string().optional().describe('Filter bonds maturing after this date (YYYY-MM-DD)'),
  maturityBefore: z.string().optional().describe('Filter bonds maturing before this date (YYYY-MM-DD)')
});

export const searchBondsTool = {
  name: "search_bonds",
  description: "Search for bonds by type (ANY,SELIC, IPCA, PREFIXADO) or maturity date range",
  inputSchema: {
    type: "object",
    properties: {
      bondType: {
        type: "string",
        enum: VALID_BOND_TYPES,
        description: "Filter by bond type (ANY, SELIC, IPCA, or PREFIXADO)"
      },
      maturityAfter: {
        type: "string",
        description: "Filter bonds maturing after this date (YYYY-MM-DD)"
      },
      maturityBefore: {
        type: "string",
        description: "Filter bonds maturing before this date (YYYY-MM-DD)"
      }
    }
  }
};

export async function handleSearchBondsTool(args: unknown) {
  try {
    // Validate the input using zod
    const criteria = searchBondsSchema.parse(args);

    const responseData = await getApiDataWithCache("bond search tool");

    // Apply search filters
    const filteredBonds = responseData.TrsrBdTradgList.filter(item => {
      let match = true;

      // Only apply bond type filter if a valid type is provided
      if (criteria.bondType && criteria.bondType !== 'ANY') {
        match = item.TrsrBd.FinIndxs.nm.includes(criteria.bondType);
      }

      if (criteria.maturityAfter) {
        const maturityDate = new Date(item.TrsrBd.mtrtyDt);
        const afterDate = new Date(criteria.maturityAfter);
        if (maturityDate < afterDate) match = false;
      }

      if (criteria.maturityBefore) {
        const maturityDate = new Date(item.TrsrBd.mtrtyDt);
        const beforeDate = new Date(criteria.maturityBefore);
        if (maturityDate > beforeDate) match = false;
      }

      return match;
    });

    // Format the search results for the response
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          criteria,
          total_results: filteredBonds.length,
          bonds: filteredBonds.map(item => ({
            code: item.TrsrBd.cd,
            name: item.TrsrBd.nm,
            type: item.TrsrBd.FinIndxs.nm,
            maturity_date: item.TrsrBd.mtrtyDt,
            investment_rate: item.TrsrBd.anulInvstmtRate,
            redemption_rate: item.TrsrBd.anulRedRate,
            minimum_investment: item.TrsrBd.minInvstmtAmt
          }))
        }, null, 2)
      }]
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Invalid input for search bonds tool:', error.errors);
      throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(', ')}`);
    }

    logger.error('Error in search bonds tool:', error);
    throw new Error('Failed to search bonds');
  }
}
