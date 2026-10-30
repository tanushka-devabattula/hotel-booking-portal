import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUI } from "../ui.jsx";
import { roomsApi } from "../services/api";
import { ROOM_TYPES } from "./Rooms.jsx";

const empty = { number: "", type: "Single", price: "", capacity: 1, status: "Active" };

export default function RoomForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const { toast } = useUI();
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState({});
  useEffect(() => { if (id) roomsApi.getById(id).then(setForm); }, [id]);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const validate = () => {
    const e = {};
    if (!String(form.number).trim()) e.number = "Room number is required";
    if (!(Number(form.price) > 0)) e.price = "Price must be greater than 0";
    if (!(Number(form.capacity) >= 1)) e.capacity = "Capacity must be at least 1";
    setErr(e);
    return Object.keys(e).length === 0;
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = { ...form, price: Number(form.price), capacity: Number(form.capacity) };
    id ? await roomsApi.update(id, data) : await roomsApi.add(data);
    toast("Room saved");
    nav("/rooms");
  };

  return (
    <form className="card formcard" onSubmit={submit}>
      <h2>{id ? "Edit room" : "Add room"}</h2>
      <label>Room number<input name="number" value={form.number} onChange={set} />{err.number && <small>{err.number}</small>}</label>
      <label>Type<select name="type" value={form.type} onChange={set}>{ROOM_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
      <label>Price per night (₹)<input name="price" type="number" value={form.price} onChange={set} />{err.price && <small>{err.price}</small>}</label>
      <label>Capacity<input name="capacity" type="number" value={form.capacity} onChange={set} />{err.capacity && <small>{err.capacity}</small>}</label>
      <label>Status<select name="status" value={form.status} onChange={set}><option>Active</option><option>Maintenance</option></select></label>
      <button className="btn" type="submit">{id ? "Save changes" : "Add room"}</button>
    </form>
  );
}
