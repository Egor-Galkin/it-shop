import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {

  // ВРЕМЕННО ОТКЛЮЧЕНО — auth проверяется в клиентских компонентах
  // Если нет токена и пользователь пытается зайти на защищённые страницы - возврат на авторизацию
  /*
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token && request.nextUrl.pathname.startsWith('/profile')) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  */
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/profile'],
};