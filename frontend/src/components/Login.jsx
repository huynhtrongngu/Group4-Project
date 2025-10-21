import { useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "";

export default function Login({ onLoggedIn, prefillEmail }) {
  const [form, setForm] = useState({ email: prefillEmail || "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(`${API_BASE}/login`, form);
      const token = res.data?.token;
      const user = res.data?.user;
      if (token) localStorage.setItem('token', token);
      onLoggedIn?.(user, token);
      setMessage("Đăng nhập thành công");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="form">
      <div className="field">
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" value={form.email} onChange={change} required />
      </div>
      <div className="field">
        <label className="label" htmlFor="password">Mật khẩu</label>
        <input id="password" name="password" type="password" className="input" value={form.password} onChange={change} required />
      </div>
      <button type="submit" className="button" disabled={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button>
      {message && <p className="muted" style={{ marginTop: 8 }}>{message}</p>}
    </form>
  );
}
