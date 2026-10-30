import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { roomsApi, customersApi, bookingsApi, nightsBetween, isRoomAvailable } from "../services/api";
import { ROOM_TYPES } from "./Rooms.jsx";
import { Empty, inr, today, useUI } from "../ui.jsx";

export default function NewBooking() {
  const nav = useNavigate();
  const { toast } = useUI();
  const t = today();
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [f, setF] = useState({ type: "", checkIn: t, checkOut: "", guests: 1, customerId: "", roomId: "", notes: "" });
  const [error, setError] = useState("");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v, ...(k !== "roomId" && k !== "customerId" && k !== "notes" ? { roomId: "" } : {}) }));

  useEffect(() => { roomsApi.getAll().then(setRooms); customersApi.getAll().then(setCustomers); bookingsApi.getAll().then(setBookings); }, []);

  const datesOk = f.checkIn && f.checkOut && f.checkOut > f.checkIn;
  const available = datesOk ? rooms.filter((r) => r.status === "Active" && r.capacity >= Number(f.guests) && (!f.type || r.type === f.type) && isRoomAvailable(r.id, f.checkIn, f.checkOut, bookings)) : [];
  const room = rooms.find((r) => r.id === f.roomId);
  const nights = datesOk ? nightsBetween(f.checkIn, f.checkOut) : 0;
  const total = room ? nights * room.price : 0;

  const confirm = async () => {
    if (!f.customerId) return setError("Select a customer first.");
    if (!room) return setError("Select a room from the available list.");
    await bookingsApi.add({ roomId: room.id, customerId: f.customerId, checkIn: f.checkIn, checkOut: f.checkOut, guests: Number(f.guests), notes: f.notes, nights, totalAmount: total, status: "Confirmed", createdAt: new Date().toISOString() });
    toast("Booking confirmed"); nav("/bookings");
  };

  return (
    <>
      <div className="head"><div><h2>New booking</h2><p className="sub">Search availability, choose a room, then confirm.</p></div></div>
      <div className="card"><h3>1. Search availability</h3>
        <div className="filters">
          <label>Room type<select value={f.type} onChange={(e) => set("type", e.target.value)}><option value="">Any type</option>{ROOM_TYPES.map((x) => <option key={x}>{x}</option>)}</select></label>
          <label>Check-in<input type="date" min={t} value={f.checkIn} onChange={(e) => set("checkIn", e.target.value)} /></label>
          <label>Check-out<input type="date" min={f.checkIn} value={f.checkOut} onChange={(e) => set("checkOut", e.target.value)} /></label>
          <label>Guests<input type="number" min="1" max="10" value={f.guests} onChange={(e) => set("guests", e.target.value)} /></label>
        </div>
      </div>
      <div className="card"><h3>2. Choose a room</h3>
        {!datesOk ? <Empty text="Pick a check-out date after check-in to see available rooms." /> : available.length === 0 ? <Empty text="No rooms available for these dates and guests." /> : (
          <div className="cards">{available.map((r) => (
            <button type="button" key={r.id} className={`pick room ${r.type.toLowerCase()} ${f.roomId === r.id ? "sel" : ""}`} onClick={() => set("roomId", r.id)}>
              <div className="top"><span className="num">{r.number}</span></div>
              <div className="body"><h4>{r.type}</h4><p>Sleeps {r.capacity}</p><div className="price">{inr(r.price)}<small> / night</small></div></div>
            </button>))}</div>)}
      </div>
      <div className="card"><h3>3. Guest and confirm</h3>
        <div className="filters">
          <label>Customer<select value={f.customerId} onChange={(e) => set("customerId", e.target.value)}><option value="">Select customer</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label className="grow">Special requests<input value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional" /></label>
        </div>
        {room && <div className="summary"><span>{nights} night(s) × {inr(room.price)}</span><strong>Total {inr(total)}</strong></div>}
        {error && <div className="alert">{error}</div>}
        <button className="btn" onClick={confirm}>Confirm booking</button>
      </div>
    </>
  );
}
