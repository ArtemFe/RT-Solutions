'use strict';

const apiUrl = 'http://localhost:5000/api';

function updateHeaderForLoggedInUser() {
    const registerBtn = document.querySelector('#registerBtn');
    const loginBtn = document.querySelector('#loginBtn');
    const cart = document.querySelector('#Cart');
    const fav = document.querySelector('#Fav');
    const lk = document.querySelector('#Lk');
    const logoutBtn = document.querySelector('#logoutBtn');

    if (registerBtn && loginBtn && cart && fav && lk && logoutBtn) {
        registerBtn.style.display = 'none';
        loginBtn.style.display = 'none';
        cart.style.display = 'block';
        fav.style.display = 'block';
        lk.style.display = 'block';
        logoutBtn.style.display = 'block';

        logoutBtn.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            updateHeaderForGuest();
            window.location.href = '/';
        };
    } else {
        console.error('Некоторые элементы не найдены');
    }
}

function updateHeaderForGuest() {
    const registerBtn = document.querySelector('#registerBtn');
    const loginBtn = document.querySelector('#loginBtn');
    const cart = document.querySelector('#Cart');
    const fav = document.querySelector('#Fav');
    const lk = document.querySelector('#Lk');
    const logoutBtn = document.querySelector('#logoutBtn');

    if (registerBtn && loginBtn && cart && fav && lk && logoutBtn) {
        registerBtn.style.display = 'block';
        loginBtn.style.display = 'block';
        cart.style.display = 'none';
        fav.style.display = 'none';
        lk.style.display = 'none';
        logoutBtn.style.display = 'none';
    } else {
        console.error('Некоторые элементы не найдены');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        updateHeaderForLoggedInUser();
    } else {
        updateHeaderForGuest();
    }

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();
            if (result.message) {
                console.log('Сообщение от сервера:', result.message);
            }
            if (result.token) {
                console.log('Токен:', result.token);
                localStorage.setItem('token', result.token); 
                updateHeaderForLoggedInUser(); 
                alert('Авторизация прошла успешно!');
                window.location.href = "/"; 
            } else {
                console.log('Токен не найден в ответе сервера');
                alert('Ошибка авторизации: токен не получен');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при авторизации');
        }
    });
});