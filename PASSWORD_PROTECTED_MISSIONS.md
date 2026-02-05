# Password-Protected Missions Feature

## Overview
This feature allows mission chiefs to create password-protected missions, restricting access to only those who know the password.

## Backend Changes

### Database Schema
- Added `password` column to `missions` table (VARCHAR(255), nullable)
- Migration file: `2026-02-03-184134-0000_add_password_to_missions`

### Models & Entities
1. **MissionModel** (`mission_model.rs`)
   - Added `password: Option<String>` field
   
2. **AddMissionModel** (`mission_model.rs`)
   - Added `password: Option<String>` field
   
3. **MissionEntity & AddMissionEntity** (`missions.rs`)
   - Added `password: Option<String>` field

### Business Logic
1. **CrewOperationUseCase** (`crew_operation.rs`)
   - Updated `join` method to accept `password: Option<String>` parameter
   - Added password validation logic:
     - If mission has a password, validates provided password matches
     - Returns "Invalid password" error if password doesn't match or is missing
     - Allows joining without password if mission is public (no password set)

2. **MissionViewingRepository** (`mission_viewing.rs`)
   - Updated SQL queries to include `password` field in SELECT statements

### API Layer
1. **crew_operation router** (`crew_operation.rs`)
   - Created `JoinMissionPayload` struct with optional password field
   - Updated `join` handler to accept JSON payload with password
   - Password is sent in request body: `{ "password": "optional_password" }`

## Frontend Changes

### Models
1. **Mission interface** (`mission.ts`)
   - Added `password?: string` field

2. **AddMission interface** (`add-mission.ts`)
   - Added `password?: string` field

### Services
1. **MissionService** (`mission-service.ts`)
   - Updated `join` method to accept optional `password` parameter
   - Sends password in request body when joining missions

### Components
1. **NewMission Dialog** (`new-mission.html`)
   - Added password input field (type="password")
   - Placeholder: "Password (optional - leave empty for public mission)"

2. **ViewDetails Component** (`view-details.ts`)
   - Updated `joinMission` method to:
     - Check if mission is password-protected
     - Prompt user for password if required
     - Handle "Invalid password" errors with specific error message
     - Allow cancellation of join operation

3. **ViewDetails Template** (`view-details.html`)
   - Added lock icon (🔒) next to mission name for password-protected missions
   - Visual indicator helps users identify protected missions

## User Flow

### Creating a Password-Protected Mission
1. Chief opens "New Mission" dialog
2. Fills in mission name and description
3. Optionally enters a password in the password field
4. Submits the form
5. Mission is created with password protection if password was provided

### Joining a Password-Protected Mission
1. User clicks "Join" on a mission with a lock icon (🔒)
2. System prompts: "This mission is password-protected. Please enter the password:"
3. User enters password and clicks OK
4. If password is correct: User joins the mission successfully
5. If password is incorrect: Alert shows "Incorrect password. Please try again."
6. User can cancel the prompt to abort the join operation

### Joining a Public Mission
1. User clicks "Join" on a mission without a lock icon
2. User joins immediately without password prompt

## Security Considerations

### Current Implementation
- Passwords are stored in plain text in the database
- Passwords are transmitted in API requests
- Password validation happens on the backend

### Recommendations for Production
1. **Hash passwords** using bcrypt or similar before storing
2. **Use HTTPS** to encrypt password transmission
3. **Add rate limiting** to prevent brute force attacks
4. **Consider password strength requirements** for mission creation
5. **Add password change functionality** for mission chiefs
6. **Implement audit logging** for failed password attempts

## Testing Checklist

- [ ] Create a public mission (no password) and verify anyone can join
- [ ] Create a password-protected mission and verify lock icon appears
- [ ] Try joining with correct password - should succeed
- [ ] Try joining with incorrect password - should show error
- [ ] Try joining and cancel password prompt - should abort
- [ ] Verify mission chief cannot join their own mission
- [ ] Verify password field is optional in mission creation
- [ ] Test that existing missions without passwords still work
- [ ] Verify password is not exposed in mission list API responses (to non-chiefs)

## API Endpoints Modified

### POST `/api/crew/join/{mission_id}`
**Request Body:**
```json
{
  "password": "optional_password_string"
}
```

**Responses:**
- `200 OK`: Successfully joined mission
- `500 Internal Server Error`: 
  - "Invalid password" - Wrong password provided
  - "Mission is full" - Mission at capacity
  - "Mission is not joinable" - Mission status doesn't allow joining
  - "The Chief can not join in his own mission as a crew member!!"

### POST `/api/mission-management`
**Request Body:**
```json
{
  "name": "Mission Name",
  "description": "Optional description",
  "password": "optional_password"
}
```

## Files Modified

### Backend
- `server/src/infrastructure/database/schema.rs`
- `server/src/domain/value_objects/mission_model.rs`
- `server/src/domain/entities/missions.rs`
- `server/src/application/use_cases/crew_operation.rs`
- `server/src/infrastructure/database/repositories/mission_viewing.rs`
- `server/src/infrastructure/http/routers/crew_operation.rs`
- `server/src/infrastructure/database/migrations/2026-02-03-184134-0000_add_password_to_missions/up.sql`
- `server/src/infrastructure/database/migrations/2026-02-03-184134-0000_add_password_to_missions/down.sql`

### Frontend
- `Avengers-Assemble-client/src/app/_models/mission.ts`
- `Avengers-Assemble-client/src/app/_models/add-mission.ts`
- `Avengers-Assemble-client/src/app/_services/mission-service.ts`
- `Avengers-Assemble-client/src/app/_dialogs/new-mission/new-mission.html`
- `Avengers-Assemble-client/src/app/_dialogs/view-details/view-details.ts`
- `Avengers-Assemble-client/src/app/_dialogs/view-details/view-details.html`
