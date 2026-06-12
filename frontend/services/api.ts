const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = {
  async fetch(endpoint: string, options?: RequestInit) {
    return fetch(`${API_URL}${endpoint}`, {
      credentials: "include",
      ...options,
    });
  },

  async get<T>(endpoint: string): Promise<T> {
    const res = await this.fetch(endpoint);

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    return res.json();
  },

  async post<T>(
    endpoint: string,
    body: unknown
  ): Promise<T> {
    const res = await this.fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    return res.json();
  },
};