// Registration page logic
const API_URL = 'http://localhost:3000/api';

// Toast Notification System
const showToast = (message, type = 'info', title = '') => {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const titles = {
    success: title || 'Success',
    error: title || 'Error',
    warning: title || 'Warning',
    info: title || 'Info'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <div class="toast-content">
      <div class="toast-title">${titles[type]}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">&times;</button>
  `;

  container.appendChild(toast);

  // Close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    removeToast(toast);
  });

  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeToast(toast);
  }, 5000);
};

const removeToast = (toast) => {
  toast.classList.add('removing');
  setTimeout(() => {
    toast.remove();
  }, 300);
};

// Register form submission
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(registerForm);
      const username = formData.get('username');
      const email = formData.get('email');
      const password = formData.get('password');

      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (data.success) {
          showToast('Account created successfully! Redirecting to login...', 'success', 'Registration Complete');
          // Redirect to login page after 2 seconds
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 2000);
        } else {
          showToast(data.message || 'Registration failed', 'error', 'Registration Failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        showToast('Unable to connect to server', 'error', 'Registration Failed');
      }
    });
  }
});
