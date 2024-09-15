// src/api/createCheckApi.js
const BASE_URL = 'http://localhost:3000';

export async function createCheck(checkData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/create-check`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${token}`
        },
        body: JSON.stringify(checkData),
    });

    if (!response.ok) {
        throw new Error('Ошибка при создании чека');
    }

    return response.json();
}

export default createCheck;
