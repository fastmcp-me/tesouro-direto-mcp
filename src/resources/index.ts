import { getApiDataWithCache } from "../cache/apiCache.js";
import { logger } from "../utils/logger.js";

// Define resource URI patterns
const MARKET_RESOURCE_URI = "tesourodireto://market";
const BOND_RESOURCE_URI_PREFIX = "tesourodireto://bond/";

/**
 * List available resources
 */
export async function getResourcesList() {
  try {
    const data = await getApiDataWithCache("resource listing");

    // Create the base resources list
    const resources = [
      {
        uri: MARKET_RESOURCE_URI,
        name: "Tesouro Direto Market Data"
      }
    ];

    // Add bond resources
    data.TrsrBdTradgList.forEach(bond => {
      resources.push({
        uri: `${BOND_RESOURCE_URI_PREFIX}${bond.TrsrBd.cd}`,
        name: `${bond.TrsrBd.nm} (${bond.TrsrBd.isinCd})`
      });
    });

    logger.info(`Listed ${resources.length} resources`);
    return { resources };
  } catch (error) {
    logger.error("Error listing resources:", error);
    throw new Error("Failed to list resources");
  }
}

/**
 * Get content for a specific resource
 */
export async function getResourceContent(uri: string) {
  try {
    if (uri === MARKET_RESOURCE_URI) {
      return await getMarketResourceContent();
    }

    if (uri.startsWith(BOND_RESOURCE_URI_PREFIX)) {
      const bondCode = parseInt(uri.substring(BOND_RESOURCE_URI_PREFIX.length), 10);
      return await getBondResourceContent(bondCode);
    }

    throw new Error(`Resource not found: ${uri}`);
  } catch (error) {
    logger.error(`Error reading resource ${uri}:`, error);
    throw new Error(`Failed to read resource: ${uri}`);
  }
}

/**
 * Get market resource content
 */
async function getMarketResourceContent() {
  const data = await getApiDataWithCache("market resource");
  const { TrsrBondMkt, BizSts } = data;

  return {
    contents: [{
      uri: MARKET_RESOURCE_URI,
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
}

/**
 * Get bond resource content
 */
async function getBondResourceContent(bondCode: number) {
  const data = await getApiDataWithCache(`bond ${bondCode}`);
  const bondItem = data.TrsrBdTradgList.find(item => item.TrsrBd.cd === bondCode);

  if (!bondItem) {
    throw new Error(`Bond with code ${bondCode} not found`);
  }

  const { TrsrBd, TrsrBdType } = bondItem;

  return {
    contents: [{
      uri: `${BOND_RESOURCE_URI_PREFIX}${bondCode}`,
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
        treasury_bond_type: {
          code: TrsrBdType.cd,
          name: TrsrBdType.nm,
          custody_rate: TrsrBdType.ctdyRate,
          gross_price: TrsrBdType.grPr
        }
      }, null, 2)
    }]
  };
}
