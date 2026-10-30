import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { roomsApi, customersApi, bookingsApi } from "../services/api";
import { Badge, Empty, inr, useUI } from "../ui.jsx";

export default function Bookings() {
  const { toast, ask } = useUI();
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const load = () => bookingsApi.getAll().then(setBookings);
  useEffect(() => { load(); roomsApi.getAll().then(setRooms); customersApi.getAll().then(setCustomers); }, []);

  const cancel = async (b) => {
    if (!(await ask("The room will become available again for these dates.", "Cancel booking"))) return;
    await bookingsApi.update(b.id, { ...b, status: "Cancelled", cancelledAt: new Date().toISOString() });
    toast("Booking cancelled", "warn"); load();
  };
  const del = async (b) => {
    if (!(await ask("Delete this booking record permanently?", "Delete"))) return;
    await bookingsApi.remove(b.id); toast("Booking deleted"); load();
  };
  const roomNo = (id) => rooms.find((r) => r.id === id)?.number ?? "—";
  const custName = (id) => customers.find((c) => c.id === id)?.name ?? "Deleted guest";
  const shown = [...bookings].reverse().filter((b) => (!status || b.status === status) && (custName(b.customerId) + roomNo(b.roomId)).toLowerCase().includes(q.toLowerCase()));
  const total = shown.filter((b) => b.status === "Confirmed").reduce((s, b) => s + b.totalAmount, 0);

  return (
    <>
      <div className="head"><div><h2>Bookings</h2><p className="sub">{shown.length} shown · confirmed value {inr(total)}</p></div><Link className="btn" to="/book">+ New booking</Link></div>
      <div className="filters">
        <input placeholder="Search guest or room…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option><option>Confirmed</option><option>Cancelled</option></select>
      </div>
      {shown.length === 0 ? <Empty text="No bookings found." /> : (
        <div className="card flush"><table>
          <thead><tr><th>Guest</th><th>Room</th><th>Stay</th><th>Nights</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>{shown.map((b) => (
            <tr key={b.id} className={b.status === "Cancelled" ? "muted" : ""}>
              <td><b>{custName(b.customerId)}</b></td><td>{roomNo(b.roomId)}</td><td>{b.checkIn} → {b.checkOut}</td><td>{b.nights}</td><td>{inr(b.totalAmount)}</td><td><Badge v={b.status} /></td>
              <td className="actions"><Link to={`/bookings/${b.id}`}>Details</Link>{b.status === "Confirmed" && <button className="danger" onClick={() => cancel(b)}>Cancel</button>}<button className="ghost" onClick={() => del(b)}>Delete</button></td>
            </tr>))}</tbody>
        </table></div>
      )}
    </>
  );
}
