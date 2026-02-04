# Meeting Response System

## Overview
Participants can now confirm or decline future meetings. When more than 50% of participants confirm, the meeting status automatically changes from `PROPOSED` to `CONFIRMED`.

## Features

### 1. Participant Responses
- **Confirm**: Participant agrees to attend the meeting
- **Decline**: Participant cannot attend the meeting
- **Optional Reason**: Participants can provide a reason for their response (not required)

### 2. Automatic Status Updates
- Meetings start with status `PROPOSED`
- When > 50% of participants confirm → status changes to `CONFIRMED`
- If ≤ 50% confirm → meeting remains `PROPOSED` (needs new time)

### 3. Restrictions
- Only **future meetings** can receive responses
- Only **participants** can respond to a meeting
- Participants can change their response anytime before the meeting

## API Endpoints

### Submit Response
```http
POST /api/meetings/:id/respond
```

**Request Body:**
```json
{
  "userId": "user123",
  "response": "confirmed",  // "confirmed" or "declined"
  "reason": "Looking forward to it!"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Response recorded successfully",
  "data": {
    "stats": {
      "total": 10,
      "confirmed": 6,
      "declined": 2,
      "pending": 2,
      "confirmationPercentage": 60.0,
      "isConfirmed": true
    }
  }
}
```

### Get Response Statistics
```http
GET /api/meetings/:id/responses
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 10,
      "confirmed": 6,
      "declined": 2,
      "pending": 2,
      "confirmationPercentage": 60.0,
      "isConfirmed": true
    },
    "participants": [
      {
        "userId": "user1",
        "username": "John Doe",
        "response": "confirmed",
        "reason": "Happy to attend",
        "respondedAt": "2026-02-04T10:30:00Z"
      },
      {
        "userId": "user2",
        "username": "Jane Smith",
        "response": "declined",
        "reason": "Have another meeting",
        "respondedAt": "2026-02-04T11:00:00Z"
      },
      {
        "userId": "user3",
        "username": "Bob Wilson",
        "response": "pending",
        "reason": null,
        "respondedAt": null
      }
    ]
  }
}
```

## Database Schema

### New Table: `meeting_responses`
```sql
CREATE TABLE meeting_responses (
  meeting_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  response TEXT NOT NULL,        -- 'confirmed' or 'declined'
  reason TEXT,                    -- optional reason
  responded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (meeting_id, user_id),
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

## Data Model

### MeetingParticipant Interface
```typescript
export interface MeetingParticipant {
  userId: string;
  username?: string;
  checkedIn: boolean;
  checkedInAt?: Date;
  response?: ResponseType;        // NEW
  responseReason?: string;        // NEW
  respondedAt?: Date;             // NEW
}

export enum ResponseType {
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
  PENDING = 'pending',
}
```

## Usage Example

1. **Create a meeting** - starts with `PROPOSED` status
2. **Participants respond:**
   - User 1: Confirms
   - User 2: Confirms
   - User 3: Declines
   - User 4: Confirms (doesn't respond yet)
   - User 5: Doesn't respond yet

3. **After User 3 confirms:**
   - Total: 5 participants
   - Confirmed: 3 (60%)
   - Status automatically changes to `CONFIRMED` ✓

4. **If not enough confirmations:**
   - The organizer needs to propose a new meeting time

## Notifications
- Meeting creator receives notification when participants respond
- Special notification sent when meeting reaches > 50% confirmation
