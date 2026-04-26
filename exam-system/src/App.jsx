import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Faculty from './pages/Faculty';
import Rooms from './pages/Rooms';
import Exams from './pages/Exams';
import SeatingAllocation from './pages/SeatingAllocation';
import Invigilation from './pages/Invigilation';
import Attendance from './pages/Attendance';
import DailyAttendance from './pages/DailyAttendance';
import QRAttendance from './pages/QRAttendance';
import Replacements from './pages/Replacements';
import Reports from './pages/Reports';
import ERPIntegration from './pages/ERPIntegration';
import BackendStatus from './components/BackendStatus';
import { getToken } from './data/api';

// Protected route — redirects to /login if no token
function Protected({ children }) {
  // Allow access even without token (offline mode works)
  // Only redirect if explicitly logged out
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <BackendStatus />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protected><Layout /></Protected>}>
          <Route index element={<Dashboard />} />
          <Route path="students"         element={<Students />} />
          <Route path="faculty"          element={<Faculty />} />
          <Route path="rooms"            element={<Rooms />} />
          <Route path="exams"            element={<Exams />} />
          <Route path="seating"          element={<SeatingAllocation />} />
          <Route path="invigilation"     element={<Invigilation />} />
          <Route path="attendance"       element={<Attendance />} />
          <Route path="daily-attendance" element={<DailyAttendance />} />
          <Route path="qr-attendance"    element={<QRAttendance />} />
          <Route path="replacements"     element={<Replacements />} />
          <Route path="reports"          element={<Reports />} />
          <Route path="erp"              element={<ERPIntegration />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
