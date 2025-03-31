// Unused: Replaced with Firebase Authentication

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SetPassword.css";

const SetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Password validation (same as SignUp)
    if (!password.trim()) {
      newErrors.password = "נא למלא סיסמה";
    } else if (password.length < 6) {
      newErrors.password = "סיסמה חייבת להיות לפחות 6 תווים";
    }

    // Confirm password validation
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "נא לאשר את הסיסמה";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "הסיסמאות אינן תואמות";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSetPassword = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("New password set successfully:", password);
      setMessage("הסיסמה שונתה בהצלחה!");
      setErrors({});
      setTimeout(() => navigate("/login"), 3000); // Redirect to login after 3 seconds
    } else {
      setMessage("");
    }
  };

  return (
    <div className="set-password-container">
      <h2 className="set-password-title">בחרו סיסמה חדשה</h2>
      <p className="set-password-instructions">
        יש להזין סיסמה חדשה ולוודא שהיא עומדת בדרישות האבטחה.
      </p>

      <form onSubmit={handleSetPassword} className="set-password-form" noValidate>
        <div className="set-password-field">
          <label>סיסמה חדשה</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="*******"
            required
          />
          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>

        <div className="set-password-field">
          <label>אימות סיסמה</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="*******"
            required
          />
          {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
        </div>

        <button type="submit" className="set-password-button">שמור סיסמה</button>
      </form>

      {message && <p className="success-message">{message}</p>}

      <p className="back-to-login" onClick={() => navigate("/login")}>
        חזרה להתחברות
      </p>
    </div>
  );
};

export default SetPassword;
