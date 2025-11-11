# Waffle Talkie

Waffle Talkie is a simple voice chat applications that allows users to record a voice memo and broadcast it to other users. Inspired by "Waffle Wednesday" a family tradition to send voice memos to each other on wednesday.

# Architecture

This app is designed as [a home cooked meal](https://www.robinsloan.com/notes/home-cooked-app/). It is not scalable or "production ready". It is designed to be simple, easily maintainable, and used by a small group of friends or family.

## Stack

Frontend:
- React Native
- Expo

Backend:
- Go
- sqlite
- Docker
- Linux VPS

## Auth

1. User provides their name and sends a request to verify to the backend with device info
2. The backend server stores the user's identity and device information in the database
3. Admin manually approves the user's identity and device information
4. Identity and device information are verified by the backend server and a token is generated
5. User is granted access to the application

## Broadcast Audio

1. User uploads audio → stored on server
2. Server creates message record with status "pending"
  - Send push notification
3. Other users pull new messages when app opens
4. Server tracks who downloaded/played it
5. Delete when: (7 days old) OR (all users received)


## Other Considerations

- Max audio file size/duration
- Token expiration
- Rate limiting
- Encryption at rest
- Hashing device data
- Multiple devices per user
- Tracking active users/marking users inactive

## Database Design

`users` table:
- id, name, device_id, approved, last_active, created_at

`audio_messages` table:
- id, sender_user_id, file_path, duration, created_at, deleted_at

`audio_message_receipts` table:
- id, audio_message_id, user_id, received_at
