import GamblingApi, { WalletCategory, ExchangeRequest, ExchangeResponse } from "./GamblingApi.js";

export default class MockGamblingApi extends GamblingApi {
  constructor(gameKey: string) {
    super(gameKey);
  }

  /**
   * Mock: Returns a fixed high balance to allow testing.
   */
  async getWallet(category: WalletCategory, key: string): Promise<number> {
    console.log(`\x1b[33m[MOCK API] getWallet called for ${category}:${key}. Returning 5000.\x1b[0m`);
    return 5000;
  }

  /**
   * Mock: Always returns success.
   */
  async exchangeMoney(request: ExchangeRequest): Promise<ExchangeResponse> {
    console.log(`\x1b[33m[MOCK API] exchangeMoney called.\x1b[0m`);
    console.log(`\x1b[33m   Source:      ${request.source}\x1b[0m`);
    console.log(`\x1b[33m   Destination: ${request.destination}\x1b[0m`);
    console.log(`\x1b[33m   Amount:      ${request.montant}\x1b[0m`);
    
    return {
      message: "Transaction approved (MOCKED)",
      flag: "MOCK_CTF_FLAG_EXAMPLE"
    };
  }
}
