import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import PropTypes from 'prop-types';

const PrivateRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  return user ? children : <Navigate to="/" />;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
