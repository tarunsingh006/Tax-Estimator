import { useState, useEffect } from 'react';
import { Calendar, Calculator, Save, Download, Clock, Plus } from 'lucide-react';
import { saveTaxEstimate, getTaxCalendarEvents, getTaxEstimates } from '../api/taxes';
import { getTransactions } from '../api/transactions';
import api from '../api/axios';
import { showToast } from './Toast';
import '../index.css';

// Modal for Adding Calendar Events
const AddEventModal = ({ onClose, onSave, year }) => {
    const [eventData, setEventData] = useState({
        title: '',
        event_date: `${year}-01-01`,
        description: '',
        event_type: 'reminder'
    });

    return (
        <div className="modal-backdrop">
            <div className="modal-card">
                <div className="modal-header">
                    <h3>Create New Reminder</h3>
                    <button onClick={onClose}>✕</button>
                </div>
                <p className="modal-sub">
                    Get ahead of your taxes by setting custom deadlines.
                </p>

                <label>Reminder Title</label>
                <input
                    className="modal-input"
                    placeholder="e.g. Quarterly VAT Filing"
                    value={eventData.title}
                    onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                />

                <div className="modal-row">
                    <div>
                        <label>Date</label>
                        <input
                            type="date"
                            className="modal-input"
                            value={eventData.event_date}
                            onChange={(e) => setEventData({ ...eventData, event_date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Category</label>
                        <select
                            className="modal-input"
                            value={eventData.event_type}
                            onChange={(e) => setEventData({ ...eventData, event_type: e.target.value })}
                        >
                            <option value="reminder">🔔 Reminder</option>
                            <option value="payment">💰 Payment</option>
                        </select>
                    </div>
                </div>

                <label>Notes</label>
                <textarea
                    className="modal-input"
                    placeholder="Add details about this deadline..."
                    style={{ minHeight: '100px' }}
                    value={eventData.description}
                    onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                />

                <div className="modal-actions">
                    <button className="ghost" onClick={onClose}>
                        Discard
                    </button>
                    <button
                        className="primary"
                        onClick={() => onSave(eventData)}
                        disabled={!eventData.title || !eventData.event_date}
                    >
                        Save Reminder
                    </button>
                </div>
            </div>
        </div>
    );
};

// Separate Modal Component for History
const HistoryModal = ({ history, onClose }) => (
    <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card glassy-modal" style={{ maxWidth: '650px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="icon-badge blue">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '20px' }}>Tax Estimation History</h3>
                        <p style={{ margin: 0, fontSize: '12px', opacity: 0.6, color: '#fff' }}>Your previously saved quarterly calculations</p>
                    </div>
                </div>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="modal-body custom-scrollbar" style={{ maxHeight: '450px', overflowY: 'auto', marginTop: '24px', paddingRight: '10px' }}>
                {history.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {history.map((item, idx) => (
                            <div key={idx} className="history-item">
                                <div className="history-info">
                                    <div className="history-quarter">{item.quarter}</div>
                                    <div className="history-meta">
                                        <span>{item.country}</span>
                                        <span className="dot-sep"></span>
                                        <span>{item.filing_status}</span>
                                        <span className="dot-sep"></span>
                                        <span>{new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>
                                <div className="history-value">
                                    <div className="value-label">Estimated Tax</div>
                                    <div className="value-amount">
                                        ₹{parseFloat(item.estimated_tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', opacity: 0.5, padding: '60px 20px' }}>
                        <div className="empty-state-icon">
                            <Clock size={48} />
                        </div>
                        <h4 style={{ color: '#fff', marginBottom: '8px' }}>No Estimates Found</h4>
                        <p style={{ color: '#fff', fontSize: '14px' }}>Once you calculate and save a tax estimate, it will appear here.</p>
                    </div>
                )}
            </div>
            <div className="modal-actions" style={{ marginTop: '28px' }}>
                <button className="primary-btn glassy-btn" onClick={onClose} style={{ width: '100%', height: '48px', fontWeight: '600' }}>
                    Close History
                </button>
            </div>
        </div>
    </div>
);

function TaxEstimator() {
    const storedUserId = localStorage.getItem('userId');
    const userId = storedUserId && storedUserId !== 'undefined' ? storedUserId : null;
    const [view, setView] = useState('estimator'); // 'estimator' or 'calendar'
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    // History State
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showAddEvent, setShowAddEvent] = useState(false);

    const [formData, setFormData] = useState({
        country: '',
        state: '',
        filingStatus: '',
        quarter: '',
        grossIncome: '',
        businessExpenses: '',
        retirementContributions: '',
        healthInsurance: '',
        homeOffice: '',
    });

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const years = [selectedYear - 1, selectedYear, selectedYear + 1];

    const quarters = [
        { id: 'Q1', label: `Q1 (Jan-Mar ${selectedYear})` },
        { id: 'Q2', label: `Q2 (Apr-Jun ${selectedYear})` },
        { id: 'Q3', label: `Q3 (Jul-Sep ${selectedYear})` },
        { id: 'Q4', label: `Q4 (Oct-Dec ${selectedYear})` }
    ];

    const [estimatedTax, setEstimatedTax] = useState(null);
    const [calendarLoading, setCalendarLoading] = useState(true);
    const [calendarError, setCalendarError] = useState(null);

    const fetchCalendar = async () => {
        if (!userId) return;
        try {
            setCalendarLoading(true);
            setCalendarError(null);
            console.log(`📅 Fetching ${selectedYear} calendar events for:`, userId);
            const events = await getTaxCalendarEvents(userId, selectedYear);

            if (!Array.isArray(events)) {
                console.error("❌ Calendar API returned non-array:", events);
                throw new Error("Invalid response format from calendar API");
            }

            // Group by month for display
            const grouped = events.reduce((acc, event) => {
                const dateVal = event.event_date || event.date;
                if (!dateVal) return acc;

                const date = new Date(dateVal);
                if (isNaN(date.getTime())) return acc;

                const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                if (!acc[monthYear]) acc[monthYear] = [];
                acc[monthYear].push({
                    ...event,
                    formattedDate: date.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })
                });
                return acc;
            }, {});

            const formatted = Object.keys(grouped).map(month => ({
                month,
                events: grouped[month]
            }));

            setCalendarEvents(formatted);
        } catch (err) {
            console.error("❌ Failed to fetch calendar events:", err);
            if (err.response?.status === 401) {
                setCalendarError("Session expired. Please re-login.");
            } else {
                setCalendarError("Connect to server to load tax calendar.");
            }
        } finally {
            setCalendarLoading(false);
        }
    };

    // Fetch calendar events on mount & when year changes
    useEffect(() => {
        if (!userId) {
            console.warn("⚠️ No valid userId found for Tax Calendar");
            setCalendarError("Please login to view your tax calendar.");
            setCalendarLoading(false);
            return;
        }
        fetchCalendar();
    }, [userId, selectedYear]);

    const handleAddCalendarEvent = async (eventData) => {
        try {
            setLoading(true);
            await api.post(`/taxes/calendar`, {
                ...eventData,
                user_id: userId
            });
            showToast('Success', 'Event added to your calendar!');
            setShowAddEvent(false);

            // Refresh calendar data without refreshing the whole page
            await fetchCalendar();
        } catch (err) {
            console.error("Failed to add event:", err);
            showToast('Error', 'Failed to save calendar event');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear result when inputs change to enforce explicit "Calculate" click
        if (estimatedTax !== null) {
            setEstimatedTax(null);
        }
    };

    const handleFetchFromDashboard = async () => {
        try {
            setLoading(true);
            const transactions = await getTransactions(userId);

            // Filter transactions for the selected quarter
            // Simplified logic: just sum up all income/expenses for now to demonstrate
            const income = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

            const expenses = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

            setFormData(prev => ({
                ...prev,
                grossIncome: income.toString(),
                businessExpenses: expenses.toString()
            }));

            showToast('Success', 'Data imported from your transactions!');
        } catch (err) {
            console.error("Fetch from dashboard error:", err);
            const msg = err.response?.status === 401 ? 'Session expired. Please re-login.' : 'Failed to fetch transaction data';
            showToast('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleViewHistory = async () => {
        if (!userId) {
            showToast('Error', 'Please login to view history');
            return;
        }

        try {
            setLoading(true);
            const data = await getTaxEstimates(userId);
            setHistory(data);
            setShowHistory(true);
        } catch (err) {
            console.error("History fetch error:", err);
            const msg = err.response?.status === 401 ? 'Session expired. Please re-login.' : 'Failed to load estimation history';
            showToast('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCalculate = async (e) => {
        if (e) e.preventDefault();

        // Basic validation
        if (!formData.grossIncome || !formData.country || !formData.quarter) {
            showToast('Warning', 'Please fill in the required fields (Income, Country, Quarter)');
            return;
        }

        const income = parseFloat(formData.grossIncome) || 0;
        const totalDeductions =
            (parseFloat(formData.businessExpenses) || 0) +
            (parseFloat(formData.retirementContributions) || 0) +
            (parseFloat(formData.healthInsurance) || 0) +
            (parseFloat(formData.homeOffice) || 0);

        const taxableIncome = Math.max(0, income - totalDeductions);

        // Indian Income Tax Slabs - New Regime (FY 2025-26 / AY 2026-27)
        // Since this is a quarterly estimator, we divide the annual slabs by 4
        const calculateIndianTax = (qIncome) => {
            // Annual Slabs -> Quarterly Slabs
            // 0 - 4L: Nil          -> 0 - 1L: Nil
            // 4L - 8L: 5%          -> 1L - 2L: 5%
            // 8L - 12L: 10%        -> 2L - 3L: 10%
            // 12L - 16L: 15%       -> 3L - 4L: 15%
            // 16L - 20L: 20%       -> 4L - 5L: 20%
            // 20L - 24L: 25%       -> 5L - 6L: 25%
            // Above 24L: 30%       -> Above 6L: 30%

            let qTax = 0;
            const slabs = [
                { limit: 100000, rate: 0.05 },
                { limit: 100000, rate: 0.10 },
                { limit: 100000, rate: 0.15 },
                { limit: 100000, rate: 0.20 },
                { limit: 100000, rate: 0.25 },
                { limit: Infinity, rate: 0.30 }
            ];

            let remainingIncome = qIncome - 100000; // First 1L is Nil
            if (remainingIncome <= 0) return 0;

            // Section 87A Rebate for New Regime (FY 25-26):
            // Resident individuals with taxable income up to ₹12 Lakh (Annual) pay NIL tax.
            // Quarterly equivalent: ₹3 Lakh.
            if (qIncome <= 300000) return 0;

            for (const slab of slabs) {
                const taxableInThisSlab = Math.min(remainingIncome, slab.limit);
                qTax += taxableInThisSlab * slab.rate;
                remainingIncome -= taxableInThisSlab;
                if (remainingIncome <= 0) break;
            }

            // Add 4% Health and Education Cess
            return qTax * 1.04;
        };

        // Standard logic for other countries (fallback) or specific India logic
        let tax = 0;
        if (formData.country.toLowerCase() === 'india') {
            tax = calculateIndianTax(taxableIncome);
        } else {
            // General Fallback Slabs (Global Average)
            if (taxableIncome > 100000) tax = taxableIncome * 0.30;
            else if (taxableIncome > 50000) tax = taxableIncome * 0.20;
            else if (taxableIncome > 20000) tax = taxableIncome * 0.10;
            else tax = taxableIncome * 0.05;
        }

        setEstimatedTax(tax);

        // Auto-save to backend if userId exists
        if (userId) {
            try {
                await saveTaxEstimate({
                    ...formData,
                    user_id: userId,
                    estimatedTax: tax
                });
                showToast('Success', 'Estimate calculated and saved to history!');
            } catch (err) {
                console.error("Failed to save tax estimate", err);
                showToast('Error', 'Calculated but failed to save to history');
            }
        } else {
            showToast('Success', 'Tax calculated (Login to save history)');
        }
    };

    return (
        <main className="dashboard-main">
            {/* HISTORY MODAL */}
            {showHistory && <HistoryModal history={history} onClose={() => setShowHistory(false)} />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff' }}>
                        {view === 'estimator' ? 'Tax Estimator' : 'Tax Calendar'}
                    </h2>
                    <p style={{ opacity: 0.8, color: '#fff' }}>
                        {view === 'estimator'
                            ? 'Calculate your estimated tax obligations based on real data'
                            : 'Stay on top of your quarterly tax deadlines'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    {view === 'estimator' && (
                        <button
                            onClick={handleFetchFromDashboard}
                            disabled={loading}
                            className="primary-btn"
                            title="Automatically fill income and expenses from your recorded transactions"
                            style={{
                                background: 'rgba(59, 130, 246, 0.2)',
                                border: '1px solid rgba(59, 130, 246, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Download size={18} /> {loading ? 'Importing...' : 'Auto-Fill from Transactions'}
                        </button>
                    )}
                    <button
                        onClick={() => setView(view === 'estimator' ? 'calendar' : 'estimator')}
                        className="primary-btn"
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {view === 'estimator' ? (
                            <>
                                <Calendar size={18} /> View Tax Calendar
                            </>
                        ) : (
                            <>
                                <Calculator size={18} /> Back to Estimator
                            </>
                        )}
                    </button>
                </div>
            </div>

            {view === 'estimator' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
                    {/* LEFT FORM SECTION */}
                    <div className="transactions-card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ margin: 0, fontSize: '18px' }}>Quarterly Tax Calculator</h4>
                            <span style={{ fontSize: '11px', opacity: 0.5 }}>All fields required for accurate results</span>
                        </div>

                        <form onSubmit={handleCalculate}>
                            {/* COUNTRY & STATE */}
                            <div
                                className="form-grid"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '20px',
                                    marginBottom: '24px',
                                }}
                            >
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '500', opacity: 0.8 }}>Country/Region</label>
                                    <input
                                        type="text"
                                        name="country"
                                        list="country-list"
                                        placeholder="Enter country"
                                        style={{
                                            height: '48px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px'
                                        }}
                                        value={formData.country}
                                        onChange={handleChange}
                                        required
                                    />
                                    <datalist id="country-list">
                                        <option value="USA" />
                                        <option value="India" />
                                        <option value="UK" />
                                        <option value="Canada" />
                                        <option value="Australia" />
                                        <option value="Germany" />
                                        <option value="France" />
                                        <option value="Singapore" />
                                        <option value="UAE" />
                                    </datalist>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '500', opacity: 0.8 }}>State / Province</label>
                                    <input
                                        type="text"
                                        name="state"
                                        list="state-list"
                                        placeholder="Enter state / province"
                                        style={{
                                            height: '48px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px'
                                        }}
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                    />
                                    <datalist id="state-list">
                                        <option value="California" />
                                        <option value="New York" />
                                        <option value="Texas" />
                                        <option value="Florida" />
                                        <option value="Ontario" />
                                        <option value="British Columbia" />
                                        <option value="London" />
                                        <option value="New South Wales" />
                                        <option value="Delhi" />
                                        <option value="Maharashtra" />
                                        <option value="Karnataka" />
                                        <option value="Dubai" />
                                    </datalist>
                                </div>
                            </div>

                            {/* FILING STATUS & QUARTER */}
                            <div
                                className="form-grid"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '20px',
                                    marginBottom: '32px',
                                }}
                            >
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '500', opacity: 0.8 }}>Filing Status</label>
                                    <select
                                        name="filingStatus"
                                        style={{
                                            height: '48px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px'
                                        }}
                                        value={formData.filingStatus}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Single">Single</option>
                                        <option value="Married Filing Jointly">
                                            Married Filing Jointly
                                        </option>
                                        <option value="Head of Household">
                                            Head of Household
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '500', opacity: 0.8 }}>Year</label>
                                    <select
                                        value={selectedYear}
                                        style={{
                                            height: '48px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px'
                                        }}
                                        onChange={(e) => {
                                            setSelectedYear(parseInt(e.target.value));
                                            setFormData(prev => ({ ...prev, quarter: '' })); // Reset quarter when year changes
                                        }}
                                    >
                                        {years.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '500', opacity: 0.8 }}>Quarter</label>
                                    <select
                                        name="quarter"
                                        style={{
                                            height: '48px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px'
                                        }}
                                        value={formData.quarter}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Quarter</option>
                                        {quarters.map(q => (
                                            <option key={q.id} value={q.label}>
                                                {q.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* INCOME */}
                            <div style={{ marginBottom: '32px' }}>
                                <h5
                                    style={{
                                        fontSize: '14px',
                                        opacity: 0.7,
                                        marginBottom: '12px',
                                        color: '#fff',
                                    }}
                                >
                                    Income
                                </h5>
                                <label>Gross Income for Quarter</label>
                                <div style={{ position: 'relative' }}>
                                    <span
                                        style={{
                                            position: 'absolute',
                                            left: '14px',
                                            top: '14px',
                                            opacity: 0.6,
                                        }}
                                    >
                                        ₹
                                    </span>
                                    <input
                                        type="number"
                                        name="grossIncome"
                                        placeholder="0.00"
                                        value={formData.grossIncome}
                                        onChange={handleChange}
                                        style={{
                                            paddingLeft: '32px',
                                            height: '48px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px'
                                        }}
                                        required
                                    />
                                </div>
                            </div>

                            {/* DEDUCTIONS */}
                            <div style={{ marginBottom: '32px' }}>
                                <h5
                                    style={{
                                        fontSize: '14px',
                                        opacity: 0.7,
                                        marginBottom: '12px',
                                        color: '#fff',
                                    }}
                                >
                                    Deductions
                                </h5>

                                <div
                                    className="form-grid"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '20px',
                                        marginBottom: '20px',
                                    }}
                                >
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.8 }}>Business Expenses</label>
                                        <input
                                            type="number"
                                            name="businessExpenses"
                                            placeholder="0.00"
                                            style={{
                                                height: '48px',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px'
                                            }}
                                            value={formData.businessExpenses}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.8 }}>Retirement Contr.</label>
                                        <input
                                            type="number"
                                            name="retirementContributions"
                                            placeholder="0.00"
                                            style={{
                                                height: '48px',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px'
                                            }}
                                            value={formData.retirementContributions}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div
                                    className="form-grid"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '20px',
                                    }}
                                >
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.8 }}>Health Insurance Premiums</label>
                                        <input
                                            type="number"
                                            name="healthInsurance"
                                            placeholder="0.00"
                                            style={{
                                                height: '48px',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px'
                                            }}
                                            value={formData.healthInsurance}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.8 }}>Home Office Deduction</label>
                                        <input
                                            type="number"
                                            name="homeOffice"
                                            placeholder="0.00"
                                            style={{
                                                height: '48px',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px'
                                            }}
                                            value={formData.homeOffice}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    type="submit"
                                    className="primary-btn glassy-btn"
                                    style={{
                                        padding: '14px 28px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        fontSize: '15px',
                                        fontWeight: '600'
                                    }}
                                >
                                    <Calculator size={18} /> Calculate & Save Estimate
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT SUMMARY */}
                    <div className="transactions-card" style={{ padding: '32px', height: 'fit-content' }}>
                        <h4 style={{ marginBottom: '24px', fontSize: '18px' }}>
                            Tax Summary
                        </h4>

                        <div
                            style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
                                border: '1px dashed rgba(255,255,255,0.1)',
                            }}
                        >
                            {estimatedTax !== null ? (
                                <div>
                                    <h3 style={{ fontSize: '36px', marginBottom: '8px' }}>
                                        ₹{estimatedTax.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </h3>
                                    <p style={{ opacity: 0.7 }}>
                                        Estimated Tax Due for {formData.quarter}
                                    </p>
                                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <button
                                            onClick={handleViewHistory}
                                            className="secondary-btn"
                                            style={{ fontSize: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <Clock size={14} /> View History
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.2 }}>
                                        📊
                                    </div>
                                    <p style={{ opacity: 0.6 }}>
                                        Enter your details to calculate your estimated quarterly tax.
                                    </p>
                                    <button
                                        onClick={handleViewHistory}
                                        className="ghost"
                                        style={{ marginTop: '16px', fontSize: '13px', textDecoration: 'underline' }}
                                    >
                                        View Past Estimates
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="transactions-card" style={{ padding: '32px' }}>
                    {/* MODALS */}
                    {showAddEvent && (
                        <AddEventModal
                            year={selectedYear}
                            onClose={() => setShowAddEvent(false)}
                            onSave={handleAddCalendarEvent}
                        />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h4 style={{ fontSize: '24px', fontWeight: '700', margin: 0, letterSpacing: '-0.02em' }}>Your Tax Calendar</h4>
                            <p style={{ fontSize: '14px', opacity: 0.5, margin: '6px 0 0' }}>Manage your custom reminders and important tax dates</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button
                                onClick={() => setShowAddEvent(true)}
                                className="primary-btn"
                                style={{
                                    background: 'rgba(34, 197, 94, 0.2)',
                                    border: '1px solid rgba(34, 197, 94, 0.4)',
                                    color: '#4ade80',
                                    padding: '8px 16px',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Plus size={16} /> Add Custom Event
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '13px', opacity: 0.6 }}>Year:</span>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    style={{
                                        minHeight: '36px',
                                        padding: '4px 12px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)'
                                    }}
                                >
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {calendarLoading ? (
                        <div style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                            <div className="loading-spinner" style={{ marginBottom: '16px' }}>⌛</div>
                            <p>Loading tax calendar events...</p>
                        </div>
                    ) : calendarError ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>
                            <p>{calendarError}</p>
                            <button onClick={() => window.location.reload()} className="ghost" style={{ marginTop: '10px', textDecoration: 'underline' }}>Retry</button>
                        </div>
                    ) : calendarEvents.length > 0 ? (
                        calendarEvents.map((monthData, idx) => (
                            <div key={idx} style={{ marginBottom: '40px' }}>
                                <h5 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', opacity: 0.9, borderLeft: '4px solid #3b82f6', paddingLeft: '12px' }}>
                                    {monthData.month}
                                </h5>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {monthData.events.map((event, eventIdx) => (
                                        <div
                                            key={eventIdx}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                borderRadius: '16px',
                                                padding: '24px',
                                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                            className="calendar-event-card premium-hover"
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h6 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>{event.title}</h6>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                        <Calendar size={14} color="#60a5fa" />
                                                        <span style={{ fontSize: '13px', color: '#60a5fa', fontWeight: '600' }}>{event.formattedDate}</span>
                                                    </div>
                                                    <p style={{ fontSize: '14px', opacity: 0.6, lineHeight: '1.6', maxWidth: '90%' }}>{event.description}</p>
                                                </div>
                                                <div className={`event-type-badge ${event.event_type}`} style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    background: event.event_type === 'payment' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                                    color: event.event_type === 'payment' ? '#4ade80' : '#60a5fa',
                                                    border: `1px solid ${event.event_type === 'payment' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                                                }}>
                                                    {event.event_type}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                            <Calendar size={48} style={{ marginBottom: '16px' }} />
                            <p>No tax calendar events found for your region.</p>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}

export default TaxEstimator;
