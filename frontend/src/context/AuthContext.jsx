import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    // Dummy authentication logic
    let userRole = 'PATIENT'; // default role
    
    if (username === 'doctor' && password === 'doctor') {
      userRole = 'DOCTOR';
    } else if (username === 'patient' && password === 'patient') {
      userRole = 'PATIENT';
    } 

    const userData = {
      username:username.toLowerCase() == "patient" ? "Bhaskar Bhatta" : "Dr. Sagar Regmi",
      role: userRole,
      name: username.charAt(0).toUpperCase() + username.slice(1),
      phone: '+9806028752',
      position: userRole,
      hospitalName: 'B&C Hospital',
      additionalDetailsCompleted: true, // Demo users don't need to fill additional details
      patients: userRole === 'DOCTOR' ? [
        { id: 1, name: 'John Doe', age: 45, condition: 'Hypertension', admissionDate: '2024-01-15' },
        { id: 2, name: 'Jane Smith', age: 32, condition: 'Diabetes', admissionDate: '2024-01-20' },
        { id: 3, name: 'Bob Johnson', age: 58, condition: 'Cardiac', admissionDate: '2024-01-18' },
      ] : []
    };

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  const register = (userData) => {
    const newUser = {
      ...userData,
      role: userData.role || 'PATIENT',
      patients: []
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return true;
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    register,
    updateUser,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

