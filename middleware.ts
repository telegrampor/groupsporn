import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  // Age gate: sinaliza para o client component exibir o modal
  const ageConfirmed = request.cookies.get('age_confirmed')
  if (!ageConfirmed) {
    response.headers.set('x-age-gate', 'required')
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
