const API_BASE_URL = 'http://localhost:3000';

const token = localStorage.getItem('token');

export const getMyCurrencies = async () => {
  
    try {
      const response = await fetch(`${API_BASE_URL}/currencies`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
  
      const data = await response.json();
      return data.payload || {}; // Извлекаем данные из свойства `payload`
    } catch (error) {
      console.error("Ошибка при получении валют:", error);
      throw error; // Пробрасываем ошибку дальше для обработки в компоненте
    }
};

// Получаем список всех используемых валют
export const getAllCurrencies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/all-currencies`);
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data; // Предполагаем, что это массив валют
  } catch (error) {
    console.error("Ошибка при получении всех валют:", error);
    throw error;
  }
};

export const exchangeCurrency = async (from, to, amount) => {
  try {
    const response = await fetch(`${API_BASE_URL}/currency-buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, amount }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error("Ошибка при обмене валют:", error);
    throw error;
  }
};




