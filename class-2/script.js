function createStudentCardHtml(student) {
    return `
        <div class="card-container">
            <div class="card-inner">
                <!-- Front Side -->
                <div class="card-front">
                    <div class="card-header">
                        <div class="school-name">BETHANY CONVENT SCHOOL</div>
                        <div style="font-size: 12px;">DM-49, Indus Town, Bhopal</div>
                        <div style="font-size: 11px;">Session: 2025-26</div>
                    </div>
                    <div class="card-body">
                        <div class="photo-section">
                            <div class="student-photo">
                                <div class="photo-placeholder">Student Photo</div>
                            </div>
                            <div class="id-number">ID: ${student.id}</div>
                        </div>
                        <div class="details-section">
                            <div class="student-name">${student.name}</div>
                            <div class="student-details">
                                <div><span class="detail-label">Class:</span> ${student.class}</div>
                                <div><span class="detail-label">Roll No:</span> ${student.roll}</div>
                                <div><span class="detail-label">DOB:</span> ${student.dob}</div>
                                <div><span class="detail-label">Blood Group:</span> ${student.blood}</div>
                                <div><span class="detail-label">Father:</span> ${student.father}</div>
                                <div><span class="detail-label">Contact:</span> +91 XXXXX XXXXX</div>
                                <div><span class="detail-label">Address:</span> ${student.address}</div>
                            </div>
                        </div>
                    </div>
                    <div class="signature-area">
                        <span class="signature-line"></span>
                        <div>Principal's Signature</div>
                    </div>
                    <div class="school-footer">
                        Affiliation No.: 1030568 | UDISE Code: 23420111373
                    </div>
                </div>
                
                <!-- Back Side -->
                <div class="card-back">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <div class="school-name">BETHANY CONVENT SCHOOL</div>
                        <div style="font-size: 12px;">DM-49, Indus Town, Bhopal</div>
                    </div>
                    
                    <div class="qr-code" id="qr-${student.id}"></div>
                    <div class="qr-label">Scan to Verify Student ID</div>
                    
                    <div style="margin-top: 20px; font-size: 12px; text-align: center;">
                        <div>Phone: 0755-2897222</div>
                        <div>Email: info@bethanybhopal.edu.in</div>
                        <div>Website: www.bethanybhopal.edu.in</div>
                    </div>
                    
                    <div class="school-footer" style="margin-top: 15px;">
                        Valid through: ${student.valid}
                    </div>
                </div>
            </div>
        </div>
    `;
}