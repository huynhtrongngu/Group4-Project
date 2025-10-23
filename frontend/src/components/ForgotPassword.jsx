import { useState } from "react";
import axios from "axios";

const _envApi = process.env.REACT_APP_API_URL;
const API_BASE = _envApi ? _envApi.replace(/\/$/, "") : (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '');

export default function ForgotPassword({ onShowReset }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [devToken, setDevToken] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setDevToken("");
    try {
      const res = await axios.post(`${API_BASE}/forgot-password`, { email });
      setMessage(res.data?.message || "Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại.");
      if (res.data?.devToken) setDevToken(res.data.devToken);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Gửi yêu cầu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <header className="auth-card__header">
        <h2>Quên mật khẩu</h2>
        <p className="muted">Nhập email để nhận token/đường dẫn đặt lại.</p>
      </header>
      <form onSubmit={submit} className="form auth-form">
        <div className="field">
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="button" disabled={loading}>{loading?"Đang gửi...":"Gửi"}</button>
        {message && <p className="status" style={{marginTop:8}}>{message}</p>}
        {devToken && (
          <div className="token-box">
            <div className="row" style={{alignItems:'center', gap:8}}>
              <code style={{userSelect:'all'}}>{devToken}</code>
              <button type="button" className="button button--small" onClick={() => onShowReset?.(devToken)}>Dùng token này để đổi mật khẩu</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
