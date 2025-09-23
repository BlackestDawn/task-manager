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
  let cookieString = `${name}=${encodeURIComponent(value)}`;
  Object.entries(cookieOptions).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (typeof value === "boolean" && value) {
      cookieString += `; ${key}`;
    } else if (typeof value !== "boolean") {
      cookieString += `; ${key}=${value}`;
    }
  });

  const existingCookies = response.headers.get('Set-Cookie');
  if (existingCookies) {
    response.headers.set('Set-Cookie', `${existingCookies}, ${cookieString}`);
  } else {
    response.headers.set('Set-Cookie', cookieString);
  }
}

export function getCookie(request: BunRequest, name: string) {
  const cookieString = request.headers.get('Cookie');
  if (!cookieString) return null;

  const cookies = cookieString.split(";").reduce((acc, cookie) => {
    const [key, ...valueParts] = cookie.trim().split("=");
    if (!key || valueParts.length === 0) return acc;

    const value = valueParts.join("=");
    acc[key] = decodeURIComponent(value);
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
