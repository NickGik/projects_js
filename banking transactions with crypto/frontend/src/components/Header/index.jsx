import { useNavigate, useLocation } from 'react-router-dom';
import './style.scss';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const handleOpenTerminals = () => {
    navigate('/terminals');
  };

  const handleOpenCurrency = () => {
    navigate('/currency');
  };

  const handleOpenChecks = () => {
    navigate('/list');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/'); 
  };

  console.log('Current path:', location.pathname);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className='container'>
        <div className='header__block'>
          <h1 className="header__h1">Coin.</h1>
          <nav className="nav">
            <ul className="nav__ul">
              <li className="nav__item">
                <button
                  type="button"
                  className={`nav__btn ${isActive('/terminals') ? 'active' : ''}`}
                  onClick={handleOpenTerminals}
                >
                  Банкоматы
                </button>
              </li>
              <li className="nav__item">
                <button
                  type="button"
                  className={`nav__btn ${isActive('/list') ? 'active' : ''}`}
                  onClick={handleOpenChecks}
                >
                  Счета
                </button>
              </li>
              <li className="nav__item">
                <button
                  type='button'
                  className={`nav__btn ${isActive('/currency') ? 'active' : ''}`}
                  onClick={handleOpenCurrency}
                >
                  Валюта
                </button>
              </li>
              <li className="nav__item">
                <button
                  className="nav__btn"
                  onClick={handleLogout}
                >
                  Выйти
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};
