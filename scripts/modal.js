document.getElementById('loginBtn').addEventListener('click', function() {
    showForm('login');
});

document.getElementById('registerBtn').addEventListener('click', function() {
    showForm('register');
});

function showForm(type) {
    const formContainer = document.getElementById('formContainer');
    formContainer.innerHTML = '';

    const form = document.createElement('div');
    form.classList.add('form');

    if (type === 'login') {
        form.innerHTML = `
            <h2>Login</h2>
            <label for="username">Login:</label>
            <input type="text" id="username" required>
            <label for="password">Password:</label>
            <input type="password" id="password" required>
            <button id="submitLogin">Login</button>
            <button id="closeForm">Close</button>
        `;
    } else if (type === 'register') {
        form.innerHTML = `
            <h2>Register</h2>
            <label for="newUsername">Login:</label>
            <input type="text" id="newUsername" required>
            <label for="newUsername">Email:</label>
            <input type="email" id="newUsername" required>
            <label for="newPassword">Password:</label>
            <input type="password" id="newPassword" required>
            <label for="newPassword">Repeat password:</label>
            <input type="password" id="newPassword" required>
            <button id="submitRegister">Register</button>
            <button id="closeForm">Close</button>
        `;
    }

    formContainer.appendChild(form);
    formContainer.classList.add('active');

    // Close form functionality
    document.getElementById('closeForm').addEventListener('click', function() {
        formContainer.classList.remove('active');
        setTimeout(() => {
            formContainer.innerHTML = ''; // Clear form after animation
        }, 500); // Match the duration of the CSS transition
    });
}