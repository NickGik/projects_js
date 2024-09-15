import { createContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const UserContext = createContext(null);

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const loginUser = useCallback((userData) => {
    console.log("Обновление данных пользователя в контексте:", userData); 
    setUser(prevUser => {
      if (prevUser?.id !== userData.id || prevUser?.login !== userData.login) {
        localStorage.setItem('user', JSON.stringify(userData)); 
        return userData;
      }
      return prevUser;
    });
  }, []);

  const logoutUser = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user'); 
    localStorage.removeItem('token');
  }, []);

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { UserContext, UserProvider };
