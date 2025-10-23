import { useState, useEffect } from "react";
import axios from "axios";

const _envApi = process.env.REACT_APP_API_URL;
const API_BASE = _envApi ? _envApi.replace(/\/$/, "") : (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '');

export default function ResetPassword({ initialToken, onDone }) {
  const [token, setToken] = useState(initialToken || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Support token via URL search (when served as SPA)
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (!token && t) setToken(t);
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!token) { setMessage("Thiếu token"); return; }
    if (!password || password.length < 6) { setMessage("Mật khẩu tối thiểu 6 ký tự"); return; }
    if (password !== confirm) { setMessage("Nhập lại mật khẩu không khớp"); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/reset-password`, { token, password });
      setMessage(res.data?.message || "Đổi mật khẩu thành công");
      setTimeout(() => onDone?.(), 1200);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <header className="auth-card__header">
        <h2>Đổi mật khẩu</h2>
        <p className="muted">Nhập token và mật khẩu mới.</p>
      </header>
      <form onSubmit={submit} className="form auth-form">
        <div className="field">
          <label className="label" htmlFor="token">Token</label>
          <input id="token" className="input" value={token} onChange={(e)=>setToken(e.target.value)} required />
        </div>
        <div className="field">
          <label className="label" htmlFor="password">Mật khẩu mới</label>
          <input id="password" type="password" className="input" value={password} onChange={(e)=>setPassword(e.target.value)} minLength={6} required />
        </div>
        <div className="field">
          <label className="label" htmlFor="confirm">Nhập lại mật khẩu</label>
          <input id="confirm" type="password" className="input" value={confirm} onChange={(e)=>setConfirm(e.target.value)} minLength={6} required />
        </div>
        <button type="submit" className="button" disabled={loading}>{loading?"Đang đổi...":"Đổi mật khẩu"}</button>
        {message && <p className="status" style={{marginTop:8}}>{message}</p>}
      </form>
    </div>
  );
}
