import { useState, useEffect } from 'react';
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
import { getProfile, updateProfile, updateNotifications, changePassword, deleteAccount } from '../api/user';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../api/categories';
import { showToast } from './Toast';
import CategoryModal from './CategoryModal';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // States
  const [categories, setCategories] = useState([]);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    currency: 'USD',
    language: 'English'
  });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    budgetReminders: true,
    taxDeadlines: true,
    weeklyReports: false
  });

  // Security state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profileData = await getProfile();
      setProfile({
        name: profileData.full_name || '',
        email: profileData.email || '',
        currency: profileData.currency || 'USD',
        language: profileData.language || 'English'
      });

      if (profileData.notification_preferences) {
        setNotifications(profileData.notification_preferences);
      }

      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching settings:", error);
      showToast("Error", "Failed to load settings data", "error");
    }
  };

  const handleProfileSave = async () => {
    try {
      setLoading(true);
      await updateProfile({
        full_name: profile.name,
        email: profile.email,
        currency: profile.currency,
        language: profile.language
      });

      // Update local storage if name or email changed
      localStorage.setItem('userName', profile.name);
      localStorage.setItem('userEmail', profile.email);

      showToast("Success", "Profile updated successfully", "success");
    } catch (error) {
      showToast("Error", error.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsSave = async () => {
    try {
      setLoading(true);
      await updateNotifications(notifications);
      showToast("Success", "Preferences updated successfully", "success");
    } catch (error) {
      showToast("Error", "Failed to update notification preferences", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (security.newPassword !== security.confirmPassword) {
      showToast("Error", "Passwords do not match", "error");
      return;
    }

    if (security.newPassword.length < 6) {
      showToast("Error", "Password must be at least 6 characters", "info");
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword
      });
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast("Success", "Password changed successfully", "success");
    } catch (error) {
      showToast("Error", error.response?.data?.message || "Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      try {
        await deleteAccount();
        showToast("Account Deleted", "Your account has been removed", "success");
        localStorage.clear();
        window.location.href = '/login';
      } catch (error) {
        showToast("Error", "Failed to delete account", "error");
      }
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Delete this category?")) {
      try {
        await deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
        showToast("Success", "Category deleted", "success");
      } catch (error) {
        showToast("Error", "Failed to delete category", "error");
      }
    }
  };

  const saveCategory = async (data) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
        showToast("Success", "Category updated", "success");
      } else {
        await addCategory(data);
        showToast("Success", "Category added", "success");
      }
      setIsCategoryModalOpen(false);
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      showToast("Error", "Failed to save category", "error");
    }
  };

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
                <button
                  className="primary-btn"
                  style={{ gap: '8px' }}
                  onClick={handleProfileSave}
                  disabled={loading}
                >
                  <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
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
              <button
                className="primary-btn"
                style={{ padding: '8px 16px', fontSize: '13px', gap: '6px' }}
                onClick={handleAddCategory}
              >
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
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '500' }}>{cat.name}</span>
                      <span style={{ fontSize: '11px', opacity: 0.5, textTransform: 'capitalize' }}>{cat.type}</span>
                    </div>
                  </div>
                  <div className="txn-actions">
                    <button className="txn-edit-btn" title="Edit" onClick={() => handleEditCategory(cat)}>
                      <Pencil size={16} />
                    </button>
                    <button className="txn-delete-btn" title="Delete" onClick={() => handleDeleteCategory(cat.id)}>
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
                <button
                  className="primary-btn"
                  style={{ gap: '8px' }}
                  onClick={handleNotificationsSave}
                  disabled={loading}
                >
                  <Save size={18} /> {loading ? 'Updating...' : 'Update Preferences'}
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
                <input
                  type="password"
                  className="modal-input"
                  placeholder="••••••••"
                  value={security.currentPassword}
                  onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label>New Password</label>
                  <input
                    type="password"
                    className="modal-input"
                    placeholder="Enter new password"
                    value={security.newPassword}
                    onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    className="modal-input"
                    placeholder="Confirm new password"
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button
                  className="primary-btn"
                  style={{ gap: '8px' }}
                  onClick={handlePasswordChange}
                  disabled={loading || !security.currentPassword || !security.newPassword}
                >
                  <Shield size={18} /> {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
              <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', marginTop: '12px' }}>
                <h5 style={{ color: '#ef4444', marginBottom: '8px' }}>Danger Zone</h5>
                <p style={{ fontSize: '13px', opacity: 0.8, marginBottom: '12px' }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button
                  style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                  onClick={handleDeleteAccount}
                >
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

      {isCategoryModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={saveCategory}
        />
      )}
    </main>
  );
}

export default Settings;
