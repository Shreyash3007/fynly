/**
 * Supabase Middleware Client
 * Handles auth token refresh and session management
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database.types'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/auth/callback',
    '/verify-email',
    '/onboarding',
    '/advisors',
    '/about',
    '/contact',
    '/pricing',
    '/terms',
    '/privacy'
  ]
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(route + '/')
  )

  // API routes and static files
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/static')
  ) {
    return response
  }

  // Redirect to login if accessing protected route without auth
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (user && (path === '/login' || path === '/signup')) {
    // Get user profile to check if they need onboarding
    const { data: profile } = await supabase
      .from('users')
      .select('role, email_verified')
      .eq('id', user.id)
      .single()

    // If no profile or no role, send to onboarding
    if (!profile || !(profile as any).role) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // If email not verified, send to verification
    if (!(profile as any).email_verified) {
      return NextResponse.redirect(new URL(`/verify-email?email=${encodeURIComponent(user.email || '')}`, request.url))
    }

    const role = (profile as any).role as 'investor' | 'advisor' | 'admin'
    const dashboardUrl =
      role === 'admin'
        ? '/admin/dashboard'
        : role === 'advisor'
        ? '/advisor/dashboard'
        : '/investor/dashboard'

    return NextResponse.redirect(new URL(dashboardUrl, request.url))
  }

  // Role-based route protection
  if (user && !isPublicRoute) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = (profile as any)?.role as string

    // Protect admin routes
    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Protect advisor routes
    if (path.startsWith('/advisor') && role !== 'advisor') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Protect investor routes
    if (path.startsWith('/investor') && role !== 'investor') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return response
}
