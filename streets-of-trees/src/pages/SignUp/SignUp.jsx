import React, { useState } from 'react'
import './SignUp.css'
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/authContext";
import { doCreateUserWithEmailAndPassword } from '../../firebase/auth';
import { Navigate } from 'react-router-dom';
import { auth } from '../../firebase/firebase';
import { updateProfile } from "firebase/auth";



const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const [isRegistering, setIsRegistering] = useState(false);
  const { userLoggedIn } = useAuth();
  const [message, setMessage] = useState("");

  



  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!fullName.trim()) {
      newErrors.fullName = "נא למלא שם מלא";
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "נא למלא כתובת דוא״ל";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "כתובת מייל לא תקינה";
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = "נא למלא סיסמה";
    } else if (password.length < 6) {
      newErrors.password = "סיסמה חייבת להיות לפחות 6 תווים";
    }

    setErrors(newErrors);

    // Return true if there are no errors
    return Object.keys(newErrors).length === 0;
  };
  const handleSignUp = async (e) => {
    e.preventDefault();
  
    if (validateForm()) {
      if (!isRegistering) {
        setIsRegistering(true);
        setErrors({});
        setMessage(""); 
        try {
          const userCredential = await doCreateUserWithEmailAndPassword(email, password);
          const user = userCredential.user;
          console.log("✅ Signed up successfully:", userCredential.user.email);

        await updateProfile(user, {
          displayName: fullName, 
        });

        console.log("✅ Full name added to user profile");
          alert("נשלחה אליך הודעת אימות למייל. יש לאשר את כתובת הדוא״ל לפני הכניסה למערכת.");
  
          navigate("/email-verification");
  
        } catch (error) {
          console.error("❌ Sign-up error:", error.message);
          setErrors({ signup: "שגיאה בהרשמה. אנא נסה שנית." });
        } finally {
          setIsRegistering(false);
        }
      }
    }
  };
  
  
  


  return (
    <div className="signup-container">
{userLoggedIn && auth.currentUser?.emailVerified && <Navigate to= {'/'} replace= {true} />}
<h2 className="signup-title">הרשמה</h2>
    {errors.signup && <p className="error-message">{errors.signup}</p>}
  {message && <p className="success-message">{message}</p>}
    <div className="signup-prompt">
        <p>כדי להשלים את הפעולה עליכם להיות מחוברים</p>
        <p>
          כבר רשומים?{' '}
          <span
            className="login-link"
            onClick={() => navigate('/login')} 
          >
            התחברות
          </span>
        </p>
      </div>
    <form onSubmit={handleSignUp} className="signup-form"noValidate>
      <div className="signup-field">
        <label>שם מלא<span className="required-asterisk">*</span></label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        {errors.fullName && <p className="error-message">{errors.fullName}</p>}

      </div>
      <div className="signup-field">
        <label>כתובת דוא״ל<span className="required-asterisk">*</span></label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          
        />
        {errors.email && <p className="error-message">{errors.email}</p>}


      </div>
      <div className="signup-field">
        <label>סיסמה <span className="required-asterisk">*</span></label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <p className="error-message">{errors.password}</p>}

      </div>
      <button type="submit" className="signup-button">הרשם</button>
    </form>
  </div>
  );
};

export default SignUp