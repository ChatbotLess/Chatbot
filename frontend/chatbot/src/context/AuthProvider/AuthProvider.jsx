// AuthProvider.js
import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { auth } from "../../firebase";
import api from "../../services/api";

export const AuthContext = createContext(null);

const E2E_AUTH_STORAGE_KEY = "chatbot:e2e-user";
const isE2EAuthEnabled = import.meta.env.VITE_E2E_AUTH === "true";

const createE2EUser = ({ uid, email, displayName }) => ({
  uid,
  email,
  displayName: displayName || email?.split("@")[0] || "Usuario E2E",
  getIdToken: () => Promise.resolve("e2e-token"),
});

const createE2EProfile = (user) => ({
  id: "backend-user-1",
  firebase_uid: user.uid,
  email: user.email,
  name: user.displayName || user.email?.split("@")[0] || "Usuario E2E",
  is_staff: true,
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
    return createE2EUser(JSON.parse(storedUser));
  } catch {
    window.localStorage.removeItem(E2E_AUTH_STORAGE_KEY);
    return null;
  }
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredE2EUser());
  const [profile, setProfile] = useState(() => {
    const storedUser = readStoredE2EUser();
    return storedUser ? createE2EProfile(storedUser) : null;
  });
  const [profileError, setProfileError] = useState(null);
  const [loading, setLoading] = useState(!isE2EAuthEnabled);
  const queryClient = useQueryClient();
  const lastUserUidRef = useRef(null);
  const authChangeVersionRef = useRef(0);

  const createUser = async (email, password) => {
    if (isE2EAuthEnabled) {
      return {
        user: createE2EUser({
          uid: "e2e-created-user",
          email,
          displayName: email?.split("@")[0] || "Usuario E2E",
        }),
        password,
      };
    }

    setLoading(true);
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginUser = async (email, password) => {
    if (isE2EAuthEnabled) {
      const authenticatedUser = createE2EUser({
        uid: "e2e-auth-user",
        email,
        displayName: email?.split("@")[0] || "Usuario E2E",
      });

      window.localStorage.setItem(
        E2E_AUTH_STORAGE_KEY,
        JSON.stringify({
          uid: authenticatedUser.uid,
          email: authenticatedUser.email,
          displayName: authenticatedUser.displayName,
        })
      );

      setUser(authenticatedUser);
      setProfile(createE2EProfile(authenticatedUser));
      setProfileError(null);

      return {
        user: authenticatedUser,
        password,
      };
    }

    setLoading(true);
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
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

  const logOut = async () => {
    if (isE2EAuthEnabled) {
      window.localStorage.removeItem(E2E_AUTH_STORAGE_KEY);
      setUser(null);
      setProfile(null);
      setProfileError(null);
      return;
    }

    setLoading(true);
    try {
      return await signOut(auth);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  useEffect(() => {
    if (isE2EAuthEnabled) {
      return undefined;
    }

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
