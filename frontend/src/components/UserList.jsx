import { useEffect, useState, useMemo } from "react";
import axios from "axios";

const _envApi = process.env.REACT_APP_API_URL;
const API_BASE = _envApi ? _envApi.replace(/\/$/, "") : (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");

export default function UserList({ onEdit }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getInitials = (name = "?") => {
    try {
      const parts = String(name).trim().split(/\s+/);
      const first = parts[0]?.[0] || "?";
      const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
      return (first + last).toUpperCase();
    } catch {
      return "?";
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
  const res = await axios.get(`${API_BASE}/users`);
  if (!cancelled) setUsers((res.data || []).map((u) => ({ ...u, _id: String(u._id || u.id || "") })));
      } catch (err) {
        console.error(err);
        alert("Không tải được users");
        if (!cancelled) setUsers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;
    try {
  await axios.delete(`${API_BASE}/users/${id}`);
  const idStr = String(id);
  setUsers(users.filter(user => String(user._id) !== idStr));
    } catch (err) {
      console.error(err);
      alert("Xóa user thất bại");
    }
  };

  const handleEdit = (user) => {
    onEdit?.(user);
  };

  if (loading) return <p className="loading">Đang tải...</p>;
  if (!users.length)
    return <div className="empty">Chưa có user nào. Hãy thêm mới ở khung bên cạnh.</div>;

  return (
    <ul className="list">
      {users.map((u) => (
        <li
          key={u._id || `${u.name}-${u.email}`}
          className="item"
          title={`${u.name} <${u.email}>`}
        >
          <div className="item__row">
            <div className="item__main">
              <div className="avatar" aria-hidden>{getInitials(u.name)}</div>
              <div>
                <div className="item__name">{u.name}</div>
                <div className="meta">{u.email}</div>
              </div>
            </div>
            <div className="item__actions">
              <button onClick={() => handleEdit(u)} className="button button--small">Sửa</button>
              <button onClick={() => handleDelete(u._id)} className="button button--small button--danger">Xóa</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
