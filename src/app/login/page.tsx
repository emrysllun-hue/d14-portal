'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { loginAction } from './actions' // Import the Server Action

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false) 
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Call the Server Action instead of supabase directly
    const result = await loginAction(email, password)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      setIsRedirecting(true)
      
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1200)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a192f] p-4 relative overflow-hidden">
      
      {/* --- CONTINUOUS RADAR BACKGROUND --- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-60">
        <div className="absolute w-[300px] h-[300px] rounded-full border border-blue-500/20"></div>
        <div className="absolute w-[500px] h-[500px] rounded-full border border-blue-500/20"></div>
        <div className="absolute w-[700px] h-[700px] rounded-full border border-blue-500/20"></div>
        <div className="absolute w-[900px] h-[900px] rounded-full border border-blue-500/20"></div>
        <div className="absolute w-[1100px] h-[1100px] rounded-full border border-blue-500/20"></div>
        <div className="absolute w-[1100px] h-[1100px] rounded-full animate-radar radar-beam"></div>
      </div>

      {/* --- LOGIN CARD --- */}
      <div className="w-full max-w-lg bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-10 border-t-[6px] border-yellow-500 z-10">
        
        <div className="flex flex-col items-center mb-10 text-center">
          
          {/* Logo */}
          <div className="w-24 h-24 relative mb-6">
            <Image 
              src="/STL.png" 
              alt="CGDSTL Logo" 
              fill
              sizes="96px"
              priority
              className="object-contain"
            />
          </div>
          
          {/* Main Title */}
          <h1 className="text-3xl font-extrabold text-[#0a192f] tracking-tight">
            CGDSTL <span className="text-gray-400 font-light mx-1">|</span> D-14
          </h1>
          
          {/* Subtitle */}
          <p className="text-[11px] font-bold text-gray-500 mt-3 uppercase tracking-[0.15em] leading-relaxed max-w-[320px] mx-auto">
            Deputy Chief of District Staff for<br />Maritime Security Law Enforcement
          </p>
          
          {/* Portal Access Title */}
          <h2 className="text-2xl font-bold mt-8 text-gray-800 border-b-2 border-gray-100 pb-2 w-full">
            D-14 Access Portal
          </h2>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <input
            type="email"
            placeholder="Username / Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-[#0b2d6b] focus:bg-white transition-all placeholder:text-gray-400"
            required
            disabled={isLoading || isRedirecting}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-[#0b2d6b] focus:bg-white transition-all placeholder:text-gray-400"
            required
            disabled={isLoading || isRedirecting}
          />
          
          {error && (
            <p className="text-red-600 text-sm font-semibold text-center bg-red-50 border border-red-100 p-3 rounded-lg animate-fade-in">
              {error}
            </p>
          )}
          
          <button
            type="submit"
            disabled={isLoading || isRedirecting}
            className="w-full bg-[#0b2d6b] text-white text-lg font-bold py-4 px-4 rounded-lg hover:bg-[#092252] hover:shadow-lg transition-all duration-200 mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3 tracking-widest"
          >
            {isLoading && !isRedirecting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AUTHENTICATING...
              </>
            ) : (
              'SECURE LOGIN'
            )}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-3 text-sm text-gray-500 text-center font-medium">
          <div className="flex justify-between px-2">
            <a href="#" className="hover:text-[#0b2d6b] transition-colors">Trouble Logging In?</a>
            <a href="#" className="hover:text-[#0b2d6b] transition-colors">Forgot Access Key?</a>
          </div>
        </div>
      </div>

      <p className="absolute bottom-6 text-xs font-semibold tracking-wide text-blue-300 z-10">
        This system is restricted to authorized users. Access is monitored.
      </p>

      {/* --- ACCESS GRANTED TRANSITION OVERLAY --- */}
      {isRedirecting && (
        <div className="absolute inset-0 bg-[#050e1a]/95 z-50 flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm">
          <div className="text-green-400 font-mono text-2xl md:text-3xl tracking-[0.3em] mb-8 animate-pulse font-bold">
            ACCESS GRANTED
          </div>
          
          <div className="w-72 md:w-96 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 animate-load-bar shadow-[0_0_15px_rgba(34,197,94,1)]"></div>
          </div>
          
          <div className="text-gray-400 font-mono text-sm mt-6 tracking-widest">
            INITIALIZING SECURE SESSION...
          </div>
        </div>
      )}
    </div>
  )
}