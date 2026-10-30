import { NavLink, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Rooms from "./pages/Rooms.jsx";
import RoomForm from "./pages/RoomForm.jsx";
import Customers from "./pages/Customers.jsx";
import CustomerForm from "./pages/CustomerForm.jsx";
import Bookings from "./pages/Bookings.jsx";
import NewBooking from "./pages/NewBooking.jsx";
import BookingDetails from "./pages/BookingDetails.jsx";

const links = [["/", "◧", "Dashboard"], ["/rooms", "▦", "Rooms"], ["/customers", "☺", "Customers"], ["/bookings", "☰", "Bookings"], ["/book", "＋", "New booking"]];

export default function App() {
  return (
    <div className="layout">
      <aside className="nav">
        <div className="brand"><span className="logo">H</span><div><b>Grand Stay</b><small>Hotel management</small></div></div>
        {links.map(([to, ic, label]) => <NavLink key={to} to={to} end={to === "/"}><i>{ic}</i>{label}</NavLink>)}
        <div className="navfoot">Staff portal</div>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/new" element={<RoomForm />} />
          <Route path="/rooms/edit/:id" element={<RoomForm />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/edit/:id" element={<CustomerForm />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/bookings/:id" element={<BookingDetails />} />
          <Route path="/book" element={<NewBooking />} />
        </Routes>
      </main>
    </div>
  );
}
