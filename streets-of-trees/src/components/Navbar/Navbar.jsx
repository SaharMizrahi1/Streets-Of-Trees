import React, { useState, useEffect } from 'react'
import './Navbar.css'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png';
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';

const Navbar = () => {
  const {userLoggedIn} = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await doSignOut(); 
      navigate("/login"); 
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNotificationsClick = () => {
    if (userLoggedIn) {
      navigate("/my-notifications"); 
    } else {
      navigate("/login"); 
    }
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-right">
        <Link to="/">
          <img src={logo} alt="רישיונות כריתה" className="navbar-logo" />
        </Link>

        <button className="navbar-notifications" onClick={handleNotificationsClick}>
          ההתראות שלי
        </button>
      </div>

      <div className="navbar-left">
        {userLoggedIn ? (
          <button className="navbar-button" onClick={handleLogout}>התנתקות</button>
        ) : (
          <>
            <Link to="/login" className="navbar-button">התחברות</Link>
            <Link to="/signup" className="navbar-button">הרשמה</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;