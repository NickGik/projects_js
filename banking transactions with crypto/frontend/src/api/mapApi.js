const API_BASE_URL = 'http://localhost:3000';

export const getMap = async () => {
  const token = localStorage.getItem('token'); 

  try {
    const response = await fetch(`${API_BASE_URL}/banks`, {
      headers: {
        'Authorization': `Basic ${token}` 
      },
    });

    if (!response.ok) {
      if (response.status === 401) { 
        console.error("Ошибка авторизации. Токен недействителен."); 
      }
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data.payload; 

  } catch (error) {
    console.error("Ошибка при получении данных:", error);
    throw error; 
  }
};