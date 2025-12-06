import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';
import { 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithRedirect, 
    signInWithPopup, 
    getRedirectResult, 
    signOut, 
    setPersistence, 
    browserLocalPersistence 
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRedirectResult(auth).then((result) => {
             if (result) {
                 console.log("Redirect result:", result.user);
             }
        }).catch((error) => {
             console.error("Redirect Error:", error);
             alert("Login failed: " + error.message);
        });

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log("Auth State Changed:", currentUser ? "User" : "Null");
            if (currentUser) {
                const idToken = await currentUser.getIdToken();
                setUser(currentUser);
                setToken(idToken);
            } else {
                setUser(null);
                setToken(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const loginWithPopup = async () => {
        setLoading(true);
        try {
            await setPersistence(auth, browserLocalPersistence);
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Popup Login Error:", error);
            setLoading(false);
            if (error.code === 'auth/popup-blocked') {
                throw new Error("Popup blocked");
            }
            alert(error.message);
        }
    };

    const loginWithRedirect = async () => {
        setLoading(true);
        try {
            await setPersistence(auth, browserLocalPersistence);
            const provider = new GoogleAuthProvider();
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error("Redirect Login Error:", error);
            setLoading(false);
            alert(error.message);
        }
    };

    const logout = () => signOut(auth);

    const checkToken = async () => {
        if(auth.currentUser) {
            const t = await auth.currentUser.getIdToken(true);
            setToken(t);
            return t;
        }
    }

    const login = loginWithRedirect; 

    const value = { user, token, loginWithPopup, loginWithRedirect, login, logout, checkToken };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
