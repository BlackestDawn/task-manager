import type { BunRequest } from "bun";

export interface CookieOptions {
  HttpOnly?: boolean;
  Secure?: boolean;
  SameSite?: 'Strict' | 'Lax' | 'None';
  "Max-Age"?: number;
  Path?: string;
  expires?: Date;
}

export function isWebClient(req: BunRequest) {
  const clientType = req.headers.get('X-Client-Type');
  const userAgent = req.headers.get('User-Agent') || '';

  if (clientType) return clientType.toLowerCase() === "web";

  const isBrowser = /Mozilla|Chrome|Safari|Firefox|Opera|Edg/i.test(userAgent) &&
    !/Mobile App|Desktop App/i.test(userAgent);

  return isBrowser;
}

export function setCookie(response: Response, name: string, value: string, options: CookieOptions = {}) {
  const defaults = {
    httpOnly: true,
    secure: process.env.PLATFORM === 'prod',
    sameSite: 'Lax',
    path: '/',
  };

  const cookieOptions = { ...defaults, ...options };
  const cookieString = `${name}=${encodeURIComponent(value)};
    ${Object.entries(cookieOptions).map(([key, value]) => value && `${key}=${value}`).join('; ')}`;

  response.headers.set('Set-Cookie', cookieString);
}

export function getCookie(request: BunRequest, name: string) {
  const cookieString = request.headers.get('Cookie');
  if (!cookieString) return null;

  const cookies = cookieString.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    if (!key || !value) return acc;
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies[name] || null;
}

export function clearCookie(response: Response, name: string, options: Partial<CookieOptions> = {}) {
  setCookie(response, name, '', {
    ...options,
    'Max-Age': 0,
    expires: new Date(0),
  });
}
