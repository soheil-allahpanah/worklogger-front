import { ApiError } from "@/src/entities/errors/app-error";
import { getApiBaseUrl } from "@/lib/env";

type ErrorBody = {
  error: string;
  details?: string[];
};

export class WorkloggerClient {
  private readonly baseUrl: string;

  constructor(baseUrl = getApiBaseUrl()) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      accessToken?: string;
    },
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (options?.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    if (options?.accessToken) {
      headers.Authorization = `Bearer ${options.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    if (!response.ok) {
      if (isJson) {
        const errorBody = (await response.json()) as ErrorBody;
        throw new ApiError(
          errorBody.error ?? "Request failed",
          response.status,
          errorBody.details,
        );
      }
      throw new ApiError(`Request failed (${response.status})`, response.status);
    }

    if (!isJson) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}
