import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getAccountDetails } from '../../api/accountDetails';
import { Chart } from 'chart.js/auto';
import { Header } from "../../components/Header";
import './style.scss';

export const AccountStatisticsPage = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [accountData, setAccountData] = useState(state?.accountData || null);
  const balanceChartRef = useRef(null);
  const transactionsChartRef = useRef(null);
  const [balanceChartInstance, setBalanceChartInstance] = useState(null);
  const [transactionsChartInstance, setTransactionsChartInstance] = useState(null);

  useEffect(() => {
    if (!accountData) {
      getAccountDetails(id).then(response => {
        setAccountData(response.payload);
      }).catch(error => {
        console.error("Ошибка при загрузке данных счёта:", error);
      });
    }
  }, [accountData, id]);

  useEffect(() => {
    if (accountData?.transactions?.length > 0) {
      const monthNames = [
        'Янв',
        'Фев',
        'Мар',
        'Апр',
        'Май',
        'Июн',
        'Июл',
        'Авг',
        'Сен',
        'Окт',
        'Ноя',
        'Дек',
      ];
      const months = [];
      const currentDate = new Date();
      for (let i = 0; i < 6; i++) {
        const monthIndex = (currentDate.getMonth() - i + 12) % 12;
        months.push(monthNames[monthIndex]);
      }
      months.reverse();

      // Данные для графика баланса
      const monthlyBalanceData = {};
      accountData.transactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        const month = monthNames[date.getMonth()];
        if (months.includes(month)) {
          if (!monthlyBalanceData[month]) {
            monthlyBalanceData[month] = 0;
          }
          monthlyBalanceData[month] +=
            transaction.from === id ? -transaction.amount : transaction.amount;
        }
      });

      // Данные для графика транзакций
      const monthlyTransactionsData = {};
      accountData.transactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        const month = monthNames[date.getMonth()];
        if (months.includes(month)) {
          if (!monthlyTransactionsData[month]) {
            monthlyTransactionsData[month] = { income: 0, expense: 0 };
          }
          if (transaction.from === id) {
            monthlyTransactionsData[month].expense += transaction.amount;
          } else {
            monthlyTransactionsData[month].income += transaction.amount;
          }
        }
      });

      // Создание графика баланса
      const balanceChartData = {
        labels: months,
        datasets: [
          {
            label: 'Баланс',
            data: months.map(
              (month) =>
                monthlyBalanceData[month] < 0 ? 0 : monthlyBalanceData[month]
            ),
            backgroundColor: 'rgba(17, 106, 204, 1)',
            borderColor: 'rgba(17, 106, 204, 1)',
            borderRadius: 5,
            barPercentage: 0.5,
            categoryPercentage: 0.5,
          },
        ],
      };

      const balanceValues = Object.values(monthlyBalanceData);
      const minValue = Math.min(...balanceValues);
      const maxValue = Math.max(...balanceValues);

      if (balanceChartInstance) {
        balanceChartInstance.destroy();
      }

      const balanceCtx = balanceChartRef.current.getContext('2d');
      const newBalanceChartInstance = new Chart(balanceCtx, {
        type: 'bar',
        data: balanceChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#666', font: { size: 18, weight: 700 } },
              border: { display: false },
            },
            y: {
              beginAtZero: true,
              suggestedMax: maxValue * 1.1,
              grid: { display: false },
              position: 'right',
              ticks: { color: '#666', font: { size: 12 } },
              border: { display: false },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0,0,0,0.7)',
              titleFont: { size: 12 },
              bodyFont: { size: 12 },
              footerFont: { size: 12 },
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
      });
      setBalanceChartInstance(newBalanceChartInstance);

      // Создание графика транзакций
      const transactionsChartData = {
        labels: months,
        datasets: [
          {
            label: 'Доход',
            data: months.map((month) => monthlyTransactionsData[month].income),
            backgroundColor: 'rgba(76, 175, 80, 1)',
            borderColor: 'rgba(76, 175, 80, 1)',
            borderRadius: 5,
            barPercentage: 0.5,
            categoryPercentage: 0.5,
          },
          {
            label: 'Расход',
            data: months.map((month) => monthlyTransactionsData[month].expense),
            backgroundColor: 'rgba(244, 67, 54, 1)',
            borderColor: 'rgba(244, 67, 54, 1)',
            borderRadius: 5,
            barPercentage: 0.5,
            categoryPercentage: 0.5,
          },
        ],
      };

      const incomeValues = months.map((month) => monthlyTransactionsData[month].income);
      const expenseValues = months.map((month) => monthlyTransactionsData[month].expense);
      const maxTransactionValue = Math.max(...incomeValues, ...expenseValues);

      if (transactionsChartInstance) {
        transactionsChartInstance.destroy();
      }

      const transactionsCtx = transactionsChartRef.current.getContext('2d');
      const newTransactionsChartInstance = new Chart(transactionsCtx, {
        type: 'bar',
        data: transactionsChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#666', font: { size: 18, weight: 700 } },
              border: { display: false },
            },
            y: {
              beginAtZero: true,
              suggestedMax: maxTransactionValue * 1.1,
              grid: { display: false },
              position: 'right',
              ticks: { color: '#666', font: { size: 12 } },
              border: { display: false },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0,0,0,0.7)',
              titleFont: { size: 12 },
              bodyFont: { size: 12 },
              footerFont: { size: 12 },
              callbacks: {
                label: function (context) {
                  return `${context.dataset.label}: ${context.raw.toFixed(2)} ₽`;
                },
              },
            },
          },
        },
      });
      setTransactionsChartInstance(newTransactionsChartInstance);
    }
  }, [accountData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Header />
      <main className="main-account ">
        <div className="container">
          <div className="account-details grid-main">
            <h1 className="account-details__h1 grid-h1">Просмотр счёта</h1>
            <button className="account-details__btn grid-btn" onClick={() => navigate(-1)}>
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
            <p className="account-details__numb grid-numb">
              № {accountData?.account || 'Нет данных'}
            </p>
            <p className="account-details__balance  grid-balance-numb">
              Баланс: {accountData?.balance || 'Нет данных'} ₽
            </p>

            <div className="balance grid-balans-graph">
              <h2 className="balance__h2">Динамика баланса</h2>
              <div className="chart-container">
                <canvas ref={balanceChartRef} />
              </div>
            </div>

            <div className="balance-transaction grid-trans-graph">
              <h2 className="balance-transaction__h2">Соотношение входящих исходящих транзакций</h2>
              <div className="chart-container-trans">
                <canvas ref={transactionsChartRef} />
              </div>
            </div>

            <div className="transactions-history grid-history">
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
                  {accountData?.transactions?.slice(-25).length > 0 ? (
                    accountData.transactions.slice(-25).map((transaction) => (
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

export default AccountStatisticsPage;
