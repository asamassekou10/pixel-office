import type { IAgent } from '@pixel-office/shared';
import { SERVER_URL } from '../config.js';

/**
 * HTTP client for the Pixel Office REST API.
 * Singleton pattern matching NetworkManager.
 */
export class APIService {
  private static instance: APIService | null = null;
  private baseURL: string;
  private apiKey: string;

  private constructor() {
    this.baseURL = `${SERVER_URL}/api/agents`;
    this.apiKey = localStorage.getItem('pixeloffice_api_key') ?? '';
  }

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  setAPIKey(key: string): void {
    this.apiKey = key;
    localStorage.setItem('pixeloffice_api_key', key);
  }

  getAPIKey(): string {
    return this.apiKey;
  }

  async getAllAgents(): Promise<{ agents: IAgent[]; count: number }> {
    return this.request<{ agents: IAgent[]; count: number }>('/');
  }

  async createAgent(agent: Partial<IAgent>): Promise<IAgent> {
    return this.request<IAgent>('/', {
      method: 'POST',
      body: JSON.stringify(agent),
    });
  }

  async deleteAgent(id: string): Promise<{ deleted: string }> {
    return this.request<{ deleted: string }>(`/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const res = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options?.headers as Record<string, string> },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(body.error || `API error ${res.status}`);
    }

    return res.json() as Promise<T>;
  }
}
