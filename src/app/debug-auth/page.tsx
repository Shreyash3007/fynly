/**
 * Debug Authentication Page
 * Test database connection and authentication flow
 */

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { signUp, signIn, signInWithGoogle } from '@/lib/auth/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function DebugAuthPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('TestPassword123!')
  const [name, setName] = useState('Test User')
  const [loading, setLoading] = useState(false)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const testDatabaseConnection = async () => {
    setLoading(true)
    addLog('Testing database connection...')
    
    try {
      const supabase = createClient()
      
      // Test basic connection
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (error) {
        addLog(`❌ Database error: ${error.message}`)
      } else {
        addLog('✅ Database connection successful')
      }

      // Test auth connection
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        addLog(`❌ Auth error: ${sessionError.message}`)
      } else {
        addLog(`✅ Auth connection successful (session: ${session ? 'active' : 'none'})`)
      }

    } catch (error: any) {
      addLog(`❌ Connection failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testSignUp = async () => {
    setLoading(true)
    addLog(`Testing signup with email: ${email}`)
    
    try {
      const result = await signUp(email, password, name, 'investor')
      
      if ('error' in result) {
        addLog(`❌ Signup failed: ${result.error}`)
      } else {
        addLog(`✅ Signup successful, redirecting to: ${result.redirectTo}`)
      }
    } catch (error: any) {
      addLog(`❌ Signup error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testSignIn = async () => {
    setLoading(true)
    addLog(`Testing signin with email: ${email}`)
    
    try {
      const result = await signIn(email, password)
      
      if ('error' in result) {
        addLog(`❌ Signin failed: ${result.error}`)
      } else {
        addLog(`✅ Signin successful, redirecting to: ${result.redirectTo}`)
      }
    } catch (error: any) {
      addLog(`❌ Signin error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testGoogleSignIn = async () => {
    setLoading(true)
    addLog('Testing Google OAuth...')
    
    try {
      const result = await signInWithGoogle()
      
      if ('error' in result) {
        addLog(`❌ Google OAuth failed: ${result.error}`)
      } else {
        addLog(`✅ Google OAuth initiated successfully`)
      }
    } catch (error: any) {
      addLog(`❌ Google OAuth error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Authentication Debug Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="TestPassword123!"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Test User"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={testDatabaseConnection} disabled={loading}>
                Test Database Connection
              </Button>
              <Button onClick={testSignUp} disabled={loading}>
                Test Sign Up
              </Button>
              <Button onClick={testSignIn} disabled={loading}>
                Test Sign In
              </Button>
              <Button onClick={testGoogleSignIn} disabled={loading}>
                Test Google OAuth
              </Button>
              <Button onClick={clearLogs} variant="secondary">
                Clear Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet. Run a test to see results.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔍 Environment Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>NEXT_PUBLIC_APP_URL:</strong> {process.env.NEXT_PUBLIC_APP_URL || 'Not set'}
              </div>
              <div>
                <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}
              </div>
              <div>
                <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
