import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "";

export default function AddUser({ onAdded, editUser, onCancelEdit }) {
  const [form, setForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);

  // Update form when editUser changes
  useEffect(() => {
    if (editUser) {
      setForm({ name: editUser.name, email: editUser.email });
    } else {
      setForm({ name: "", email: "" });
    }
  }, [editUser]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editUser) {
        // Update existing user
        await axios.put(`${API_BASE}/users/${editUser._id}`, form);
      } else {
        // Add new user
        await axios.post(`${API_BASE}/users`, form);
      }
      onAdded?.();
      setForm({ name: "", email: "" });
      onCancelEdit?.();
    } catch (e) {
      alert(e?.response?.data?.message || (editUser ? "Cập nhật user thất bại" : "Thêm user thất bại"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: "", email: "" });
    onCancelEdit?.();
  };

  return (
    <form onSubmit={submit} className="form">
      <div className="field">
        <label className="label" htmlFor="name">Tên</label>
        <input className="input" id="name" name="name" placeholder="Tên" value={form.name} onChange={change} required />
      </div>
      <div className="field">
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" placeholder="Email" value={form.email} onChange={change} required />
      </div>
      <div className="row">
        <button type="submit" className="button" disabled={saving}>
          {saving ? "Đang lưu..." : (editUser ? "Cập nhật" : "Thêm")}
        </button>
        <button type="button" className="button button--ghost" onClick={handleCancel}>
          {editUser ? "Hủy" : "Xóa"}
        </button>
      </div>
    </form>
  );
}

