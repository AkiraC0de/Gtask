# 🗂️ GTASK - Full Stack Web App
#OUTDATED DOC!!!!
**Task Management** is my second full-stack web application focused on helping students manage and track their group tasks efficiently. The aim is to provide users with a clean, responsive interface and secure backend where they can manage group tasks, export their progess as pdf ,and monitor their progress with ease. 

This project is designed to be *scalable*, with future plans to incorporate collaborative features that allow interactions between users.

## CURRENT TASK
| Category | Task | Status |
| :--- | :--- | :---: |
| **Backend** | Attempt Counter for Tokens | On Progress |
| **Frontend** | Established the dashboard page | Pending |
| **Frontend** | Use URL Query to set as state when the verification process is done | Pending |
| **Backend** | Centralized Global Error Handling Middleware | Pending |
| **Backend** | Add Rate Limiter for routes | Pending |


## Features (UNUPDATED)
- User authentication with JWT (signup, login, logout)
- Create and update personal tasks
- Secure API endpoints with middleware protection
- Clean UI built with Tailwind CSS
- Scalable backend with MongoDB and Mongoose

## Built With
# Frontend
- **React JS** 
- **Tailwind CSS**
# Backend
- **Node.js** 
- **Express.js**
- **MongoDB**
- **Mongoose** 

### **Authentication Module**
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register user & trigger verification email |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT |
| `POST` | `/api/auth/logout` | Revoke tokens & clear session |
| `GET` | `/api/auth/refresh` | Rotate access token using Refresh Token |
| `POST` | `/api/auth/verify-email` | Validate account via email token (Protected with access token) |
| `POST` | `/api/auth/resend-code` | Regenerate and resend verification code (Protected with access token) |
| `GET` | `/api/auth/verify-token` | Verify the Users Token |

### **Task Module**
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/task` | Create a new task instance |
| `PATCH` | `/api/task/:taskId` | Update task details (Protected) |
| `GET` | `/api/task/export` | Generate PDF summary of tasks |
