document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        const username = usernameInput.value;
        const password = passwordInput.value;

        // Replace with your actual authentication logic
        if (username === 'user' && password === 'password') {
            // Redirect to the algorithms page AFTER successful login
            window.location.href = 'algorithm.html';
        } else {
            loginError.textContent = 'Invalid username or password.';
        }
    });
});