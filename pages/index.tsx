import { useState } from 'react'
import Login from './login'
import Chat from './chat'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const Home = () => {
  const [loggedIn, setLoggedIn] = useState(false)

  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    setLoggedIn(!!user)
  })

  return <div>{loggedIn ? <Chat /> : <Login />}</div>
}

export default Home
