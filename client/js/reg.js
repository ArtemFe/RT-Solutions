'use strict'

import { showGlobalMessage } from './utils.js';

const apiUrl = '/api';

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const middleName = document.getElementById('middleName').value;
        const address = document.getElementById('address').value;

        if (password !== confirmPassword) {
            showGlobalMessage('Пароли не совпадают', 'error');
            return;
        }

        try {
            const userData = { 
                username, 
                email, 
                password,
                firstName,
                lastName,
                middleName,
                address
            };
            console.log('Отправляем данные на регистрацию:', userData);

            const response = await fetch(`/api/reg`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            console.log('Статус ответа:', response.status);
            const responseData = await response.json();
            console.log('Ответ сервера:', responseData);

            if (!response.ok) {
                throw new Error(responseData.message || `HTTP ошибка! статус: ${response.status}`);
            }
            showGlobalMessage(responseData.message);
            if (responseData.redirectUrl) {
                window.location.href = responseData.redirectUrl;
            }
        } catch (err) {
            console.error('Ошибка при регистрации:', err);
            showGlobalMessage(err.message || 'Регистрация не успешна. Попробуйте снова.', 'error');
        }
    });
});