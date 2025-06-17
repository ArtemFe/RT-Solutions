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
            const response = await fetch(`api/reg`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    username, 
                    email, 
                    password,
                    firstName,
                    lastName,
                    middleName,
                    address
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP ошибка! статус: ${response.status}`);
            }
            const data = await response.json();
            showGlobalMessage(data.message);
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            }
        } catch (err) {
            showGlobalMessage(err.message || 'Регистрация не успешна. Попробуйте снова.', 'error');
        }
    });
});