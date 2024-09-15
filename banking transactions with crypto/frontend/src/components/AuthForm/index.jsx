import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext'; 
import { useMutation } from '@tanstack/react-query';
import { login } from '../../api/loginApi';
import { Spinner } from '../Spinner'
import './style.scss';

export const AuthForm = () => {
  const [loginData, setLoginData] = useState({ login: '', password: '' });
  const navigate = useNavigate();
  const { loginUser } = useContext(UserContext);

  const { mutate: loginMutation, isLoading, error } = useMutation({
    mutationFn: (data) => login(data.login, data.password),
    onSuccess: (data) => {
      console.log('Data from API:', data);
      console.log('Token from API:', data.payload.token);
      localStorage.setItem('token', data.payload.token);
      console.log(localStorage.getItem('token'));

      const mockUser = {
        id: 1, 
        login: loginData.login, 
      };

      loginUser(mockUser); 
      navigate('/list');
    },
    onError: (error) => {
      console.error('Login Error:', error);
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    loginMutation(loginData);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2 className="form__h2">Вход в аккаунт</h2>
      <input
        type="text"
        id="login"
        value={loginData.login}
        onChange={(e) => setLoginData({ ...loginData, login: e.target.value })}
        className="form__input"
        placeholder="Логин"
        required
      />
      <input
        type="password"
        id="password"
        value={loginData.password}
        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
        className="form__input"
        placeholder="Пароль"
        required
      />
      {isLoading && <div className="loading"><Spinner /></div>} 
      <button className="form__btn" type="submit" disabled={isLoading}>
        Войти 
      </button>
      {error && <p className="error">Ошибка входа: {error.message}</p>}
    </form>
  );
};

export default AuthForm;