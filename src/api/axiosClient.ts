import axios, { AxiosInstance } from "axios";
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
    console.log(`Fazendo requisição GET para: ${path}`, params);
    try {
      const response = await this.client.get<T>(path, { params });
      console.log("Resposta recebida:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erro na requisição:", error);
      throw error;
    }
  }
}
