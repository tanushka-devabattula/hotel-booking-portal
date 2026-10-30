import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { customersApi, bookingsApi } from "../services/api";
import { Empty, inr, useUI } from "../ui.jsx";

export default function Customers() {
  const { toast, ask } = useUI();
  const [list, setList] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [q, setQ] = useState("");
  const load = () => customersApi.getAll().then(setList);
  useEffect(() => { load(); bookingsApi.getAll().then(setBookings); }, []);
  const del = async (c) => {
    if (!(await ask(`Delete ${c.name}?`, "Delete customer"))) return;
    await customersApi.remove(c.id); toast("Customer deleted"); load();
  };
  const stats = (id) => {
    const bs = bookings.filter((b) => b.customerId === id && b.status === "Confirmed");
    return { n: bs.length, spent: bs.reduce((s, b) => s + b.totalAmount, 0) };
  };
  const shown = list.filter((c) => (c.name + c.email + c.phone).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="head"><div><h2>Customers</h2><p className="sub">{list.length} registered guests</p></div><Link className="btn" to="/customers/new">+ Add customer</Link></div>
      <div className="filters"><input placeholder="Search name, email or phone…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {shown.length === 0 ? <Empty text="No customers found." /> : (
        <div className="card flush"><table>
          <thead><tr><th>Guest</th><th>Phone</th><th>Address</th><th>Stays</th><th>Total spent</th><th></th></tr></thead>
          <tbody>{shown.map((c) => { const s = stats(c.id); return (
            <tr key={c.id}>
              <td><div className="who"><span className="av">{c.name.charAt(0).toUpperCase()}</span><div><b>{c.name}</b><small>{c.email}</small></div></div></td>
              <td>{c.phone}</td><td>{c.address || "—"}</td><td>{s.n}</td><td>{inr(s.spent)}</td>
              <td className="actions"><Link to={`/customers/edit/${c.id}`}>Edit</Link><button className="danger" onClick={() => del(c)}>Delete</button></td>
            </tr>); })}</tbody>
        </table></div>
      )}
    </>
  );
}
