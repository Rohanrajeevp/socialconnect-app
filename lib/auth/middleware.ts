import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, JWTPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function authenticate(request: NextRequest): JWTPayload | null {
  const token = getAuthToken(request);
  if (!token) {
    return null;
  }
  return verifyAccessToken(token);
}

export function requireAuth(handler: (request: NextRequest, user: JWTPayload) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
    return handler(request, user);
  };
}

export function requireAdmin(handler: (request: NextRequest, user: JWTPayload) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }
    return handler(request, user);
  };
}


