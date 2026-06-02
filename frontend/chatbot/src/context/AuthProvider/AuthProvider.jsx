// AuthProvider.js
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut,
} from "firebase/auth";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { auth } from "../../firebase";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const lastUserUidRef = useRef(null);

  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password)
      .finally(() => setLoading(false));
  };

  const loginUser = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password)
      .finally(() => setLoading(false));
  };

  const resetPassword = (email, actionCodeSettings) => {
    setLoading(true);
    return sendPasswordResetEmail(auth, email, actionCodeSettings)
      .finally(() => setLoading(false));
  };

  const confirmPassword = (oobCode, senha) => {
    setLoading(true);
    return confirmPasswordReset(auth, oobCode, senha)
      .finally(() => setLoading(false));
  };

  const logOut = () => {
    setLoading(true);
    return signOut(auth)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const currentUid = currentUser?.uid ?? null;

      if (lastUserUidRef.current !== currentUid) {
        queryClient.cancelQueries();
        queryClient.clear();
      }

      lastUserUidRef.current = currentUid;
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

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
