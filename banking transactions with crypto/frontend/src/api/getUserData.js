export const getUserData = async () => {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    } else {
      return null; 
    }

  } catch (error) {
    console.error("Ошибка при получении данных пользователя:", error);
    throw error; 
  }
};