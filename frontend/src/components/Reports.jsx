import { useState, useEffect } from 'react';
import {
    Download,
    Printer,
    RotateCcw,
    FileText,
    Clock,
    ChevronDown
} from 'lucide-react';
import { getTransactionSummary } from '../api/transactions';
import { showToast } from './Toast';
import '../index.css';

function Reports() {
    const [loading, setLoading] = useState(true);
    const [reportGenerated, setReportGenerated] = useState(false);
    const [filters, setFilters] = useState({
        type: 'Income Statement',
        period: 'Current Month',
        format: 'PDF'
    });

    const [summaryData, setSummaryData] = useState(null);

    useEffect(() => {
        const loadSummary = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) return;
                const data = await getTransactionSummary(userId);
                setSummaryData(data);
            } catch (err) {
                console.error('Report Error:', err);
            } finally {
                setLoading(false);
            }
        };
        loadSummary();
    }, []);

    const handleGenerate = () => {
        setLoading(true);
        setTimeout(() => {
            setReportGenerated(true);
            setLoading(false);
            showToast('Success', 'Report generated successfully', 'success');
        }, 1000);
    };

    const handleReset = () => {
        setFilters({
            type: 'Income Statement',
            period: 'Current Month',
            format: 'PDF'
        });
        setReportGenerated(false);
    };

    return (
        <main className="dashboard-main">
            <div className="report-header-static">
                <h2 className="report-main-title">Financial Reports</h2>
                <p className="report-main-subtitle">Generate and download your financial reports</p>
            </div>

            {/* GENERATE REPORT CARD */}
            <div className="report-card">
                <h4 className="report-card-title">Generate Report</h4>
                <div className="report-form-grid">
                    <div className="form-group">
                        <label>Report Type</label>
                        <div className="select-wrapper">
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            >
                                <option>Income Statement</option>
                                <option>Expense Report</option>
                                <option>Transaction History</option>
                                <option>Tax Summary</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Period</label>
                        <div className="select-wrapper">
                            <select
                                value={filters.period}
                                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                            >
                                <option>Current Month</option>
                                <option>Last Month</option>
                                <option>Last 3 Months</option>
                                <option>Last 6 Months</option>
                                <option>Year to Date</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Format</label>
                        <div className="select-wrapper">
                            <select
                                value={filters.format}
                                onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                            >
                                <option>PDF</option>
                                <option>Excel</option>
                                <option>CSV</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="report-card-actions">
                    <button className="reset-btn" onClick={handleReset}>
                        <RotateCcw size={16} />
                        Reset
                    </button>
                    <button className="generate-btn" onClick={handleGenerate}>
                        <FileText size={18} />
                        Generate Report
                    </button>
                </div>
            </div>

            {/* RECENT REPORTS CARD */}
            <div className="report-card">
                <h4 className="report-card-title">Recent Reports</h4>
                <div className="report-table-container">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Report Name</th>
                                <th>Generated</th>
                                <th>Period</th>
                                <th>Format</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!reportGenerated ? (
                                <tr>
                                    <td colSpan="5" className="empty-row">No results.</td>
                                </tr>
                            ) : (
                                <tr>
                                    <td>{filters.type}</td>
                                    <td>Today, {new Date().toLocaleTimeString()}</td>
                                    <td>{filters.period}</td>
                                    <td>{filters.format}</td>
                                    <td className="table-actions">
                                        <button className="action-link-btn">View</button>
                                        <button className="action-link-btn download">Download</button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* REPORT PREVIEW CARD */}
            <div className="report-card">
                <div className="report-preview-header">
                    <h4 className="report-card-title">Report Preview</h4>
                    <div className="preview-actions">
                        <button className="preview-btn" onClick={() => window.print()}>
                            <Printer size={16} />
                            Print
                        </button>
                        <button className="preview-btn primary" onClick={() => showToast('Info', 'Downloading...', 'info')}>
                            <Download size={16} />
                            Download
                        </button>
                    </div>
                </div>

                <div className="preview-content">
                    {!reportGenerated ? (
                        <div className="preview-placeholder">
                            <FileText size={48} color="rgba(255, 255, 255, 0.2)" />
                            <p className="placeholder-title">Select a report to preview</p>
                            <p className="placeholder-sub">Generated reports will appear here for review before downloading</p>
                        </div>
                    ) : (
                        <div className="actual-preview fadeIn">
                            <div className="preview-inner">
                                <div className="preview-report-header">
                                    <h2 className="preview-report-type">{filters.type}</h2>
                                    <p className="preview-report-period">{filters.period}</p>
                                </div>

                                <div className="preview-divider"></div>

                                <div className="preview-data-rows">
                                    <div className="preview-row">
                                        <span className="preview-label">Gross Income</span>
                                        <span className="preview-value positive">₹{summaryData?.summary?.totalIncome?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="preview-row">
                                        <span className="preview-label">Total Deductions (Expenses)</span>
                                        <span className="preview-value negative">- ₹{summaryData?.summary?.totalExpense?.toLocaleString() || '0'}</span>
                                    </div>

                                    <div className="preview-divider"></div>

                                    <div className="preview-row total">
                                        <span className="preview-label total">Net Profit</span>
                                        <span className="preview-value total highlight">
                                            ₹{(summaryData?.summary?.totalIncome - summaryData?.summary?.totalExpense).toLocaleString() || '0'}
                                        </span>
                                    </div>
                                </div>

                                <div className="preview-footer">
                                    Generated by TaxPal on {new Date().toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default Reports;
