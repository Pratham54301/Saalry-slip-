// Global variables for signature images
let employerSignatureImage = null;
let employeeSignatureImage = null;
let companyLogoImage = null;

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Preview button
    document.getElementById('previewBtn').addEventListener('click', generatePayslip);
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetForm);
    
    // Print/Download button
    document.getElementById('printBtn').addEventListener('click', downloadPDF);
    
    // Image upload handlers
    setupImageHandlers();
    
    // Set default company logo
    companyLogoImage = 'logo.png';
    
    // Set default date to current month
    const now = new Date();
    document.getElementById('payslipMonth').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('paymentDate').valueAsDate = new Date();
});

// Setup image upload handlers
function setupImageHandlers() {
    // Company Logo
    document.getElementById('companyLogo').addEventListener('change', handleImageUpload);
    document.getElementById('companyLogoUrl').addEventListener('input', handleImageUrl);
    
    // Employer Signature
    document.getElementById('employerSignature').addEventListener('change', function(e) {
        handleSignatureUpload(e, 'employer');
    });
    document.getElementById('employerSignatureUrl').addEventListener('input', function(e) {
        handleSignatureUrl(e, 'employer');
    });
    
    // Employee Signature
    document.getElementById('employeeSignature').addEventListener('change', function(e) {
        handleSignatureUpload(e, 'employee');
    });
    document.getElementById('employeeSignatureUrl').addEventListener('input', function(e) {
        handleSignatureUrl(e, 'employee');
    });
}

// Handle image upload for company logo
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            companyLogoImage = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Handle image URL for company logo
function handleImageUrl(event) {
    const url = event.target.value.trim();
    if (url) {
        companyLogoImage = url;
    }
}

// Handle signature upload
function handleSignatureUpload(event, type) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageSrc = e.target.result;
            if (type === 'employer') {
                employerSignatureImage = imageSrc;
                displaySignaturePreview('employerSignaturePreview', imageSrc);
            } else {
                employeeSignatureImage = imageSrc;
                displaySignaturePreview('employeeSignaturePreview', imageSrc);
            }
        };
        reader.readAsDataURL(file);
    }
}

// Handle signature URL
function handleSignatureUrl(event, type) {
    const url = event.target.value.trim();
    if (url) {
        if (type === 'employer') {
            employerSignatureImage = url;
            displaySignaturePreview('employerSignaturePreview', url);
        } else {
            employeeSignatureImage = url;
            displaySignaturePreview('employeeSignaturePreview', url);
        }
    }
}

// Display signature preview
function displaySignaturePreview(elementId, imageSrc) {
    const previewDiv = document.getElementById(elementId);
    previewDiv.innerHTML = `<img src="${imageSrc}" alt="Signature Preview" onerror="this.parentElement.innerHTML='Invalid image URL'">`;
}

// Generate payslip preview
function generatePayslip() {
    // Validate form
    if (!document.getElementById('salaryForm').checkValidity()) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Get form values
    const formData = getFormData();
    
    // Calculate totals
    const calculations = calculateSalary(formData);
    
    // Generate payslip HTML
    const payslipHTML = generatePayslipHTML(formData, calculations);
    
    // Display payslip
    const payslipDiv = document.getElementById('payslip');
    payslipDiv.innerHTML = payslipHTML;
    
    // Show print button
    document.getElementById('payslipActions').style.display = 'block';
    
    // Scroll to payslip
    document.querySelector('.payslip-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Get form data
function getFormData() {
    const monthDate = new Date(document.getElementById('payslipMonth').value + '-01');
    const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    return {
        // Company Details
        companyName: document.getElementById('companyName').value,
        companyLogo: companyLogoImage,
        companyAddress: document.getElementById('companyAddress').value,
        payslipMonth: monthName,
        
        // Employee Details
        employeeName: document.getElementById('employeeName').value,
        employeeId: document.getElementById('employeeId').value,
        payPeriod: document.getElementById('payPeriod').value,
        
        // Attendance & Payment
        totalPaidDays: parseFloat(document.getElementById('totalPaidDays').value),
        lopDays: parseFloat(document.getElementById('lopDays').value),
        paymentDate: formatDate(document.getElementById('paymentDate').value),
        
        // Earnings
        basicSalary: parseFloat(document.getElementById('basicSalary').value) || 0,
        hra: parseFloat(document.getElementById('hra').value) || 0,
        allowances: parseFloat(document.getElementById('allowances').value) || 0,
        specialAllowance: parseFloat(document.getElementById('specialAllowance').value) || 0,
        
        // Deductions
        pf: parseFloat(document.getElementById('pf').value) || 0,
        tax: parseFloat(document.getElementById('tax').value) || 0,
        professionalTax: parseFloat(document.getElementById('professionalTax').value) || 0,
        otherDeductions: parseFloat(document.getElementById('otherDeductions').value) || 0,
        
        // Signatures
        employerSignature: employerSignatureImage,
        employeeSignature: employeeSignatureImage
    };
}

// Calculate salary
function calculateSalary(data) {
    // Calculate total earnings
    const totalEarnings = data.basicSalary + data.hra + data.allowances + data.specialAllowance;
    
    // Calculate total deductions
    const totalDeductions = data.pf + data.tax + data.professionalTax + data.otherDeductions;
    
    // Gross salary (same as total earnings)
    const grossSalary = totalEarnings;
    
    // Net salary (take home)
    const netSalary = grossSalary - totalDeductions;
    
    return {
        totalEarnings,
        totalDeductions,
        grossSalary,
        netSalary
    };
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Generate payslip HTML
function generatePayslipHTML(data, calculations) {
    let logoHTML = '';
    if (data.companyLogo) {
        logoHTML = `<img src="${data.companyLogo}" alt="Company Logo" class="company-logo" onerror="this.style.display='none'">`;
    }
    
    let employerSigHTML = '';
    if (data.employerSignature) {
        employerSigHTML = `<img src="${data.employerSignature}" alt="Employer Signature" class="signature-image" onerror="this.style.display='none'">`;
    }
    
    let employeeSigHTML = '';
    if (data.employeeSignature) {
        employeeSigHTML = `<img src="${data.employeeSignature}" alt="Employee Signature" class="signature-image" onerror="this.style.display='none'">`;
    }
    
    return `
        <div class="payslip-header">
            ${logoHTML}
            <div class="company-name">${escapeHtml(data.companyName)}</div>
            <div class="company-address">${escapeHtml(data.companyAddress)}</div>
            <div class="payslip-title">Salary Slip</div>
            <div class="payslip-month">${escapeHtml(data.payslipMonth)}</div>
        </div>
        
        <div class="employee-section">
            <div class="section-title">Employee Details</div>
            <div class="employee-details">
                <div class="detail-item">
                    <span class="detail-label">Employee Name:</span>
                    <span class="detail-value">${escapeHtml(data.employeeName)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Employee ID:</span>
                    <span class="detail-value">${escapeHtml(data.employeeId)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Pay Period:</span>
                    <span class="detail-value">${escapeHtml(data.payPeriod)}</span>
                </div>
            </div>
        </div>
        
        <div class="attendance-section">
            <div class="section-title">Attendance & Payment Details</div>
            <div class="attendance-details">
                <div class="detail-item">
                    <span class="detail-label">Total Paid Days:</span>
                    <span class="detail-value">${data.totalPaidDays}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Loss of Pay (LOP) Days:</span>
                    <span class="detail-value">${data.lopDays}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Payment Date:</span>
                    <span class="detail-value">${escapeHtml(data.paymentDate)}</span>
                </div>
            </div>
        </div>
        
        <div class="salary-breakdown">
            <table class="earnings-table">
                <thead>
                    <tr>
                        <th>Earnings</th>
                        <th class="amount">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Basic Salary</td>
                        <td class="amount">${formatCurrency(data.basicSalary)}</td>
                    </tr>
                    ${data.hra > 0 ? `
                    <tr>
                        <td>HRA (House Rent Allowance)</td>
                        <td class="amount">${formatCurrency(data.hra)}</td>
                    </tr>
                    ` : ''}
                    ${data.allowances > 0 ? `
                    <tr>
                        <td>Other Allowances</td>
                        <td class="amount">${formatCurrency(data.allowances)}</td>
                    </tr>
                    ` : ''}
                    ${data.specialAllowance > 0 ? `
                    <tr>
                        <td>Special Allowance</td>
                        <td class="amount">${formatCurrency(data.specialAllowance)}</td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td><strong>Total Earnings</strong></td>
                        <td class="amount"><strong>${formatCurrency(calculations.totalEarnings)}</strong></td>
                    </tr>
                </tbody>
            </table>
            
            <table class="deductions-table">
                <thead>
                    <tr>
                        <th>Deductions</th>
                        <th class="amount">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.pf > 0 ? `
                    <tr>
                        <td>Provident Fund (PF)</td>
                        <td class="amount">${formatCurrency(data.pf)}</td>
                    </tr>
                    ` : ''}
                    ${data.tax > 0 ? `
                    <tr>
                        <td>Income Tax</td>
                        <td class="amount">${formatCurrency(data.tax)}</td>
                    </tr>
                    ` : ''}
                    ${data.professionalTax > 0 ? `
                    <tr>
                        <td>Professional Tax</td>
                        <td class="amount">${formatCurrency(data.professionalTax)}</td>
                    </tr>
                    ` : ''}
                    ${data.otherDeductions > 0 ? `
                    <tr>
                        <td>Other Deductions</td>
                        <td class="amount">${formatCurrency(data.otherDeductions)}</td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td><strong>Total Deductions</strong></td>
                        <td class="amount"><strong>${formatCurrency(calculations.totalDeductions)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="salary-summary">
            <div class="summary-row">
                <span class="summary-label">Gross Salary:</span>
                <span class="summary-value">${formatCurrency(calculations.grossSalary)}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Total Deductions:</span>
                <span class="summary-value">${formatCurrency(calculations.totalDeductions)}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Net Salary (Take Home):</span>
                <span class="summary-value">${formatCurrency(calculations.netSalary)}</span>
            </div>
        </div>
        
        <div class="signatures-section">
            <div class="signature-box">
                ${employerSigHTML}
                <div class="signature-label">Authorized Signature<br/>(Founder/Employer)</div>
            </div>
            <div class="signature-box">
                ${employeeSigHTML}
                <div class="signature-label">Employee Signature</div>
            </div>
        </div>
    `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Reset form
function resetForm() {
    if (confirm('Are you sure you want to reset all fields?')) {
        document.getElementById('salaryForm').reset();
        document.getElementById('payslip').innerHTML = '<div class="payslip-placeholder"><p>Fill in the form and click "Preview Payslip" to see your payslip here</p></div>';
        document.getElementById('payslipActions').style.display = 'none';
        
        // Reset global variables to defaults
        employerSignatureImage = null;
        employeeSignatureImage = null;
        companyLogoImage = 'logo.png'; // Restore default logo
        
        // Clear preview divs
        document.getElementById('employerSignaturePreview').innerHTML = '';
        document.getElementById('employeeSignaturePreview').innerHTML = '';
        
        // Reset dates to current
        const now = new Date();
        document.getElementById('payslipMonth').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        document.getElementById('paymentDate').valueAsDate = new Date();
    }
}

// Download PDF
async function downloadPDF() {
    const payslipElement = document.getElementById('payslip');
    
    if (!payslipElement || payslipElement.innerHTML.includes('payslip-placeholder')) {
        alert('Please generate a payslip preview first');
        return;
    }
    
    try {
        // Show loading state
        const printBtn = document.getElementById('printBtn');
        const originalText = printBtn.innerHTML;
        printBtn.innerHTML = '⏳ Generating PDF...';
        printBtn.disabled = true;
        
        // Use html2canvas to capture the payslip
        const canvas = await html2canvas(payslipElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        // Get form data for filename
        const employeeName = document.getElementById('employeeName').value || 'payslip';
        const month = document.getElementById('payslipMonth').value || new Date().toISOString().slice(0, 7);
        const filename = `${employeeName}_${month}_payslip.pdf`;
        
        // Create PDF using jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Calculate dimensions - fit to one page
        const pageWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        
        // Calculate the dimensions that would fit if we use full width
        let imgWidth = pageWidth;
        let imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // If content is taller than page, scale it down to fit
        if (imgHeight > pageHeight) {
            const scale = pageHeight / imgHeight;
            imgWidth = pageWidth * scale;
            imgHeight = pageHeight;
        }
        
        // Calculate position to center horizontally
        const xPos = (pageWidth - imgWidth) / 2;
        const yPos = 0;
        
        // Add image to single page
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xPos, yPos, imgWidth, imgHeight);
        
        // Download PDF
        pdf.save(filename);
        
        // Reset button
        printBtn.innerHTML = originalText;
        printBtn.disabled = false;
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
        const printBtn = document.getElementById('printBtn');
        printBtn.innerHTML = '🖨️ Print & Download PDF';
        printBtn.disabled = false;
    }
}

