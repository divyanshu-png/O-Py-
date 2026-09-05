import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('opy_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [screen, setScreen] = useState(() => {
    const savedScreen = localStorage.getItem('opy_screen');
    return savedScreen || (localStorage.getItem('opy_user') ? 'start_test' : 'login');
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('opy_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('opy_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('opy_screen', screen);
  }, [screen]);

  const refreshProfile = async () => {
    if (!user || !user.user_id) return;
    try {
      const res = await axios.get('/api/profile/', {
        params: { user_id: user.user_id }
      });
      if (res.data) {
        setUser(prev => ({
          ...prev,
          username: res.data.username || prev.username,
          rank: res.data.rank ?? prev.rank,
          questions_solved: res.data.questions_solved ?? prev.questions_solved,
        }));
      }
    } catch (err) {
      console.error('Failed to refresh profile', err);
    }
  };

  const loginUser = (userData) => {
    setUser({
      user_id: userData.user_id,
      username: userData.username,
      rank: userData.rank || 1000,
      questions_solved: userData.questions_solved || 0,
    });
    setScreen('start_test');
  };

  const logoutUser = () => {
    setUser(null);
    setScreen('login');
    localStorage.removeItem('opy_user');
    localStorage.removeItem('opy_screen');
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      screen,
      setScreen,
      loginUser,
      logoutUser,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
