import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const _envApi = process.env.REACT_APP_API_URL;
const API_BASE = _envApi ? _envApi.replace(/\/$/, "") : (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");

export default function Login({ onLoggedIn, prefillEmail }) {
  const rememberedEmail = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("rememberedEmail") || "";
  }, []);
  const [form, setForm] = useState({
    email: prefillEmail || rememberedEmail,
    password: "",
    remember: Boolean(prefillEmail || rememberedEmail),
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: "", tone: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (prefillEmail) {
      setForm((prev) => ({ ...prev, email: prefillEmail, remember: true }));
    }
  }, [prefillEmail]);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ text: "", tone: "" });
    try {
      const payload = { email: form.email, password: form.password };
      const res = await axios.post(`${API_BASE}/login`, payload);
      const token = res.data?.token;
      const user = res.data?.user;
      if (token) localStorage.setItem('token', token);
      if (form.remember) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      onLoggedIn?.(user, token);
      setFeedback({ text: "Đăng nhập thành công", tone: "success" });
    } catch (err) {
      setFeedback({ text: err?.response?.data?.message || "Đăng nhập thất bại", tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <header className="auth-card__header">
        <h2>Chào mừng quay lại 👋</h2>
        <p className="muted">Nhập thông tin để tiếp tục quản lý người dùng của bạn.</p>
      </header>

      <form onSubmit={submit} className="form auth-form">
        <div className="field">
          <label className="label" htmlFor="email">Email</label>
          <div className="input-wrap">
            <span className="input-icon" aria-hidden>@</span>
            <input
              id="email"
              name="email"
              type="email"
              className="input input--with-icon"
              placeholder="you@example.com"
              value={form.email}
              onChange={change}
              autoComplete="email"
              required
            />
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="password">Mật khẩu</label>
          <div className="input-wrap">
            <span className="input-icon" aria-hidden>••</span>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="input input--with-icon"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={change}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </div>

        <div className="form__footer">
          <label className="checkbox">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={(e) => setForm((prev) => ({ ...prev, remember: e.target.checked }))}
            />
            <span>Ghi nhớ email lần sau</span>
          </label>
          <button type="button" className="link-button" onClick={() => alert("Vui lòng liên hệ quản trị viên để đặt lại mật khẩu.")}>Quên mật khẩu?</button>
        </div>

        <button type="submit" className="button" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        {feedback.text && (
          <p className={`status ${feedback.tone ? "status--" + feedback.tone : ""}`}>{feedback.text}</p>
        )}
      </form>
    </div>
  );
}
