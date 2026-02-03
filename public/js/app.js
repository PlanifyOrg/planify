// Client-side application logic
const API_URL = 'http://localhost:3000/api';
let currentUser = null;

// Check if user is logged in
const checkAuth = () => {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateUIForLoggedInUser();
  }
};

// Update UI when user is logged in
const updateUIForLoggedInUser = () => {
  const authButtons = document.querySelector('.auth-buttons');
  if (authButtons && currentUser) {
    authButtons.innerHTML = `
      <span style="margin-right: 1rem;">Welcome, ${currentUser.username}!</span>
      <button class="btn btn-secondary" id="logoutBtn">Logout</button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', logout);
    loadUserData();
  }
};

// Logout function
const logout = () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  location.reload();
};

// Load user's events
const loadUserData = async () => {
  if (!currentUser) return;

  try {
    // Load events
    const eventsResponse = await fetch(`${API_URL}/events/user/${currentUser.id}`);
    const eventsData = await eventsResponse.json();
    
    if (eventsData.success) {
      displayEvents(eventsData.data);
    }

    // Load notifications
    const notificationsResponse = await fetch(`${API_URL}/notifications/user/${currentUser.id}`);
    const notificationsData = await notificationsResponse.json();
    
    if (notificationsData.success) {
      displayNotifications(notificationsData.data);
    }
  } catch (error) {
    console.error('Failed to load user data:', error);
  }
};

// Display events in the UI
const displayEvents = (events) => {
  const eventList = document.querySelector('.event-list');
  if (!eventList) return;

  if (events.length === 0) {
    eventList.innerHTML = '<p>No events yet. Create your first event!</p>';
    return;
  }

  eventList.innerHTML = events.map(event => `
    <div class="card" style="margin-bottom: 1rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px;">
      <h3>${event.title}</h3>
      <p>${event.description}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p><strong>Start:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
      <p><strong>Status:</strong> ${event.status}</p>
      <p><strong>Participants:</strong> ${event.participants.length}</p>
    </div>
  `).join('');
};

// Display notifications
const displayNotifications = (notifications) => {
  const notificationList = document.querySelector('.notification-list');
  if (!notificationList) return;

  if (notifications.length === 0) {
    notificationList.innerHTML = '<p>No notifications</p>';
    return;
  }

  notificationList.innerHTML = notifications.map(notification => `
    <div class="card" style="margin-bottom: 1rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; ${!notification.isRead ? 'background-color: #e8f4f8;' : ''}">
      <h4>${notification.title}</h4>
      <p>${notification.message}</p>
      <small>${new Date(notification.createdAt).toLocaleString()}</small>
    </div>
  `).join('');
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('Planify client application loaded');
  checkAuth();

  // Modal handling
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const closeBtns = document.getElementsByClassName('close');

  // Open login modal
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      if (loginModal) {
        loginModal.style.display = 'block';
      }
    });
  }

  // Open register modal
  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      if (registerModal) {
        registerModal.style.display = 'block';
      }
    });
  }

  // Close modals
  Array.from(closeBtns).forEach((btn) => {
    btn.addEventListener('click', () => {
      if (loginModal) loginModal.style.display = 'none';
      if (registerModal) registerModal.style.display = 'none';
    });
  });

  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
      loginModal.style.display = 'none';
    }
    if (event.target === registerModal) {
      registerModal.style.display = 'none';
    }
  });

  // Login form submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const username = formData.get('username');
      const password = formData.get('password');

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.success) {
          currentUser = data.data;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          loginModal.style.display = 'none';
          alert('Login successful!');
          location.reload();
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
      }
    });
  }

  // Register form submission
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
          alert('Registration successful! Please login.');
          registerModal.style.display = 'none';
          loginModal.style.display = 'block';
        } else {
          alert(data.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
      }
    });
  }

  // Create event button
  const createEventBtn = document.getElementById('createEventBtn');
  if (createEventBtn) {
    createEventBtn.addEventListener('click', async () => {
      if (!currentUser) {
        alert('Please login first!');
        loginModal.style.display = 'block';
        return;
      }

      const title = prompt('Event title:');
      if (!title) return;

      const description = prompt('Event description:');
      const location = prompt('Event location:');
      const startDate = prompt('Start date (YYYY-MM-DD):');
      const endDate = prompt('End date (YYYY-MM-DD):');

      try {
        const response = await fetch(`${API_URL}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizerId: currentUser.id,
            title,
            description,
            location,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          }),
        });

        const data = await response.json();

        if (data.success) {
          alert('Event created successfully!');
          loadUserData();
        } else {
          alert(data.message || 'Failed to create event');
        }
      } catch (error) {
        console.error('Create event error:', error);
        alert('Failed to create event. Please try again.');
      }
    });
  }

  // Create meeting button
  const createMeetingBtn = document.getElementById('createMeetingBtn');
  if (createMeetingBtn) {
    createMeetingBtn.addEventListener('click', () => {
      if (!currentUser) {
        alert('Please login first!');
        loginModal.style.display = 'block';
        return;
      }
      alert('Meeting creation coming soon!');
    });
  }

  // Create task button
  const createTaskBtn = document.getElementById('createTaskBtn');
  if (createTaskBtn) {
    createTaskBtn.addEventListener('click', () => {
      if (!currentUser) {
        alert('Please login first!');
        loginModal.style.display = 'block';
        return;
      }
      alert('Task creation coming soon!');
    });
  }
});
