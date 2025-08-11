# MiniSocial - Full-Stack Social Media Platform

## Project Overview
A complete social media platform built with React, Node.js, Express, and MongoDB. This project demonstrates full-stack development skills including user authentication, content management, and modern web technologies.

## Live Application
- **Frontend**: https://minisocial-app.vercel.app
- **Backend API**: https://minisocial-backend.onrender.com

## Features
- User registration and authentication
- Post creation and timeline view  
- Like functionality
- Responsive design
- RESTful API architecture
- Real-time post interactions
- Secure JWT-based sessions

## Tech Stack
- **Frontend**: React with TypeScript, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Vercel + Render + MongoDB Atlas

## API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/profile` - Get user profile
- `GET /api/posts` - Retrieve timeline posts
- `POST /api/posts` - Create new post
- `DELETE /api/posts/:postId` - Delete post
- `POST /api/posts/:postId/like` - Toggle like on post

## Development Progress
- [x] Project setup and GitHub integration
- [x] Project structure and folder organization
- [x] Backend API development
- [x] Database models and connections
- [x] User authentication system
- [x] Frontend React application
- [x] Post creation and management
- [x] Like functionality
- [x] Deployment

## Getting Started
```bash
# Clone repository
git clone https://github.com/yike2/minisocial-app.git
cd minisocial-app

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install

# Run backend (requires MongoDB connection)
cd backend
npm run dev

# Run frontend
cd frontend
npm start
```

## Environment Variables
Create a `.env` file in the backend directory:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## Project Status
All core features implemented and deployed. The application is live and fully functional with user authentication, post management, and real-time interactions.