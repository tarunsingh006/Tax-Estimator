import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import '../index.css';
import api from '../api/axios';

function SignupForm({ onSignupSuccess }) {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    country: '',
    income: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    e.target.classList.toggle('filled', value !== '');
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (
      !formData.username ||
      !formData.password ||
      !formData.fullName ||
      !formData.email ||
      !formData.country
    ) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setError('');

      await api.post('/auth/register', {
        username: formData.username,
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        income_bracket: formData.income,
      });

      // ✅ Trigger App-level toast
      if (onSignupSuccess) onSignupSuccess();

      // Navigate to login after 3 sec
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="right signup-right">
      <h2>Create Account</h2>
      <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '12px' }}>
        Enter your information to create your TaxPal account
      </p>

      <form onSubmit={handleCreateAccount}>
        <div
          className="signup-grid"
          style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}
        >
          <div>
            <label>Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label>Password</label>
            <div className="input-group password-group">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Choose a password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label>Full Name</label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label>Confirm Password</label>
            <div className="input-group password-group">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
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
          </div>

          <div>
            <label>Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label>Country</label>
            <div className="input-group">
              <input
                name="country"
                list="country-options"
                value={formData.country}
                onChange={handleChange}
                placeholder="Enter your country"
              />
            </div>
            <datalist id="country-options">
              <option value="USA" />
              <option value="India" />
              <option value="UK" />
              <option value="Canada" />
              <option value="Australia" />
              <option value="Singapore" />
              <option value="UAE" />
              <option value="Germany" />
              <option value="France" />
            </datalist>
          </div>

          <div>
            <label>Income Bracket (Optional)</label>
            <select
              name="income"
              value={formData.income}
              onChange={handleChange}
            >
              <option value="" disabled>Select your income bracket</option>
              <option>Low</option>
              <option>Middle</option>
              <option>High</option>
            </select>
          </div>
        </div>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

        <button type="submit" className="signin" style={{ marginTop: '20px' }}>
          Create Account
        </button>

        <p className="register">
          Already have an account?{' '}
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default SignupForm;
