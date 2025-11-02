import { useState, useEffect } from "react";
import api from "../api";

export default function AddUser({ onAdded, editUser, onCancelEdit, currentUser }) {
  const [form, setForm] = useState({ name: "", email: "", role: "user" });
  const [saving, setSaving] = useState(false);

  // Update form when editUser changes
  useEffect(() => {
    if (editUser) {
      setForm({ name: editUser.name, email: editUser.email, role: editUser.role || 'user' });
    } else {
      setForm({ name: "", email: "", role: 'user' });
    }
  }, [editUser]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = undefined; // handled by interceptor
      if (editUser) {
        // Update existing user
        if (!token) {
          alert("Bạn cần đăng nhập trước khi chỉnh sửa user.");
          return;
        }
        const payload = { name: form.name, email: form.email };
        if (currentUser?.role === 'admin') payload.role = form.role;
        await api.put(`/users/${editUser._id}`, payload, { headers });
      } else {
        // Add new user
        if (currentUser?.role !== 'admin') {
          alert('Chỉ admin mới được thêm user mới.');
          return;
        }
        const payload = { name: form.name, email: form.email, role: form.role };
        await api.post(`/users`, payload, headers ? { headers } : undefined);
      }
      onAdded?.();
      setForm({ name: "", email: "", role: 'user' });
      onCancelEdit?.();
    } catch (e) {
  alert(e?.response?.data?.message || (editUser ? "Cập nhật user thất bại" : "Thêm user thất bại"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: "", email: "", role: 'user' });
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
      {currentUser?.role === 'admin' && (
        <div className="field">
          <label className="label" htmlFor="role">Vai trò</label>
          <select id="role" name="role" className="input" value={form.role} onChange={change} disabled={Boolean(editUser && editUser.role === 'admin')}>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
          {editUser?.role === 'admin' && (
            <small className="form-hint">Không thể thay đổi vai trò của admin.</small>
          )}
        </div>
      )}
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

