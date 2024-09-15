import { useState, useEffect } from 'react';
import { getMyCurrencies } from '../../api/currencyApi'; 
import './style.scss';

export const MyCurrencies = () => {
    const [currencies, setCurrencies] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const data = await getMyCurrencies();
                console.log('Полученные валюты:', data);
                setCurrencies(data);
            } catch (error) {
                setError('Ошибка при загрузке валют. Пожалуйста, попробуйте позже.');
            }
        };

        fetchCurrencies();
    }, []);

    const currencyEntries = Object.entries(currencies);

    return (
        <div className="currency-container">
            <h2 className='currency-your__h2'>Ваши валюты</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul className='currency-your__ul'>
                {currencyEntries.length > 0 ? (
                    currencyEntries.map(([code, { amount }]) => (
                        <li key={code} className='currency-your__item'>
                            <span className="currency-code">{code}</span>
                            <span className="currency-amount">{amount.toFixed(4)}</span>
                        </li>
                    ))
                ) : (
                    <li className='currency-your__item'>Нет данных для отображения</li>
                )}
            </ul>
        </div>
    );
};

export default MyCurrencies;
