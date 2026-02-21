import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';
import '../index.css';
import { forgotPassword, verifyOtp as apiVerifyOtp, resetPassword as apiResetPassword } from '../api/auth';
import { showToast } from './Toast';

function ForgotPasswordForm() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [resetSessionToken, setResetSessionToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* ---------- CAPTCHA ---------- */
  const generateCaptcha = () => {
    const value = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptcha(value);
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const isCaptchaValid = captchaInput === captcha;

  /* ---------- API CALLS ---------- */
  const sendOtp = async () => {
    if (!isCaptchaValid) {
      showToast("Invalid Captcha", "Please enter the correct captcha code", "info");
      return;
    }
    if (!email) {
      showToast("Error", "Please enter your email address", "info");
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      showToast("OTP Sent", "Verification code has been sent to your email", "success");
      setStep(2);
    } catch (error) {
      console.error("Send OTP error:", error);
      showToast("Error", error.response?.data?.message || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpInput) {
      showToast("Required", "Please enter the 6-digit OTP", "info");
      return;
    }

    try {
      setLoading(true);
      const data = await apiVerifyOtp(email, otpInput);
      setResetSessionToken(data.resetSessionToken);
      showToast("Verified", "OTP verified successfully", "success");
      setStep(3);
    } catch (error) {
      showToast("Error", error.response?.data?.message || "Invalid or expired OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalReset = async () => {
    if (!newPassword || !confirmPassword) {
      showToast("Required", "Please fill both password fields", "info");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Error", "Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Error", "Password must be at least 6 characters", "info");
      return;
    }

    try {
      setLoading(true);
      await apiResetPassword(email, resetSessionToken, newPassword);
      showToast("Success", "Password reset successfully ✅", "success");
      navigate('/');
    } catch (error) {
      showToast("Error", error.response?.data?.message || "Failed to reset password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFilled = (e) => {
    e.target.classList.toggle('filled', e.target.value !== '');
  };

  return (
    <div className="right">
      <h2>
        {step === 1 && 'Forgot Password'}
        {step === 2 && 'Enter OTP'}
        {step === 3 && 'Reset Password'}
      </h2>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* ================= STEP 1 : SEND OTP ================= */}
        {step === 1 && (
          <>
            <label>Email</label>
            <div className="input-group">
              <input
                type="email"
                placeholder="username@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  handleFilled(e);
                }}
              />
            </div>

            <label>Captcha</label>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{
                flex: 1,
                height: '52px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <span style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  letterSpacing: '8px',
                  fontStyle: 'italic',
                  userSelect: 'none',
                  opacity: 0.8,
                  color: '#fff'
                }}>
                  {captcha}
                </span>
                {/* CLUMSY LINE */}
                <div style={{
                  position: 'absolute',
                  width: '120%',
                  height: '2px',
                  background: 'rgba(255,255,255,0.4)',
                  transform: 'rotate(-5deg)',
                  pointerEvents: 'none'
                }} />
                <div style={{
                  position: 'absolute',
                  width: '120%',
                  height: '1px',
                  background: 'rgba(255,255,255,0.3)',
                  transform: 'rotate(8deg)',
                  pointerEvents: 'none'
                }} />
              </div>

              <button
                type="button"
                className="refresh-btn"
                onClick={generateCaptcha}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '52px',
                  height: '52px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  color: '#fff'
                }}
              >
                <RefreshCw size={20} />
              </button>
            </div>

            <div className="input-group" style={{ marginTop: '16px' }}>
              <input
                type="text"
                placeholder="Enter verification code"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value);
                  handleFilled(e);
                }}
              />
            </div>

            <button
              className="signin"
              onClick={sendOtp}
              disabled={!isCaptchaValid || loading}
              style={{
                opacity: (isCaptchaValid && !loading) ? 1 : 0.5,
                cursor: (isCaptchaValid && !loading) ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        )}

        {/* ================= STEP 2 : VERIFY OTP ================= */}
        {step === 2 && (
          <>
            <p
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '6px',
              }}
            >
              Verification code sent to <strong>{email}</strong>
            </p>

            <div className="input-group">
              <input
                type="text"
                placeholder="6-digit OTP"
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value);
                  handleFilled(e);
                }}
              />
            </div>

            <button className="signin" onClick={verifyOtp} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </>
        )}

        {/* ================= STEP 3 : RESET PASSWORD ================= */}
        {step === 3 && (
          <>
            <label>New Password</label>
            <div className="input-group password-group">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  handleFilled(e);
                }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <label>Confirm Password</label>
            <div className="input-group password-group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  handleFilled(e);
                }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button className="signin" onClick={handleFinalReset} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </>
        )}

        <p className="register">
          Remember your password?{' '}
          <span
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            Back to Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default ForgotPasswordForm;
