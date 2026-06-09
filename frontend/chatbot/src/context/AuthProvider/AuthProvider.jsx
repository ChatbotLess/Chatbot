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
import api from "../../services/api";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const lastUserUidRef = useRef(null);
  const authChangeVersionRef = useRef(0);

  const createUser = async (email, password) => {
    setLoading(true);
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
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

  const logOut = async () => {
    setLoading(true);
    try {
      return await signOut(auth);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const authChangeVersion = ++authChangeVersionRef.current;
      const currentUid = currentUser?.uid ?? null;
      setLoading(true);
      setProfile(null);
      setProfileError(null);

      if (lastUserUidRef.current !== currentUid) {
        await queryClient.cancelQueries();
        queryClient.clear();
      }

      lastUserUidRef.current = currentUid;
      setUser(currentUser);

      if (!currentUser) {
        if (active && authChangeVersionRef.current === authChangeVersion) {
          setLoading(false);
        }
        return;
      }

      try {
        const response = await api.get("/api/users/me/");
        if (
          active &&
          authChangeVersionRef.current === authChangeVersion &&
          auth.currentUser?.uid === currentUid
        ) {
          setProfile(response.data);
        }
      } catch (error) {
        console.error("Nao foi possivel validar o perfil no backend.", error);
        if (
          active &&
          authChangeVersionRef.current === authChangeVersion &&
          auth.currentUser?.uid === currentUid
        ) {
          setProfileError("Nao foi possivel validar sua permissao.");
        }
      } finally {
        if (
          active &&
          authChangeVersionRef.current === authChangeVersion &&
          auth.currentUser?.uid === currentUid
        ) {
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [queryClient]);

  const authValue = {
    createUser,
    user,
    profile,
    profileError,
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
