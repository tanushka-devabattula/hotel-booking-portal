import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUI } from "../ui.jsx";
import { customersApi } from "../services/api";

const empty = { name: "", email: "", phone: "", address: "" };

export default function CustomerForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const { toast } = useUI();
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState({});
  useEffect(() => { if (id) customersApi.getById(id).then(setForm); }, [id]);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Phone must be 10 digits";
    setErr(e);
    return Object.keys(e).length === 0;
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    id ? await customersApi.update(id, form) : await customersApi.add(form);
    toast("Customer saved");
    nav("/customers");
  };

  return (
    <form className="card formcard" onSubmit={submit}>
      <h2>{id ? "Edit customer" : "Add customer"}</h2>
      <label>Name<input name="name" value={form.name} onChange={set} />{err.name && <small>{err.name}</small>}</label>
      <label>Email<input name="email" value={form.email} onChange={set} />{err.email && <small>{err.email}</small>}</label>
      <label>Phone<input name="phone" value={form.phone} onChange={set} />{err.phone && <small>{err.phone}</small>}</label>
      <label>Address<input name="address" value={form.address} onChange={set} /></label>
      <button className="btn" type="submit">{id ? "Save changes" : "Add customer"}</button>
    </form>
  );
}
