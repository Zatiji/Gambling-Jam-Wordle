import GamblingApi, { ExchangeRequest, ExchangeResponse } from "./GamblingApi.js";

export default class TransactionMockGamblingApi extends GamblingApi {
  /**
   * Mock: Always returns success for transactions while keeping real wallet reads.
   */
  async exchangeMoney(request: ExchangeRequest): Promise<ExchangeResponse> {
    console.log("[MOCK API] exchangeMoney called.");
    console.log(`   Source:      ${request.source}`);
    console.log(`   Destination: ${request.destination}`);
    console.log(`   Amount:      ${request.montant}`);

    return {
      message: "Transaction approved (MOCKED)",
      flag: "MOCK_CTF_FLAG_EXAMPLE",
    };
  }
}
