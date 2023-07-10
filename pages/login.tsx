import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { AuthError } from 'firebase/auth'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { AuthErrorCode } from '@firebase/auth/internal'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(true)
  const router = useRouter()
  const { currentUser, signInWithGoogle, logIn, signUp, signInAnonymously } =
    useAuth()
  useEffect(() => {
    if (currentUser) {
      router.replace('/')
    }
  }, [currentUser, router])

  const checkPasswordsMatch = () => {
    if (password !== confirmPassword) {
      setPassword('')
      setConfirmPassword('')
      toast.error('Passwords do not match')
      return false
    } else {
      return true
    }
  }
  const handleSignInOrSighUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (isLoggingIn) {
        await logIn(email, password)
      } else {
        if (checkPasswordsMatch()) {
          await signUp(email, password)
        }
      }
    } catch (error) {
      console.error(error)
      toast.error((error as AuthError).code)
    }
  }
  const toggleLoginMode = () => {
    setIsLoggingIn((prevValue) => !prevValue)
  }

  return (
    <div className="login-container">
      <header className="login-header">
        <h1 className="login-title">Welcome to Chat App</h1>
      </header>
      <div className="login-form-container">
        <form className="login-form" onSubmit={handleSignInOrSighUp}>
          <input
            type="email"
            className="login-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {!isLoggingIn && (
            <input
              type="password"
              className="login-input"
              placeholder="ConfirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}
          {isLoggingIn ? (
            <div className="signup-link">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={toggleLoginMode}
                className="switch-button"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="signup-link">
              Already have an account?{' '}
              <button
                type="button"
                onClick={toggleLoginMode}
                className="switch-button"
              >
                Log In
              </button>
            </div>
          )}
          <button type="submit" className="login-button">
            {isLoggingIn ? 'Log In' : 'Sign Up'}
          </button>
          <button
            type="button"
            className="login-button"
            onClick={signInAnonymously}
          >
            Sign In Anonymously
          </button>
          <button
            type="button"
            className="google-signin-button"
            onClick={signInWithGoogle}
          >
            <Image src={'/google.png'} width="30" height="30" alt="" /> Sign in
            with Google
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
