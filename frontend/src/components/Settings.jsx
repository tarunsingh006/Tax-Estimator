import { useState } from 'react';
import {
  User,
  Tag,
  Bell,
  Shield,
  Pencil,
  X,
  Save,
  Trash2,
  Plus
} from 'lucide-react';
import '../index.css';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  // Local state for categories (demo)
  const [categories, setCategories] = useState([
    { id: 1, name: 'Business Expenses', color: '#ef4444' },
    { id: 2, name: 'Office Rent', color: '#3b82f6' },
    { id: 3, name: 'Software Subscriptions', color: '#8b5cf6' },
    { id: 4, name: 'Professional Development', color: '#22c55e' },
  ]);

  const [profile, setProfile] = useState({
    name: localStorage.getItem('userName') || 'User',
    email: localStorage.getItem('userEmail') || 'user@example.com',
    currency: 'USD',
    language: 'English'
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    budgetReminders: true,
    taxDeadlines: true,
    weeklyReports: false
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="transactions-card" style={{ padding: '32px' }}>
            <h4 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '600' }}>Profile Settings</h4>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div>
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="modal-input"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label>Currency</label>
                  <select className="modal-input" value={profile.currency} onChange={(e) => setProfile({ ...profile, currency: e.target.value })}>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                  </select>
                </div>
                <div>
                  <label>Language</label>
                  <select className="modal-input" value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })}>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button className="primary-btn" style={{ gap: '8px' }}>
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      case 'categories':
        return (
          <div className="transactions-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600' }}>Manage Categories</h4>
              <button className="primary-btn" style={{ padding: '8px 16px', fontSize: '13px', gap: '6px' }}>
                <Plus size={16} /> Add New
              </button>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {categories.map((cat) => (
                <div key={cat.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 20px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color }} />
                    <span style={{ fontWeight: '500' }}>{cat.name}</span>
                  </div>
                  <div className="txn-actions">
                    <button className="txn-edit-btn" title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button className="txn-delete-btn" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="transactions-card" style={{ padding: '32px' }}>
            <h4 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '600' }}>Notification Preferences</h4>
            <div style={{ display: 'grid', gap: '20px' }}>
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: '500', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p style={{ fontSize: '13px', opacity: 0.6 }}>Receive alerts via email and push notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => setNotifications({ ...notifications, [key]: !value })}
                    style={{ width: '40px', height: '20px', cursor: 'pointer' }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button className="primary-btn" style={{ gap: '8px' }}>
                  <Save size={18} /> Update Preferences
                </button>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="transactions-card" style={{ padding: '32px' }}>
            <h4 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '600' }}>Security Settings</h4>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label>Current Password</label>
                <input type="password" className="modal-input" placeholder="••••••••" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label>New Password</label>
                  <input type="password" className="modal-input" placeholder="Enter new password" />
                </div>
                <div>
                  <label>Confirm Password</label>
                  <input type="password" className="modal-input" placeholder="Confirm new password" />
                </div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', marginTop: '12px' }}>
                <h5 style={{ color: '#ef4444', marginBottom: '8px' }}>Danger Zone</h5>
                <p style={{ fontSize: '13px', opacity: 0.8, marginBottom: '12px' }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="dashboard-main">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff' }}>Settings</h2>
        <p style={{ opacity: 0.8, color: '#fff' }}>Manage your account settings and preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        {/* SIDE NAV */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'categories', label: 'Categories', icon: Tag },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 20px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                opacity: activeTab === item.id ? 1 : 0.7,
                fontWeight: activeTab === item.id ? '600' : '400'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) e.currentTarget.style.background = 'transparent';
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div>
          {renderContent()}
        </div>
      </div>
    </main>
  );
}

export default Settings;
