import { useState, useEffect } from 'react';
import {
    Download,
    Printer,
    RotateCcw,
    FileText,
    Clock,
    ChevronDown
} from 'lucide-react';
import { getTransactionSummary, getTransactions } from '../api/transactions';
import { saveReport, getReportHistory, deleteReportHistory } from '../api/reports';
import { showToast } from './Toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
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
    const [history, setHistory] = useState([]);

    const loadData = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            setLoading(true);
            const data = await getTransactionSummary(userId);
            setSummaryData(data);

            const reports = await getReportHistory(userId);
            setHistory(reports);
        } catch (err) {
            console.error('Report Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const userId = localStorage.getItem('userId');

            // Simulating generation time
            await new Promise(resolve => setTimeout(resolve, 800));

            // Save to database history
            await saveReport({
                user_id: userId,
                report_type: filters.type,
                period: filters.period,
                format: filters.format
            });

            setReportGenerated(true);
            showToast('Success', 'Report generated and saved to history', 'success');

            // Refresh history
            const reports = await getReportHistory(userId);
            setHistory(reports);

        } catch (err) {
            showToast('Error', 'Failed to save report to history', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteHistory = async (id) => {
        try {
            await deleteReportHistory(id);
            setHistory(history.filter(h => h.id !== id));
            showToast('Success', 'History item deleted', 'success');
        } catch (err) {
            showToast('Error', 'Failed to delete history item', 'error');
        }
    };

    const handleDownload = () => {
        if (!reportGenerated) {
            showToast('Info', 'Generate a report first', 'info');
            return;
        }

        if (filters.format === 'CSV') {
            downloadCSV();
        } else if (filters.format === 'PDF') {
            downloadPDF();
        } else if (filters.format === 'Excel') {
            downloadExcel();
        }
    };

    const downloadPDF = async () => {
        const doc = new jsPDF();
        const userId = localStorage.getItem('userId');
        const transactions = await getTransactions(userId);

        // Header
        doc.setFontSize(22);
        doc.setTextColor(30, 136, 229);
        doc.text("TaxPal Financial Report", 105, 20, { align: "center" });

        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text(`${filters.type} - ${filters.period}`, 105, 30, { align: "center" });

        // Summary Table
        const netProfit = (summaryData?.summary?.totalIncome - summaryData?.summary?.totalExpense);
        const summaryRows = [
            ["Gross Income", `INR ${summaryData?.summary?.totalIncome?.toLocaleString()}`],
            ["Total Expenses", `INR ${summaryData?.summary?.totalExpense?.toLocaleString()}`],
            ["Net Profit", `INR ${netProfit?.toLocaleString()}`],
        ];

        doc.autoTable({
            startY: 40,
            head: [["Summary Metric", "Value"]],
            body: summaryRows,
            theme: 'striped',
            headStyles: { fillColor: [30, 136, 229] }
        });

        // Transactions Table
        doc.setFontSize(14);
        doc.setTextColor(30, 136, 229);
        doc.text("Itemized Transactions", 14, doc.lastAutoTable.finalY + 15);

        const txnRows = transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.description || 'N/A',
            t.category,
            t.type.toUpperCase(),
            `INR ${Number(t.amount).toLocaleString()}`
        ]);

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [["Date", "Description", "Category", "Type", "Amount"]],
            body: txnRows,
            theme: 'grid',
            headStyles: { fillColor: [71, 85, 105] }
        });

        doc.save(`${filters.type}_Detailed.pdf`);
        showToast('Success', 'Detailed PDF Downloaded ✅', 'success');
    };

    const downloadExcel = async () => {
        const userId = localStorage.getItem('userId');
        const transactions = await getTransactions(userId);
        const netProfit = (summaryData?.summary?.totalIncome - summaryData?.summary?.totalExpense);

        const summaryDataArray = [
            ["TaxPal Financial Report"],
            ["Report Type", filters.type],
            ["Period", filters.period],
            ["Generated", new Date().toLocaleString()],
            [],
            ["FINANCIAL SUMMARY"],
            ["Metric", "Amount (INR)"],
            ["Gross Income", summaryData?.summary?.totalIncome],
            ["Total Expenses", summaryData?.summary?.totalExpense],
            ["Net Profit", netProfit],
            [],
            ["ITEMIZED TRANSACTIONS"],
            ["Date", "Description", "Category", "Type", "Amount (INR)"]
        ];

        const txnData = transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.description || '',
            t.category,
            t.type,
            Number(t.amount)
        ]);

        const finalData = [...summaryDataArray, ...txnData];

        const ws = XLSX.utils.aoa_to_sheet(finalData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Financial Data");
        XLSX.writeFile(wb, `${filters.type}_Detailed.xlsx`);
        showToast('Success', 'Detailed Excel Downloaded ✅', 'success');
    };

    const downloadCSV = async () => {
        const userId = localStorage.getItem('userId');
        const transactions = await getTransactions(userId);

        const summaryHeaders = ["Metric", "Value"];
        const summaryRows = [
            ["Gross Income", summaryData?.summary?.totalIncome],
            ["Total Expenses", summaryData?.summary?.totalExpense],
            ["Net Profit", (summaryData?.summary?.totalIncome - summaryData?.summary?.totalExpense)]
        ];

        const txnHeaders = ["Date", "Description", "Category", "Type", "Amount"];
        const txnRows = transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            `"${t.description || ''}"`,
            t.category,
            t.type,
            t.amount
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + "FINANCIAL SUMMARY\n"
            + summaryHeaders.join(",") + "\n"
            + summaryRows.map(e => e.join(",")).join("\n")
            + "\n\nITEMIZED TRANSACTIONS\n"
            + txnHeaders.join(",") + "\n"
            + txnRows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filters.type}_Detailed.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Success', 'Detailed CSV Downloaded ✅', 'success');
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
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-row">No reports generated yet.</td>
                                </tr>
                            ) : (
                                history.map((report) => (
                                    <tr key={report.id}>
                                        <td>{report.report_type}</td>
                                        <td>{new Date(report.generated_at).toLocaleString()}</td>
                                        <td>{report.period}</td>
                                        <td>{report.format}</td>
                                        <td className="table-actions">
                                            <button className="action-link-btn" onClick={() => {
                                                setFilters({
                                                    type: report.report_type,
                                                    period: report.period,
                                                    format: report.format
                                                });
                                                setReportGenerated(true);
                                            }}>View</button>
                                            <button className="action-link-btn delete" onClick={() => handleDeleteHistory(report.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
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
                        <button className="preview-btn primary" onClick={handleDownload}>
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
