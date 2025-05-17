import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./authnew.css";

const Auth = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertColor, setAlertColor] = useState("primary");
  const [alertVisible, setAlertVisible] = useState(false);
  const navigate = useNavigate();

  const toggleForm = () => setIsRegister(!isRegister);

  const handleRegister = async () => {
    if (!email || !password || password !== confirmPassword) {
      setAlertMessage("Please fill in all fields and ensure passwords match.");
      setAlertColor("warning");
      setAlertVisible(true);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlertMessage("Registration successful!");
        setAlertColor("success");
        setAlertVisible(true);
        setTimeout(() => {
          setIsRegister(false);
          setAlertVisible(false);
        }, 500);
      } else {
        setAlertMessage("Registration failed");
        setAlertColor("danger");
        setAlertVisible(true);
      }
    } catch (error) {
      setAlertMessage("An error occurred.");
      setAlertColor("danger");
      setAlertVisible(true);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setAlertMessage("Please fill in all fields.");
      setAlertColor("warning");
      setAlertVisible(true);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("id_token", data.id_token);
        localStorage.setItem("user_id", data.user_id);
        setAlertMessage("Login successful!");
        setAlertColor("success");
        setAlertVisible(true);
        setTimeout(() => {
          navigate("/home");
        }, 500);
      } else {
        setAlertMessage("Login failed");
        setAlertColor("danger");
        setAlertVisible(true);
      }
    } catch (error) {
      setAlertMessage("An error occurred.");
      setAlertColor("danger");
      setAlertVisible(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isRegister ? "Register" : "Login"}</h2>
        {alertVisible && (
          <p className={`alert ${alertColor}`}>{alertMessage}</p>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            required
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isRegister && (
            <input
              type="password"
              placeholder="Confirm Password"
              required
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}
          <button type="submit" className="auth-button">
            {isRegister ? "Sign Up" : "Sign In"}
          </button>
        </form>
        <p onClick={toggleForm} className="toggle-text">
          {isRegister
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </p>
      </div>
    </div>
  );
};

export default Auth;
