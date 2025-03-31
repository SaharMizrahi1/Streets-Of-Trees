import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="contact-link">
          <a href="mailto:rehovot.shel.etzim@gmail.com">צור קשר</a>
        </p>
        <nav className="footer-nav">
          <a href="/about">אודות</a>
          <a href="/privacy">מדיניות פרטיות</a>
          <a href="/terms">תנאי שימוש</a>
        </nav>
       <strong>  
       <p className="footer-credit">© 2025 Rehovot Shel Etzim</p>
        </strong> 
        <p className="footer-credit">Developed by students for "Rehovot Shel Etzim".
        Developers: Shaked Yael & Sahar Mizrahi</p>
      </div>
    </footer>
  );
};

export default Footer;
