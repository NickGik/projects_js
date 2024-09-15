const API_BASE_URL = 'http://localhost:3000';

export const getAccountDetails = async (id) => {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_BASE_URL}/account/${id}`, {
      headers: {
        'Authorization': `Basic ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Ошибка при получении деталей счета:", error);
    throw error;
  }
};