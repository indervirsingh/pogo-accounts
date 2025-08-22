# Pogo Accounts Management System

A secure CRUD application for managing Pokemon GO accounts built with the MEAN stack (MongoDB, Express.js, Angular, Node.js).

## 🔒 Security Features

- **XSS Protection**: Secure data binding and input sanitization
- **Input Validation**: Comprehensive server-side validation with type checking
- **Rate Limiting**: API endpoint protection (50 requests/15min)
- **Security Headers**: Helmet.js implementation with CSP
- **CORS Configuration**: Restricted cross-origin requests
- **Error Handling**: Secure error responses without information leakage

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pogo-accounts
   ```

2. **Install dependencies**
   ```bash
   npm run prepare
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp server/.env.example server/.env
   
   # Edit server/.env with your MongoDB credentials
   ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   PORT=5200
   CORS_ORIGIN=http://localhost:4200
   ```

4. **Start the application**
   ```bash
   npm start
   ```

   The application will be available at:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:5200
   - Health Check: http://localhost:5200/health

## 📁 Project Structure

```
pogo-accounts/
├── client/                 # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── models/
│   │   └── assets/
│   ├── package.json
│   └── angular.json
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── server.ts       # Main server configuration
│   │   ├── database.ts     # MongoDB connection
│   │   └── pogo-accounts.routes.ts  # API routes
│   ├── .env.example        # Environment template
│   └── package.json
├── docs/                   # Documentation
├── scripts/                # Utility scripts
└── package.json           # Root package configuration
```

## 🛡️ Security Implementation

### XSS Prevention
- Angular templates use `[textContent]` binding instead of interpolation
- Server-side HTML escaping with `escape-html`
- Content Security Policy headers

### Input Validation
```typescript
// Example validation rules
const allowedFields = {
    username: { required: true, maxLength: 50, pattern: /^[a-zA-Z0-9_-]+$/ },
    email: { required: true, maxLength: 100, isEmail: true },
    team: { required: true, enum: ['instinct', 'mystic', 'valor'] }
};
```

### API Security
- Rate limiting with `express-rate-limit`
- CORS configuration for specific origins
- Request payload size limits
- MongoDB ObjectId validation

## 📚 API Documentation

### Endpoints

| Method | Endpoint | Description | Security |
|--------|----------|-------------|----------|
| GET | `/pogo-accounts` | List all accounts | Rate limited |
| GET | `/pogo-accounts/:id` | Get account by ID | ID validation |
| POST | `/pogo-accounts` | Create new account | Input sanitization |
| PUT | `/pogo-accounts/:id` | Update account | Validation + sanitization |
| DELETE | `/pogo-accounts/:id` | Delete account | ID validation |
| GET | `/health` | Health check | Public |

### Request/Response Examples

**Create Account**
```bash
POST /pogo-accounts
Content-Type: application/json

{
  "username": "trainer123",
  "email": "trainer@example.com",
  "team": "mystic",
  "country": "USA"
}
```

**Response**
```json
{
  "message": "Account created successfully",
  "id": "507f1f77bcf86cd799439011"
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run client tests only
npm run test:client

# Run server tests only
npm run test:server

# Security audit
node scripts/security-audit.js
```

## 🔧 Development

### Available Scripts

```bash
npm start              # Start both client and server
npm run start:client   # Start Angular dev server
npm run start:server   # Start Express server
npm run build          # Build for production
npm run prepare        # Install all dependencies
npm test              # Run all tests
```

### Code Quality
- ESLint configuration for consistent code style
- TypeScript for type safety
- Prettier for code formatting

## 🚀 Deployment

### Production Environment Variables
```bash
ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/database
PORT=5200
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### Build for Production
```bash
npm run build
```

## 🔍 Security Audit

Run the security audit script to verify all security measures:

```bash
node scripts/security-audit.js
```

This will check:
- Environment variable security
- XSS protection implementation
- Input validation
- Security headers
- Dependency vulnerabilities

## 📋 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Security Guidelines
- Never commit sensitive data (credentials, API keys)
- Always validate and sanitize user input
- Use parameterized queries for database operations
- Implement proper error handling
- Follow OWASP security guidelines

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `/docs` folder
- Review security guidelines in `SECURITY.md`

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes and version history.
