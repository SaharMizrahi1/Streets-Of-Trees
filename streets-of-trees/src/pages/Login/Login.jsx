import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { Navigate } from 'react-router-dom';
import { doSignInWithEmailAndPassword } from "../../firebase/auth";
import { useAuth } from "../../contexts/authContext";

const Login = () => {

  const { userLoggedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = "נא למלא כתובת דוא״ל";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "כתובת מייל לא תקינה";
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = "נא למלא סיסמה";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (!isSigningIn) {
        setIsSigningIn(true);
        setErrors({}); 
  
        try {
          const userCredential = await doSignInWithEmailAndPassword(email, password);
          const user = userCredential.user;
  
          if (!user.emailVerified) {
            setIsSigningIn(false);
            return;
          }
          console.log("Logging in:", { email, password });
          alert("התחברת בהצלחה");
          navigate("/"); 
        } catch (error) {
          console.error("Login failed:", error.message);
  
          let errorMessage = "שגיאה בהתחברות. בדוק את כתובת הדוא״ל והסיסמה.";
  
          if (error.code === "auth/user-not-found") {
            errorMessage = "משתמש לא נמצא. אנא בדוק את כתובת הדוא״ל שלך.";
          } else if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
            errorMessage = "סיסמה שגויה. אנא נסה שוב.";
          } else if (error.code === "auth/invalid-email") {
            errorMessage = "כתובת דוא״ל לא תקינה.";
          } else if (error.code === "auth/too-many-requests") {
            errorMessage = "נחסמת זמנית עקב ניסיונות כניסה מרובים. נסה מאוחר יותר.";
          }
  
          setErrors((prev) => ({ ...prev, login: errorMessage }));
          setIsSigningIn(false);
        }
      }
    } else {
      console.log("Form validation failed", errors);
    }
  };
  
  return (

    
    <>
    <div className="welcome-text">
    <strong>ברוכים הבאים למערכת רישיונות כריתה ועררים של עמותת רחובות של עצים</strong>
      <p>
        המערכת מאפשרת לציבור לעקוב אחרי רישיונות כריתה של עצים ולבצע פעולות כמו בדיקת סטטוס,
        קבלת התראות על רישונות באיזורים לבחירתך, הנחיות להגשת ערר, ובעתיד גם הגשת ערר דרך המערכת.
      </p>
      <p>
        כדי לשמור על העצים ברחובות שלנו, חשוב שכולנו נהיה מעורבים ונפעל בזמן. ההתחברות למערכת מאפשרת
        לכם לקבל מידע בזמן אמת ולנקוט פעולה בקלות ובשקיפות.
      </p>
     
    </div>
    <div className="login-container">
          {userLoggedIn && (<Navigate to= {'/'} replace= {true} />) }
      <h2 className="login-title">התחברות</h2>
      {errors.login && <p className="error-message">{errors.login}</p>}
      {errors.emailVerification && <p className="error-message">{errors.emailVerification}</p>}

      <div className="login-prompt">
        <p>כדי להשלים את הפעולה עליכם להיות מחוברים</p>
        <p>
          עוד לא הצטרפתם?{" "}
          <span className="signup-link" onClick={() => navigate("/signup")}>
            הרשמו עכשיו
          </span>
        </p>
      </div>
      <form onSubmit={handleLogin} className="login-form" noValidate>
        <div className="login-field">
          <label>
            כתובת דוא״ל <span className="required-asterisk">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>
        <div className="login-field">
          <label>
            סיסמה <span className="required-asterisk">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errors.password && (
            <p className="error-message">{errors.password}</p>
          )}
        </div>

        <div className="forgot-password-container">
          <p
            className="forgot-password"
            onClick={() => navigate("/reset-password")}
          >
            שכחתי סיסמה
          </p>
        </div>

        <button type="submit" className="login-button">
          התחבר
        </button>
      </form>
    </div>

    </>

  );
};

export default Login;
