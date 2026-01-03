const BASE_URL = "https://api.gamblingjamaeglo.dev";

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
  getGameKey(): string {
    const gameKey = process.env.GAME_API_KEY;
    if (!gameKey) {
      throw new Error("GAME_API_KEY is missing from environment.");
    }

    return gameKey;
  }

  async getWallet(category: WalletCategory, key: string): Promise<WalletResponse> {
    const response = await fetch(`${BASE_URL}/portefeuille/${category}/${key}`);
    if (!response.ok) {
      await this.throwApiError(response);
    }

    return (await response.json()) as WalletResponse;
  }

  async exchangeMoney(gameKey: string, request: ExchangeRequest): Promise<ExchangeResponse> {
    const response = await fetch(`${BASE_URL}/echangerArgent/${gameKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      await this.throwApiError(response);
    }

    return (await response.json()) as ExchangeResponse;
  }

  private async throwApiError(response: Response): Promise<never> {
    let detail = `Request failed with status ${response.status}.`;
    try {
      const body = (await response.json()) as ApiErrorResponse;
      if (body.detail) {
        detail = body.detail;
      }
    } catch {
      // Keep default detail message.
    }

    throw new Error(detail);
  }
}
