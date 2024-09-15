import { useMutation } from '@tanstack/react-query';
import { createCheck } from '../../api/createCheckApi';
import { Spinner } from '../Spinner'; 
import './style.scss';

export const CreateCheck = () => {
  const { mutate: createCheckMutation, isLoading, error } = useMutation(createCheck, {
    onSuccess: (data) => {
      console.log('Check created successfully:', data);
    },
    onError: (error) => {
      console.error('Error creating check:', error);
    },
  });

  const handleCreateCheck = () => {
    createCheckMutation();
  };

  return (
    <div className="create-check">
      <button type="button" className="create-check__btn" onClick={handleCreateCheck} disabled={isLoading}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.99999 7.69167e-06L8 8.00001M8 8.00001L8.00001 16M8 8.00001L16 8.00001M8 8.00001L0 8" stroke="white" strokeWidth="2"/>
        </svg>
        <span>Создать новый счёт</span>
        {isLoading && <div className="loading"><Spinner /></div>} 
        {error && <p className="error">Ошибка создания счёта: {error.message}</p>}
      </button>
    </div>
  );
};

export default CreateCheck;