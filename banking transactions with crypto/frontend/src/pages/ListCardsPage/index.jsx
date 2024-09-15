import { useState, useMemo } from 'react';
import { Header } from "../../components/Header";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAccounts } from '../../api/accountsApi'; 
import { ListCard } from '../../components/ListCard';
import { CreateCheck } from '../../components/CreateCheck';
import './style.scss';

const ListCardsPage = () => {
  const [sortValue, setSortValue] = useState('option1'); 

  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
    refetchInterval: 30000,
    enabled: true  
  },
  queryClient
);

  const accounts = useMemo(() => (data ? data.payload : []), [data]);

  const handleChange = (event) => {
    setSortValue(event.target.value);
  };

  if (isLoading) return <div>Загрузка счетов...</div>;
  if (error) return <div>Ошибка: {error.message}</div>;

  return (
    <>
      <Header />
      <main className="processing">
        <div className="container">
          <div className="processing__block">
              <form action="#" className="processing__form">
                  <label htmlFor="sort" className="processing__label">
                    <h2>Ваши счета</h2>
                    <select
                      className="processing__select processing__select--disabled"
                      name="sort"
                      id="sort"
                      value={sortValue} 
                      onChange={handleChange} 
                      disabled 
                    >
                      <option value="option1" className="processing__option">Сортировка</option>
                      <option value="option2" className="processing__option">По номеру</option>
                      <option value="option3" className="processing__option">По балансу</option>
                      <option value="option4" className="processing__option">По последней транзакции</option>
                    </select>      
                  </label> 
              </form>
              <CreateCheck />
          </div>
          <div className="processing__list">
            {accounts && accounts.length > 0 ? (
              <ul className="processing__list__ul">
                {accounts.map((account) => (
                  <li className="processing__list__item" key={account.account}>
                    <ListCard account={account} />
                  </li>
                ))}
              </ul>
            ) : (
              <p>У вас нет счетов.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default ListCardsPage;
