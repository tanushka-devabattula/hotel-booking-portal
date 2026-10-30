import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { roomsApi, customersApi, bookingsApi } from "../services/api";
import { Badge, inr } from "../ui.jsx";

export default function BookingDetails() {
  const { id } = useParams();
  const [d, setD] = useState(null);
  useEffect(() => {
    bookingsApi.getById(id).then(async (booking) => {
      const [room, customer] = await Promise.all([roomsApi.getById(booking.roomId).catch(() => null), customersApi.getById(booking.customerId).catch(() => null)]);
      setD({ booking, room, customer });
    }).catch(() => setD(false));
  }, [id]);
  if (d === false) return <div className="alert">Booking not found.</div>;
  if (!d) return <p>Loading…</p>;
  const { booking: b, room, customer } = d;
  const rate = b.totalAmount / b.nights;
  return (
    <>
      <div className="head"><div><h2>Booking #{b.id}</h2><p className="sub">Created {new Date(b.createdAt).toLocaleString()}</p></div>
        <div className="row"><Link className="ghost" to="/bookings">Back</Link><button className="btn" onClick={() => window.print()}>Print invoice</button></div></div>
      <div className="grid2">
        <div className="card"><h3>Guest</h3><p><b>{customer?.name ?? "Deleted guest"}</b></p><p>{customer?.email}</p><p>{customer?.phone}</p><p>{customer?.address}</p>
          <h3 style={{ marginTop: 18 }}>Room</h3><p><b>Room {room?.number ?? "—"}</b> · {room?.type}</p><p>Guests: {b.guests ?? 1}</p>{b.notes && <p>Note: {b.notes}</p>}</div>
        <div className="card invoice"><h3>Invoice <Badge v={b.status} /></h3>
          <div className="line"><span>Check-in</span><b>{b.checkIn}</b></div>
          <div className="line"><span>Check-out</span><b>{b.checkOut}</b></div>
          <div className="line"><span>Rate per night</span><b>{inr(rate)}</b></div>
          <div className="line"><span>Nights</span><b>{b.nights}</b></div>
          <div className="line"><span>Subtotal</span><b>{inr(b.totalAmount)}</b></div>
          <div className="line total"><span>Total amount</span><b>{inr(b.status === "Cancelled" ? 0 : b.totalAmount)}</b></div>
          {b.status === "Cancelled" && <small>Cancelled — no amount payable.</small>}
        </div>
      </div>
    </>
  );
}
