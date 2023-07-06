import { useEffect, useState } from 'react'
import Login from './login'
import Chat from './chat'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useUser } from '@/lib/firebase'
import { useRouter } from 'next/router'
import { auth } from '@/lib/firebase'

const Home = () => {
  const { user, loading } = useUser()
  const router = useRouter()
  if (loading) {
    return <></>
  } else if (!user) {
    router.replace('/login')
  } else {
    return <Chat />
  }
}

export default Home
