import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const _envApi = process.env.REACT_APP_API_URL;
const API_BASE = _envApi ? _envApi.replace(/\/$/, "") : (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");

export default function Profile({ currentUser, onProfileChange, onAuthError }) {
  const [profile, setProfile] = useState(currentUser || null);
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    bio: currentUser?.bio || "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ text: "", tone: "" });

  useEffect(() => {
    if (currentUser) {
      setProfile(currentUser);
      setForm({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        bio: currentUser.bio || "",
        password: "",
      });
    }
  }, [currentUser]);

  const fetchProfile = useCallback(async (showSpinner = true) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setProfile(null);
      setFeedback({ text: "Bạn cần đăng nhập để xem thông tin cá nhân.", tone: "error" });
      return;
    }
    if (showSpinner) setLoading(true);
    setFeedback({ text: "", tone: "" });
    try {
      const res = await axios.get(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000,
      });
      const user = res.data?.user;
      setProfile(user || null);
      if (user) {
        setForm({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          bio: user.bio || "",
          password: "",
        });
        onProfileChange?.(user);
      }
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || "Không tải được thông tin profile";
      setProfile(null);
      setFeedback({ text: message, tone: "error" });
      if (status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        onAuthError?.();
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [onProfileChange, onAuthError]);

  useEffect(() => {
    // Nếu đã có currentUser (từ lúc đăng nhập), hiển thị ngay và refresh nền
    // để tránh treo spinner khi token hợp lệ nhưng mạng chậm.
    fetchProfile(!currentUser); // chỉ show spinner nếu chưa có dữ liệu ban đầu
  }, [fetchProfile, currentUser]);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      bio: profile?.bio || "",
      password: "",
    });
    setFeedback({ text: "", tone: "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setFeedback({ text: "Chưa có token. Hãy đăng nhập lại.", tone: "error" });
      return;
    }
    setSaving(true);
    setFeedback({ text: "", tone: "" });
    try {
      const payload = {};
  const currentName = profile?.name ?? "";
  const currentEmail = profile?.email ?? "";
  const currentPhone = profile?.phone ?? "";
  const currentBio = profile?.bio ?? "";

  if (form.name && form.name.trim() !== currentName) payload.name = form.name.trim();
  if (form.email && form.email.trim() !== currentEmail) payload.email = form.email.trim();
  if (form.phone.trim() !== currentPhone) payload.phone = form.phone.trim();
  if (form.bio.trim() !== currentBio) payload.bio = form.bio.trim();
      if (form.password) payload.password = form.password;

      if (!Object.keys(payload).length) {
        setFeedback({ text: "Không có thay đổi nào để lưu.", tone: "error" });
        return;
      }

      const res = await axios.put(`${API_BASE}/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = res.data?.user;
      setProfile(user || null);
      setForm({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        bio: user?.bio || "",
        password: "",
      });
      setFeedback({ text: res.data?.message || "Cập nhật thành công", tone: "success" });
      onProfileChange?.(user);
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || "Cập nhật thất bại";
      setFeedback({ text: message, tone: "error" });
      if (status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        onAuthError?.();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid-profile">
      <div className="panel appear-up">
        <div className="panel__header">
          <h3 className="panel__title">Thông tin cá nhân</h3>
          <button type="button" className="button button--ghost" onClick={() => fetchProfile(true)} disabled={loading}>
            {loading ? "Đang tải..." : "Tải lại"}
          </button>
        </div>
        <div className="panel__body">
          {loading && <p className="loading">Đang tải thông tin...</p>}
          {!loading && !profile && feedback.text && feedback.tone === "error" && (
            <p className="status status--error">{feedback.text}</p>
          )}
          {!loading && profile && (
            <div className="profile-summary">
              <div className="profile-header-card">
                <div className="profile-avatar" aria-hidden>
                  {(profile.name || profile.email || "?")
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join('') || '?'}
                </div>
                <div className="profile-header-card__meta">
                  <h4 className="profile-header-card__name">{profile.name || 'Người dùng chưa đặt tên'}</h4>
                  <a className="profile-header-card__email" href={`mailto:${profile.email}`}>{profile.email}</a>
                  <span className={`role-badge role-badge--${profile.role || 'user'}`}>{profile.role || 'user'}</span>
                </div>
              </div>

              <div className="profile-detail-grid">
                <div className="profile-field">
                  <span className="profile-field__label">Họ tên</span>
                  <span className="profile-field__value">{profile.name || 'Chưa cập nhật'}</span>
                </div>
                <div className="profile-field">
                  <span className="profile-field__label">Email</span>
                  <span className="profile-field__value">{profile.email}</span>
                </div>
                <div className="profile-field">
                  <span className="profile-field__label">Vai trò</span>
                  <span className="profile-field__value">{profile.role}</span>
                </div>
                <div className="profile-field">
                  <span className="profile-field__label">Số điện thoại</span>
                  <span className="profile-field__value">{profile.phone || 'Chưa cung cấp'}</span>
                </div>
                <div className="profile-field profile-field--block">
                  <span className="profile-field__label">Giới thiệu</span>
                  <span className="profile-field__value">{profile.bio || 'Chưa chia sẻ thêm'}</span>
                </div>
              </div>

              <div className="profile-meta">
                <span>Tạo lúc: {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : "--"}</span>
                <span>Cập nhật lần cuối: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "--"}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="panel appear-up delay-1">
        <div className="panel__header">
          <h3 className="panel__title">Cập nhật thông tin</h3>
        </div>
        <div className="panel__body">
          <form className="form profile-form" onSubmit={submit}>
            <div className="field">
              <label className="label" htmlFor="profile-name">Họ tên</label>
              <input
                id="profile-name"
                name="name"
                className="input"
                placeholder="Nhập họ tên"
                value={form.name}
                onChange={change}
                autoComplete="name"
                required
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                name="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={change}
                autoComplete="email"
                required
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="profile-phone">Số điện thoại</label>
              <input
                id="profile-phone"
                name="phone"
                className="input"
                placeholder="Ví dụ: 0987 654 321"
                value={form.phone}
                onChange={change}
                autoComplete="tel"
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="profile-bio">Giới thiệu</label>
              <textarea
                id="profile-bio"
                name="bio"
                className="input textarea"
                placeholder="Viết vài dòng về bản thân"
                value={form.bio}
                onChange={change}
                rows={4}
              />
              <small className="form-hint">Tối đa 500 ký tự.</small>
            </div>
            <div className="field">
              <label className="label" htmlFor="profile-password">Mật khẩu mới</label>
              <input
                id="profile-password"
                name="password"
                type="password"
                className="input"
                placeholder="Để trống nếu không đổi"
                value={form.password}
                onChange={change}
                autoComplete="new-password"
                minLength={6}
              />
              <small className="form-hint">Để trống nếu bạn không muốn thay đổi mật khẩu.</small>
            </div>
            {feedback.text && (
              <p className={`status ${feedback.tone ? "status--" + feedback.tone : ""}`}>{feedback.text}</p>
            )}
            <div className="row">
              <button type="submit" className="button" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button type="button" className="button button--ghost" onClick={resetForm} disabled={saving}>
                Khôi phục
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
