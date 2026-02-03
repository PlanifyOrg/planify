// Client-side application logic
document.addEventListener('DOMContentLoaded', () => {
  console.log('Planify client application loaded');

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

  // Form submissions
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('Login form submitted');
      // TODO: Implement login logic
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('Register form submitted');
      // TODO: Implement registration logic
    });
  }

  // Button handlers
  const createEventBtn = document.getElementById('createEventBtn');
  if (createEventBtn) {
    createEventBtn.addEventListener('click', () => {
      console.log('Create event clicked');
      // TODO: Implement event creation
    });
  }

  const createMeetingBtn = document.getElementById('createMeetingBtn');
  if (createMeetingBtn) {
    createMeetingBtn.addEventListener('click', () => {
      console.log('Create meeting clicked');
      // TODO: Implement meeting creation
    });
  }

  const createTaskBtn = document.getElementById('createTaskBtn');
  if (createTaskBtn) {
    createTaskBtn.addEventListener('click', () => {
      console.log('Create task clicked');
      // TODO: Implement task creation
    });
  }
});
