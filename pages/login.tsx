import { useEffect, useState } from 'react'
import {
  signInUser,
  signInWithGoogle,
  signUpUser,
  useUser,
} from '@lib/firebase'
import { toast } from 'react-hot-toast'
import { AuthError } from 'firebase/auth'
import { useRouter } from 'next/router'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(true)
  const router = useRouter()
  const { user } = useUser()
  useEffect(() => {
    if (user) {
      router.replace('/')
    }
  }, [user, router])

  const handleSignInOrSighUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (isLoggingIn) {
        await signInUser(email, password)
        toast.success('Logged in successfully')
      } else {
        await signUpUser(email, password)
        toast.success('Signed up successfully')
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
            className="google-signin-button"
            onClick={signInWithGoogle}
          >
            <img src={'/google.png'} width="30px" alt="" /> Sign in with Google
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
