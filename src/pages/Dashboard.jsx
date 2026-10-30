import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { roomsApi, customersApi, bookingsApi } from "../services/api";
import { Badge, Empty, inr, today } from "../ui.jsx";

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([roomsApi.getAll(), customersApi.getAll(), bookingsApi.getAll()])
      .then(([rooms, customers, bookings]) => setD({ rooms, customers, bookings }))
      .catch(() => setError("Cannot reach JSON Server. Run: npm run server"));
  }, []);
  if (error) return <div className="alert">{error}</div>;
  if (!d) return <p>Loading…</p>;

  const t = today();
  const live = d.bookings.filter((b) => b.status === "Confirmed");
  const active = d.rooms.filter((r) => r.status === "Active");
  const occupied = new Set(live.filter((b) => b.checkIn <= t && b.checkOut > t).map((b) => b.roomId));
  const occ = active.length ? Math.round((occupied.size / active.length) * 100) : 0;
  const revenue = live.reduce((s, b) => s + b.totalAmount, 0);
  const byType = ["Single", "Double", "Deluxe", "Suite"].map((ty) => ({
    ty, amt: live.filter((b) => d.rooms.find((r) => r.id === b.roomId)?.type === ty).reduce((s, b) => s + b.totalAmount, 0),
  }));
  const max = Math.max(1, ...byType.map((x) => x.amt));
  const cust = (id) => d.customers.find((c) => c.id === id)?.name ?? "—";
  const room = (id) => d.rooms.find((r) => r.id === id)?.number ?? "—";
  const recent = [...d.bookings].reverse().slice(0, 5);
  const upcoming = live.filter((b) => b.checkIn >= t).sort((a, b) => a.checkIn.localeCompare(b.checkIn)).slice(0, 5);

  return (
    <>
      <div className="head"><div><h2>Dashboard</h2><p className="sub">Today, {new Date().toDateString()}</p></div><Link className="btn" to="/book">+ New booking</Link></div>
      <div className="stats">
        <div className="stat"><span>Total revenue</span><strong>{inr(revenue)}</strong></div>
        <div className="stat"><span>Occupancy today</span><strong>{occ}%</strong><div className="meter"><div style={{ width: occ + "%" }} /></div></div>
        <div className="stat"><span>Active bookings</span><strong>{live.length}</strong></div>
        <div className="stat"><span>Cancelled</span><strong>{d.bookings.length - live.length}</strong></div>
        <div className="stat"><span>Rooms / Customers</span><strong>{d.rooms.length} / {d.customers.length}</strong></div>
      </div>
      <div className="grid2">
        <div className="card"><h3>Revenue by room type</h3>
          {byType.map((x) => <div className="bar" key={x.ty}><span>{x.ty}</span><div className="track"><div style={{ width: (x.amt / max) * 100 + "%" }} /></div><b>{inr(x.amt)}</b></div>)}
        </div>
        <div className="card"><h3>Upcoming check-ins</h3>
          {upcoming.length === 0 ? <Empty text="No upcoming check-ins." /> : upcoming.map((b) => <Link className="li" key={b.id} to={`/bookings/${b.id}`}><span>{cust(b.customerId)} · Room {room(b.roomId)}</span><small>{b.checkIn}</small></Link>)}
        </div>
      </div>
      <div className="card"><h3>Recent bookings</h3>
        {recent.length === 0 ? <Empty text="No bookings yet. Create the first one." /> : recent.map((b) => <Link className="li" key={b.id} to={`/bookings/${b.id}`}><span>{cust(b.customerId)} · Room {room(b.roomId)} · {b.checkIn} → {b.checkOut}</span><span><b>{inr(b.totalAmount)}</b> <Badge v={b.status} /></span></Link>)}
      </div>
    </>
  );
}
