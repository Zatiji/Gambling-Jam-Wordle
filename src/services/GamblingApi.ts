export type WalletCategory = "utilisateur" | "jeu";

export interface WalletResponse {
  portefeuille: number;
}

export interface ExchangeRequest {
  source: string;
  destination: string;
  montant: number;
}

export interface ExchangeResponse {
  message: string;
  flag?: string;
}

interface ApiErrorResponse {
  title?: string;
  status?: number;
  detail?: string;
}

export default class GamblingApi {
  private readonly baseUrl = "https://api.gamblingjamaeglo.dev";
  private readonly gameKey: string;

  constructor(gameKey: string) {
    if (!gameKey) {
      throw new Error("GamblingApi requires a valid Game Key.");
    }
    this.gameKey = gameKey;
  }

  getGameKey(): string {
    return this.gameKey;
  }

  /**
   * Retrieves the wallet balance of a user or a game. Returns the amount directly.
  **/
  async getWallet(category: WalletCategory, key: string): Promise<number> {
    const response = await fetch(`${this.baseUrl}/portefeuille/${category}/${key}`);
    
    if (!response.ok) {
      await this.handleError(response);
    }

    const data = (await response.json()) as WalletResponse;
    if (typeof data.portefeuille !== "number") {
      throw new Error("Invalid response: 'portefeuille' field missing.");
    }
    
    return data.portefeuille;
  }

  /**
   * Executes a transaction between two entities. The game identified by gameKey must be involved.
  **/
  async exchangeMoney(request: ExchangeRequest): Promise<ExchangeResponse> {
    const response = await fetch(`${this.baseUrl}/echangerArgent/${this.gameKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return (await response.json()) as ExchangeResponse;
  }

  private async handleError(response: Response): Promise<never> {
    let detail = `Request failed with status ${response.status}.`;
    try {
      const body = (await response.json()) as ApiErrorResponse;
      if (body.detail) {
        detail = body.detail;
      }
    } catch {
      // Keep default detail message.
    }

    throw new Error(`Gambling API Error (${response.status}): ${detail}`);
  }
}