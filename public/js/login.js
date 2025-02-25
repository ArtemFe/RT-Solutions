document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
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
        } else {
            console.log('Токен не найден в ответе сервера');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при авторизации');
    }
});