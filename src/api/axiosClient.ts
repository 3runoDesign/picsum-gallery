import axios, { AxiosError, AxiosInstance } from "axios";
import { HttpClient } from "./httpClient";

export class AxiosClient implements HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const maxRetries = 3;
    let lastError: AxiosError | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.client.get<T>(path, { params });
        return response.data;
      } catch (error) {
        lastError = error as AxiosError;

        if (error instanceof AxiosError && error.response?.status === 525) {
          console.warn(
            `Tentativa ${attempt}/${maxRetries} falhou com erro 525. Aguardando...`
          );

          if (attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        break;
      }
    }

    console.error("Erro na requisição após todas as tentativas:", lastError);

    if (lastError?.response?.status === 525) {
      throw new Error(
        "Servidor temporariamente indisponível. Tente novamente em alguns instantes."
      );
    } else if (lastError?.response?.status) {
      throw new Error(
        `Erro ${lastError.response.status}: ${lastError.response.statusText}`
      );
    } else if (lastError?.code === "ECONNABORTED") {
      throw new Error(
        "Tempo limite da requisição excedido. Verifique sua conexão."
      );
    } else {
      throw new Error(
        "Erro na requisição. Verifique sua conexão e tente novamente."
      );
    }
  }
}
