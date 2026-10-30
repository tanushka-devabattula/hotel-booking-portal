import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { roomsApi, bookingsApi } from "../services/api";
import { Badge, Empty, inr, today, useUI } from "../ui.jsx";

export const ROOM_TYPES = ["Single", "Double", "Deluxe", "Suite"];

export default function Rooms() {
  const { toast, ask } = useUI();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("number");
  const load = () => roomsApi.getAll().then(setRooms);
  useEffect(() => { load(); bookingsApi.getAll().then(setBookings); }, []);

  const del = async (r) => {
    if (!(await ask(`Delete room ${r.number}? This cannot be undone.`, "Delete room"))) return;
    await roomsApi.remove(r.id); toast(`Room ${r.number} deleted`); load();
  };
  const t = today();
  const busy = (id) => bookings.some((b) => b.roomId === id && b.status === "Confirmed" && b.checkIn <= t && b.checkOut > t);
  const shown = rooms
    .filter((r) => (!type || r.type === type) && (!status || r.status === status) && r.number.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === "price" ? a.price - b.price : sort === "priceDesc" ? b.price - a.price : a.number.localeCompare(b.number, undefined, { numeric: true }));

  return (
    <>
      <div className="head"><div><h2>Rooms</h2><p className="sub">{shown.length} of {rooms.length} rooms</p></div><Link className="btn" to="/rooms/new">+ Add room</Link></div>
      <div className="filters">
        <input placeholder="Search room number…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option>{ROOM_TYPES.map((x) => <option key={x}>{x}</option>)}</select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Any status</option><option>Active</option><option>Maintenance</option></select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="number">Sort: room number</option><option value="price">Price: low to high</option><option value="priceDesc">Price: high to low</option></select>
      </div>
      {shown.length === 0 ? <Empty text="No rooms match your filters." /> : (
        <div className="cards">
          {shown.map((r) => (
            <div className={`room ${r.type.toLowerCase()}`} key={r.id}>
              <div className="top"><span className="num">{r.number}</span><Badge v={r.status === "Maintenance" ? "Maintenance" : busy(r.id) ? "Occupied" : "Vacant"} /></div>
              <div className="body">
                <h4>{r.type} room</h4>
                <p>Sleeps {r.capacity}</p>
                <div className="price">{inr(r.price)}<small> / night</small></div>
                <div className="row"><Link className="ghost" to={`/rooms/edit/${r.id}`}>Edit</Link><button className="danger" onClick={() => del(r)}>Delete</button></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
