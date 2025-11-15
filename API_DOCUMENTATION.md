# SocialConnect API Documentation

This document provides detailed information about all API endpoints available in SocialConnect.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require authentication using JWT Bearer tokens.

### Getting a Token

Login to get access and refresh tokens:

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",  // OR "username": "johndoe"
  "password": "SecurePassword123"
}
```

### Using the Token

Include the access token in the Authorization header:

```
Authorization: Bearer your_access_token_here
```

## API Endpoints

### Authentication Endpoints

#### 1. Register User

Create a new user account.

```
POST /api/auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    ...
  }
}
```

#### 2. Login

Authenticate and get tokens.

```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "user@example.com",  // OR use "username"
  "password": "SecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "user": { ...user object },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Logout

Invalidate refresh token.

```
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

**Response:** `200 OK`

#### 4. Refresh Token

Get a new access token using refresh token.

```
POST /api/auth/token/refresh
```

**Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "new_access_token"
}
```

#### 5. Change Password

Change user password (requires authentication).

```
POST /api/auth/change-password
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Response:** `200 OK`

#### 6. Password Reset Request

Request password reset (placeholder - would send email in production).

```
POST /api/auth/password-reset
```

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`

#### 7. Password Reset Confirm

Confirm password reset with token.

```
POST /api/auth/password-reset-confirm
```

**Body:**
```json
{
  "email": "user@example.com",
  "resetToken": "reset_token_from_email",
  "newPassword": "NewPassword123"
}
```

**Response:** `200 OK`

---

### User Endpoints

#### 1. Get Current User

Get authenticated user's profile.

```
GET /api/users/me
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Hello, I'm John!",
  "avatar_url": "https://...",
  "followers_count": 42,
  "following_count": 38,
  "posts_count": 156,
  ...
}
```

#### 2. Update Current User

Update authenticated user's profile.

```
PUT /api/users/me
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Updated bio",
  "avatar_url": "https://...",
  "website": "https://johndoe.com",
  "location": "New York, USA",
  "profile_visibility": "public"  // public|private|followers_only
}
```

**Response:** `200 OK`

#### 3. Get User Profile

Get any user's public profile.

```
GET /api/users/{userId}
Authorization: Bearer {accessToken} (optional)
```

**Response:** `200 OK`

#### 4. List Users

Get list of users (with search).

```
GET /api/users?search=john&page=1&limit=20
```

**Query Parameters:**
- `search` (optional): Search term
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page

**Response:** `200 OK`
```json
{
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### 5. Follow User

Follow a user.

```
POST /api/users/{userId}/follow
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`

#### 6. Unfollow User

Unfollow a user.

```
DELETE /api/users/{userId}/follow
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`

#### 7. Get User Followers

Get list of user's followers.

```
GET /api/users/{userId}/followers?page=1&limit=20
```

**Response:** `200 OK`

#### 8. Get User Following

Get list of users that a user follows.

```
GET /api/users/{userId}/following?page=1&limit=20
```

**Response:** `200 OK`

---

### Post Endpoints

#### 1. Create Post

Create a new post.

```
POST /api/posts
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "content": "This is my post content!",
  "image_url": "https://example.com/image.jpg",  // optional
  "category": "general"  // general|announcement|question
}
```

**Response:** `201 Created`

#### 2. Get Posts (Feed)

Get list of posts with filters.

```
GET /api/posts?page=1&limit=20&following=true&author_id=uuid&category=general
Authorization: Bearer {accessToken} (optional)
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `following` (optional): Filter posts from followed users only
- `author_id` (optional): Filter by author
- `category` (optional): Filter by category

**Response:** `200 OK`

#### 3. Get Single Post

Get a specific post by ID.

```
GET /api/posts/{postId}
Authorization: Bearer {accessToken} (optional)
```

**Response:** `200 OK`

#### 4. Update Post

Update own post.

```
PUT /api/posts/{postId}
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "content": "Updated content",
  "image_url": "https://...",
  "category": "announcement"
}
```

**Response:** `200 OK`

#### 5. Delete Post

Delete own post.

```
DELETE /api/posts/{postId}
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`

#### 6. Like Post

Like a post.

```
POST /api/posts/{postId}/like
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`

#### 7. Unlike Post

Remove like from a post.

```
DELETE /api/posts/{postId}/like
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`

#### 8. Get Post Comments

Get comments for a post.

```
GET /api/posts/{postId}/comments?page=1&limit=20
```

**Response:** `200 OK`

#### 9. Add Comment

Add a comment to a post.

```
POST /api/posts/{postId}/comments
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "content": "Great post!"
}
```

**Response:** `201 Created`

---

### Notification Endpoints

#### 1. Get Notifications

Get user's notifications.

```
GET /api/notifications?page=1&limit=20&unread_only=true
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `unread_only` (optional): Show only unread notifications

**Response:** `200 OK`

#### 2. Mark Notification as Read

Mark a specific notification as read.

```
POST /api/notifications/{notificationId}/read
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`

#### 3. Mark All as Read

Mark all notifications as read.

```
POST /api/notifications/mark-all-read
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`

---

### Admin Endpoints

All admin endpoints require the user to have `is_admin: true`.

#### 1. Provision Admin

Manually provision a user as admin (requires secret key).

```
POST /api/admin/provision
```

**Body:**
```json
{
  "userId": "user-uuid",
  "secretKey": "admin_secret_from_env"
}
```

**Response:** `200 OK`

#### 2. Get System Statistics

Get system-wide statistics.

```
GET /api/admin/stats
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "users": {
    "total": 1000,
    "active": 950,
    "activeToday": 42
  },
  "posts": {
    "total": 5000,
    "createdToday": 150
  },
  "engagement": {
    "totalLikes": 25000,
    "totalComments": 10000,
    "totalFollows": 5000
  }
}
```

#### 3. List All Users (Admin)

Get all users with admin details.

```
GET /api/admin/users?page=1&limit=20&search=john&status=active
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`

#### 4. Get User Details (Admin)

Get detailed user information.

```
GET /api/admin/users/{userId}
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`

#### 5. Deactivate User

Deactivate a user account.

```
POST /api/admin/users/{userId}/deactivate
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`

#### 6. List All Posts (Admin)

Get all posts including inactive ones.

```
GET /api/admin/posts?page=1&limit=20&include_inactive=true
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`

#### 7. Delete Any Post (Admin)

Delete any post as admin.

```
DELETE /api/admin/posts/{postId}
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message here"
}
```

### Common HTTP Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

## Rate Limiting

Currently, there's no rate limiting implemented. For production, consider adding rate limiting to prevent abuse.

## Pagination

All list endpoints support pagination with consistent format:

**Query Parameters:**
- `page`: Page number (starts at 1)
- `limit`: Items per page (max: 100)

**Response:**
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Real-time Features

Notifications are delivered in real-time using Supabase Realtime subscriptions. When authenticated, clients automatically subscribe to their notification channel.

## Security Best Practices

1. Always use HTTPS in production
2. Never expose service role keys to clients
3. Validate and sanitize all user inputs
4. Use strong JWT secrets
5. Implement rate limiting
6. Enable Row Level Security in Supabase
7. Regularly update dependencies

## Support

For issues or questions about the API, please refer to the main README or create an issue in the repository.


