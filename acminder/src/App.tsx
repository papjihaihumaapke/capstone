import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import ImportSchedule from './pages/ImportSchedule';
import Home from './pages/Home';
import CalendarView from './pages/CalendarView';
import AddItem from './pages/AddItem';
import ItemDetail from './pages/ItemDetail';
import ConflictDetail from './pages/ConflictDetail';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes — zero navigation */}
        <Route path="/" element={<Navigate to="/splash" replace />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/import" element={<ImportSchedule />} />
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/add" element={<AddItem />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/conflict/:id" element={<ConflictDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>
      <Toast />
    </Router>
  );
}
