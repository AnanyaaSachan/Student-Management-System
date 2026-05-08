# Exam Management System

A full-stack university exam management platform developed for Gautam Buddha University to streamline student records, seating allocation, invigilation, attendance management, and exam operations.

## Features

* Admin dashboard with real-time statistics
* Student management system
* Faculty and room management
* Exam scheduling and shift management
* Automated seating allocation
* Room-wise seating plan generation
* Attendance management system
* QR attendance support
* Replacement and invigilation management
* Search and filter functionality
* Printable seating plans and reports
* Responsive admin interface

## Modules

### Dashboard

* Overview of exams, students, rooms, and seat allocation
* Room utilization analytics
* Recent exam tracking

### Student Management

* Add, update, and delete student records
* Department, semester, batch, and session filtering
* Excel import support

### Seating Allocation

* Automatic seat allocation
* Room-wise student arrangement
* Shift-based exam allocation
* Printable seating plans

### Attendance System

* Daily attendance management
* Present/absent tracking
* Attendance summary generation
* Roll-number-wise attendance records

## Tech Stack

### Frontend

* React.js
* Tailwind CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Deployment

* Vercel

## Project Structure

```bash
client/
server/
```

## Installation

### Clone the repository

```bash
git clone https://github.com/AnanyaaSachan/Student-Management-System.git
```

### Install dependencies

Frontend

```bash
cd client
npm install
```

Backend

```bash
cd server
npm install
```

### Environment Variables

Create a `.env` file inside the server folder.

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

### Run the project

Frontend

```bash
npm run dev
```

Backend

```bash
npm start
```

## Live Demo

[Live Project](https://student-management-system-l16v.vercel.app/)

## GitHub Repository

[GitHub Repository](https://github.com/AnanyaaSachan/Student-Management-System)

## Future Improvements

* Role-based authentication
* ERP integration
* Advanced analytics dashboard
* Export reports in PDF/Excel
* Email notifications
* Multi-admin support

## Author

Ananya Sachan
B.Tech CSE, Gautam Buddha University
