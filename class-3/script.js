// Load student data and initialize the application
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const students = data.students;
        generateIDCards(students);
        setupEventListeners();
        checkUrlForStudentData(students);
    })
    .catch(error => console.error('Error loading student data:', error));

/**
 * Generates ID cards for all students
 * @param {Array} students - Array of student objects
 */
function generateIDCards(students) {
    const cardsContainer = document.getElementById('cardsContainer');
    
    if (!cardsContainer) {
        console.error('Container element not found');
        return;
    }

    if (typeof QRCode === 'undefined') {
        console.error('QRCode library not loaded!');
        return;
    }

    students.forEach(student => {
        // Create front of ID card
        const frontCard = document.createElement('article');
        frontCard.className = 'id-card';
        frontCard.innerHTML = `
            <header class="header">
                ${student.school.name}
                <div class="sub-header">${student.school.address}
                    <p>Session: ${student.school.session}</p>
                </div>
            </header>
            <section class="body-section">
                <div class="qr-code">
                    <div id="qr-${student.id}" class="qr-code-container"></div>
                    <p>Sector ID: ${student.school.codes.udise.substring(7)}</p>
                </div>
                <div class="photo">
                    <img 
                        src="${student.photo}" 
                        alt="Student Photo" 
                        onerror="this.src='https://via.placeholder.com/110x120?text=Photo+Not+Available'"
                    />
                </div>
                <div class="details">
                    <div>
                        <div class="chairman-sign">[signature]</div>
                        <div class="chairman-title">Principal</div>
                    </div>
                    <h1 class="name">${student.name.toUpperCase()}</h1>
                    <div class="info-list">
                        <div class="info-item"><span>Class:</span> ${student.class}</div>
                        <div class="info-item"><span>Roll No:</span> ${student.roll || 'N/A'}</div>
                        <div class="info-item"><span>Contact:</span> ${student.contact}</div>
                        <div class="info-item"><span>DOB:</span> ${student.dob}</div>
                        <div class="info-item address"><span>Address:</span> ${student.address.replace(/,/g, ',<br>')}</div>
                    </div>
                </div>
            </section>
        `;

        // Create back of ID card
        const backCard = document.createElement('article');
        backCard.className = 'id-card back';
        backCard.innerHTML = `
            <img src="${student.school.logo}" alt="School Logo" class="back-logo">
            <h2 class="back-title">${student.school.name}</h2>
            <img src="${student.school.building}" alt="School Building" class="back-school-img">
            <div class="back-info">
                <p>${student.school.address}</p>
                <p>Affiliation No.: ${student.school.codes.affiliation}</p>
                <p>UDISE Code: ${student.school.codes.udise}</p>
            </div>
            <div class="back-contact">
                <p>Phone: ${student.school.contact.phone}</p>
                <p>Email: ${student.school.contact.email}</p>
                <p>Website: ${student.school.contact.website}</p>
            </div>
        `;

        cardsContainer.appendChild(frontCard);
        cardsContainer.appendChild(backCard);

        generateQRCodeForStudent(student);
    });
}

/**
 * Generates QR code for a student
 * @param {Object} student - Student object
 */
function generateQRCodeForStudent(student) {
    const qrContainer = document.getElementById(`qr-${student.id}`);
    if (!qrContainer) return;

    const url = `${window.location.origin}${window.location.pathname}?id=${student.id}`;
    qrContainer.innerHTML = '';

    new QRCode(qrContainer, {
        text: url,
        width: 90,
        height: 90,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    qrContainer.addEventListener('click', () => {
        window.open(url, '_blank');
    });
}

/**
 * Displays student verification information
 * @param {Object} student - Student object to verify
 */
function showVerification(student) {
    // Activate verification tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-tab="verification"]').classList.add('active');
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById('verification').classList.add('active');

    // Create photo HTML with fallback
    const photoHtml = `
        <div class="verification-photo">
            <div class="photo-container">
                <img src="${student.photo}" 
                     alt="${student.name}" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/200x250?text=Student+Photo'">
            </div>
            <div class="photo-meta">${student.name}'s Photo</div>
        </div>
    `;

    // Generate verification details HTML
    document.getElementById('verificationDetails').innerHTML = `
        ${photoHtml}
        <div class="detail-grid">
            <div class="detail-card">
                <h3><i class="fas fa-user-graduate"></i> Student Information</h3>
                <p><strong>Name:</strong> ${student.name}</p>
                <p><strong>Class:</strong> ${student.class}</p>
                <p><strong>Roll No:</strong> ${student.roll || 'N/A'}</p>
                <p><strong>Student ID:</strong> ${student.id}</p>
                <p><strong>Date of Birth:</strong> ${student.dob}</p>
                <p><strong>Contact:</strong> ${student.contact}</p>
                <p><strong>Address:</strong> ${student.address}</p>
            </div>
            
            <div class="detail-card">
                <h3><i class="fas fa-school"></i> School Information</h3>
                <p><strong>School Name:</strong> ${student.school.name}</p>
                <p><strong>Address:</strong> ${student.school.address}</p>
                <p><strong>Session:</strong> ${student.school.session}</p>
                <p><strong>Affiliation No.:</strong> ${student.school.codes.affiliation}</p>
                <p><strong>UDISE Code:</strong> ${student.school.codes.udise}</p>
            </div>
            
            <div class="detail-card">
                <h3><i class="fas fa-phone"></i> School Contact</h3>
                <p><strong>Phone:</strong> ${student.school.contact.phone}</p>
                <p><strong>Email:</strong> ${student.school.contact.email}</p>
                <p><strong>Website:</strong> ${student.school.contact.website}</p>
            </div>
            
            <div class="detail-card">
                <h3><i class="fas fa-calendar-check"></i> Validity</h3>
                <p><strong>Valid Through:</strong> ${student.valid || '2025-12-31'}</p>
                <p><strong>Issued Date:</strong> 01/06/2025</p>
                <p><strong>Status:</strong> <span class="status-active">Active</span></p>
            </div>
        </div>
    `;

    document.getElementById('statusText').innerHTML = `
        <i class="fas fa-check-circle"></i> ID Verified Successfully!
        <small>Verified on ${new Date().toLocaleDateString()}</small>
    `;
}
    // Rest of your function...

/**
 * Sets up event listeners for UI interactions
 */
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Download button
    document.getElementById('downloadAll')?.addEventListener('click', () => {
        alert('Export feature will be implemented soon');
    });
}

/**
 * Checks URL for student ID parameter and shows verification if found
 * @param {Array} students - Array of student objects
 */
function checkUrlForStudentData(students) {
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');
    
    if (studentId) {
        const student = students.find(s => s.id === studentId);
        if (student) {
            showVerification(student);
            // Scroll to verification section
            setTimeout(() => {
                document.getElementById('verification').scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            document.getElementById('statusText').innerHTML = `
                <i class="fas fa-times-circle"></i> Invalid Student ID
                <small>No student found with ID: ${studentId}</small>
            `;
        }
    }
}