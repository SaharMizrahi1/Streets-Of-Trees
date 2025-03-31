import React from "react";
import { useNavigate } from "react-router-dom";
import "./EmailVerification.css";
import { auth } from "../../firebase/firebase";
import { sendEmailVerification, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useState, useEffect } from "react";

const EmailVerification = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [cooldown, setCooldown] = useState(false);


 useEffect(() => {
  const interval = setInterval(async () => {
    await auth.currentUser?.reload(); 
    if (auth.currentUser?.emailVerified) {
      setEmailVerified(true);
      clearInterval(interval); 
      navigate("/"); 
    }
  }, 5000); 

  return () => clearInterval(interval); 
}, [navigate]);

  const handleResendEmail = async () => {
    setMessage("");
    setError("");

    if (!auth.currentUser) {
      setError("❌ אין משתמש מחובר.");
      return;
    }

    try {

      setCooldown(true);
      setTimeout(() => setCooldown(false), 30000);
      await sendEmailVerification(auth.currentUser);
      setMessage("✅ קישור חדש נשלח לכתובת המייל שלך! בדוק את תיבת הדואר.");
    } catch (error) {
      console.error("❌ Error resending verification email:", error.message);
      setError("❌ שגיאה בשליחת המייל. נסה שוב מאוחר יותר.");
    }
  };

  return (
    <div className="email-verification-container">
      <h2 className="verification-title">נרשמת בהצלחה! 🎉</h2>
      <p className="verification-message">
        כדי להשלים את ההרשמה, עליך לאמת את כתובת המייל שלך.  
        שלחנו לך ממש עכשיו מייל עם קישור לאימות.
      </p>
      <p className="resend-text">לא קיבלת את המייל? לחץ כדי לשלוח מחדש:</p>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <button className="resend-button" onClick={handleResendEmail} disabled={cooldown}>
        {cooldown ? "המתן 30 שניות..." : "שלח קישור מחדש"}
      </button>

    </div>
  );
};

export default EmailVerification;
