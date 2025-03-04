// Form switching functionality
document.getElementById('showSignup').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
});

// Login form submission
document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if user exists in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Store current user
            localStorage.setItem('currentUser', JSON.stringify({
                name: user.name,
                email: user.email
            }));

            // Show success message
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to editor
            setTimeout(() => {
                window.location.href = 'letter-editor.html';
            }, 1500);
        } else {
            showMessage('Invalid email or password', 'error');
        }
    } catch (error) {
        showMessage('Error logging in. Please try again.', 'error');
    } finally {
        // Reset button state
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }
});

// Signup form submission
document.getElementById('signupFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Basic validation
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }

    try {
        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Creating Account...';

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(u => u.email === email)) {
            showMessage('Email already registered', 'error');
            return;
        }

        // Add new user
        users.push({ name, email, password });
        localStorage.setItem('users', JSON.stringify(users));

        // Store current user
        localStorage.setItem('currentUser', JSON.stringify({ name, email }));

        // Show success message
        showMessage('Account created successfully! Redirecting...', 'success');
        
        // Redirect to editor
        setTimeout(() => {
            window.location.href = 'letter-editor.html';
        }, 1500);
    } catch (error) {
        showMessage('Error creating account. Please try again.', 'error');
    } finally {
        // Reset button state
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Sign Up';
    }
});

// Google Sign-In
function handleCredentialResponse(response) {
    try {
        const responsePayload = jwt_decode(response.credential);
        const user = {
            name: responsePayload.name,
            email: responsePayload.email,
            picture: responsePayload.picture
        };
        
        // Store current user
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Show success message
        showMessage('Google Sign-In successful! Redirecting...', 'success');
        
        // Redirect to editor
        setTimeout(() => {
            window.location.href = 'letter-editor.html';
        }, 1500);
    } catch (error) {
        console.error('Error handling Google Sign-In:', error);
        showMessage('Error signing in with Google', 'error');
    }
}

// Add Google Sign-In button to both forms
document.addEventListener('DOMContentLoaded', () => {
    const googleButtons = document.querySelectorAll('.google-signin-btn');
    googleButtons.forEach(button => {
        button.addEventListener('click', () => {
            google.accounts.id.prompt();
        });
    });
});

// Utility function to show messages
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;

    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());

    // Add new message
    const formBox = document.querySelector('.form-box');
    formBox.insertBefore(messageDiv, formBox.firstChild);

    // Remove message after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
} 