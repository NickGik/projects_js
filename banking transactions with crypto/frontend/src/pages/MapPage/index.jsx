import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from "../../components/Header";
import { getMap } from '../../api/mapApi';
import './style.scss';

export const MapPage = () => {
  const mapRef = useRef(null);
  const ymapRef = useRef(null);

  const { isLoading, error, data: bankomats } = useQuery({
    queryKey: ['bankomats'], 
    queryFn: getMap,
  });

  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve(script);
        script.onerror = () => reject(new Error(`Failed to load script ${src}`));
        document.head.appendChild(script);
      });
    };

    const initMap = () => {
      if (ymapRef.current) return; 

      ymapRef.current = new window.ymaps.Map(mapRef.current, {
        center: [55.75, 37.57], 
        zoom: 9, 
      });

      if (bankomats) {
        bankomats.forEach(bankomat => {
          const placemark = new window.ymaps.Placemark([bankomat.lat, bankomat.lon], {
            balloonContent: 'Банкомат',
          });
          ymapRef.current.geoObjects.add(placemark);
        });
      }
    };

    loadScript('https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=ВАШ_API_КЛЮЧ_ЯНДЕКС.КАРТ')
      .then(() => {
        window.ymaps.ready(initMap);
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      if (ymapRef.current) {
        ymapRef.current.destroy();
        ymapRef.current = null;
      }
    };
  }, [bankomats]);

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка при загрузке данных: {error.message}</div>;

  return (
    <>
      <main>
        <Header />
        <div className="container">
          <div className='block-map'>
            <h1 className='map__h1'>Карта банкоматов</h1>
            <div className='map' ref={mapRef} style={{ width: '100%', height: '700px' }}></div>
          </div>
        </div>
      </main>
    </>
  );
};

export default MapPage;
