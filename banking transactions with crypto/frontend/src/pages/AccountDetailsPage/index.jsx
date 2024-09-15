import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAccountDetails } from '../../api/accountDetails'; 
import { Chart } from 'chart.js/auto';
import { Header } from "../../components/Header";
import { useForm } from 'react-hook-form';
import './style.scss';

export const AccountDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accountData, setAccountData] = useState(null);
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const {
    register,
    handleSubmit: handleFormSubmit,        
    formState: { errors },
    setValue,
  } = useForm();

  const { isLoading, error } = useQuery({
    queryKey: ['account', id],
    queryFn: () => getAccountDetails(id), 
    onError: (error) => {
      console.error("Ошибка при загрузке данных счёта:", error);
    },
    onSuccess: (data) => {
      setAccountData(data.payload);
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (accountData?.transactions?.length > 0) {
      const ctx = chartRef.current.getContext('2d');
      if (chartInstance) {
        chartInstance.destroy();
      }

      const monthNames = [
        'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
        'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
      ];
      const months = [];
      const currentDate = new Date();
      for (let i = 0; i < 6; i++) {
        const monthIndex = (currentDate.getMonth() - i + 12) % 12;
        months.push(monthNames[monthIndex]);
      }
      months.reverse();

      const monthlyData = {};
      accountData.transactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        const month = monthNames[date.getMonth()];
        if (months.includes(month)) {
          if (!monthlyData[month]) {
            monthlyData[month] = 0;
          }
          monthlyData[month] +=
            transaction.from === id ? -transaction.amount : transaction.amount;
        }
      });

      const chartData = {
        labels: months,
        datasets: [
          {
            label: 'Баланс',
            data: months.map(
              (month) => (monthlyData[month] < 0 ? 0 : monthlyData[month])
            ),
            backgroundColor: 'rgba(17, 106, 204, 1)',
            borderColor: 'rgba(17, 106, 204, 1)',
            borderRadius: 5,
            barPercentage: 0.5,
            categoryPercentage: 0.5,
          },
        ],
      };

      const balanceValues = Object.values(monthlyData);
      const minValue = Math.min(...balanceValues);
      const maxValue = Math.max(...balanceValues);

      setChartInstance(
        new Chart(ctx, {
          type: 'bar',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  color: '#666',
                  font: {
                    size: 18,
                    weight: 700,
                  },
                },
                border: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
                suggestedMax: maxValue * 1.1,
                grid: {
                  display: false,
                },
                position: 'right',
                ticks: {
                  color: '#666',
                  font: {
                    size: 12,
                  },
                },
                border: {
                  display: false,
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0,0,0,0.7)',
                titleFont: {
                  size: 12,
                },
                bodyFont: {
                  size: 12,
                },
                footerFont: {
                  size: 12,
                },
                callbacks: {
                  label: function (context) {
                    return `Баланс: ${context.raw.toFixed(2)} ₽`;
                  },
                },
              },
              afterDraw: (chart) => {
                const ctx = chart.ctx;
                ctx.font = '12px Arial';
                ctx.fillStyle = '#666';
                ctx.textAlign = 'right';
                ctx.fillText(
                  `Min: ${minValue.toFixed(2)}`,
                  chart.chartArea.right - 10,
                  chart.chartArea.bottom - 10
                );
                ctx.fillText(
                  `Max: ${maxValue.toFixed(2)}`,
                  chart.chartArea.right - 10,
                  chart.chartArea.top + 10
                );
              },
            },
          },
        })
      );
    }
  }, [accountData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRecipientAccountChange = (event) => {
    const input = event.target.value;
    setValue('transferTo', input);

    const usedAccounts = localStorage.getItem('usedAccounts')
      ? JSON.parse(localStorage.getItem('usedAccounts'))
      : [];
    const filteredSuggestions = usedAccounts.filter((account) =>
      account.startsWith(input)
    );
    setSuggestions(filteredSuggestions);
  };

  const handleSuggestionClick = (suggestion) => {
    setValue('transferTo', suggestion);
    setSuggestions([]);
  };

  const handleSubmit = async (data) => {
    try {
      console.log('Отправка перевода:', {
        from: id,
        to: data.transferTo,
        amount: data.transferAmount,
      });

      let usedAccounts = localStorage.getItem('usedAccounts')
        ? JSON.parse(localStorage.getItem('usedAccounts'))
        : [];
      if (!usedAccounts.includes(data.transferTo)) {
        usedAccounts.push(data.transferTo);
        localStorage.setItem('usedAccounts', JSON.stringify(usedAccounts));
      }

      setValue('transferTo', '');
      setValue('transferAmount', '');
    } catch (error) {
      console.error('Ошибка при отправке перевода:', error);
    }
  };

  if (isLoading) {
    return <div>Загрузка данных счёта...</div>;
  }

  if (error) {
    return <div>Ошибка при загрузке данных счёта: {error.message}</div>;
  }

  const handleStats = () => {
    navigate(`/statistics/account/${id}`); 
  };

  return (
    <>
      <Header />
      <main className="main-account">
        <div className="container">
          <div className="account-details">
            <h1 className="account-details__h1">Просмотр счёта</h1>
            <button type='button' className="account-details__btn" onClick={() => navigate(-1)}>
              <svg
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.83 5L7.41 1.41L6 0L0 6L6 12L7.41 10.59L3.83 7L16 7V5L3.83 5Z"
                  fill="white"
                />
              </svg>
              Вернуться назад
            </button>
            <p className="account-details__numb">
              № {accountData?.account || 'Нет данных'}
            </p>
            <p className="account-details__balance">
              Баланс: {accountData?.balance || 'Нет данных'} ₽
            </p>

            <button className='details-statistics' onClick={handleStats}>Подробная статистика</button>

            <div className="transaction">
              <p className="transaction__title">Новый перевод</p>
              <form
                className="transaction__form"
                onSubmit={handleFormSubmit(handleSubmit)}
              >
                <fieldset className="transaction__fieldset">
                  <legend className="transaction__legend">
                    Номер счета получателя:
                  </legend>
                  <input
                    type="text"
                    id="transferTo"
                    className="transaction__input"
                    placeholder="Введите номер счета"
                    {...register('transferTo', {
                      required: 'Это поле обязательно',
                      pattern: {
                        value: /^\d{10}$/, // Пример: номер счета должен состоять из 10 цифр
                        message: 'Номер счета должен состоять из 10 цифр',
                      },
                    })}
                    onChange={handleRecipientAccountChange}
                  />
                  {suggestions.length > 0 && (
                    <ul className="suggestions">
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                           className="suggestions__item"
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.transferTo && (
                    <span className="error-message">
                      {errors.transferTo.message}
                    </span>
                  )}
                </fieldset>
                <fieldset className="transaction__fieldset">
                  <legend className="transaction__legend">
                    Сумма перевода:
                  </legend>
                  <input
                    type="number"
                    id="transferAmount"
                    className="transaction__input"
                    placeholder="Введите сумму"
                    {...register('transferAmount', {
                      required: 'Это поле обязательно',
                      min: { value: 0.01, message: 'Сумма должна быть больше нуля' },
                    })}
                  />
                  {errors.transferAmount && (
                    <span className="error-message">
                      {errors.transferAmount.message}
                    </span>
                  )}
                </fieldset>
                <button type="submit" className="transaction__submit-button">
                  <svg
                    width="20"
                    height="16"
                    viewBox="0 0 20 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 16H2C0.89543 16 0 15.1046 0 14V1.913C0.0466084 0.842547 0.928533 -0.00101428 2 -9.95438e-07H18C19.1046 -9.95438e-07 20 0.89543 20 2V14C20 15.1046 19.1046 16 18 16ZM2 3.868V14H18V3.868L10 9.2L2 3.868ZM2.8 2L10 6.8L17.2 2H2.8Z"
                      fill="white"
                    />
                  </svg>
                  Отправить перевод
                </button>
              </form>
            </div>

            <div className="balance">
              <h2 className="balance__h2">Динамика баланса</h2>
              <div className="chart-container">
                <canvas ref={chartRef} />
              </div>
            </div>

            <div className="transactions-history">
              <h2 className="transactions-history__h2">
                История переводов
              </h2>
              <table className="transactions-history">
                <thead>
                  <tr>
                    <th>Счет отправителя</th>
                    <th>Счет получателя</th>
                    <th>Сумма</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {accountData?.transactions?.slice(-10).length > 0 ? (
                    accountData.transactions.slice(-10).map((transaction) => (
                      <tr key={transaction.date}>
                        <td>{transaction.from}</td>
                        <td>{transaction.to}</td>
                        <td
                          className={
                            transaction.amount > 0 ? 'positive' : ''
                          }
                        >
                          {transaction.amount} ₽
                        </td>
                        <td>
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">Нет транзакций</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AccountDetailsPage;
