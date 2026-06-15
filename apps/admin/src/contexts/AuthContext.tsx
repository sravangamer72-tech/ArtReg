import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@art-workshop/shared'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

async function checkAdminStatus(email: string): Promise<boolean> {
  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  return !!data
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Resolve current session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email) {
        const admin = await checkAdminStatus(session.user.email)
        setIsAdmin(admin)
      }
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Keep state in sync with auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user?.email) {
          const admin = await checkAdminStatus(session.user.email)
          setIsAdmin(admin)
        } else {
          setIsAdmin(false)
        }
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }

    if (data.user?.email) {
      const admin = await checkAdminStatus(data.user.email)
      if (!admin) {
        await supabase.auth.signOut()
        return { error: 'Access denied. This account is not an admin.' }
      }
      setIsAdmin(true)
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
