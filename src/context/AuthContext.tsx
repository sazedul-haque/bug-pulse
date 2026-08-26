import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isEditor: boolean;
  login: (passkey: string) => boolean;
  logout: () => void;
  changePasskey: (oldKey: string, newKey: string) => boolean;
  isPasskeyModalOpen: boolean;
  openPasskeyModal: () => void;
  closePasskeyModal: () => void;
}

const DEFAULT_PASSKEY = 'ollyo2026';
const STORAGE_AUTH_TOKEN = 'bugpulse_auth_editor_session';
const STORAGE_CUSTOM_PASSKEY = 'bugpulse_team_passkey';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditor, setIsEditor] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_AUTH_TOKEN) === 'true';
  });
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState(false);

  const getActivePasskey = (): string => {
    return localStorage.getItem(STORAGE_CUSTOM_PASSKEY) || DEFAULT_PASSKEY;
  };

  const login = (inputPasskey: string): boolean => {
    const activeKey = getActivePasskey();
    if (inputPasskey.trim() === activeKey.trim()) {
      setIsEditor(true);
      localStorage.setItem(STORAGE_AUTH_TOKEN, 'true');
      setIsPasskeyModalOpen(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsEditor(false);
    localStorage.removeItem(STORAGE_AUTH_TOKEN);
  };

  const changePasskey = (oldKey: string, newKey: string): boolean => {
    const activeKey = getActivePasskey();
    if (oldKey.trim() === activeKey.trim() && newKey.trim().length >= 4) {
      localStorage.setItem(STORAGE_CUSTOM_PASSKEY, newKey.trim());
      return true;
    }
    return false;
  };

  const openPasskeyModal = () => setIsPasskeyModalOpen(true);
  const closePasskeyModal = () => setIsPasskeyModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        isEditor,
        login,
        logout,
        changePasskey,
        isPasskeyModalOpen,
        openPasskeyModal,
        closePasskeyModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
