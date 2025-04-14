import https from 'https';
import { logger } from '../utils/logger.js';
import { ApiResponse, ResponseData, TrsrBdTradgListItem } from '../types/index.js';

// Define API URL as a constant
const API_URL = 'https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json';

/**
 * Fetches data from the Tesouro Direto API
 */
export async function fetchTesouroDiretoAPI(): Promise<ResponseData> {
  try {
    return new Promise<ResponseData>((resolve, reject) => {
      const req = https.get(API_URL, {
        rejectUnauthorized: false,
      }, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data) as ApiResponse;

            if (parsedData.responseStatus !== 200) {
              throw new Error(`API returned error status: ${parsedData.responseStatusText}`);
            }

            logger.info('Successfully fetched data from Tesouro Direto API');
            resolve(parsedData.response);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  } catch (error) {
    logger.error('Error fetching from Tesouro Direto API:', error);
    throw new Error('Failed to fetch data from Tesouro Direto API');
  }
}

/**
 * Fetches a specific treasury bond by its code
 */
export async function fetchBondByCode(code: number): Promise<TrsrBdTradgListItem | undefined> {
  const data = await fetchTesouroDiretoAPI();
  return data.TrsrBdTradgList.find(item => item.TrsrBd.cd === code);
}

/**
 * Searches bonds by criteria
 */
export async function searchBonds(criteria: {
  bondType?: string;
  maturityAfter?: string;
  maturityBefore?: string;
}): Promise<TrsrBdTradgListItem[]> {
  const data = await fetchTesouroDiretoAPI();

  return data.TrsrBdTradgList.filter(item => {
    let match = true;

    if (criteria.bondType && !item.TrsrBdType.nm.includes(criteria.bondType)) {
      match = false;
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
}
