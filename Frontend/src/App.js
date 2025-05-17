import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/header.js";
import Footer from "./components/Footer/footer.js";
import Auth from "./pages/Auth/auth.js";
import Home from "./pages/Home/home.js";
import ProtectedRoute from "./components/ProtectedRoute.js";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
