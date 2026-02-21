import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import LeftSection from './components/LeftSection';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';

import Dashboard from './components/Dashboard';
import TransactionsPage from './components/TransactionsPage';
import Budgets from './components/Budgets';
import TaxEstimator from './components/TaxEstimator';
import Reports from './components/Reports';
import Settings from './components/Settings'; // ✅ ADDED
import DashboardLayout from './components/DashboardLayout';

import Toast, { showToast } from './components/Toast.jsx';

import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const rawUserName = localStorage.getItem('userName');
  const user = {
    name: rawUserName && rawUserName !== 'undefined' ? rawUserName : 'User',
    email: localStorage.getItem('userEmail') || '',
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    showToast('Success', 'Login Successful!');
  };

  const handleLogout = () => {
    showToast('Info', 'Logged out successfully!');
    setTimeout(() => {
      localStorage.clear();
      setIsLoggedIn(false);
    }, 500);
  };

  return (
    <>
      {/* UNIVERSAL TOAST */}
      <Toast />

      {/* ---------- AUTH SCREENS ---------- */}
      {!isLoggedIn ? (
        <div className="card">
          <LeftSection />

          <Routes>
            <Route
              path="/"
              element={<LoginForm onLoginSuccess={handleLoginSuccess} />}
            />

            <Route
              path="/signup"
              element={
                <SignupForm
                  onSignupSuccess={() =>
                    showToast(
                      'Success',
                      'Account created successfully! You can now login.'
                    )
                  }
                />
              }
            />

            <Route path="/forgot" element={<ForgotPasswordForm />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      ) : (
        /* ---------- PROTECTED APP ---------- */
        <Routes>
          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Layout Route */}
          <Route
            element={
              <DashboardLayout
                onLogout={handleLogout}
                userName={user.name}
                userEmail={user.email}
              />
            }
          >
            <Route
              path="/dashboard"
              element={<Dashboard userName={user.name} />}
            />

            <Route path="/transactions" element={<TransactionsPage />} />

            <Route path="/budgets" element={<Budgets />} />

            <Route path="/tax-estimator" element={<TaxEstimator />} />

            <Route path="/reports" element={<Reports />} />

            <Route path="/settings" element={<Settings />} /> {/* ✅ FIX */}
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      )}
    </>
  );
}

export default App;
