import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';
import '../index.css';

function ForgotPasswordForm() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [captcha, setCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');

  const [otp, setOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');

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

  /* ---------- OTP ---------- */
  const sendOtp = () => {
    if (!isCaptchaValid) return;

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(generatedOtp);

    console.log('OTP (mock):', generatedOtp); // dev only
    setStep(2);
  };

  const verifyOtp = () => {
    if (otpInput === otp) {
      setStep(3);
    } else {
      alert('Invalid OTP');
    }
  };

  const handleFinalReset = () => {
    alert('Password reset successfully (mock)');
    navigate('/'); // ✅ back to login
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
                onChange={handleFilled}
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
              disabled={!isCaptchaValid}
              style={{
                opacity: isCaptchaValid ? 1 : 0.5,
                cursor: isCaptchaValid ? 'pointer' : 'not-allowed',
              }}
            >
              Send OTP
            </button>
          </>
        )}

        {/* ================= STEP 2 : VERIFY OTP ================= */}
        {step === 2 && (
          <>
            {/* DEV ONLY */}
            <p
              style={{
                fontSize: '12px',
                color: '#000',
                marginBottom: '6px',
              }}
            >
              Dev OTP: <strong>{otp}</strong>
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

            <button className="signin" onClick={verifyOtp}>
              Verify OTP
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
                onChange={handleFilled}
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
                onChange={handleFilled}
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

            <button className="signin" onClick={handleFinalReset}>
              Reset Password
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
