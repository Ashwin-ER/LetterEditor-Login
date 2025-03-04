document.addEventListener('DOMContentLoaded', () => {
    // Form elements
    const loginForm = document.getElementById('loginFormElement');
    const signupForm = document.getElementById('signupFormElement');
    const loginContainer = document.getElementById('loginForm');
    const signupContainer = document.getElementById('signupForm');

    // Input elements
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const signupName = document.getElementById('signupName');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('confirmPassword');

    // Navigation links
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');

    // Check if user is already logged in
    const user = localStorage.getItem('currentUser');
    if (user) {
        window.showEditor();
    }

    // Form switching
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });

    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic validation
        if (!loginEmail.value || !loginPassword.value) {
            alert('Please fill in all fields');
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(loginEmail.value)) {
            alert('Please enter a valid email address');
            return;
        }

        // Password length validation
        if (loginPassword.value.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        // Simulate successful login
        const user = {
            name: loginEmail.value.split('@')[0],
            email: loginEmail.value
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.showEditor();
        loginForm.reset();
    });

    // Signup form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get the submit button and disable it
        const submitButton = signupForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Creating Account...';

        try {
            // Basic validation
            if (!signupName.value || !signupEmail.value || !signupPassword.value || !confirmPassword.value) {
                throw new Error('Please fill in all fields');
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(signupEmail.value)) {
                throw new Error('Please enter a valid email address');
            }

            // Password strength validation
            const password = signupPassword.value;
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            
            if (password.length < 8) {
                throw new Error('Password must be at least 8 characters long');
            }
            if (!hasUpperCase || !hasLowerCase) {
                throw new Error('Password must contain both uppercase and lowercase letters');
            }
            if (!hasNumbers) {
                throw new Error('Password must contain at least one number');
            }
            if (!hasSpecialChar) {
                throw new Error('Password must contain at least one special character');
            }

            // Password match validation
            if (signupPassword.value !== confirmPassword.value) {
                throw new Error('Passwords do not match');
            }

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create user object
            const user = {
                name: signupName.value,
                email: signupEmail.value
            };

            // Store user in localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Account created successfully!';
            signupForm.insertBefore(successMessage, signupForm.firstChild);
            
            // Remove success message after 2 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 2000);

            // Show the editor
            window.showEditor();
            
            // Reset form
            signupForm.reset();
        } catch (error) {
            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = error.message;
            signupForm.insertBefore(errorMessage, signupForm.firstChild);
            
            // Remove error message after 3 seconds
            setTimeout(() => {
                errorMessage.remove();
            }, 3000);
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });

    // Real-time validation for login form
    loginEmail.addEventListener('input', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(loginEmail.value)) {
            loginEmail.style.borderBottomColor = '#ff4444';
        } else {
            loginEmail.style.borderBottomColor = '#4b6cb7';
        }
    });

    loginPassword.addEventListener('input', () => {
        if (loginPassword.value.length < 6) {
            loginPassword.style.borderBottomColor = '#ff4444';
        } else {
            loginPassword.style.borderBottomColor = '#4b6cb7';
        }
    });

    // Real-time validation for signup form
    signupEmail.addEventListener('input', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(signupEmail.value)) {
            signupEmail.style.borderBottomColor = '#ff4444';
        } else {
            signupEmail.style.borderBottomColor = '#4b6cb7';
        }
    });

    signupPassword.addEventListener('input', () => {
        if (signupPassword.value.length < 6) {
            signupPassword.style.borderBottomColor = '#ff4444';
        } else {
            signupPassword.style.borderBottomColor = '#4b6cb7';
        }
    });

    confirmPassword.addEventListener('input', () => {
        if (signupPassword.value !== confirmPassword.value) {
            confirmPassword.style.borderBottomColor = '#ff4444';
        } else {
            confirmPassword.style.borderBottomColor = '#4b6cb7';
        }
    });
});

// Google Sign-In callback function
function handleCredentialResponse(response) {
    // Decode the JWT token
    const responsePayload = jwt_decode(response.credential);
    
    // Create user object
    const user = {
        name: responsePayload.name,
        email: responsePayload.email
    };
    
    // Store user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Show the editor
    window.showEditor();
} 