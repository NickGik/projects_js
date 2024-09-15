import { useState, useEffect, useMemo } from 'react';
import { getMyCurrencies } from '../../api/currencyApi';
import './style.scss';

export const RealTimeExchangeRates = () => {
    const [myCurrencies, setMyCurrencies] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const userCurrencies = await getMyCurrencies();
                setMyCurrencies(userCurrencies);
            } catch (error) {
                setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formattedExchangeRates = useMemo(() => {
        const ratesArray = [];
        const currencyCodes = Object.keys(myCurrencies);

        currencyCodes.forEach((baseCurrency) => {
            currencyCodes.forEach((targetCurrency) => {
                if (baseCurrency !== targetCurrency) {
                    const baseAmount = myCurrencies[baseCurrency]?.amount || 0;
                    const targetAmount = myCurrencies[targetCurrency]?.amount || 0;
                    const rate = baseAmount / targetAmount;

                    if (rate) {
                        ratesArray.push({
                            pair: `${baseCurrency}/${targetCurrency}`,
                            rate: rate.toFixed(4),
                            change: Math.random() > 0.5 ? 'up' : 'down', 
                        });
                    }
                }
            });
        });

        return ratesArray.slice(-21);
    }, [myCurrencies]);

    return (
        <>
            <h2 className='currency-real__h2'>Курсы обмена в реальном времени</h2>
            {loading && <p>Загрузка данных...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {formattedExchangeRates.length > 0 ? (
                <ul className='currency-real__ul'>
                    {formattedExchangeRates.map(({ pair, rate, change }, index) => (
                        <li className={`currency-real__item ${change}`} key={index}>
                            <span className='currency-real__currency'>{pair}</span>
                            <span className={`currency-real__value ${change}`}>
                                {rate}
                                <span className={`indicator ${change}`}>
                                    {change === 'up' ? '▲' : '▼'}
                                </span>
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                !loading && <p>Нет данных для отображения</p>
            )}
        </>
    );
};

export default RealTimeExchangeRates;
