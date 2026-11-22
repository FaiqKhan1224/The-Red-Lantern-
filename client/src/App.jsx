import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar, Footer } from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Story from './pages/Story.jsx';
import Dining from './pages/Dining.jsx';
import Gallery from './pages/Gallery.jsx';
import Private from './pages/Private.jsx';
import Reservations from './pages/Reservations.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Admin from './admin/Admin.jsx';
import AdminReservations from './admin/AdminReservations.jsx';
import MyReservations from './pages/MyReservations.jsx';
import { useAuth } from './lib/auth.jsx';

function AdminGate({ children }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <div className="center-msg">Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (user.role !== 'admin') return <div className="center-msg">This area is for restaurant staff only.</div>;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/our-story" element={<Story />} />
          <Route path="/dining" element={<Dining />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/private-dining" element={<Private />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my-reservations" element={<MyReservations />} />
          <Route path="/admin" element={<AdminGate><Admin /></AdminGate>} />
          <Route path="/admin/reservations" element={<AdminGate><AdminReservations /></AdminGate>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
