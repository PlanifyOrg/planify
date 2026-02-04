// Client-side application logic
const API_URL = 'http://localhost:3000/api';
let currentUser = null;

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

// Check if user is logged in
const checkAuth = () => {
  const savedUser = localStorage.getItem('currentUser');
  const authView = document.getElementById('authView');
  const mainView = document.getElementById('mainView');
  
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    if (authView) authView.style.display = 'none';
    if (mainView) mainView.style.display = 'flex';
    updateUIForLoggedInUser();
  } else {
    if (authView) authView.style.display = 'flex';
    if (mainView) mainView.style.display = 'none';
  }
};

// Update UI when user is logged in
const updateUIForLoggedInUser = () => {
  const usernameEl = document.getElementById('currentUsername');
  const userAvatar = document.getElementById('userAvatar');
  
  if (usernameEl && currentUser) {
    usernameEl.textContent = currentUser.username;
  }
  
  if (userAvatar && currentUser) {
    userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  loadUserData();
};

// Logout function
const logout = () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  location.reload();
};

// Load user's events and meetings
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

    // Load meetings
    await loadMeetingsForUser();
  } catch (error) {
    console.error('Failed to load user data:', error);
  }
};

// Load meetings for the current user
const loadMeetingsForUser = async () => {
  if (!currentUser) return;

  try {
    // Get user's events first
    const eventsResponse = await fetch(`${API_URL}/events/user/${currentUser.id}`);
    const eventsData = await eventsResponse.json();
    
    const meetingList = document.getElementById('meetingsList');
    const emptyState = document.getElementById('meetingsEmpty');
    
    if (!meetingList) return;
    
    if (!eventsData.success || !eventsData.data.length) {
      meetingList.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    meetingList.innerHTML = '';
    let hasMeetings = false;

    // Load meetings for each event
    for (const event of eventsData.data) {
      const meetingsResponse = await fetch(`${API_URL}/meetings/event/${event.id}`);
      const meetingsData = await meetingsResponse.json();

      if (meetingsData.success && meetingsData.data.length > 0) {
        hasMeetings = true;
        meetingsData.data.forEach(meeting => {
          const meetingCard = document.createElement('div');
          meetingCard.className = 'meeting-card';
          meetingCard.innerHTML = `
            <h4>📋 ${meeting.title}</h4>
            <div class="meeting-info">
              <span>🗓️ ${new Date(meeting.scheduledTime).toLocaleString()}</span>
              <span>⏱️ ${meeting.duration} min</span>
              <span>👥 ${meeting.participants.length} participants</span>
              <span>📝 ${meeting.agendaItems.length} agenda items</span>
            </div>
            <div class="meeting-actions">
              <button class="btn btn-sm" onclick="viewMeetingDetails('${meeting.id}')">View Details</button>
              <button class="btn btn-sm btn-success" onclick="checkInToMeeting('${meeting.id}', '${currentUser.id}')">Check In</button>
            </div>
          `;
          meetingList.appendChild(meetingCard);
        });
      }
    }

    if (emptyState) {
      emptyState.style.display = hasMeetings ? 'none' : 'block';
    }
  } catch (error) {
    console.error('Failed to load meetings:', error);
  }
};

// Display events in the UI
const displayEvents = (events) => {
  const eventList = document.getElementById('eventsList');
  const emptyState = document.getElementById('eventsEmpty');
  
  if (!eventList) return;

  if (events.length === 0) {
    eventList.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  
  eventList.innerHTML = events.map(event => `
    <div class="event-card">
      <div class="event-card-header">
        <h3>${event.title}</h3>
        <div class="event-date">📅 ${new Date(event.startDate).toLocaleDateString()}</div>
      </div>
      <div class="event-card-body">
        <p class="event-description">${event.description || 'No description'}</p>
        <div class="event-meta">
          <div class="meta-item">
            <span>📍 <strong>Location:</strong> ${event.location}</span>
          </div>
          <div class="meta-item">
            <span>👥 <strong>Participants:</strong> ${event.participants.length}</span>
          </div>
          <div class="meta-item">
            <span>📊 <strong>Status:</strong> ${event.status}</span>
          </div>
        </div>
      </div>
      <div class="event-card-footer">
        <button class="btn btn-sm btn-secondary" onclick="editEvent('${event.id}')">Edit</button>
        <button class="btn btn-sm" onclick="viewEvent('${event.id}')">View Details</button>
      </div>
    </div>
  `).join('');
};

// Display notifications
const displayNotifications = (notifications) => {
  const notificationList = document.getElementById('notificationsList');
  const emptyState = document.getElementById('notificationsEmpty');
  
  if (!notificationList) return;

  if (notifications.length === 0) {
    notificationList.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  notificationList.innerHTML = notifications.map(notification => `
    <div class="notification-card ${!notification.isRead ? 'unread' : ''}">
      <div class="notification-icon">🔔</div>
      <div class="notification-content">
        <h4>${notification.title}</h4>
        <p>${notification.message}</p>
        <div class="notification-time">${new Date(notification.createdAt).toLocaleString()}</div>
      </div>
    </div>
  `).join('');
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('Planify client application loaded');
  
  // Tab navigation
  const tabButtons = document.querySelectorAll('.nav-tabs button');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.getAttribute('data-tab');
      
      // Update active button
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update active section
      const sections = document.querySelectorAll('.content-section');
      sections.forEach(section => section.classList.remove('active'));
      const activeSection = document.getElementById(`${tab}Section`);
      if (activeSection) {
        activeSection.classList.add('active');
      }
    });
  });

  checkAuth();

  // Login form submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    console.log('Login form found, attaching event listener');
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Login form submitted');
      
      const formData = new FormData(loginForm);
      const username = formData.get('username');
      const password = formData.get('password');

      console.log('Attempting login for:', username);

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        console.log('Login response:', data);

        if (data.success) {
          currentUser = data.data;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          showToast('Welcome back, ' + currentUser.username + '!', 'success', 'Login Successful');
          checkAuth(); // Switch to main view
        } else {
          showToast(data.message || 'Invalid credentials', 'error', 'Login Failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        showToast('Unable to connect to server', 'error', 'Login Failed');
      }
      
      return false;
    });
  } else {
    console.error('Login form not found!');
  }

  // Create event button
  const createEventBtn = document.getElementById('createEventBtn');
  if (createEventBtn) {
    createEventBtn.addEventListener('click', () => {
      if (!currentUser) {
        showToast('Please login first to create events', 'warning', 'Authentication Required');
        return;
      }
      openEventModal();
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
    createMeetingBtn.addEventListener('click', () => {
      if (!currentUser) {
        showToast('Please login first to plan meetings', 'warning', 'Authentication Required');
        return;
      }
      openMeetingModal();
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

      console.log('Creating meeting with data:', meetingData);

      try {
        // Create meeting
        const response = await fetch(`${API_URL}/meetings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(meetingData),
        });

        const data = await response.json();
        
        console.log('Meeting creation response:', data);

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

  // View meeting details
  window.viewMeetingDetails = async function(meetingId) {
    try {
      const response = await fetch(`${API_URL}/meetings/${meetingId}`);
      const data = await response.json();

      if (data.success) {
        const meeting = data.data;
        const detailModal = document.getElementById('meetingDetailModal');
        const detailContent = document.getElementById('meetingDetailContent');

        const checkedInCount = meeting.participants.filter(p => p.checkedIn).length;

        detailContent.innerHTML = `
          <div class="meeting-detail-header">
            <h2>${meeting.title}</h2>
            <p>${meeting.description || 'No description provided'}</p>
          </div>

          <div class="meeting-meta">
            <div class="meeting-meta-card">
              <div class="label">📅 Scheduled</div>
              <div class="value">${new Date(meeting.scheduledTime).toLocaleDateString()}</div>
              <div style="font-size: 0.9rem; color: #666;">${new Date(meeting.scheduledTime).toLocaleTimeString()}</div>
            </div>
            <div class="meeting-meta-card">
              <div class="label">⏱️ Duration</div>
              <div class="value">${meeting.duration}</div>
              <div style="font-size: 0.9rem; color: #666;">minutes</div>
            </div>
            <div class="meeting-meta-card">
              <div class="label">👥 Attendance</div>
              <div class="value">${checkedInCount}/${meeting.participants.length}</div>
              <div style="font-size: 0.9rem; color: #666;">checked in</div>
            </div>
            <div class="meeting-meta-card">
              <div class="label">📋 Status</div>
              <div class="value" style="font-size: 1.1rem; text-transform: uppercase;">${meeting.status}</div>
            </div>
          </div>

          <hr class="section-divider">

          <h3 style="margin-bottom: 1rem; color: var(--secondary-color);">👥 Participants</h3>
          <div class="participant-grid">
            ${meeting.participants.map(p => {
              const initial = p.userId.charAt(0).toUpperCase();
              return `
                <div class="participant-item ${p.checkedIn ? 'checked-in' : ''}">
                  <div class="participant-info">
                    <div class="participant-avatar">${initial}</div>
                    <div>
                      <div style="font-weight: 600;">${p.userId}</div>
                      ${p.checkedIn && p.checkedInAt ? `<div style="font-size: 0.8rem; color: #666;">at ${new Date(p.checkedInAt).toLocaleTimeString()}</div>` : ''}
                    </div>
                  </div>
                  ${p.checkedIn ? `
                    <span class="checkin-badge checked-in">✓ Checked In</span>
                  ` : p.userId === currentUser.id ? `
                    <button class="btn btn-primary" style="padding: 0.5rem 1rem;" onclick="checkInToMeeting('${meeting.id}', '${p.userId}')">Check In</button>
                  ` : `
                    <span class="checkin-badge pending">⏱ Pending</span>
                  `}
                </div>
              `;
            }).join('')}
          </div>

          <hr class="section-divider">

          <h3 style="margin-bottom: 1rem; color: var(--secondary-color);">📋 Agenda</h3>
          ${meeting.agendaItems.length > 0 ? `
            <div class="agenda-timeline">
              ${meeting.agendaItems.map((item, index) => `
                <div class="agenda-timeline-item ${item.isCompleted ? 'completed' : ''}">
                  <div class="agenda-item-header">
                    <div>
                      <span style="color: #999; font-size: 0.9rem; margin-right: 0.5rem;">#${index + 1}</span>
                      <span class="agenda-item-title">${item.title}</span>
                    </div>
                    ${item.duration ? `<span class="agenda-item-duration">⏱ ${item.duration} min</span>` : ''}
                  </div>
                  ${item.description ? `<div style="color: #666; margin-top: 0.5rem;">${item.description}</div>` : ''}
                  ${item.isCompleted ? '<div style="color: var(--success-color); margin-top: 0.5rem; font-weight: 600;">✓ Completed</div>' : ''}
                </div>
              `).join('')}
            </div>
          ` : '<p style="color: #999; font-style: italic;">No agenda items defined</p>'}

          <hr class="section-divider">

          <h3 style="margin-bottom: 1rem; color: var(--secondary-color);">📄 Documents</h3>
          ${meeting.documents.length > 0 ? `
            <div class="document-grid">
              ${meeting.documents.map(doc => `
                <div class="document-item">
                  <div class="document-header">
                    <span class="document-title">${doc.title}</span>
                    <span class="document-type ${doc.type}">${doc.type}</span>
                  </div>
                  <div class="document-body">${doc.content}</div>
                  <div class="document-footer">
                    Created by ${doc.createdBy} • ${new Date(doc.createdAt).toLocaleString()}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p style="color: #999; font-style: italic;">No documents yet</p>'}
        `;

        detailModal.style.display = 'block';
      }
    } catch (error) {
      console.error('Failed to load meeting details:', error);
      showToast('Unable to load meeting details', 'error', 'Load Failed');
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
        showToast('Checked in successfully!', 'success', 'Check-in Complete');
        viewMeetingDetails(meetingId); // Refresh the view
      } else {
        showToast(data.message || 'Failed to check in', 'error', 'Check-in Failed');
      }
    } catch (error) {
      console.error('Check in error:', error);
      showToast('Unable to check in', 'error', 'Check-in Failed');
    }
  };

  // Create task button
  const createTaskBtn = document.getElementById('createTaskBtn');
  if (createTaskBtn) {
    createTaskBtn.addEventListener('click', () => {
      if (!currentUser) {
        showToast('Please login first to create tasks', 'warning', 'Authentication Required');
        return;
      }
      showToast('Task creation feature coming soon!', 'info', 'Coming Soon');
    });
  }

  // Add empty state button listeners
  const createEventBtnEmpty = document.getElementById('createEventBtnEmpty');
  const createMeetingBtnEmpty = document.getElementById('createMeetingBtnEmpty');
  const createTaskBtnEmpty = document.getElementById('createTaskBtnEmpty');

  if (createEventBtnEmpty) {
    createEventBtnEmpty.addEventListener('click', () => openEventModal());
  }
  if (createMeetingBtnEmpty) {
    createMeetingBtnEmpty.addEventListener('click', () => openMeetingModal());
  }
  if (createTaskBtnEmpty) {
    createTaskBtnEmpty.addEventListener('click', () => {
      showToast('Task creation feature coming soon!', 'info', 'Coming Soon');
    });
  }
});

// Global modal control functions
window.openEventModal = function() {
  const modal = document.getElementById('eventModal');
  if (modal) {
    modal.classList.add('active');
    // Reset form
    document.getElementById('eventForm').reset();
  }
};

window.closeEventModal = function() {
  const modal = document.getElementById('eventModal');
  if (modal) {
    modal.classList.remove('active');
  }
};

window.submitEventForm = async function() {
  const form = document.getElementById('eventForm');
  const formData = new FormData(form);
  
  try {
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizerId: currentUser.id,
        title: formData.get('title'),
        description: formData.get('description'),
        location: formData.get('location'),
        startDate: new Date(formData.get('date')),
        endDate: new Date(formData.get('date')),
      }),
    });

    const data = await response.json();

    if (data.success) {
      showToast('Event created successfully!', 'success', 'Event Created');
      closeEventModal();
      loadUserData();
    } else {
      showToast(data.message || 'Failed to create event', 'error', 'Creation Failed');
    }
  } catch (error) {
    console.error('Create event error:', error);
    showToast('Unable to create event', 'error', 'Creation Failed');
  }
};

window.openMeetingModal = function() {
  const modal = document.getElementById('meetingModal');
  if (modal) {
    modal.classList.add('active');
    document.getElementById('meetingForm').reset();
    meetingParticipants = [];
    agendaItems = [];
    document.getElementById('participantsList').innerHTML = '';
    document.getElementById('agendaItemsList').innerHTML = '';
    loadEventsToSelect();
  }
};

window.closeMeetingModal = function() {
  const modal = document.getElementById('meetingModal');
  if (modal) {
    modal.classList.remove('active');
  }
};

window.submitMeetingForm = async function() {
  const form = document.getElementById('meetingForm');
  const formData = new FormData(form);

  // Get selected event
  const eventId = formData.get('eventId');
  if (!eventId) {
    showToast('Please select an event', 'warning', 'Missing Information');
    return;
  }

  // Get document templates
  const createNotes = formData.get('createNotes') === 'notes';
  const createMinutes = formData.get('createMinutes') === 'minutes';
  const createProtocol = formData.get('createProtocol') === 'protocol';

  const meetingData = {
    title: formData.get('title'),
    description: formData.get('description') || '',
    eventId: eventId,
    scheduledTime: new Date(formData.get('scheduledTime')),
    duration: parseInt(formData.get('duration')),
    organizerId: currentUser.id,
    participants: meetingParticipants,
    agendaItems: agendaItems,
    documents: []
  };

  // Add document templates
  if (createNotes) {
    meetingData.documents.push({
      type: 'notes',
      content: `Meeting Notes for: ${meetingData.title}\n\nDate: ${new Date().toLocaleDateString()}\n\n`
    });
  }
  if (createMinutes) {
    meetingData.documents.push({
      type: 'minutes',
      content: `Meeting Minutes\n\nTitle: ${meetingData.title}\nDate: ${new Date().toLocaleDateString()}\n\n`
    });
  }
  if (createProtocol) {
    meetingData.documents.push({
      type: 'protocol',
      content: `Meeting Protocol\n\nTitle: ${meetingData.title}\nDate: ${new Date().toLocaleDateString()}\n\n`
    });
  }

  try {
    const response = await fetch(`${API_URL}/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meetingData),
    });

    const data = await response.json();

    if (data.success) {
      showToast('Meeting created successfully!', 'success', 'Meeting Created');
      closeMeetingModal();
      loadUserData();
    } else {
      showToast(data.message || 'Failed to create meeting', 'error', 'Creation Failed');
    }
  } catch (error) {
    console.error('Create meeting error:', error);
    showToast('Unable to create meeting', 'error', 'Creation Failed');
  }
};

window.closeMeetingDetailModal = function() {
  const modal = document.getElementById('meetingDetailModal');
  if (modal) {
    modal.classList.remove('active');
  }
};

// View event details
window.viewEvent = async function(eventId) {
  try {
    const response = await fetch(`${API_URL}/events/${eventId}`);
    const data = await response.json();

    if (data.success && data.data) {
      const event = data.data;
      const modal = document.getElementById('eventDetailModal');
      const content = document.getElementById('eventDetailContent');

      if (!modal || !content) return;

      // Format dates
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      const duration = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));

      content.innerHTML = `
        <div class="event-detail-header" style="background: var(--primary-gradient); padding: 2rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem; color: white;">
          <h2 style="margin: 0 0 0.5rem 0; font-size: 2rem;">${event.title}</h2>
          <p style="margin: 0; opacity: 0.9;">${event.description || 'No description provided'}</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
          <div class="meta-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: var(--radius-lg); color: white;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📅</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">Start Date</div>
            <div style="font-size: 1.25rem; font-weight: 600;">${startDate.toLocaleDateString()}</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">${startDate.toLocaleTimeString()}</div>
          </div>

          <div class="meta-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 1.5rem; border-radius: var(--radius-lg); color: white;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏁</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">End Date</div>
            <div style="font-size: 1.25rem; font-weight: 600;">${endDate.toLocaleDateString()}</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">${endDate.toLocaleTimeString()}</div>
          </div>

          <div class="meta-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 1.5rem; border-radius: var(--radius-lg); color: white;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏱️</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">Duration</div>
            <div style="font-size: 1.25rem; font-weight: 600;">${duration} ${duration === 1 ? 'Day' : 'Days'}</div>
          </div>

          <div class="meta-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 1.5rem; border-radius: var(--radius-lg); color: white;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">Status</div>
            <div style="font-size: 1.25rem; font-weight: 600;">${event.status}</div>
          </div>
        </div>

        <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin-bottom: 1rem;">
          <h3 style="margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
            <span>📍</span> Location
          </h3>
          <p style="margin: 0; color: var(--text-secondary);">${event.location || 'No location specified'}</p>
        </div>

        <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <h3 style="margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
            <span>👥</span> Participants
          </h3>
          <div style="color: var(--text-secondary);">
            ${event.participants.length} participant(s)
          </div>
        </div>

        <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: flex-end;">
          <button class="btn btn-secondary" onclick="closeEventDetailModal()">Close</button>
          <button class="btn" onclick="closeEventDetailModal(); editEvent('${event.id}')">Edit Event</button>
        </div>
      `;

      // Add scroll indicator
      const scrollIndicator = document.createElement('div');
      scrollIndicator.className = 'modal-scroll-indicator';
      scrollIndicator.id = 'eventScrollIndicator';
      scrollIndicator.innerHTML = '<div class="scroll-arrow">↓</div>';
      content.appendChild(scrollIndicator);

      // Handle scroll indicator visibility
      const modalBody = content.parentElement;
      const updateScrollIndicator = () => {
        const isScrollable = modalBody.scrollHeight > modalBody.clientHeight;
        const isAtBottom = modalBody.scrollHeight - modalBody.scrollTop <= modalBody.clientHeight + 10;
        
        if (!isScrollable || isAtBottom) {
          scrollIndicator.classList.add('hidden');
        } else {
          scrollIndicator.classList.remove('hidden');
        }
      };

      modalBody.addEventListener('scroll', updateScrollIndicator);
      setTimeout(updateScrollIndicator, 100); // Initial check

      modal.classList.add('active');
    } else {
      showToast('Event not found', 'error', 'Error');
    }
  } catch (error) {
    console.error('View event error:', error);
    showToast('Unable to load event details', 'error', 'Error');
  }
};

// Close event detail modal
window.closeEventDetailModal = function() {
  const modal = document.getElementById('eventDetailModal');
  if (modal) {
    modal.classList.remove('active');
  }
};

// Edit event
window.editEvent = async function(eventId) {
  try {
    const response = await fetch(`${API_URL}/events/${eventId}`);
    const data = await response.json();

    if (data.success && data.data) {
      const event = data.data;
      const modal = document.getElementById('eventModal');
      const form = document.getElementById('eventForm');
      
      if (!modal || !form) return;

      // Update modal title
      const modalHeader = modal.querySelector('.modal-header h2');
      if (modalHeader) {
        modalHeader.textContent = 'Edit Event';
      }

      // Update submit button
      const modalFooter = modal.querySelector('.modal-footer');
      if (modalFooter) {
        modalFooter.innerHTML = `
          <button class="btn btn-secondary" onclick="closeEventModal(); resetEventModal()">Cancel</button>
          <button class="btn" onclick="updateEventForm('${eventId}')">Update Event</button>
        `;
      }

      // Populate form with event data
      form.elements['title'].value = event.title;
      form.elements['description'].value = event.description || '';
      form.elements['location'].value = event.location || '';
      
      // Format dates for datetime-local input
      const startDate = new Date(event.startDate);
      const formattedDate = startDate.toISOString().slice(0, 16);
      form.elements['date'].value = formattedDate;

      modal.classList.add('active');
    } else {
      showToast('Event not found', 'error', 'Error');
    }
  } catch (error) {
    console.error('Edit event error:', error);
    showToast('Unable to load event for editing', 'error', 'Error');
  }
};

// Update event form submission
window.updateEventForm = async function(eventId) {
  const form = document.getElementById('eventForm');
  const formData = new FormData(form);
  
  const dateValue = formData.get('date');
  const startDate = new Date(dateValue);
  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + 2); // Default 2 hour duration

  try {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.get('title'),
        description: formData.get('description'),
        location: formData.get('location'),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    });

    const data = await response.json();

    if (data.success) {
      showToast('Event updated successfully!', 'success', 'Event Updated');
      closeEventModal();
      resetEventModal();
      loadUserData();
    } else {
      showToast(data.message || 'Failed to update event', 'error', 'Update Failed');
    }
  } catch (error) {
    console.error('Update event error:', error);
    showToast('Unable to update event', 'error', 'Update Failed');
  }
};

// Reset event modal to create mode
window.resetEventModal = function() {
  const modal = document.getElementById('eventModal');
  if (!modal) return;

  // Reset modal title
  const modalHeader = modal.querySelector('.modal-header h2');
  if (modalHeader) {
    modalHeader.textContent = 'Create Event';
  }

  // Reset submit button
  const modalFooter = modal.querySelector('.modal-footer');
  if (modalFooter) {
    modalFooter.innerHTML = `
      <button class="btn btn-secondary" onclick="closeEventModal()">Cancel</button>
      <button class="btn" onclick="submitEventForm()">Create Event</button>
    `;
  }

  // Clear form
  const form = document.getElementById('eventForm');
  if (form) {
    form.reset();
  }
};

// Helper function to load events into select
async function loadEventsToSelect() {
  if (!currentUser) return;

  try {
    const response = await fetch(`${API_URL}/events/user/${currentUser.id}`);
    const data = await response.json();

    const select = document.getElementById('meetingEventSelect');
    if (select && data.success) {
      select.innerHTML = '<option value="">-- Select an Event --</option>';
      data.events.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = event.title;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Failed to load events:', error);
  }
}
