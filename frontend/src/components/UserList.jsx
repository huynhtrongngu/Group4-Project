import { useEffect, useState, useMemo } from "react";
import api, { API_BASE } from "../api";

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

  const getAvatarUrl = (u) => {
    const url = u?.avatarUrl;
    if (!url) return null;
    // If backend returns relative path like /uploads/..., prefix with API_BASE when set
    if (/^https?:\/\//i.test(url)) return url;
    if (API_BASE) return `${API_BASE}${url.startsWith('/') ? url : '/'+url}`;
    return url; // rely on dev proxy
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          alert("Bạn cần đăng nhập bằng tài khoản admin.");
          if (!cancelled) setUsers([]);
          return;
        }
        const res = await api.get(`/users`, { timeout: 8000 });
        if (!cancelled) setUsers((res.data || []).map((u) => ({ ...u, _id: String(u._id || u.id || "") })));
      } catch (err) {
        console.error(err);
        const status = err?.response?.status;
        const message = status === 403 ? "Chỉ admin mới xem được danh sách" : "Không tải được users";
        alert(message);
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
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        alert("Bạn cần đăng nhập bằng tài khoản hợp lệ.");
        return;
      }
      await api.delete(`/users/${id}`);
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
              {getAvatarUrl(u) ? (
                <img className="avatar avatar--image" src={getAvatarUrl(u)} alt={u.name||'avatar'} />
              ) : (
                <div className="avatar" aria-hidden>{getInitials(u.name)}</div>
              )}
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
