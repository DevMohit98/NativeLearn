import { account } from "@/lib/appwrite";
import React, { createContext, useEffect, useState } from "react";
import { ID, Models } from "react-native-appwrite";
type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  signup: (email: string, password: string) => Promise<string | null>;
  signin: (email: string, password: string) => Promise<string | null>;
  loading: boolean;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await account.get();
        setUser(res);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const signup = async (email: string, password: string) => {
    try {
      await account.create(ID.unique(), email, password);
      await signin(email, password);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : "Signup error";
    }
  };

  const signin = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const res = await account.get();
      setUser(res);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : "Signin error";
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signin,
        signup,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
