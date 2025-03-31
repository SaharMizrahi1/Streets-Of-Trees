import React, { useState } from 'react';
import './ResetPassword.css';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setErrors] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
        newErrors.email = "נא למלא כתובת דוא״ל";
      } else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/.test(email)) {
        newErrors.email = "כתובת מייל לא תקינה. יש להזין פורמט תקין כגון: example@example.com, user@domain.co.il";
      }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage("");
      return;
    }

  try{
    await sendPasswordResetEmail(auth, email);
    setMessage("קישור לאיפוס סיסמה נשלח למייל שלך.");
    setErrors({});
  } catch (error) {
    setErrors({ email: "⚠️ שגיאה: " + error.message });
    setMessage("");
  }

  };


  return (
    <div className="reset-container">
      <h2 className="reset-title">איפוס סיסמה</h2>
      <p className="reset-instructions">
        הזן את כתובת הדוא״ל שלך ונשלח לך קישור לאיפוס הסיסמה
      </p>
      
      <form onSubmit={handleResetPassword} className="reset-form" noValidate>
        <div className="reset-field">
          <label>כתובת דוא״ל <span className="required-asterisk">*</span></label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@example.com" 
            required
          />
          {error.email && <p className="error-message">{error.email}</p>}
        </div>

        <button type="submit" className="reset-button">שלח קישור</button>
      </form>

      {message && <p className="success-message">{message}</p>}

      <p className="back-to-login" onClick={() => navigate('/login')}>
        חזרה להתחברות
      </p>
    </div>
  );
};

export default ResetPassword;
