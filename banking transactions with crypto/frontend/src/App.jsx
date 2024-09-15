import { Suspense, lazy, useEffect, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomLayout from './Layout';
import PrivateRoute from './components/PrivateRoute';
import { UserContext } from './context/UserContext';
import { getUserData } from './api/getUserData';

const AuthorizationPage = lazy(() => import('./pages/AuthorizationPage'));
const ListCardsPage = lazy(() => import('./pages/ListCardsPage'));
const AccountDetailsPage = lazy(() => import('./pages/AccountDetailsPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const CurrencyPage = lazy(() => import('./pages/CurrencyPage'));
const AccountStatisticsPage = lazy(() => import('./pages/AccountStatisticsPage'));

const App = () => {
  const { loginUser } = useContext(UserContext);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const fetchUserData = async () => {
        try {
          const userData = await getUserData();
          if (userData) {
            loginUser(userData);
          }
        } catch (error) {
          console.error('Ошибка загрузки данных пользователя:', error);
        }
      };

      fetchUserData();
    }
  }, [loginUser]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<CustomLayout />}>
          <Route index element={<AuthorizationPage />} />
          <Route
            path="/list"
            element={
              <PrivateRoute>
                <ListCardsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/account/:id"
            element={
              <PrivateRoute>
                <AccountDetailsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/terminals"
            element={
              <PrivateRoute>
                <MapPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/currency"
            element={
              <PrivateRoute>
                <CurrencyPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/statistics/account/:id"
            element={
              <PrivateRoute>
                <AccountStatisticsPage />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
