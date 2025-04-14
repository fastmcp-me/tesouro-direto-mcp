import { z } from 'zod';
import { getApiDataWithCache } from '../cache/apiCache.js';
import { logger } from '../utils/logger.js';

// Zod schema for the tool input
const bondDataSchema = z.object({
  code: z.number().int().positive().describe('The numeric code of the bond to retrieve')
});

export const bondDataTool = {
  name: "bond_data",
  description: "Retrieves detailed data for a specific bond from Tesouro Direto",
  inputSchema: {
    type: "object",
    properties: {
      code: {
        type: "number",
        description: "The numeric code of the bond to retrieve"
      }
    },
    required: ["code"]
  }
};

export async function handleBondDataTool(args: unknown) {
  try {
    // Validate the input using zod
    const { code } = bondDataSchema.parse(args);

    const responseData = await getApiDataWithCache(`bond data tool (code: ${code})`);

    // Find the specific bond in the data
    const bondItem = responseData.TrsrBdTradgList.find(item => item.TrsrBd.cd === code);

    if (!bondItem) {
      throw new Error(`Bond with code ${code} not found`);
    }

    const { TrsrBd, TrsrBdType } = bondItem;

    // Format the bond data for the response
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          code: TrsrBd.cd,
          name: TrsrBd.nm,
          features: TrsrBd.featrs,
          maturity_date: TrsrBd.mtrtyDt,
          minimum_investment_amount: TrsrBd.minInvstmtAmt,
          unitary_investment_value: TrsrBd.untrInvstmtVal,
          investment_stability: TrsrBd.invstmtStbl,
          semiannual_interest_indicator: TrsrBd.semiAnulIntrstInd,
          receiving_income: TrsrBd.rcvgIncm,
          annual_investment_rate: TrsrBd.anulInvstmtRate,
          annual_redemption_rate: TrsrBd.anulRedRate,
          minimum_redemption_quantity: TrsrBd.minRedQty,
          unitary_redemption_value: TrsrBd.untrRedVal,
          minimum_redemption_value: TrsrBd.minRedVal,
          isin_code: TrsrBd.isinCd,
          financial_index: {
            code: TrsrBd.FinIndxs.cd,
            name: TrsrBd.FinIndxs.nm
          },
          withdrawal_date: TrsrBd.wdwlDt,
          conversion_date: TrsrBd.convDt,
          business_segment: TrsrBd.BusSegmt ? {
            code: TrsrBd.BusSegmt.cd,
            name: TrsrBd.BusSegmt.nm
          } : null,
          amortization_quota_quantity: TrsrBd.amortQuotQty,
          treasury_bond_type: {
            code: TrsrBdType.cd,
            name: TrsrBdType.nm,
            custody_rate: TrsrBdType.ctdyRate,
            gross_price: TrsrBdType.grPr
          }
        }, null, 2)
      }]
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Invalid input for bond data tool:', error.errors);
      throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(', ')}`);
    }

    logger.error('Error in bond data tool:', error);
    throw new Error('Failed to retrieve bond data');
  }
}
