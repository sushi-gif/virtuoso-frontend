import { useState, ChangeEvent, FormEvent } from "react";
import { useAuth } from "../auth/auth";
import logo from "../img/logo.svg";
import "../style/login.css";

export function LoginView() {
  const auth = useAuth();
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setCredentials((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    const { username, password } = credentials;
    auth?.signIn(username, password);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo-login">
          <a href="#" className="title-navbar">
            <img src={logo} className="logo-l"/>
          </a>
        </div>
        <div className="login-card">
          <div className="card-body">
            <h2>Login to your Account</h2>
            <form  onSubmit={handleLogin}>
              <div>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Inserisci il tuo username..."
                  value={credentials.username}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Inserisci la tua password..."
                  value={credentials.password}
                  onChange={handleChange}
                />
              </div>
              <div className="form-footer">
                <button className="login-button" type="submit">
                  <span>Sign in</span>
                </button>
              </div>
            </form>
          </div>
        </div>
        <p>Don't have an account yet? <a href="/">Sign up</a></p>
      </div>
    </div>
  );
}
