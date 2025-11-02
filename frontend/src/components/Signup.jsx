import { useState } from "react";
import api from "../api";

// Default to REACT_APP_API_URL when provided; in development fall back to localhost:3000
// This avoids issues when the dev proxy isn't active or the app is opened without the CRA dev server.
const _envApi = process.env.REACT_APP_API_URL;
const API_BASE = _envApi ? _envApi.replace(/\/$/, "") : (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '');

export default function Signup({ onSignedUp }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if (!form.password || form.password.length < 6) {
        setMessage("Mật khẩu phải có ít nhất 6 ký tự");
        setLoading(false);
        return;
      }
      if (form.password !== form.confirmPassword) {
        setMessage("Mật khẩu nhập lại không khớp");
        setLoading(false);
        return;
      }
      // Only send required fields to the backend
      const payload = { name: form.name, email: form.email, password: form.password };
  const res = await api.post(`/signup`, payload);
      const createdEmail = form.email;
      setMessage(res.data?.message || "Tạo tài khoản thành công");
      // Đợi người dùng nhìn thấy thông báo, rồi chuyển sang trang Đăng nhập và tự điền email
      setTimeout(() => {
        onSignedUp?.(createdEmail);
      }, 1200);
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (err) {
      // Show backend error message when available, else a network/axios message
      const errMsg = err?.response?.data?.message || err?.message || "Đăng ký thất bại";
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="form">
      <div className="field">
        <label className="label" htmlFor="name">Tên</label>
        <input id="name" name="name" className="input" value={form.name} onChange={change} required />
      </div>
      <div className="field">
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" value={form.email} onChange={change} required />
      </div>
      <div className="field">
        <label className="label" htmlFor="password">Mật khẩu</label>
        <input id="password" name="password" type="password" className="input" value={form.password} onChange={change} required />
      </div>
      <div className="field">
        <label className="label" htmlFor="confirmPassword">Nhập lại mật khẩu</label>
        <input id="confirmPassword" name="confirmPassword" type="password" className="input" value={form.confirmPassword} onChange={change} required />
      </div>
      <button type="submit" className="button" disabled={loading}>{loading ? "Đang đăng ký..." : "Đăng ký"}</button>
      {message && <p className="muted" style={{ marginTop: 8 }}>{message}</p>}
    </form>
  );
}
