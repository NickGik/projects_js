import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import './style.scss';

export const ListCard = ({ account }) => {
  const navigate = useNavigate();
  const { account: accountNumber, balance, transactions } = account;

  const lastTransaction = transactions.length > 0 ? transactions[0] : null;

  const handleOpenAccount = () => {
    navigate(`/account/${accountNumber}`);
  };

  return (
    <div className="card">
      <div className="card__info">
        <div className="card__details">
          <h3 className="card__number">{accountNumber}</h3>
          <p className="card__balance">{balance} ₽</p>
        </div>

        {lastTransaction ? ( 
        <div className="card__actions">
          <p className="card__last-transaction">
            Последняя транзакция: 
            {new Date(lastTransaction.date).toLocaleDateString()}
          </p>
          <p className="card__last-transaction">
            {lastTransaction.amount > 0 ? (
              <span className="transaction-income">+{lastTransaction.amount} ₽</span>
            ) : (
              <span className="transaction-expense">{lastTransaction.amount} ₽</span>
            )}
          </p>
        </div>
        ) : (
          <p className="list-card__no-transactions">Нет транзакций</p>
        )}
      </div>

      <button type="button" className="card__btn" onClick={handleOpenAccount}>Открыть</button>
    </div>
  );
};

ListCard.propTypes = {
  account: PropTypes.shape({
    account: PropTypes.string.isRequired,
    balance: PropTypes.number.isRequired,
    transactions: PropTypes.arrayOf(
      PropTypes.shape({
        amount: PropTypes.number.isRequired,
        date: PropTypes.string.isRequired,
        // ... другие поля транзакций
      })
    ).isRequired,
  }).isRequired,
};

export default ListCard;
