# API Documentation

## Base URL
```
http://localhost:5200
```

## Authentication
Currently, no authentication is required. All endpoints are public but rate-limited.

## Rate Limiting
- **Limit**: 50 requests per 15 minutes per IP address
- **Headers**: Rate limit information is included in response headers

## Error Handling

All errors return JSON responses with the following structure:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Endpoints

### Health Check

**GET** `/health`

Returns server health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Get All Accounts

**GET** `/pogo-accounts`

Retrieves all Pokemon GO accounts (limited to 100 results).

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "trainer123",
    "email": "trainer@example.com",
    "team": "mystic",
    "country": "USA",
    "birthday": "1990-01-01",
    "level": 40
  }
]
```

### Get Account by ID

**GET** `/pogo-accounts/:id`

Retrieves a specific account by MongoDB ObjectId.

**Parameters:**
- `id` (string, required) - MongoDB ObjectId (24 characters)

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "trainer123",
  "email": "trainer@example.com",
  "team": "mystic",
  "country": "USA",
  "birthday": "1990-01-01",
  "level": 40
}
```

**Error Response:**
```json
{
  "error": "Account not found"
}
```

### Create Account

**POST** `/pogo-accounts`

Creates a new Pokemon GO account.

**Request Body:**
```json
{
  "username": "trainer123",
  "email": "trainer@example.com",
  "team": "mystic",
  "country": "USA",
  "birthday": "1990-01-01",
  "level": 40
}
```

**Validation Rules:**
- `username`: Required, 3-50 characters, alphanumeric with underscores/hyphens only
- `email`: Required, valid email format, max 100 characters
- `team`: Required, must be one of: "instinct", "mystic", "valor"
- `country`: Optional, max 50 characters, letters/spaces/hyphens only
- `birthday`: Optional, valid ISO 8601 date format
- `level`: Optional, number between 1-50

**Response:**
```json
{
  "message": "Account created successfully",
  "id": "507f1f77bcf86cd799439011"
}
```

**Error Response:**
```json
{
  "error": "Account with this email already exists"
}
```

### Update Account

**PUT** `/pogo-accounts/:id`

Updates an existing account.

**Parameters:**
- `id` (string, required) - MongoDB ObjectId

**Request Body:**
Same as create account, all fields optional for updates.

**Response:**
```json
{
  "message": "Account updated successfully",
  "username": "trainer123"
}
```

### Delete Account

**DELETE** `/pogo-accounts/:id`

Deletes an account by ID.

**Parameters:**
- `id` (string, required) - MongoDB ObjectId

**Response:**
```json
{
  "message": "Account deleted successfully",
  "deletedId": "507f1f77bcf86cd799439011"
}
```

## Security Headers

All responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy: default-src 'self'`

## CORS Policy

CORS is configured to allow requests from:
- `http://localhost:4200` (development)
- Configurable via `CORS_ORIGIN` environment variable

## Input Sanitization

All input is automatically:
- HTML escaped to prevent XSS
- Validated against defined schemas
- Sanitized to remove potentially harmful content
- Limited in length to prevent buffer overflow attacks

## Examples

### cURL Examples

**Create Account:**
```bash
curl -X POST http://localhost:5200/pogo-accounts \
  -H "Content-Type: application/json" \
  -d '{
    "username": "trainer123",
    "email": "trainer@example.com",
    "team": "mystic"
  }'
```

**Get All Accounts:**
```bash
curl http://localhost:5200/pogo-accounts
```

**Update Account:**
```bash
curl -X PUT http://localhost:5200/pogo-accounts/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "level": 45
  }'
```

**Delete Account:**
```bash
curl -X DELETE http://localhost:5200/pogo-accounts/507f1f77bcf86cd799439011
```
