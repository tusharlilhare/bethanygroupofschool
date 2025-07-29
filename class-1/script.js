document.addEventListener('DOMContentLoaded', function() {
    // Load student data from JSON file
    fetch('data.json')
        .then(response => response.json())
        .then(students => {
            // Check if we're coming from a QR code scan
            const urlParams = new URLSearchParams(window.location.search);
            const studentId = urlParams.get('id');
            
            if (studentId) {
                // Find the student with this ID
                const student = students.find(s => s.id === studentId);
                if (student) {
                    // Show only this student's card
                    showSingleStudentCard(student, students);
                } else {
                    // If student not found, show all cards
                    generateStudentCards(students);
                }
            } else {
                // Generate all student ID cards normally
                generateStudentCards(students);
            }
            
            // Set up tab switching
            const tabBtns = document.querySelectorAll('.tab-btn');
            tabBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Remove active class from all buttons
                    tabBtns.forEach(b => b.classList.remove('active'));
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    // Hide all tab content
                    document.querySelectorAll('.tab-content').forEach(tab => {
                        tab.classList.remove('active');
                    });
                    
                    // Show selected tab content
                    const tabId = this.getAttribute('data-tab');
                    document.getElementById(tabId).classList.add('active');
                });
            });
            
            // Set up download all QR codes button
            document.getElementById('downloadAll').addEventListener('click', function() {
                alert('All QR codes downloaded successfully! In a real application, this would download ZIP file with all QR codes.');
            });
        })
        .catch(error => {
            console.error('Error loading student data:', error);
            alert('Error loading student data. Please try again later.');
        });
});

function generateStudentCards(students) {
    const container = document.getElementById('cardsContainer');
    container.innerHTML = '';
    
    // Hide single card view
    document.getElementById('singleCardContainer').style.display = 'none';
    // Show card grid
    container.style.display = 'grid';
    
    students.forEach(student => {
        const cardHtml = createStudentCardHtml(student);
        container.innerHTML += cardHtml;
        
        // Generate QR code after element is added to DOM
        setTimeout(() => {
            generateQRCodeForStudent(student);
        }, 100);
    });
}

function showSingleStudentCard(student, students) {
    // Hide the card grid
    document.getElementById('cardsContainer').style.display = 'none';
    
    // Show single card container
    const singleCardContainer = document.getElementById('singleCardContainer');
    singleCardContainer.style.display = 'flex';
    
    // Create and display the single card
    singleCardContainer.innerHTML = createStudentCardHtml(student);
    
    // Generate QR code for this single card
    setTimeout(() => {
        generateQRCodeForStudent(student);
    }, 100);
    
    // Also show verification details
    showVerification(student);
}

function createStudentCardHtml(student) {
    return `
        <div class="card-container">
            <div class="card-inner">
                <div class="card-front">
                    <div class="card-header">
                        <div class="school-name">Modern Public School</div>
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
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="validity">Valid through: ${student.valid}</div>
                        <div>Principal's Signature</div>
                    </div>
                </div>
                
                <div class="card-back">
                    <div class="qr-code" id="qr-${student.id}"></div>
                    <div class="qr-label">Scan to Verify Student ID</div>
                    <div class="school-name" style="margin-top: 20px;">Modern Public School</div>
                </div>
            </div>
        </div>
    `;
}

function generateQRCodeForStudent(student) {
    const qrContainer = document.getElementById(`qr-${student.id}`);
    if (qrContainer) {
        // Clear any existing QR code
        qrContainer.innerHTML = '';
        
        // Create QR code with student data
        // Instead of the full student data, we'll just encode a URL with the student ID
        const verificationUrl = `${window.location.origin}${window.location.pathname}?id=${student.id}`;
        new QRCode(qrContainer, {
            text: verificationUrl,
            width: 180,
            height: 180,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Add click event to simulate scan
        qrContainer.addEventListener('click', function() {
            showVerification(student);
        });
    }
}

function showVerification(student) {
    // Switch to verification tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-tab="verification"]').classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById('verification').classList.add('active');
    
    // Scroll to verification section
    document.getElementById('verification').scrollIntoView({ behavior: 'smooth' });
    
    // Update verification details
    const detailsHtml = `
        <div class="detail-card">
            <h3>Student Information</h3>
            <p><strong>Name:</strong> ${student.name}</p>
            <p><strong>Class:</strong> ${student.class}</p>
            <p><strong>Roll No:</strong> ${student.roll}</p>
            <p><strong>Student ID:</strong> ${student.id}</p>
        </div>
        
        <div class="detail-card">
            <h3>Personal Details</h3>
            <p><strong>Date of Birth:</strong> ${student.dob}</p>
            <p><strong>Blood Group:</strong> ${student.blood}</p>
            <p><strong>Father's Name:</strong> ${student.father}</p>
        </div>
        
        <div class="detail-card">
            <h3>Validity</h3>
            <p><strong>Valid Through:</strong> ${student.valid}</p>
            <p><strong>Issued Date:</strong> 01/06/2025</p>
            <p><strong>Status:</strong> Active</p>
        </div>
        
        <div class="detail-card">
            <h3>Contact Information</h3>
            <p><strong>Address:</strong> ${student.address}</p>
            <p><strong>Phone:</strong> +91 XXXXX XXXXX</p>
            <p><strong>Email:</strong> student@school.edu</p>
        </div>
    `;
    
    document.getElementById('verificationDetails').innerHTML = detailsHtml;
    document.getElementById('statusText').innerHTML = `<i class="fas fa-check-circle"></i> ID Verified Successfully!`;
}