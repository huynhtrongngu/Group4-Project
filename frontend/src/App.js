import { useState } from "react";
import UserList from "./components/UserList";
import AddUser from "./components/AddUser";
import Signup from "./components/Signup";
import Login from "./components/Login";

export default function App() {
  const [reloadKey, setReloadKey] = useState(0);
  const [editUser, setEditUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [view, setView] = useState('login'); // 'login' | 'signup' | 'dashboard'
  const [prefillEmail, setPrefillEmail] = useState('');

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

  const handleSignedUp = (email) => {
    setPrefillEmail(email || '');
    setView('login');
  };

  const handleLoggedIn = (user) => {
    setAuthUser(user || null);
    setView('dashboard');
  };

  const handleLogout = async () => {
    // Remove token locally and optionally ping backend /logout for screenshots
    localStorage.removeItem('token');
    try {
      await fetch('/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    } catch {}
    setAuthUser(null);
    setView('login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo-circle" aria-hidden>U</div>
        <h1 className="brand">Users Admin</h1>
        <p className="muted">Quản lý người dùng đơn giản</p>
        <div className="nav">
          <button className={`nav__item ${view==='dashboard'?'active':''}`} onClick={() => setView('dashboard')}>Dashboard</button>
          <button className={`nav__item ${view==='login'?'active':''}`} onClick={() => setView('login')}>Đăng nhập</button>
          <button className={`nav__item ${view==='signup'?'active':''}`} onClick={() => setView('signup')}>Đăng ký</button>
        </div>
        <div className="sidebar__footer">
          MER Stack Demo
          {authUser ? (
            <div style={{ marginTop: 8 }}>
              <div className="meta">Hi, {authUser.name}</div>
              <button className="button button--small" onClick={handleLogout}>Đăng xuất</button>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="content">
        {view === 'signup' && (
          <section className="grid-2">
            <div className="panel appear-up">
              <div className="panel__header">
                <h3 className="panel__title">Form đăng ký</h3>
              </div>
              <div className="panel__body">
                <Signup onSignedUp={handleSignedUp} />
              </div>
            </div>
            <div className="panel appear-up delay-1">
              <div className="panel__header">
                <h3 className="panel__title">Ghi chú</h3>
              </div>
              <div className="panel__body">
                <p>Điền tên, email và mật khẩu để tạo tài khoản. Email không được trùng.</p>
              </div>
            </div>
          </section>
        )}

        {view === 'login' && (
          <section className="grid-2">
            <div className="panel appear-up">
              <div className="panel__header">
                <h3 className="panel__title">Form đăng nhập</h3>
              </div>
              <div className="panel__body">
                <Login onLoggedIn={handleLoggedIn} prefillEmail={prefillEmail} />
              </div>
            </div>
            <div className="panel appear-up delay-1">
              <div className="panel__header">
                <h3 className="panel__title">JWT token</h3>
              </div>
              <div className="panel__body">
                <p>Token được lưu ở localStorage:</p>
                <code>{localStorage.getItem('token') || 'Chưa có token'}</code>
              </div>
            </div>
          </section>
        )}

        {view === 'dashboard' && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
