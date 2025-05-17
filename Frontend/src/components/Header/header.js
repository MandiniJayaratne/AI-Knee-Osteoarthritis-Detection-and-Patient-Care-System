import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("id_token");
    localStorage.removeItem("user_id");

    navigate("/");
  };

  const showLogout = location.pathname === "/home";

  return (
    <header className="header">
      <h1 className="title">AidMyOsteo</h1>
      {showLogout && (
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      )}
    </header>
  );
};

export default Header;
