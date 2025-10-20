import { useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "";

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
        return;
      }
      if (form.password !== form.confirmPassword) {
        setMessage("Mật khẩu nhập lại không khớp");
        return;
      }
      const res = await axios.post(`${API_BASE}/signup`, form);
      const createdEmail = form.email;
      setMessage(res.data?.message || "Tạo tài khoản thành công");
      // Đợi người dùng nhìn thấy thông báo, rồi chuyển sang trang Đăng nhập và tự điền email
      setTimeout(() => {
        onSignedUp?.(createdEmail);
      }, 1200);
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (err) {
      setMessage(err?.response?.data?.message || "Đăng ký thất bại");
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
