import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateEmail as updateEmailFn,
  updatePassword as updatePasswordFn,
  signInAnonymously as signInAnonymouslyFn,
  User as FirebaseUser,
  GoogleAuthProvider,
} from 'firebase/auth'
import { auth } from '@lib/firebase'
import { toast } from 'react-hot-toast'

interface AuthContextProps {
  currentUser: FirebaseUser | null
  logIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateEmail: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  signInAnonymously: () => Promise<void>
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  async function signUp(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password)
    toast.success('Signed up successfully')
  }
  async function signInWithGoogle() {
    await signInWithPopup(auth, new GoogleAuthProvider())
    toast.success('Signed in with Google')
  }

  async function logIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
    toast.success('Logged in successfully')
  }

  async function logOut() {
    await signOut(auth)
    toast.success('Logged out successfully')
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email)
  }

  async function updateEmail(email: string) {
    await updateEmailFn(currentUser!, email)
  }

  async function updatePassword(password: string) {
    await updatePasswordFn(currentUser!, password)
  }
  async function signInAnonymously() {
    await signInAnonymouslyFn(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value: AuthContextProps = {
    currentUser,
    signUp,
    logIn,
    logOut,
    signInWithGoogle,
    resetPassword,
    updateEmail,
    updatePassword,
    signInAnonymously,
  }
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
