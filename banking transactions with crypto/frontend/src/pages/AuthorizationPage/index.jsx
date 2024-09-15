import { AuthForm } from '../../components/AuthForm';
import './style.scss';

const AuthorizationPage = () => {
  return (
      <>
        <header className="header">
          <div className='container'>  
            <div className='header__block'>
              <h1 className="header__h1">Coin.</h1>
            </div>        
          </div>
        </header>
        <main className="main">
          <AuthForm />
        </main>
      </>
  );
};

export default AuthorizationPage;
