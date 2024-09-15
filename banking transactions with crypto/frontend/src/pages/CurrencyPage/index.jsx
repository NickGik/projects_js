import { MyCurrencies } from '../../components/MyCurrencies';
import { RealTimeExchangeRates } from '../../components/RealTimeExchangeRates';
import { CurrencyExchange } from '../../components/CurrencyExchange';
import { Header } from '../../components/Header';
import './style.scss';

const CurrencyPage = () => {

  return (
    <>
    <Header />
    <main>
      <div className="container">
        <div className="currency">
          <h1 className="currency__h1">Валютный обмен</h1>
          <div className="currency-grid">
          
            <div className='currency-your'>
              <MyCurrencies />
            </div>

            <div className='currency-real'>
              <RealTimeExchangeRates />
            </div>

            <div className='currency-exchange'>
              <CurrencyExchange />
            </div>

          </div>
        </div>
        </div>
    </main>
    </>
  )
}

export default CurrencyPage;