document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('login').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login, password })
    });

    const result = await response.json();
    if (response.ok) {
        document.getElementById('message').innerText = 'Login successful! Token: ' + result.token;
        localStorage.setItem('token', result.token);
    } else {
        document.getElementById('message').innerText = result.message || 'Login failed!';
    }
});