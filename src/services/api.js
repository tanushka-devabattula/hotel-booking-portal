const BASE = "http://localhost:3000";
const make = (res) => ({
  getAll: async () => (await fetch(`${BASE}/${res}`)).json(),
  getById: async (id) => {
    const r = await fetch(`${BASE}/${res}/${id}`);
    if (!r.ok) throw new Error("Not found");
    return r.json();
  },
  add: async (d) => (await fetch(`${BASE}/${res}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) })).json(),
  update: async (id, d) => (await fetch(`${BASE}/${res}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) })).json(),
  remove: async (id) => { await fetch(`${BASE}/${res}/${id}`, { method: "DELETE" }); },
});
export const roomsApi = make("rooms");
export const customersApi = make("customers");
export const bookingsApi = make("bookings");

export const nightsBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
export const isRoomAvailable = (roomId, checkIn, checkOut, bookings) =>
  !bookings.some((b) => b.roomId === roomId && b.status === "Confirmed" && checkIn < b.checkOut && checkOut > b.checkIn);
