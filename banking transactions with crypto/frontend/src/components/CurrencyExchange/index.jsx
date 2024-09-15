import { useState, useEffect } from 'react';
import { getAllCurrencies, getMyCurrencies, exchangeCurrency } from '../../api/currencyApi';
import { Spinner } from '../Spinner'; 
import './style.scss';

export const CurrencyExchange = () => {
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [myCurrencies, setMyCurrencies] = useState({});
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); 
      try {
        const response = await getAllCurrencies();
        if (Array.isArray(response.payload)) {
          setAllCurrencies(response.payload);
        } else {
          setError('Ошибка при загрузке списка валют.');
        }

        const userCurrencies = await getMyCurrencies();
        setMyCurrencies(userCurrencies);
      } catch (error) {
        setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false); 
      }
    };

    fetchData();
  }, []);

  const handleExchange = async (event) => {
    event.preventDefault(); 

    // Проверка валидации данных
    if (!fromCurrency || !toCurrency || !amount) {
      setError('Пожалуйста, заполните все поля.');
      return; 
    }

    if (isNaN(amount) || amount <= 0) {
      setError('Введите корректную сумму.');
      return; 
    }

    const fromAmount = myCurrencies[fromCurrency]?.amount || 0;
    if (amount > fromAmount) {
      setError('Недостаточно средств на счету.');
      return;
    }

    // Если все условия валидации пройдены, начинаем загрузку
    setIsLoading(true); 

    try {
      const result = await exchangeCurrency(fromCurrency, toCurrency, parseFloat(amount));
      setMyCurrencies(result);
      setSuccess('Обмен валюты выполнен успешно!');
      setError(null);
    } catch (error) {
      setError(error.message);
      setSuccess(null); 
    } finally {
      setIsLoading(false);
      setFromCurrency('');
      setToCurrency('');
      setAmount('');
      setError(null); 
    }
  };

  return (
   <>
      <h2 className='currency-exchange__h2'>Обмен валюты</h2>

      {/* Отображаем сообщение об ошибке, если оно есть */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Отображаем сообщение об успехе, если нет ошибок */}
      {success && !error && <p style={{ color: 'green' }}>{success}</p>}

      {isLoading && <div className="loading"><Spinner /></div>} 

      <form className="currency-exchange__form">

        <div className='currency-content'>
          <div className='currency-block'>
            <label className="currency-exchange__label"><span>Из</span>
              <select className="currency-exchange__select select-margin"  value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                <option value=""  className="currency-exchange__option">Валюта</option>
                {allCurrencies.length > 0 ? (
                  allCurrencies.map((currency) => (
                    <option key={currency} value={currency}  className="currency-exchange__option">
                      {currency}
                    </option>
                  ))
                ) : (
                  <option className="currency-exchange__option">Нет доступных валют</option>
                )}
              </select>
            </label>

            <label className="currency-exchange__label"><span>В</span>
              <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="currency-exchange__select">
                <option value="" className="currency-exchange__option">Валюта</option>
                {allCurrencies.length > 0 ? (
                  allCurrencies.map((currency) => (
                    <option key={currency} value={currency} className="currency-exchange__option">
                      {currency}
                    </option>
                  ))
                ) : (
                  <option className="currency-exchange__option">Нет доступных валют</option>
                )}
              </select>
            </label>
          </div>

          <label className="currency-exchange__label-input"><span>Сумма</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              className="currency-exchange__input"
              required
              min="0.01"
            />
          </label>
        </div>

        <button onClick={handleExchange} className="currency-exchange__button" disabled={isLoading}> 
          Обменять
        </button>
      </form>
   </>
  );
};

export default CurrencyExchange;
