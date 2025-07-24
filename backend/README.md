# College Notice API - curl Testing Documentation

## Table of Contents
- [Base URL & Environment](#base-url--environment)
- [Authentication](#authentication)
- [Auth Endpoints](#auth-endpoints)
- [Notice Endpoints](#notice-endpoints)
- [Error Responses](#error-responses)
- [Testing Scenarios](#testing-scenarios)

## Base URL & Environment

```bash
# Development
BASE_URL="http://localhost:3000"

# Set your base URL as environment variable for easier testing
export API_BASE="http://localhost:3000"
```

## Authentication

This API uses JWT Bearer tokens. After login/register, include the token in all protected requests:

```bash
# Set token as environment variable after login
export TOKEN="your_jwt_token_here"
```

---

## Auth Endpoints

### 1. Register User

**POST** `/api/auth/register`

```bash
# Register as Admin
curl -X POST "$API_BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Admin",
    "email": "admin@college.edu",
    "password": "admin123",
    "role": "admin"
  }'

# Register as Student
curl -X POST "$API_BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Student",
    "email": "student@college.edu",
    "password": "student123",
    "role": "student"
  }'
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "John Admin",
    "role": "admin"
  }
}
```

### 2. Login User

**POST** `/api/auth/login`

```bash
# Login as Admin
curl -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@college.edu",
    "password": "admin123"
  }'

# Login as Student
curl -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@college.edu",
    "password": "student123"
  }'
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "John Admin",
    "role": "admin"
  }
}
```

---

## Notice Endpoints

### 3. Get Published Notices (Paginated)

**GET** `/api/notices?page=1&limit=10`

```bash
# Get first page (default: page=1, limit=10)
curl -X GET "$API_BASE/api/notices" \
  -H "Authorization: Bearer $TOKEN"

# Get specific page with custom limit
curl -X GET "$API_BASE/api/notices?page=2&limit=5" \
  -H "Authorization: Bearer $TOKEN"

# Get all notices on first page
curl -X GET "$API_BASE/api/notices?page=1&limit=50" \
  -H "Authorization: Bearer $TOKEN"
```

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "uuid-here",
      "title": "Important Exam Notice",
      "description": "Final exams will be conducted...",
      "category": "Academic",
      "attachmentUrl": "https://example.com/attachment.pdf",
      "createdById": "admin-uuid",
      "createdAt": "2025-07-24T10:00:00.000Z",
      "publishAt": "2025-07-24T12:00:00.000Z",
      "isPublished": true
    }
  ],
  "page": 1,
  "totalPages": 3,
  "total": 25
}
```

### 4. Get All Notices (Including Unpublished - Admin Only)

**GET** `/api/notices/all?page=1&limit=10`

```bash
# Admin can see all notices (published + unpublished)
curl -X GET "$API_BASE/api/notices/all" \
  -H "Authorization: Bearer $TOKEN"

# With pagination
curl -X GET "$API_BASE/api/notices/all?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Get Notice by ID

**GET** `/api/notices/:id`

```bash
# Replace NOTICE_ID with actual notice ID
NOTICE_ID="your-notice-uuid-here"
curl -X GET "$API_BASE/api/notices/$NOTICE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**Success Response (200):**
```json
{
  "id": "uuid-here",
  "title": "Important Exam Notice",
  "description": "Final exams will be conducted from...",
  "category": "Academic",
  "attachmentUrl": "https://example.com/attachment.pdf",
  "createdById": "admin-uuid",
  "createdAt": "2025-07-24T10:00:00.000Z",
  "publishAt": "2025-07-24T12:00:00.000Z",
  "isPublished": true
}
```

### 6. Create Notice (Admin Only)

**POST** `/api/notices`

```bash
# Create notice with future publish date
curl -X POST "$API_BASE/api/notices" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Academic Notice",
    "description": "This is an important notice regarding upcoming events. Please read carefully and follow the instructions provided.",
    "category": "Academic",
    "attachmentUrl": "https://example.com/documents/notice.pdf",
    "publishAt": "2025-07-25T09:00:00.000Z"
  }'

# Create notice without attachment
curl -X POST "$API_BASE/api/notices" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "General Announcement",
    "description": "This is a general announcement for all students.",
    "category": "General",
    "publishAt": "2025-07-24T15:30:00.000Z"
  }'

# Create notice with immediate publishing
curl -X POST "$API_BASE/api/notices" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Urgent Notice",
    "description": "This is an urgent notice that needs immediate attention.",
    "category": "Urgent",
    "publishAt": "2025-07-24T10:00:00.000Z"
  }'
```

**Success Response (201):**
```json
{
  "id": "new-uuid-here",
  "title": "New Academic Notice",
  "description": "This is an important notice...",
  "category": "Academic",
  "attachmentUrl": "https://example.com/documents/notice.pdf",
  "createdById": "admin-uuid",
  "createdAt": "2025-07-24T10:15:00.000Z",
  "publishAt": "2025-07-25T09:00:00.000Z",
  "isPublished": false
}
```

### 7. Update Notice (Admin Only)

**PUT** `/api/notices/:id`

```bash
# Update notice content
NOTICE_ID="your-notice-uuid-here"
curl -X PUT "$API_BASE/api/notices/$NOTICE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Notice Title",
    "description": "This notice has been updated with new information.",
    "category": "Academic",
    "attachmentUrl": "https://example.com/updated-document.pdf",
    "publishAt": "2025-07-25T10:00:00.000Z",
    "isPublished": false
  }'

# Publish a notice (triggers email notifications)
curl -X PUT "$API_BASE/api/notices/$NOTICE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Published Notice",
    "description": "This notice is now published and will send emails.",
    "category": "Important",
    "isPublished": true
  }'

# Update only specific fields
curl -X PUT "$API_BASE/api/notices/$NOTICE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title Only",
    "description": "Updated description only",
    "category": "Academic",
    "isPublished": true
  }'
```

**Success Response (200):**
```json
{
  "id": "uuid-here",
  "title": "Updated Notice Title",
  "description": "This notice has been updated...",
  "category": "Academic",
  "attachmentUrl": "https://example.com/updated-document.pdf",
  "createdById": "admin-uuid",
  "createdAt": "2025-07-24T10:15:00.000Z",
  "publishAt": "2025-07-25T10:00:00.000Z",
  "isPublished": false
}
```

### 8. Delete Notice (Admin Only)

**DELETE** `/api/notices/:id`

```bash
# Delete a notice
NOTICE_ID="your-notice-uuid-here"
curl -X DELETE "$API_BASE/api/notices/$NOTICE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**Success Response (200):**
```json
{
  "message": "Notice deleted"
}
```

### 9. Health Check

**GET** `/health`

```bash
# Check if server is running (no auth required)
curl -X GET "$API_BASE/health"
```

**Success Response (200):**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## Error Responses

### Common Error Formats

**400 Bad Request:**
```json
{
  "message": "Role must be admin or student"
}
```

**401 Unauthorized:**
```json
{
  "error": "Access denied, no token provided"
}
```

**403 Forbidden:**
```json
{
  "error": "Access denied, insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "message": "Notice not found"
}
```

**409 Conflict:**
```json
{
  "message": "Email already registered"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Database connection failed"
}
```

---

## Testing Scenarios

### Complete Testing Flow

```bash
#!/bin/bash
# Complete API testing script

# Set base URL
export API_BASE="http://localhost:3000"

echo "=== 1. Health Check ==="
curl -X GET "$API_BASE/health"

echo -e "\n\n=== 2. Register Admin ==="
ADMIN_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "testadmin@college.edu",
    "password": "admin123",
    "role": "admin"
  }')
echo $ADMIN_RESPONSE

# Extract admin token
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
export ADMIN_TOKEN

echo -e "\n\n=== 3. Register Student ==="
STUDENT_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "teststudent@college.edu",
    "password": "student123",
    "role": "student"
  }')
echo $STUDENT_RESPONSE

# Extract student token
STUDENT_TOKEN=$(echo $STUDENT_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
export STUDENT_TOKEN

echo -e "\n\n=== 4. Create Notice (Admin) ==="
NOTICE_RESPONSE=$(curl -s -X POST "$API_BASE/api/notices" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notice",
    "description": "This is a test notice created via API",
    "category": "Academic",
    "publishAt": "2025-07-24T15:00:00.000Z"
  }')
echo $NOTICE_RESPONSE

# Extract notice ID
NOTICE_ID=$(echo $NOTICE_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
export NOTICE_ID

echo -e "\n\n=== 5. Get All Notices (Student) ==="
curl -s -X GET "$API_BASE/api/notices" \
  -H "Authorization: Bearer $STUDENT_TOKEN"

echo -e "\n\n=== 6. Get All Notices Including Unpublished (Admin) ==="
curl -s -X GET "$API_BASE/api/notices/all" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

echo -e "\n\n=== 7. Update Notice (Admin) ==="
curl -s -X PUT "$API_BASE/api/notices/$NOTICE_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Test Notice",
    "description": "This notice has been updated",
    "category": "Academic",
    "isPublished": true
  }'

echo -e "\n\n=== 8. Get Notice by ID ==="
curl -s -X GET "$API_BASE/api/notices/$NOTICE_ID" \
  -H "Authorization: Bearer $STUDENT_TOKEN"

echo -e "\n\n=== 9. Try to Create Notice as Student (Should Fail) ==="
curl -s -X POST "$API_BASE/api/notices" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Student Notice",
    "description": "This should fail",
    "category": "Academic",
    "publishAt": "2025-07-24T15:00:00.000Z"
  }'

echo -e "\n\n=== 10. Delete Notice (Admin) ==="
curl -s -X DELETE "$API_BASE/api/notices/$NOTICE_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

echo -e "\n\nTesting completed!"
```

### Save the script and run:

```bash
# Save as test_api.sh
chmod +x test_api.sh
./test_api.sh
```

### Individual Test Cases

**Test Authentication:**
```bash
# Test invalid credentials
curl -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@email.com",
    "password": "wrongpassword"
  }'

# Test invalid role registration
curl -X POST "$API_BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@college.edu",
    "password": "password123",
    "role": "invalid_role"
  }'
```

**Test Authorization:**
```bash
# Test accessing protected route without token
curl -X GET "$API_BASE/api/notices"

# Test accessing admin route as student
curl -X POST "$API_BASE/api/notices" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "description": "Test", "category": "Test", "publishAt": "2025-07-24T15:00:00.000Z"}'
```

**Test Pagination:**
```bash
# Test different page sizes
curl -X GET "$API_BASE/api/notices?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"

curl -X GET "$API_BASE/api/notices?page=2&limit=3" \
  -H "Authorization: Bearer $TOKEN"
```

**Test Edge Cases:**
```bash
# Test non-existent notice ID
curl -X GET "$API_BASE/api/notices/non-existent-id" \
  -H "Authorization: Bearer $TOKEN"

# Test invalid date format
curl -X POST "$API_BASE/api/notices" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notice",
    "description": "Test description",
    "category": "Academic",
    "publishAt": "invalid-date"
  }'
```

---

## Environment Variables Required

Make sure your `.env` file contains:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/college_notices"
JWT_SECRET="your-secret-key-here"
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASS="your-app-password"
PORT=3000
```

## Notes

1. **JWT Tokens**: Tokens expire in 7 days. Store them securely for testing sessions.
2. **Email Notifications**: When a notice is published (`isPublished: true`), emails are sent to all students.
3. **Cron Job**: The server runs a cron job every 5 minutes to automatically publish scheduled notices.
4. **Pagination**: Default page size is 10. Maximum recommended limit is 100.
5. **Role-Based Access**: 
   - Students can only view published notices
   - Admins can create, update, delete, and view all notices
6. **Date Format**: Use ISO 8601 format for `publishAt` field: `"2025-07-24T15:00:00.000Z"`

---

*This documentation covers all API endpoints with practical curl examples for comprehensive testing of the College Notice Management System.*