import { auth } from "./firebase";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, sendEmailVerification } from "firebase/auth";



export const doCreateUserWithEmailAndPassword = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        auth.languageCode = 'he';

        await sendEmailVerification(user);
        console.log("✅ Verification email sent to:", user.email);


        return userCredential;
    } catch (error) {
        console.error("❌ Error during sign-up:", error.message);
        throw error;
    }
};

export const doSignInWithEmailAndPassword = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            alert("❌ עליך לאשר את כתובת הדוא״ל לפני הכניסה למערכת.");
            await doSignOut(auth);
            throw new Error("❌ עליך לאשר את כתובת הדוא״ל לפני הכניסה למערכת.");
        }

        return userCredential;
    } catch (error) {
        console.error("❌ Login error:", error.message);
        throw error;
    }
};

export const doSignOut = () => auth.signOut();

export const doPasswordReset = (email) => {
   return sendPasswordResetEmail(auth, email);
};

export const doPasswordUpdate = (password) => {
    return updatePassword(auth.currentUser, password);
};

export const doSendEmailVerification = () => {
    return sendEmailVerification(auth.currentUser);
};

