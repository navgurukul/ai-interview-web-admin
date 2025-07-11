# AI Interview Admin Management System

This is an AI Interview Admin Management System built using NextJS 15, React 19, and Ant Design.

## Features

- **User Management**: Supports CRUD operations for users
- **Job Management**: Supports CRUD operations for jobs
- **Question Management**: Supports CRUD operations for questions
- **System Settings**: Allows customization of system name, logo, theme, and language

## Tech Stack

- NextJS 15 (App Router)
- React 19
- Ant Design
- TypeScript

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create an environment variable file `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build the production version:
   ```bash
   npm run build
   ```

5. Start the production server:
   ```bash
   npm start
   ```

## System Overview

### User Management

The User Management page provides the following features:
- View user list
- Add new users
- Edit user information
- Delete users

User attributes include:
- Username (user_name)
- Staff ID (staff_id)
- Email (email)
- Role (role): Admin (1), Regular User (2), Guest (0)
- Status (status): Active (0), Inactive (1)

### Job Management

The Job Management page provides the following features:
- View job list
- Add new jobs
- Edit job information
- Delete jobs

Job attributes include:
- Job Title (job_title)
- Job Description (job_description)
- Technical Skills (technical_skills)
- Soft Skills (soft_skills)
- Creation Date (create_date)

### Question Management

The Question Management page provides the following features:
- View question list
- Add new questions
- Edit question information
- Delete questions

Question attributes include:
- Question Content (question)
- Reference Answer (answer)
- Examination Points (examination_points)
- Applicable Job (job_title)
- Language (language): Hindi, English
- Difficulty (difficulty): Easy, Medium, Hard
- Question Type (type): Short Answer, Multiple Choice, Coding

### System Settings

The System Settings page allows administrators to:
- Modify the system name
- Set the system logo
- Choose the interface theme (light, dark)
- Select the system language (Hindi, English)

## API Integration

The system integrates with backend APIs to support the following operations:

### User API
- Get user list (GET /api/v1/user)
- Get a single user (GET /api/v1/user/:id)
- Create a user (POST /api/v1/user)
- Update a user (PUT /api/v1/user/:id)
- Delete a user (DELETE /api/v1/user/:id)

### Job API
- Get job list (GET /api/v1/job)
- Get a single job (GET /api/v1/job/:id)
- Create a job (POST /api/v1/job)
- Update a job (PUT /api/v1/job/:id)
- Delete a job (DELETE /api/v1/job/:id)

### Question API
- Get question list (GET /api/v1/question)
- Get a single question (GET /api/v1/question/:id)
- Create a question (POST /api/v1/question)
- Update a question (PUT /api/v1/question/:id)
- Delete a question (DELETE /api/v1/question/:id)

API response format:
```json
{
  "code": "0",     // 0 indicates success, other values indicate error codes
  "message": "success",
  "data": {}       // Response data
}
``` 