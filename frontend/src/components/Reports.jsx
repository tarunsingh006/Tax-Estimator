import { useState } from 'react';
import { Printer, Download, FileText } from 'lucide-react';
import '../index.css';

function Reports() {
    const [reportConfig, setReportConfig] = useState({
        type: 'Income Statement',
        period: 'Current Month',
        format: 'PDF'
    });

    const handleChange = (e) => {
        setReportConfig({ ...reportConfig, [e.target.name]: e.target.value });
    };

    return (
        <main className="dashboard-main">
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff' }}>
                    Financial Reports
                </h2>
                <p style={{ opacity: 0.8, color: '#fff' }}>
                    Generate and download your financial reports
                </p>
            </div>

            {/* GENERATE REPORT CARD */}
            <div className="transactions-card" style={{ padding: '32px', marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '600' }}>
                    Generate Report
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.9 }}>
                            Report Type
                        </label>
                        <select
                            name="type"
                            value={reportConfig.type}
                            onChange={handleChange}
                            style={{ width: '100%' }}
                        >
                            <option value="Income Statement">Income Statement</option>
                            <option value="Expense Report">Expense Report</option>
                            <option value="Tax Summary">Tax Summary</option>
                            <option value="Balance Sheet">Balance Sheet</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.9 }}>
                            Period
                        </label>
                        <select
                            name="period"
                            value={reportConfig.period}
                            onChange={handleChange}
                            style={{ width: '100%' }}
                        >
                            <option value="Current Month">Current Month</option>
                            <option value="Last Month">Last Month</option>
                            <option value="Last Quarter">Last Quarter</option>
                            <option value="Year to Date">Year to Date</option>
                            <option value="Custom Range">Custom Range</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.9 }}>
                            Format
                        </label>
                        <select
                            name="format"
                            value={reportConfig.format}
                            onChange={handleChange}
                            style={{ width: '100%' }}
                        >
                            <option value="PDF">PDF</option>
                            <option value="CSV">CSV</option>
                            <option value="Excel">Excel</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        className="primary-btn"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '10px 24px'
                        }}
                        onClick={() => setReportConfig({ type: 'Income Statement', period: 'Current Month', format: 'PDF' })}
                    >
                        Reset
                    </button>
                    <button className="primary-btn" style={{ padding: '10px 24px' }}>
                        Generate Report
                    </button>
                </div>
            </div>

            {/* RECENT REPORTS CARD */}
            <div className="transactions-card" style={{ padding: '32px', marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '600' }}>
                    Recent Reports
                </h4>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', opacity: 0.6 }}>Report Name</th>
                                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', opacity: 0.6 }}>Generated</th>
                                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', opacity: 0.6 }}>Period</th>
                                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', opacity: 0.6 }}>Format</th>
                                <th style={{ textAlign: 'right', padding: '12px', fontSize: '14px', opacity: 0.6 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
                                    No results.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* REPORT PREVIEW CARD */}
            <div className="transactions-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '600' }}>Report Preview</h4>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="primary-btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Printer size={18} /> Print
                        </button>
                        <button className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Download size={18} /> Download
                        </button>
                    </div>
                </div>

                <div style={{
                    border: '1px dashed rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '80px 20px',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.02)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', opacity: 0.3 }}>
                        <FileText size={48} />
                    </div>
                    <h5 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', opacity: 0.9 }}>
                        Select a report to preview
                    </h5>
                    <p style={{ fontSize: '14px', opacity: 0.6 }}>
                        Generated reports will appear here for review before downloading
                    </p>
                </div>
            </div>
        </main>
    );
}

export default Reports;
