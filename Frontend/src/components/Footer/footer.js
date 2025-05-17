import React from "react";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} AidMyOsteo. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
