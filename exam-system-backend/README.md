# GBU Exam Management System — Backend API

Node.js + Express + SQLite REST API

## Quick Start

```bash
cd exam-system-backend
npm install
npm start          # production
npm run dev        # development (auto-restart)
```

Server runs on **http://localhost:5000**

## Default Admin Login
- Username: `admin`
- Password: `admin123`

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login → returns JWT token |
| POST | /api/auth/register | Register new user |
| GET  | /api/auth/me | Get current user |
| PUT  | /api/auth/change-password | Change password |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/students | List (filter: branch, semester, search) |
| POST   | /api/students | Create student |
| PUT    | /api/students/:id | Update student |
| DELETE | /api/students/:id | Delete student |
| POST   | /api/students/bulk-import | CSV upload |

### Seating
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/seating?exam_id= | Get allocations |
| POST   | /api/seating/generate | Auto-allocate students to rooms |
| DELETE | /api/seating/:exam_id | Clear allocations |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/attendance?exam_id= | Get attendance |
| POST   | /api/attendance/mark | Mark single student |
| POST   | /api/attendance/mark-bulk | Mark multiple |
| POST   | /api/attendance/qr-scan | QR code scan |
| GET    | /api/attendance/summary/:exam_id | Room-wise summary |
| GET    | /api/attendance/daily-summary/:exam_id | Programme-wise |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/reports/dashboard | Overall stats |
| GET | /api/reports/faculty-duties | Duty count per faculty |
| GET | /api/reports/room-utilization | Room fill % |
| GET | /api/reports/attendance-summary | Per-exam attendance |

## Authentication
All endpoints (except /api/auth/login) require:
```
Authorization: Bearer <token>
```

## Roles
- `admin` — full access
- `exam_cell` — manage exams, seating, invigilation
- `faculty` — view duties, request replacements

## Database
SQLite file at `./data/exam_system.db` — auto-created on first run.
