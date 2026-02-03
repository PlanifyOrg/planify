/**
 * Database integration test script
 * Tests user registration, event creation, and data persistence
 */

const API_URL = 'http://localhost:3000/api';

async function testDatabaseIntegration() {
  console.log('🧪 Starting Database Integration Tests...\n');

  try {
    // Test 1: Register a new user
    console.log('Test 1: Register a new user');
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123',
      }),
    });
    const registerData = await registerResponse.json();
    console.log('✓ User registered:', registerData.data.name);
    const userId = registerData.data.id;

    // Test 2: Login with the user
    console.log('\nTest 2: Login with the user');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registerData.data.email,
        password: 'testpassword123',
      }),
    });
    const loginData = await loginResponse.json();
    console.log('✓ User logged in:', loginData.data.name);

    // Test 3: Create an event
    console.log('\nTest 3: Create an event');
    const eventResponse = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizerId: userId,
        title: 'Test Event',
        description: 'This is a test event for database integration',
        location: 'Test Location',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-02'),
      }),
    });
    const eventData = await eventResponse.json();
    console.log('✓ Event created:', eventData.data.title);
    const eventId = eventData.data.id;

    // Test 4: Fetch the event by ID
    console.log('\nTest 4: Fetch the event by ID');
    const getEventResponse = await fetch(`${API_URL}/events/${eventId}`);
    const getEventData = await getEventResponse.json();
    console.log('✓ Event fetched:', getEventData.data.title);

    // Test 5: Fetch user's events
    console.log('\nTest 5: Fetch user\'s events');
    const userEventsResponse = await fetch(`${API_URL}/events/user/${userId}`);
    const userEventsData = await userEventsResponse.json();
    console.log('✓ User has', userEventsData.data.length, 'event(s)');

    // Test 6: Create a notification
    console.log('\nTest 6: Create a notification');
    const notificationResponse = await fetch(`${API_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientId: userId,
        type: 'event_invitation',
        title: 'Test Notification',
        message: 'This is a test notification',
        relatedEntityId: eventId,
      }),
    });
    const notificationData = await notificationResponse.json();
    console.log('✓ Notification created:', notificationData.data.title);

    // Test 7: Fetch user's notifications
    console.log('\nTest 7: Fetch user\'s notifications');
    const userNotificationsResponse = await fetch(`${API_URL}/notifications/user/${userId}`);
    const userNotificationsData = await userNotificationsResponse.json();
    console.log('✓ User has', userNotificationsData.data.length, 'notification(s)');

    console.log('\n✅ All tests passed! Database integration is working correctly.');
    console.log('\n📝 Summary:');
    console.log(`   - User ID: ${userId}`);
    console.log(`   - Email: ${registerData.data.email}`);
    console.log(`   - Event ID: ${eventId}`);
    console.log(`   - Data is now persisted in planify.db`);
    console.log('\n💡 You can restart the server and verify the data persists!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testDatabaseIntegration();
