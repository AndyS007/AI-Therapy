import { useState } from "react";
import { signInUser, signInWithGoogle, signUpUser } from "@/lib/firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(true);

  const handleSignInOrSighUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isLoggingIn) {
        await signInUser(email, password);
      } else {
        await signUpUser(email, password);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const toggleLoginMode = () => {
    setIsLoggingIn((prevValue) => !prevValue);
  };

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
              Don&apos;t have an account?{" "}
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
              Already have an account?{" "}
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
            {isLoggingIn ? "Log In" : "Sign Up"}
          </button>
          <button
            type="button"
            className="google-signin-button"
            onClick={signInWithGoogle}
          >
            <img src={"/google.png"} width="30px" /> Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
