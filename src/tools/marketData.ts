import { getApiDataWithCache } from '../cache/apiCache.js';
import { logger } from '../utils/logger.js';

export const marketDataTool = {
  name: "market_data",
  description: "Retrieves general market data from Tesouro Direto, including opening/closing times and status",
  inputSchema: {
    type: "object",
    properties: {}
  }
};

export async function handleMarketDataTool() {
  try {
    const responseData = await getApiDataWithCache("market data tool");
    const { TrsrBondMkt, BizSts } = responseData;

    // Format the market data for the response
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          market_status: {
            opening_time: TrsrBondMkt.opngDtTm,
            closing_time: TrsrBondMkt.clsgDtTm,
            quotation_time: TrsrBondMkt.qtnDtTm,
            status_code: TrsrBondMkt.stsCd,
            status: TrsrBondMkt.sts
          },
          business_status: {
            code: BizSts.cd,
            timestamp: BizSts.dtTm
          }
        }, null, 2)
      }]
    };
  } catch (error) {
    logger.error('Error in market data tool:', error);
    throw new Error('Failed to retrieve market data');
  }
}
