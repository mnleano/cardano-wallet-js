import axios, { AxiosInstance } from 'axios';

const responseTransformer = (data: any) => {
  let parsedData = data;
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {}
  }
  if (parsedData instanceof Object) {
    if (parsedData.Left) {
      throw new Error(parsedData.Left);
    }

    return parsedData.Right;
  }
  return data;
};

export class CardanoExplorerAPI {
  private endpoint: string;
  private axios: AxiosInstance;
  constructor(opts?: { endpoint?: string }) {
    const { endpoint = 'https://explorer.cardano.org/api' } = opts || {};
    this.endpoint = endpoint;

    this.axios = axios.create({
      baseURL: this.endpoint,
      transformResponse: responseTransformer,
    });
  }

  async addressesSummary(address: string) {
    try {
      if (!address) throw new Error('Missing address');
      const response = await this.axios.request({
        url: `/addresses/summary/${address}`,
      });
      return Promise.resolve(response.data);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

export default new CardanoExplorerAPI();

// Rerence:
// - https://input-output-hk.github.io/cardano-rest/explorer-api/#operation/_txsSummary
// - https://www.npmjs.com/package/cardano-explorer-api
