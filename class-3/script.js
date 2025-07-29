// Load student data
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const students = data.students;
        generateIDCards(students);
        setupEventListeners();
    })
    .catch(error => console.error('Error loading student data:', error));

// Function to generate ID cards
function generateIDCards(students) {
    const cardsContainer = document.getElementById('cardsContainer');
    
    students.forEach(student => {
        // Create front side card
        const frontCard = document.createElement('article');
        frontCard.className = 'id-card';
        frontCard.innerHTML = `
            <header class="header">
                ${student.school.name}
                <div class="sub-header" aria-label="Address">${student.school.address}
                    <p>session: ${student.school.session}</p>
                </div>
            </header>
            <section class="body-section">
                <div class="qr-code" aria-hidden="true">
                    <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify(student))}" 
                        alt="QR code for student information"
                    />
                    <p>Sector id: ${student.school.codes.udise.substring(7)}</p>
                </div>
                <div class="photo" aria-label="Photo of ${student.name}">
                    <img 
                        src="${student.photo}" 
                        alt="Portrait photo of ${student.name}" 
                        onerror="this.src='https://via.placeholder.com/110x120?text=Student+Photo'"
                    />
                </div>
                <div class="details">
                    <div>
                        <div class="chairman-sign" aria-label="Chairman signature">[signature]</div>
                        <div class="chairman-title">Principal</div>
                    </div>
                    <h1 class="name">${student.name.toUpperCase()}</h1>
                    <div class="info-list">
                        <div class="info-item">
                            <span class="info-label">Class:</span>
                            <span class="info-value">${student.class}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Name:</span>
                            <span class="info-value">${student.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Contact:</span>
                            <span class="info-value">${student.contact}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">DOB:</span>
                            <span class="info-value">${student.dob}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Address:</span>
                        </div>
                        <span class="address-value">
                            ${student.address.replace(/,/g, ',<br />')}
                        </span>
                    </div>
                </div>
            </section>
        `;
        
        // Create back side card
        const backCard = document.createElement('article');
        backCard.className = 'id-card back';
        backCard.innerHTML = `
            <img src="${student.school.logo}" 
                 alt="School Logo" 
                 class="back-logo">
            <h2 class="back-title">${student.school.name}</h2>
            <img src="${student.school.building}" 
                 alt="School Building" 
                 class="back-school-img">
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
        
        // Add cards to container
        cardsContainer.appendChild(frontCard);
        cardsContainer.appendChild(backCard);
    });
}

// Function to display student data in verification section
function displayStudentData(student) {
    const verificationDetails = document.getElementById('verificationDetails');
    const statusText = document.getElementById('statusText');
    const photoPlaceholder = document.querySelector('.photo-placeholder');
    
    if (!student) {
        verificationDetails.innerHTML = '';
        photoPlaceholder.innerHTML = 'Student Photo';
        statusText.textContent = 'Invalid QR code. Please scan a valid student ID QR code.';
        return;
    }
    
    // Update photo
    photoPlaceholder.innerHTML = '';
    const img = document.createElement('img');
    img.src = student.photo;
    img.alt = `Photo of ${student.name}`;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.onerror = function() {
        this.src = 'https://via.placeholder.com/200x250?text=Student+Photo';
    };
    photoPlaceholder.appendChild(img);
    
    // Update details
    verificationDetails.innerHTML = `
        <h3 class="verified-student-name">${student.name}</h3>
        <div class="verified-detail">
            <span class="verified-label">Student ID:</span>
            <span class="verified-value">${student.id}</span>
        </div>
        <div class="verified-detail">
            <span class="verified-label">Class:</span>
            <span class="verified-value">${student.class}</span>
        </div>
        <div class="verified-detail">
            <span class="verified-label">Date of Birth:</span>
            <span class="verified-value">${student.dob}</span>
        </div>
        <div class="verified-detail">
            <span class="verified-label">Contact:</span>
            <span class="verified-value">${student.contact}</span>
        </div>
        <div class="verified-detail">
            <span class="verified-label">Address:</span>
            <span class="verified-value">${student.address}</span>
        </div>
        <div class="verified-detail">
            <span class="verified-label">School:</span>
            <span class="verified-value">${student.school.name}</span>
        </div>
    `;
    
    statusText.textContent = `Student verified: ${student.name} (${student.id})`;
}

// Function to initialize QR scanner
function initQRScanner() {
    const qrScannerContainer = document.getElementById('qr-scanner-container');
    
    // Clear any existing scanner
    qrScannerContainer.innerHTML = '';
    
    // Check if we're on the verification tab
    if (!document.getElementById('verification')) return;
    
    // Check if we have a scanner library available
    if (typeof Html5QrcodeScanner === 'undefined') {
        qrScannerContainer.innerHTML = '<p>QR scanner library not loaded. Please refresh the page.</p>';
        console.warn('QR scanner library not loaded');
        return;
    }
    
    // Create scanner
    const scanner = new Html5QrcodeScanner(
        "qr-scanner-container", 
        { 
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true
        },
        /* verbose= */ false
    );
    
    scanner.render((decodedText) => {
        try {
            const studentData = JSON.parse(decodedText);
            displayStudentData(studentData);
            
            // Stop scanner after successful scan
            scanner.clear();
            
            // Show rescan button
            const rescanBtn = document.createElement('button');
            rescanBtn.className = 'action-btn print';
            rescanBtn.innerHTML = '<i class="fas fa-qrcode"></i> Rescan QR Code';
            rescanBtn.onclick = () => {
                qrScannerContainer.innerHTML = '';
                initQRScanner();
            };
            qrScannerContainer.appendChild(rescanBtn);
        } catch (e) {
            displayStudentData(null);
            console.error('Error parsing QR code data:', e);
        }
    }, (error) => {
        console.error('QR Scanner error:', error);
    });
}

// Function to handle URL parameters with QR data
function checkUrlForStudentData() {
    const urlParams = new URLSearchParams(window.location.search);
    const qrData = urlParams.get('qrdata');
    
    if (qrData) {
        try {
            // Switch to verification tab
            document.querySelector('[data-tab="verification"]').click();
            
            const studentData = JSON.parse(decodeURIComponent(qrData));
            displayStudentData(studentData);
        } catch (e) {
            console.error('Error parsing URL QR data:', e);
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching functionality
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and content
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Initialize scanner if verification tab is clicked
            if (tabId === 'verification') {
                initQRScanner();
            }
        });
    });

    // Sample QR download functionality
    document.getElementById('downloadAll').addEventListener('click', () => {
        alert('In a real implementation, this would download all QR codes');
    });
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', checkUrlForStudentData);