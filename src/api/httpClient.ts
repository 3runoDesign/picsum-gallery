export interface HttpClient {
  get<T>(path: string, params?: Record<string, any>): Promise<T>;
}
