import { createContext, useContext, useState, useCallback } from "react";
const Ctx = createContext();
export const useUI = () => useContext(Ctx);

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dlg, setDlg] = useState(null);
  const toast = useCallback((msg, type = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);
  const ask = useCallback((text, okLabel = "Confirm") => new Promise((res) => setDlg({ text, okLabel, res })), []);
  const close = (v) => { dlg.res(v); setDlg(null); };
  return (
    <Ctx.Provider value={{ toast, ask }}>
      {children}
      <div className="toasts">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
      {dlg && (
        <div className="overlay"><div className="modal">
          <h3>Are you sure?</h3><p>{dlg.text}</p>
          <div className="row"><button className="ghost" onClick={() => close(false)}>Go back</button><button className="danger" onClick={() => close(true)}>{dlg.okLabel}</button></div>
        </div></div>
      )}
    </Ctx.Provider>
  );
}
export const Badge = ({ v }) => <span className={`badge ${String(v).toLowerCase()}`}>{v}</span>;
export const Empty = ({ text }) => <div className="empty">{text}</div>;
export const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");
export const today = () => new Date().toISOString().slice(0, 10);
