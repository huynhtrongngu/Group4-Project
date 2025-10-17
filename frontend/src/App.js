import { useState } from "react";
import UserList from "./components/UserList";
import AddUser from "./components/AddUser";

export default function App() {
  const [reloadKey, setReloadKey] = useState(0);
  const [editUser, setEditUser] = useState(null);

  const handleEdit = (user) => {
    setEditUser(user);
  };

  const handleCancelEdit = () => {
    setEditUser(null);
  };

  const handleAdded = () => {
    setReloadKey((k) => k + 1);
    setEditUser(null);
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo-circle" aria-hidden>U</div>
        <h1 className="brand">Users Admin</h1>
        <p className="muted">Quản lý người dùng đơn giản</p>
        <div className="nav">
          <a className="nav__item active">Dashboard</a>
          <a className="nav__item">Users</a>
          <a className="nav__item">Settings</a>
        </div>
        <div className="sidebar__footer">MER Stack Demo</div>
      </aside>

      <div className="content">
        <section className="hero">
          <div className="hero__text">
            <h2>Xin chào 👋</h2>
            <p>Thực hiện thêm, sửa, xóa và xem danh sách người dùng một cách trực quan.</p>
          </div>
          <div className="hero__art" aria-hidden />
        </section>

        <section className="grid-2">
          <div className="panel appear-up">
            <div className="panel__header">
              <h3 className="panel__title">Danh sách users</h3>
            </div>
            <div className="panel__body">
              <UserList key={reloadKey} onEdit={handleEdit} />
            </div>
          </div>

          <div className="panel appear-up delay-1">
            <div className="panel__header">
              <h3 className="panel__title">{editUser ? "Sửa user" : "Thêm user"}</h3>
              {editUser && <span className="tag">Đang sửa</span>}
            </div>
            <div className="panel__body">
              <AddUser
                onAdded={handleAdded}
                editUser={editUser}
                onCancelEdit={handleCancelEdit}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
