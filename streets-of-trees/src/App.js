import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TreeCuttingPermits from './pages/TreeCuttingPermits/TreeCuttingPermits';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import Navbar from './components/Navbar/Navbar';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import SetPassword from './pages/SetPassword/SetPassword';
import { AuthProvider , useAuth} from './contexts/authContext';
import Footer from './components/Footer/Footer';
import EmailVerification from './pages/EmailVerification/EmailVerification';
import MyNotifications from './pages/MyNotifications/MyNotifications';
import { useEffect, useState } from 'react';
import { auth } from './firebase/firebase';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ element }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setVerified(user.emailVerified);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>טוען...</div>;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!verified) {
    return <Navigate to="/email-verification" replace />;
  }

  return element;
}

function App() {
  return (
    <AuthProvider>
    <Router>
    <Navbar />
    <div className="app-content">
    <Routes>
      <Route path="/" element={<ProtectedRoute element={<TreeCuttingPermits />} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/email-verification" element={<EmailVerification />} />
      <Route path="/my-notifications" element={<ProtectedRoute element={<MyNotifications />} />} />


    </Routes>
    </div>
    <Footer />
  </Router>
  </AuthProvider>
  );
}

export default App;
