import { useState } from 'react';
import { Calendar, Calculator } from 'lucide-react';
import '../index.css';

const CALENDAR_EVENTS = [
    {
        month: 'June 2025',
        events: [
            {
                title: 'Reminder: Q2 Estimated Tax Payment',
                date: 'Jun 1, 2025',
                description: 'Reminder for upcoming q2 estimated tax payment due on Jun 15, 2025',
                type: 'reminder'
            },
            {
                title: 'Q2 Estimated Tax Payment',
                date: 'Jun 15, 2025',
                description: 'Second quarter estimated tax payment due',
                type: 'payment'
            }
        ]
    },
    {
        month: 'September 2025',
        events: [
            {
                title: 'Reminder: Q3 Estimated Tax Payment',
                date: 'Sep 1, 2025',
                description: 'Reminder for upcoming q3 estimated tax payment due on Sep 15, 2025',
                type: 'reminder'
            },
            {
                title: 'Q3 Estimated Tax Payment',
                date: 'Sep 15, 2025',
                description: 'Third quarter estimated tax payment due',
                type: 'payment'
            }
        ]
    }
];

function TaxEstimator() {
    const [view, setView] = useState('estimator'); // 'estimator' or 'calendar'
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

    const [estimatedTax, setEstimatedTax] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCalculate = (e) => {
        e.preventDefault();

        const income = parseFloat(formData.grossIncome) || 0;
        const expenses =
            (parseFloat(formData.businessExpenses) || 0) +
            (parseFloat(formData.retirementContributions) || 0) +
            (parseFloat(formData.healthInsurance) || 0) +
            (parseFloat(formData.homeOffice) || 0);

        const taxableIncome = Math.max(0, income - expenses);
        const tax = taxableIncome * 0.25;

        setEstimatedTax(tax);
    };

    return (
        <main className="dashboard-main">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff' }}>
                        {view === 'estimator' ? 'Tax Estimator' : 'Tax Calendar'}
                    </h2>
                    <p style={{ opacity: 0.8, color: '#fff' }}>
                        {view === 'estimator'
                            ? 'Calculate your estimated tax obligations'
                            : 'Stay on top of your quarterly tax deadlines'}
                    </p>
                </div>

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

            {view === 'estimator' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
                    {/* LEFT FORM SECTION */}
                    <div className="transactions-card" style={{ padding: '32px' }}>
                        <h4 style={{ marginBottom: '20px', fontSize: '18px' }}>
                            Quarterly Tax Calculator
                        </h4>

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
                                    <label>Country/Region</label>
                                    <input
                                        type="text"
                                        name="country"
                                        list="country-list"
                                        placeholder="Enter country"
                                        value={formData.country}
                                        onChange={handleChange}
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
                                    <label>State / Province</label>
                                    <input
                                        type="text"
                                        name="state"
                                        list="state-list"
                                        placeholder="Enter state / province"
                                        value={formData.state}
                                        onChange={handleChange}
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
                                    <label>Filing Status</label>
                                    <select
                                        name="filingStatus"
                                        value={formData.filingStatus}
                                        onChange={handleChange}
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
                                    <label>Quarter</label>
                                    <select
                                        name="quarter"
                                        value={formData.quarter}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Quarter</option>
                                        <option value="Q1 (Jan-Mar 2025)">
                                            Q1 (Jan-Mar 2025)
                                        </option>
                                        <option value="Q2 (Apr-Jun 2025)">
                                            Q2 (Apr-Jun 2025)
                                        </option>
                                        <option value="Q3 (Jul-Sep 2025)">
                                            Q3 (Jul-Sep 2025)
                                        </option>
                                        <option value="Q4 (Oct-Dec 2025)">
                                            Q4 (Oct-Dec 2025)
                                        </option>
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
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        name="grossIncome"
                                        placeholder="0.00"
                                        value={formData.grossIncome}
                                        onChange={handleChange}
                                        style={{ paddingLeft: '30px' }}
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
                                        <label>Business Expenses</label>
                                        <input
                                            type="number"
                                            name="businessExpenses"
                                            placeholder="0.00"
                                            value={formData.businessExpenses}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <label>Retirement Contributions</label>
                                        <input
                                            type="number"
                                            name="retirementContributions"
                                            placeholder="0.00"
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
                                        <label>Health Insurance Premiums</label>
                                        <input
                                            type="number"
                                            name="healthInsurance"
                                            placeholder="0.00"
                                            value={formData.healthInsurance}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <label>Home Office Deduction</label>
                                        <input
                                            type="number"
                                            name="homeOffice"
                                            placeholder="0.00"
                                            value={formData.homeOffice}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    type="submit"
                                    className="primary-btn"
                                    style={{ padding: '12px 24px' }}
                                >
                                    Calculate Estimated Tax
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
                                        ${estimatedTax.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </h3>
                                    <p style={{ opacity: 0.7 }}>
                                        Estimated Tax Due for {formData.quarter}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.2 }}>
                                        📋
                                    </div>
                                    <p style={{ opacity: 0.6 }}>
                                        Enter your income and deduction details to calculate your estimated quarterly tax.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="transactions-card" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h4 style={{ fontSize: '20px', fontWeight: '600' }}>Annual Tax Calendar</h4>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ fontSize: '13px', opacity: 0.6 }}>Year:</span>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>2025</span>
                        </div>
                    </div>

                    {CALENDAR_EVENTS.map((monthData, idx) => (
                        <div key={idx} style={{ marginBottom: '40px' }}>
                            <h5 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', opacity: 0.9, borderLeft: '4px solid #3b82f6', paddingLeft: '12px' }}>
                                {monthData.month}
                            </h5>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {monthData.events.map((event, eventIdx) => (
                                    <div
                                        key={eventIdx}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        className="calendar-event-card"
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h6 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{event.title}</h6>
                                                <p style={{ fontSize: '13px', color: '#3b82f6', fontWeight: '500', marginBottom: '8px' }}>{event.date}</p>
                                                <p style={{ fontSize: '14px', opacity: 0.7, lineHeight: '1.5' }}>{event.description}</p>
                                            </div>
                                            <span
                                                style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    background: event.type === 'reminder' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                                    color: event.type === 'reminder' ? '#60a5fa' : '#fbbf24',
                                                    border: `1px solid ${event.type === 'reminder' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                                                }}
                                            >
                                                {event.type}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

export default TaxEstimator;
