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
  const meetingModal = document.getElementById('meetingModal');
  const createMeetingBtn = document.getElementById('createMeetingBtn');
  const cancelMeetingBtn = document.getElementById('cancelMeetingBtn');
  const meetingForm = document.getElementById('meetingForm');
  const participantsList = document.getElementById('participantsList');
  const agendaItemsList = document.getElementById('agendaItemsList');
  const meetingEventSelect = document.getElementById('meetingEventSelect');
  
  let meetingParticipants = [];
  let agendaItems = [];
  let agendaCounter = 0;

  if (createMeetingBtn) {
    createMeetingBtn.addEventListener('click', async () => {
      if (!currentUser) {
        alert('Please login first!');
        loginModal.style.display = 'block';
        return;
      }

      // Load user's events into the select dropdown
      try {
        const response = await fetch(`${API_URL}/events/user/${currentUser.id}`);
        const data = await response.json();
        
        meetingEventSelect.innerHTML = '<option value="">-- Select an Event --</option>';
        if (data.success && data.data.length > 0) {
          data.data.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = event.title;
            meetingEventSelect.appendChild(option);
          });
        }
      } catch (error) {
        console.error('Failed to load events:', error);
      }

      meetingModal.style.display = 'block';
    });
  }

  if (cancelMeetingBtn) {
    cancelMeetingBtn.addEventListener('click', () => {
      meetingModal.style.display = 'none';
      meetingForm.reset();
      meetingParticipants = [];
      agendaItems = [];
      participantsList.innerHTML = '';
      agendaItemsList.innerHTML = '';
    });
  }

  // Add participant
  const addParticipantBtn = document.getElementById('addParticipantBtn');
  const participantInput = document.getElementById('participantInput');
  
  if (addParticipantBtn) {
    addParticipantBtn.addEventListener('click', () => {
      const userId = participantInput.value.trim();
      if (userId && !meetingParticipants.includes(userId)) {
        meetingParticipants.push(userId);
        renderParticipants();
        participantInput.value = '';
      }
    });
  }

  function renderParticipants() {
    participantsList.innerHTML = '';
    meetingParticipants.forEach(userId => {
      const tag = document.createElement('div');
      tag.className = 'participant-tag';
      tag.innerHTML = `
        <span>${userId}</span>
        <button class="remove-btn" onclick="removeParticipant('${userId}')">&times;</button>
      `;
      participantsList.appendChild(tag);
    });
  }

  window.removeParticipant = function(userId) {
    meetingParticipants = meetingParticipants.filter(id => id !== userId);
    renderParticipants();
  };

  // Add agenda item
  const addAgendaBtn = document.getElementById('addAgendaBtn');
  
  if (addAgendaBtn) {
    addAgendaBtn.addEventListener('click', () => {
      const itemId = `agenda_${agendaCounter++}`;
      agendaItems.push({
        id: itemId,
        title: '',
        duration: 15,
        orderIndex: agendaItems.length
      });
      renderAgendaItems();
    });
  }

  function renderAgendaItems() {
    agendaItemsList.innerHTML = '';
    agendaItems.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'agenda-item';
      itemDiv.innerHTML = `
        <input type="text" placeholder="Agenda item title" value="${item.title}" 
               onchange="updateAgendaItem('${item.id}', 'title', this.value)">
        <input type="number" min="5" step="5" value="${item.duration}" 
               placeholder="Duration (min)" 
               onchange="updateAgendaItem('${item.id}', 'duration', this.value)">
        <button class="remove-agenda-btn" onclick="removeAgendaItem('${item.id}')">Remove</button>
      `;
      agendaItemsList.appendChild(itemDiv);
    });
  }

  window.updateAgendaItem = function(id, field, value) {
    const item = agendaItems.find(a => a.id === id);
    if (item) {
      item[field] = field === 'duration' ? parseInt(value) : value;
    }
  };

  window.removeAgendaItem = function(id) {
    agendaItems = agendaItems.filter(item => item.id !== id);
    // Update order indices
    agendaItems.forEach((item, index) => {
      item.orderIndex = index;
    });
    renderAgendaItems();
  };

  // Submit meeting form
  if (meetingForm) {
    meetingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(meetingForm);
      const templates = [];
      
      if (formData.get('createNotes')) templates.push('notes');
      if (formData.get('createMinutes')) templates.push('minutes');
      if (formData.get('createProtocol')) templates.push('protocol');

      const meetingData = {
        eventId: formData.get('eventId'),
        title: formData.get('title'),
        description: formData.get('description'),
        scheduledTime: new Date(formData.get('scheduledTime')),
        duration: parseInt(formData.get('duration')),
        participants: [currentUser.id, ...meetingParticipants],
        agendaItems: agendaItems.filter(item => item.title.trim() !== ''),
      };

      try {
        // Create meeting
        const response = await fetch(`${API_URL}/meetings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(meetingData),
        });

        const data = await response.json();

        if (data.success) {
          // Create document templates if selected
          for (const templateType of templates) {
            const docContent = generateDocumentTemplate(templateType, meetingData);
            await fetch(`${API_URL}/meetings/${data.data.id}/documents`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} - ${meetingData.title}`,
                content: docContent,
                type: templateType,
                createdBy: currentUser.id,
              }),
            });
          }

          alert('Meeting created successfully!');
          meetingModal.style.display = 'none';
          meetingForm.reset();
          meetingParticipants = [];
          agendaItems = [];
          participantsList.innerHTML = '';
          agendaItemsList.innerHTML = '';
          loadUserData();
        } else {
          alert(data.message || 'Failed to create meeting');
        }
      } catch (error) {
        console.error('Create meeting error:', error);
        alert('Failed to create meeting. Please try again.');
      }
    });
  }

  function generateDocumentTemplate(type, meetingData) {
    const date = new Date(meetingData.scheduledTime).toLocaleDateString();
    const time = new Date(meetingData.scheduledTime).toLocaleTimeString();
    
    switch (type) {
      case 'notes':
        return `Meeting Notes
Title: ${meetingData.title}
Date: ${date} at ${time}
Duration: ${meetingData.duration} minutes

Description:
${meetingData.description || 'No description provided'}

Agenda:
${meetingData.agendaItems.map((item, i) => `${i + 1}. ${item.title} (${item.duration || 0} min)`).join('\n') || 'No agenda items'}

Notes:
[Add your notes here during the meeting]
`;

      case 'minutes':
        return `Meeting Minutes
Title: ${meetingData.title}
Date: ${date} at ${time}
Attendees: ${meetingData.participants.length} participant(s)

Agenda Items:
${meetingData.agendaItems.map((item, i) => `${i + 1}. ${item.title}`).join('\n') || 'No agenda items'}

Discussion Points:
[To be filled during the meeting]

Action Items:
[List action items and assignments]

Next Steps:
[Define next steps]
`;

      case 'protocol':
        return `Meeting Protocol
Title: ${meetingData.title}
Date: ${date} at ${time}
Duration: ${meetingData.duration} minutes

Participants: ${meetingData.participants.length}
Status: Scheduled

Agenda:
${meetingData.agendaItems.map((item, i) => `${i + 1}. ${item.title} - ${item.duration || 0} min`).join('\n') || 'No agenda items'}

Decisions Made:
[To be documented]

Follow-up Required:
[List follow-up actions]
`;

      default:
        return `Document for ${meetingData.title}\n\n[Content here]`;
    }
  }

  // Load meetings for display
  async function loadMeetings() {
    if (!currentUser) return;

    try {
      // Get user's events first
      const eventsResponse = await fetch(`${API_URL}/events/user/${currentUser.id}`);
      const eventsData = await eventsResponse.json();
      
      if (!eventsData.success || !eventsData.data.length) return;

      const meetingList = document.querySelector('.meeting-list');
      meetingList.innerHTML = '';

      // Load meetings for each event
      for (const event of eventsData.data) {
        const meetingsResponse = await fetch(`${API_URL}/meetings/event/${event.id}`);
        const meetingsData = await meetingsResponse.json();

        if (meetingsData.success && meetingsData.data.length > 0) {
          meetingsData.data.forEach(meeting => {
            const meetingCard = document.createElement('div');
            meetingCard.className = 'card';
            meetingCard.innerHTML = `
              <h3>${meeting.title}</h3>
              <p><strong>Event:</strong> ${event.title}</p>
              <p><strong>Time:</strong> ${new Date(meeting.scheduledTime).toLocaleString()}</p>
              <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
              <p><strong>Participants:</strong> ${meeting.participants.length}</p>
              <p><strong>Agenda Items:</strong> ${meeting.agendaItems.length}</p>
              <p><strong>Status:</strong> <span class="status-badge ${meeting.status}">${meeting.status}</span></p>
              <button class="btn btn-secondary" onclick="viewMeetingDetails('${meeting.id}')">View Details</button>
            `;
            meetingList.appendChild(meetingCard);
          });
        }
      }

      if (meetingList.innerHTML === '') {
        meetingList.innerHTML = '<p>No meetings yet. Create your first meeting!</p>';
      }
    } catch (error) {
      console.error('Failed to load meetings:', error);
    }
  }

  // View meeting details
  window.viewMeetingDetails = async function(meetingId) {
    try {
      const response = await fetch(`${API_URL}/meetings/${meetingId}`);
      const data = await response.json();

      if (data.success) {
        const meeting = data.data;
        const detailModal = document.getElementById('meetingDetailModal');
        const detailContent = document.getElementById('meetingDetailContent');

        detailContent.innerHTML = `
          <div class="meeting-header">
            <h2>${meeting.title}</h2>
            <p>${meeting.description || 'No description'}</p>
          </div>

          <div class="meeting-info">
            <div class="info-card">
              <h4>Scheduled Time</h4>
              <p>${new Date(meeting.scheduledTime).toLocaleString()}</p>
            </div>
            <div class="info-card">
              <h4>Duration</h4>
              <p>${meeting.duration} minutes</p>
            </div>
            <div class="info-card">
              <h4>Status</h4>
              <p class="status-badge ${meeting.status}">${meeting.status}</p>
            </div>
          </div>

          <div class="form-section">
            <h3>Participants (${meeting.participants.length})</h3>
            <div class="participants-grid">
              ${meeting.participants.map(p => `
                <div class="participant-card ${p.checkedIn ? 'checked-in' : ''}">
                  <span>${p.userId}</span>
                  <span class="checkin-status ${p.checkedIn ? 'checked-in' : 'not-checked-in'}">
                    ${p.checkedIn ? '✓ Checked In' : 'Not Checked In'}
                  </span>
                  ${!p.checkedIn && p.userId === currentUser.id ? `
                    <button class="btn btn-primary btn-sm" onclick="checkInToMeeting('${meeting.id}', '${p.userId}')">Check In</button>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <div class="form-section">
            <h3>Agenda (${meeting.agendaItems.length} items)</h3>
            <ul class="agenda-items-list">
              ${meeting.agendaItems.length > 0 ? meeting.agendaItems.map(item => `
                <li class="${item.isCompleted ? 'completed' : ''}">
                  <div>
                    <strong>${item.title}</strong>
                    ${item.description ? `<p>${item.description}</p>` : ''}
                    ${item.duration ? `<small>${item.duration} minutes</small>` : ''}
                  </div>
                  ${item.isCompleted ? '<span>✓ Completed</span>' : ''}
                </li>
              `).join('') : '<p>No agenda items</p>'}
            </ul>
          </div>

          <div class="form-section">
            <h3>Documents (${meeting.documents.length})</h3>
            <div class="documents-list">
              ${meeting.documents.length > 0 ? meeting.documents.map(doc => `
                <div class="document-card">
                  <h4>${doc.title}</h4>
                  <span class="document-type-badge">${doc.type}</span>
                  <div class="document-content">${doc.content}</div>
                  <small>Created: ${new Date(doc.createdAt).toLocaleString()}</small>
                </div>
              `).join('') : '<p>No documents yet</p>'}
            </div>
          </div>
        `;

        detailModal.style.display = 'block';
      }
    } catch (error) {
      console.error('Failed to load meeting details:', error);
      alert('Failed to load meeting details');
    }
  };

  // Check in to meeting
  window.checkInToMeeting = async function(meetingId, userId) {
    try {
      const response = await fetch(`${API_URL}/meetings/${meetingId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Checked in successfully!');
        viewMeetingDetails(meetingId); // Refresh the view
      } else {
        alert(data.message || 'Failed to check in');
      }
    } catch (error) {
      console.error('Check in error:', error);
      alert('Failed to check in');
    }
  };

  // Update loadUserData to include meetings
  const originalLoadUserData = loadUserData;
  loadUserData = async function() {
    await originalLoadUserData();
    await loadMeetings();
  };

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
