# Backend Architecture Snapshot

This document describes the backend as it exists right now, based on the current file structure and runtime flow.

## High-Level Overview

The backend is a Node.js app built on:
- Express for HTTP APIs
- MongoDB via Mongoose for persistence
- Socket.IO for realtime messaging and presence
- JWT cookies for authentication
- Nodemailer for password reset email delivery

The backend follows a loose layered structure:
- `routes` define HTTP endpoints
- `controllers` handle request/response orchestration
- `services` contain business logic
- `repositories` wrap data access
- `models` define MongoDB schemas
- `middleware` handles auth checks
- `socket.js` manages realtime presence and message delivery
- `utils` contains token and email helpers

## Startup Flow

The backend starts from:
- `src/server.js`

Startup sequence:
1. Load environment variables from `backend/.env`
2. Create the Express app
3. Create the HTTP server
4. Attach Socket.IO to the server
5. Register the socket handlers
6. Install middleware
7. Mount API routes
8. Connect to MongoDB
9. Start listening on `PORT`

## Runtime Flow

### 1. HTTP request lifecycle

For a normal API request:
1. Browser sends a request to an endpoint like `/api/auth/login` or `/api/messages/:userId`
2. Express routes the request to the correct controller
3. Authenticated routes pass through `auth.middleware.js`
4. Controller validates inputs and delegates to the service or direct model logic
5. Service/repository/model layer performs the database work
6. Controller sends the JSON response

### 2. Authentication flow

Authentication is cookie-based:
- `createToken.js` signs a JWT with `JWT_SECRET`
- The token is stored in an `httpOnly` cookie named `jwt`
- `auth.middleware.js` reads the cookie and verifies the token
- If valid, it attaches the user document to `req.user`

### 3. Realtime flow

Socket.IO is used for:
- tracking online users
- broadcasting the online user list
- delivering new chat messages to the receiver in realtime

The socket presence map is held in memory in `src/socket.js`:
- `userId -> socketId`

When a user connects:
1. The frontend passes `userId` in the socket query
2. The server stores the mapping
3. The server emits `onlineUsers` to all clients

When a user disconnects:
1. The server removes the mapping
2. The server emits the updated `onlineUsers` list

When a message is sent:
1. The controller creates or finds a `Conversation`
2. The controller creates a `Message`
3. The message ID is pushed into the conversation
4. The server looks up the receiver's socket ID
5. If the receiver is online, the message is emitted as `newMessage`

## Current File Structure

```text
backend/
  src/
    server.js
    socket.js
    socket/
      SocketManager.js
    routes/
      auth.routes.js
      user.routes.js
      message.routes.js
    controllers/
      auth.controller.js
      user.controller.js
      message.controller.js
    services/
      AuthService.js
      UserService.js
    repositories/
      UserRepository.js
      MongoUserRepository.js
    models/
      User.js
      Message.js
      Conversation.js
    middleware/
      auth.middleware.js
    utils/
      createToken.js
      email.js
    base/
      BaseService.js
      BaseRepository.js
  .env
  package.json
```

## Layer Responsibilities

### `src/server.js`

This is the composition root of the backend.

It is responsible for:
- creating the Express app
- creating the HTTP server
- configuring CORS and cookie parsing
- wiring Socket.IO
- mounting routes
- connecting to MongoDB

### `src/routes/*`

Routes are thin and only map URL paths to controller functions.

Examples:
- `/api/auth/*`
- `/api/users`
- `/api/messages/:userId`

### `src/controllers/*`

Controllers translate HTTP requests into application calls and HTTP responses.

Current controllers:
- `auth.controller.js`
- `user.controller.js`
- `message.controller.js`

### `src/services/*`

Services contain business rules and validation.

Current services:
- `AuthService`
- `UserService`

`AuthService` currently owns:
- signup
- login
- logout
- verify email
- forgot password
- reset password

`UserService` currently owns:
- listing all users except the current user

### `src/repositories/*`

Repositories wrap model access and make persistence easier to swap later.

Current repository implementation:
- `MongoUserRepository`

The repository layer currently supports:
- lookup by email
- lookup by reset token
- lookup by email + reset token
- create
- save
- list other users

### `src/models/*`

These are the MongoDB schemas.

Models:
- `User`
- `Message`
- `Conversation`

### `src/middleware/auth.middleware.js`

This middleware:
- reads the JWT cookie
- verifies it
- loads the user from MongoDB
- attaches the user to `req.user`

### `src/socket.js`

This module currently owns the realtime presence map and socket event wiring.

Exports:
- `registerSocketServer(io)`
- `getReceiverSocketId(userId)`
- `getOnlineUserIds()`

### `src/utils/*`

Utility helpers currently handle:
- JWT creation and cookie setting
- email sending through Nodemailer

## Data Model

### User

Fields:
- `name`
- `email`
- `password`
- `mobile`
- `emailVerified`
- `resetToken`
- `resetExpires`

### Message

Fields:
- `senderId`
- `receiverId`
- `text`
- timestamps

### Conversation

Fields:
- `members` array
- `messages` array
- timestamps

## API Surface

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/verify-email`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Users

- `GET /api/users`

### Messages

- `GET /api/messages/:userId`
- `POST /api/messages/:userId`

## Frontend Integration Points

The frontend consumes the backend through:
- `VITE_BACKEND_URL` if set
- otherwise `http://localhost:5000`

The client uses:
- Axios for REST calls
- Socket.IO client for realtime presence and new message events

## Current Coupling Points

These are the main places where the system is still tightly coupled:

- Controllers repeat similar error handling logic
- `message.controller.js` mixes persistence and realtime emission
- `socket.js` stores presence in process memory, so online state resets on server restart
- Auth state is duplicated across React state and `localStorage`
- `BaseService` and `BaseRepository` add abstraction, but the codebase is not yet using them consistently
- `SocketManager.js` exists separately from `socket.js` and appears unused

## Startup Requirements

To run locally, the backend currently expects:
- MongoDB running at `mongodb://127.0.0.1:27017/myapp`
- `JWT_SECRET` defined in `backend/.env`

## Known Gaps

- No centralized error handling middleware yet
- No test suite for controllers/services/routes yet
- Realtime presence is in-memory only
- Auth and message concerns are still partially mixed across layers
- There is duplicate logic between frontend auth pages and auth state handling

## Suggested Refactor Direction

If you want to clean this backend up next, the best order is:
1. Centralize config and error handling
2. Split message persistence from realtime emission
3. Remove unused or duplicate abstractions
4. Add tests around auth, users, and messaging
5. Normalize frontend auth state handling

