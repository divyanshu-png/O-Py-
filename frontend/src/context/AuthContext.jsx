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
          is_admin: Boolean(prev?.is_admin || res.data.is_admin || prev?.username === 'admin'),
          full_name: res.data.full_name || prev?.full_name,
          bio: res.data.bio || prev?.bio,
          avatar_url: res.data.avatar_url || prev?.avatar_url,
          favorite_topics: res.data.favorite_topics || prev?.favorite_topics,
        }));
      }
    } catch (err) {
      console.error('Failed to refresh profile', err);
    }
  };

  const loginUser = (userData) => {
    const isAdmin = Boolean(userData.is_admin || userData.username === 'admin');
    const newUser = {
      user_id: userData.user_id,
      username: userData.username,
      rank: userData.rank || 1500,
      questions_solved: userData.questions_solved || 0,
      is_admin: isAdmin,
      full_name: userData.full_name || userData.username,
      bio: userData.bio || '',
      avatar_url: userData.avatar_url || '',
      favorite_topics: userData.favorite_topics || ''
    };
    setUser(newUser);
    setScreen(isAdmin ? 'admin' : 'start_test');
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
