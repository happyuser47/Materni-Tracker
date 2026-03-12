import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userFullName, setUserFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  const fetchUserProfile = async (userId) => {
    const { data } = await supabase
      .from('staff')
      .select('*')
      .eq('auth_id', userId)
      .maybeSingle();

    if (data) {
      setUserRole(data.role);
      setUserFullName(data.name);
      return data;
    }
    return null;
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.id).then(() => setAuthLoading(false));
      } else {
        setAuthLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.id).then(() => setAuthLoading(false));
      } else {
        setUserRole(null);
        setUserFullName('');
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setUserRole(null);
    setUserFullName('');
  };

  const isAdmin = userRole === 'Admin';

  const value = React.useMemo(() => ({
    user,
    userRole,
    userFullName,
    authLoading,
    login,
    logout,
    isAdmin,
    fetchUserProfile
  }), [user, userRole, userFullName, authLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
