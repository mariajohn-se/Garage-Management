const API_PREFIX = '/api/v1';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
  }
}

function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_PREFIX}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', 'Unable to contact the server. Please try again.', 0);
  }

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = data?.error ?? { code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred.' };
    throw new ApiError(err.code, err.message, response.status);
  }

  return data as T;
}

/** For endpoints that return a raw file body (e.g. CSV export) rather than JSON. */
export async function apiRequestText(path: string): Promise<string> {
  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_PREFIX}${path}`, { headers });
  } catch {
    throw new ApiError('NETWORK_ERROR', 'Unable to contact the server. Please try again.', 0);
  }
  if (!response.ok) {
    throw new ApiError('EXPORT_FAILED', 'Export failed. Please try again.', response.status);
  }
  return response.text();
}
