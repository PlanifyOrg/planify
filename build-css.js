// Script to build complete CSS file
const fs = require('fs');
const path = require('path');

const cssContent = `/* ============================================
   PLANIFY - Modern Design System
   ============================================ */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --warning-gradient: linear-gradient(135deg, #ffd93d 0%, #ff9a3c 100%);
  --primary-color: #667eea;
  --primary-dark: #5568d3;
  --secondary-color: #764ba2;
  --success-color: #00d4aa;
  --warning-color: #ffd93d;
  --danger-color: #ff6b9d;
  --info-color: #6bcfff;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
  width: 100%;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

button, .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: 12px 24px;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: all var(--transition-base);
  background: var(--primary-gradient);
  color: white;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
  font-family: inherit;
  white-space: nowrap;
}

button::before, .btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left var(--transition-slow);
}

button:hover::before, .btn:hover::before {
  left: 100%;
}

button:hover, .btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

button:active, .btn:active {
  transform: translateY(0);
  box-shadow: var(--shadow-md);
}

button:disabled, .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: linear-gradient(135deg, var(--gray-600) 0%, var(--gray-700) 100%);
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.875rem;
}

.btn-lg {
  padding: 16px 32px;
  font-size: 1.0625rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-xl);
  margin: var(--spacing-xl) 0;
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9375rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-family: inherit;
  transition: all var(--transition-base);
  background: white;
  color: var(--text-primary);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-inline {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-end;
}

.form-inline .form-group {
  flex: 1;
  margin-bottom: 0;
}

#authView {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}

.auth-container {
  width: 100%;
  max-width: 450px;
}

.auth-card {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  overflow: hidden;
}

.auth-header {
  padding: var(--spacing-2xl);
  background: var(--primary-gradient);
  color: white;
  text-align: center;
}

.auth-header h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
}

.auth-header p {
  margin: var(--spacing-sm) 0 0;
  opacity: 0.9;
}

.auth-body {
  padding: var(--spacing-2xl);
}

.auth-toggle {
  text-align: center;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--gray-200);
}

.auth-toggle a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: color var(--transition-base);
}

.auth-toggle a:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

#mainView {
  display: none;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background: var(--primary-gradient);
  color: white;
  padding: var(--spacing-xl) 0;
  box-shadow: var(--shadow-xl);
  position: sticky;
  top: 0;
  z-index: 100;
}

header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-full);
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--success-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

#logoutBtn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

#logoutBtn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.nav-tabs {
  background: white;
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 92px;
  z-index: 90;
}

.nav-tabs .container {
  display: flex;
  gap: 0;
  padding: 0;
}

.nav-tabs button {
  flex: 1;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: var(--spacing-lg) var(--spacing-xl);
  font-weight: 600;
  color: var(--text-secondary);
  box-shadow: none;
  transition: all var(--transition-base);
  border-bottom: 3px solid transparent;
}

.nav-tabs button::before {
  display: none;
}

.nav-tabs button:hover {
  background: var(--gray-50);
  color: var(--primary-color);
  transform: none;
}

.nav-tabs button.active {
  color: var(--primary-color);
  background: var(--gray-50);
  border-bottom-color: var(--primary-color);
}

.content-section {
  display: none;
  padding: var(--spacing-2xl) 0;
  flex: 1;
}

.content-section.active {
  display: block;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
}

.section-header h2 {
  margin: 0;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.section-header h2::before {
  content: '';
  width: 4px;
  height: 2rem;
  background: var(--primary-gradient);
  border-radius: var(--radius-sm);
}

.empty-state {
  text-align: center;
  padding: calc(var(--spacing-2xl) * 2);
  color: var(--text-secondary);
}

.empty-state-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-state h3 {
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.event-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transition: all var(--transition-base);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-2xl);
}

.event-card-header {
  padding: var(--spacing-xl);
  background: var(--primary-gradient);
  color: white;
}

.event-card-header h3 {
  margin: 0 0 var(--spacing-sm);
  font-size: 1.25rem;
}

.event-card-body {
  padding: var(--spacing-xl);
}

.event-card-footer {
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--gray-50);
  border-top: 1px solid var(--gray-200);
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}

.meeting-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
  border-left: 4px solid var(--primary-color);
  transition: all var(--transition-base);
}

.meeting-card:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-lg);
}

.meeting-card h4 {
  margin: 0 0 var(--spacing-md);
  color: var(--text-primary);
}

.list-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  padding: var(--spacing-xl);
  overflow-y: auto;
  animation: fadeIn var(--transition-base);
}

.modal.active {
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-2xl);
  animation: slideUp var(--transition-base);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-large .modal-content {
  max-width: 900px;
}

.modal-header {
  padding: var(--spacing-xl);
  background: var(--primary-gradient);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-modal {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
  font-size: 1.25rem;
  padding: 0;
}

.close-modal::before {
  display: none;
}

.close-modal:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg);
}

.modal-body {
  padding: var(--spacing-xl);
  max-height: 70vh;
  overflow-y: auto;
  position: relative;
}

.modal-body::-webkit-scrollbar {
  display: none;
}

.modal-body {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.modal-scroll-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.95) 50%, rgba(255, 255, 255, 1) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: var(--spacing-md);
  pointer-events: none;
  transition: opacity var(--transition-base);
  z-index: 10;
}

.modal-scroll-indicator.hidden {
  opacity: 0;
}

.scroll-arrow {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--primary-color);
  animation: bounce 2s infinite;
  background: rgba(102, 126, 234, 0.1);
  border-radius: var(--radius-full);
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
  60% {
    transform: translateY(-4px);
  }
}

.modal-footer {
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--gray-50);
  border-top: 1px solid var(--gray-200);
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

.form-section {
  margin-bottom: var(--spacing-2xl);
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-section h3 {
  margin: 0 0 var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--gray-200);
  color: var(--text-primary);
  font-size: 1.125rem;
}

.meeting-detail-header {
  padding: var(--spacing-2xl);
  background: var(--primary-gradient);
  color: white;
  text-align: center;
}

.meeting-detail-header h2 {
  margin: 0 0 var(--spacing-sm);
  font-size: 1.75rem;
}

.meeting-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
}

.meeting-meta-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.meeting-meta-card h4 {
  margin: 0 0 var(--spacing-xs);
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
}

.meeting-meta-card p {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--primary-color);
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: var(--spacing-2xl) 0 var(--spacing-lg);
  color: var(--text-primary);
}

.participant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
}

.participant-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--gray-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--gray-200);
}

.participant-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--success-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
}

.status-badge {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.checked-in {
  background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);
  color: #166534;
}

.status-badge.not-checked-in {
  background: var(--gray-200);
  color: var(--gray-600);
}

.agenda-timeline {
  position: relative;
  padding-left: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
}

.agenda-timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, var(--primary-color) 0%, var(--secondary-color) 100%);
}

.agenda-item {
  position: relative;
  padding: var(--spacing-lg);
  background: white;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
}

.agenda-item::before {
  content: attr(data-order);
  position: absolute;
  left: calc(-1 * var(--spacing-2xl) - 8px);
  top: var(--spacing-lg);
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background: var(--primary-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  border: 3px solid white;
}

.document-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.document-item {
  padding: var(--spacing-lg);
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
  transition: all var(--transition-base);
}

.document-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.document-type {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.document-type.notes {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #1e40af;
}

.document-type.minutes {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #92400e;
}

.document-type.protocol {
  background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
  color: #581c87;
}

#toastContainer {
  position: fixed;
  top: var(--spacing-xl);
  right: var(--spacing-xl);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  pointer-events: none;
}

.toast {
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-2xl);
  padding: var(--spacing-lg);
  min-width: 320px;
  max-width: 400px;
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
  pointer-events: all;
  animation: slideIn var(--transition-base);
  border-left: 4px solid var(--primary-color);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast.removing {
  animation: slideOut var(--transition-base);
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

.toast-icon {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.toast.success { border-left-color: var(--success-color); }
.toast.success .toast-icon { background: var(--success-gradient); color: white; }
.toast.error { border-left-color: var(--danger-color); }
.toast.error .toast-icon { background: var(--secondary-gradient); color: white; }
.toast.warning { border-left-color: var(--warning-color); }
.toast.warning .toast-icon { background: var(--warning-gradient); color: var(--gray-900); }
.toast.info { border-left-color: var(--info-color); }
.toast.info .toast-icon { background: var(--success-gradient); color: white; }

.toast-content { flex: 1; }
.toast-title {
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  font-size: 0.9375rem;
}
.toast-message {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.toast-close {
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  box-shadow: none;
}

.toast-close::before { display: none; }

.toast-close:hover {
  background: var(--gray-200);
  color: var(--text-primary);
  transform: none;
}

@media (max-width: 768px) {
  .container { padding: var(--spacing-lg); }
  header h1 { font-size: 1.5rem; }
  .user-info span { display: none; }
  .nav-tabs .container { flex-direction: column; }
  .nav-tabs button {
    border-bottom: none;
    border-left: 3px solid transparent;
  }
  .nav-tabs button.active { border-left-color: var(--primary-color); }
  .card-grid { grid-template-columns: 1fr; }
  .meeting-meta, .participant-grid, .document-grid { grid-template-columns: 1fr; }
  .modal { padding: var(--spacing-md); }
  #toastContainer { left: var(--spacing-md); right: var(--spacing-md); }
  .toast { min-width: auto; }
}`;

const cssPath = path.join(__dirname, 'public', 'css', 'styles.css');
fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('✓ Modern CSS design system created successfully!');
