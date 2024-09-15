import { validateResponse } from '../hooks/validateResponse';

const API_URL = 'http://localhost:3000';

export const login = async (login, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    await validateResponse(response);

    const data = await response.json();
    return data;
  } catch (error) {
    // Логгируем ошибку
    console.error('Error during login:', error.message);
    throw error;
  }
};
