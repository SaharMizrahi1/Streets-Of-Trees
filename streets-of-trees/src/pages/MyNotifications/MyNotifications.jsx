import React, { useState, useEffect } from "react";
import "./MyNotifications.css";
import { FaTrash, FaCaretDown } from "react-icons/fa";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { useAuth } from "../../contexts/authContext"; 
const MyNotifications = () => {
  const [cities, setCities] = useState([]); 
  const [subscriptions, setSubscriptions] = useState([]); 
  const [newCity, setNewCity] = useState(""); 
  const { currentUser } = useAuth();
  const SMOOVE_API_KEY = process.env.REACT_APP_SMOOVE_API_KEY;
  const SMOOVE_API_URL = process.env.REACT_APP_SMOOVE_API_URL;



  // Fetch active cities from Firestore
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const citiesRef = collection(db, "cities");
        const q = query(citiesRef, where("status", "==", "ACTIVE"));
        const snapshot = await getDocs(q);
        const cityList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCities(cityList);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, []);

  // Fetch user's subscriptions from Firestore
  useEffect(() => {
    if (!currentUser || !currentUser.uid) return; 

    const fetchUserSubscriptions = async () => {
      try {
        const userRef = doc(db, "notifications", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setSubscriptions(userSnap.data().subscribedCities || []);
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      }
    };

    fetchUserSubscriptions();
  }, [currentUser]);

  // Add city to user's subscriptions
  const handleAddSubscription = async () => {
    if (!newCity.trim()) return;

    const userRef = doc(db, "notifications", currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const subscribedCities = userSnap.data().subscribedCities;

      if (subscribedCities.includes(newCity)) {
        alert(` כבר נרשמת לקבלת התראות עבור ${newCity}`);
        return;
      }
    }

    if (!currentUser || !currentUser.uid) {
      console.error("User must be logged in to subscribe.");
      return;
    }

    const updatedSubscriptions = [...subscriptions, newCity];
    setSubscriptions(updatedSubscriptions);
    setNewCity("");

    try {
      const userRef = doc(db, "notifications", currentUser.uid);
      await setDoc(
        userRef,
        {
          userId: currentUser.uid, 
          userEmail: currentUser.email,
          subscribedCities: updatedSubscriptions,
        },
        { merge: true }
      );
      alert(`נרשמת לקבלת התראות על: ${newCity}`);

      await sendSubscriptionEmail(currentUser.email, newCity);
    } catch (error) {
      console.error("Error adding subscription:", error);
    }
  };

  const handleRemoveSubscription = async (city) => {
    const updatedSubscriptions = subscriptions.filter((sub) => sub !== city);
    setSubscriptions(updatedSubscriptions);

    try {
      const userRef = doc(db, "notifications", currentUser.uid);
      await setDoc(
        userRef,
        {
          userId: currentUser.uid, 
          userEmail: currentUser.email,
          subscribedCities: updatedSubscriptions,
        },
        { merge: true }
      );
      alert(`הוסרה ההתראה על: ${city}`);
    } catch (error) {
      console.error("Error removing subscription:", error);
    }
  };

  const sendSubscriptionEmail = async (email, city) => {
    try {
      const response = await fetch(
        SMOOVE_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SMOOVE_API_KEY}`,
          },
          body: JSON.stringify({
            trackLinks: true,
            subject: `נרשמת בהצלחה להתראות על ${city} 🌳`,
            body: `
  <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif; color: #333;">
    <p style="font-size: 16px; margin-bottom: 10px;">שלום,</p>
    <p style="font-size: 16px; margin-bottom: 10px;">
      נרשמת לקבלת התראות על עדכונים באזור: <strong>${city}</strong>.
    </p>
    <p style="font-size: 16px; margin-bottom: 10px;">
      נעדכן אותך כאשר יפורסם רישיון כריתה חדש באזור זה.
    </p>
    <hr style="border: 0; height: 1px; background-color: #ccc; margin: 20px 0;">
    <p style="font-size: 14px; color: #555;">
      בברכה,<br>
      <strong>צוות מערכת רישיונות הכריתה</strong><br>
      <span style="color: #74c59f; font-weight: bold;">עמותת רחובות של עצים</span>
    </p>
  </div>`,

            toMembersByEmail: [email], 
          }),
        }
      );

      if (response.ok) {
        console.log("✅ אימייל נשלח בהצלחה!");
      } else {
        console.error("⚠️ שגיאה בשליחת המייל", await response.text());
      }
    } catch (error) {
      console.error("⚠️ שגיאה בשליחת המייל:", error);
    }
  };

  return (
    <div className="notifications-container">
      <h2 className="notifications-title">ההתראות שלי</h2>
      <p className="notifications-instructions">
        הירשם לקבלת התראות במייל כאשר מתפרסם רישיון כריתה חדש באזור שבחרת.
      </p>

      <div className="subscription-input">
        <div className="select-wrapper">
          <select value={newCity} onChange={(e) => setNewCity(e.target.value)}>
            <option value="">בחר עיר...</option>
            {cities.map((city) => (
              <option key={city.id} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
          <FaCaretDown className="select-icon" />
        </div>

        <button onClick={handleAddSubscription}>➕ הוסף</button>
      </div>

      <div className="subscriptions-list">
        {subscriptions.length > 0 ? (
          subscriptions.map((city, index) => (
            <div key={index} className="subscription-item">
              <span>🌳 {city}</span>
              <FaTrash
                className="delete-icon"
                onClick={() => handleRemoveSubscription(city)}
              />
            </div>
          ))
        ) : (
          <p className="no-subscriptions">אין לך התראות כרגע.</p>
        )}
      </div>
    </div>
  );
};

export default MyNotifications;
