import axios, { AxiosInstance } from 'axios';

const responseTransformer = (data: any) => {
  let parsedData = data;
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {}
  }
  if (parsedData instanceof Object) {
    if (parsedData.message) {
      throw new Error(parsedData.message);
    }

    if (parsedData.status.error_message) {
      throw new Error(parsedData.status.error_message);
    }

    return parsedData.data;
  }
  return data;
};

const baseURL = 'https://data.messari.io/api';
const version = 'v1';

export class CoinMarketAPI {
  private axios: AxiosInstance;
  constructor() {
    this.axios = axios.create({
      baseURL: `${baseURL}/${version}`,
      transformResponse: responseTransformer,
    });
  }

  async getCoinPrice(coin: string) {
    try {
      if (!coin) throw new Error('Missing coin');
      const response = await this.axios.request({
        url: `/assets/${coin}/metrics/market-data`,
      });
      const { market_data } = response.data;
      return Promise.resolve(Number(market_data.price_usd));
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

const market = new CoinMarketAPI();
export default market;

// Rerence:
// - https://messari.io/api/docs
