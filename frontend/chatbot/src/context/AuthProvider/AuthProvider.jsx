// AuthProvider.js
import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { auth } from "../../firebase";

export const AuthContext = createContext(null);

const E2E_AUTH_STORAGE_KEY = "chatbot:e2e-user";

const isE2EAuthEnabled = import.meta.env.VITE_E2E_AUTH === "true";

const createdE2EUser = (email) => ({
  uid: "e2e-created-user",
  email,
  displayName: email?.split("@")[0] || "Usuario E2E",
});

const readStoredE2EUser = () => {
  if (!isE2EAuthEnabled || typeof window === "undefined") {
    return null;
  }

  const storedUser = window.localStorage.getItem(E2E_AUTH_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    window.localStorage.removeItem(E2E_AUTH_STORAGE_KEY);
    return null;
  }
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredE2EUser());
  const [loading, setLoading] = useState(!isE2EAuthEnabled);

  const createUser = (email, password) => {
    if (isE2EAuthEnabled) {
      return Promise.resolve({
        user: createdE2EUser(email),
        password,
      });
    }

    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password)
      .finally(() => setLoading(false));
  };

  const loginUser = (email, password) => {
    if (isE2EAuthEnabled) {
      const authenticatedUser = {
        uid: "e2e-auth-user",
        email,
        displayName: email?.split("@")[0] || "Usuario E2E",
      };

      window.localStorage.setItem(
        E2E_AUTH_STORAGE_KEY,
        JSON.stringify(authenticatedUser)
      );
      setUser(authenticatedUser);

      return Promise.resolve({
        user: authenticatedUser,
        password,
      });
    }

    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password)
      .finally(() => setLoading(false));
  };

  const resetPassword = (email, actionCodeSettings) => {
    if (isE2EAuthEnabled) {
      return Promise.resolve({ email, actionCodeSettings });
    }

    setLoading(true);
    return sendPasswordResetEmail(auth, email, actionCodeSettings)
      .finally(() => setLoading(false));
  };

  const confirmPassword = (oobCode, senha) => {
    if (isE2EAuthEnabled) {
      return Promise.resolve({ oobCode, senha });
    }

    setLoading(true);
    return confirmPasswordReset(auth, oobCode, senha)
      .finally(() => setLoading(false));
  };

  const logOut = () => {
    if (isE2EAuthEnabled) {
      window.localStorage.removeItem(E2E_AUTH_STORAGE_KEY);
      setUser(null);
      return Promise.resolve();
    }

    setLoading(true);
    return signOut(auth)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isE2EAuthEnabled) {
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const authValue = {
    createUser,
    user,
    loginUser,
    resetPassword,
    confirmPassword,
    logOut,
    loading,
  };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
