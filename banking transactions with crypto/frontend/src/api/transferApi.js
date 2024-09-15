const API_BASE_URL = 'http://localhost:3000';

export const transferFunds = async ({ from, to, amount }) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_BASE_URL}/transfer-funds`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, amount }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Ошибка при переводе средств:", error);
    throw error; 
  }
};
