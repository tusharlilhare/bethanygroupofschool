// Load student data
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const students = data.students;
        generateIDCards(students);
        setupEventListeners();
        checkUrlForStudentData(students); // <-- Pass students here
    })
    .catch(error => console.error('Error loading student data:', error));

// Function to generate ID cards
function generateIDCards(students) {
    const cardsContainer = document.getElementById('cardsContainer');
    const currentUrl = new URL(window.location.href);

    if (typeof QRCode === 'undefined') {
        console.error('QRCode library not loaded!');
        return;
    }

    students.forEach(student => {
        const frontCard = document.createElement('article');
        frontCard.className = 'id-card';
        frontCard.innerHTML = `
            <header class="header">
                ${student.school.name}
                <div class="sub-header">${student.school.address}
                    <p>session: ${student.school.session}</p>
                </div>
            </header>
            <section class="body-section">
                <div class="qr-code">
                    <div id="qr-${student.id}" class="qr-code-container"></div>
                    <p>Sector id: ${student.school.codes.udise.substring(7)}</p>
                </div>
                <div class="photo">
                    <img 
                        src="${student.photo}" 
                        alt="Portrait photo of ${student.name}" 
                        onerror="this.src='https://via.placeholder.com/110x120?text=Student+Photo'"
                    />
                </div>
                <div class="details">
                    <div>
                        <div class="chairman-sign">[signature]</div>
                        <div class="chairman-title">Principal</div>
                    </div>
                    <h1 class="name">${student.name.toUpperCase()}</h1>
                    <div class="info-list">
                        <div class="info-item"><span class="info-label">Class:</span><span class="info-value">${student.class}</span></div>
                        <div class="info-item"><span class="info-label">Name:</span><span class="info-value">${student.name}</span></div>
                        <div class="info-item"><span class="info-label">Contact:</span><span class="info-value">${student.contact}</span></div>
                        <div class="info-item"><span class="info-label">DOB:</span><span class="info-value">${student.dob}</span></div>
                        <div class="info-item"><span class="info-label">Address:</span></div>
                        <span class="address-value">${student.address.replace(/,/g, ',<br />')}</span>
                    </div>
                </div>
            </section>
        `;

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

// Generate QR code containing student ID URL
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

// Show student verification data
function showVerification(student) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-tab="verification"]').classList.add('active');

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById('verification').classList.add('active');

    const roll = student.roll || 'N/A';
    const blood = student.blood || 'N/A';
    const father = student.father || 'N/A';
    const valid = student.valid || '2025-12-31';

    const detailsHtml = `
        <div class="detail-card">
            <h3>Student Information</h3>
            <p><strong>photo:</strong> ${student.photo}</p>
            
            <p><strong>Name:</strong> ${student.name}</p>
            <p><strong>Class:</strong> ${student.class}</p>
            <p><strong>Roll No:</strong> ${roll}</p>
            <p><strong>Student ID:</strong> ${student.id}</p>
        </div>
        <div class="detail-card">
            <h3>Personal Details</h3>
            <p><strong>Date of Birth:</strong> ${student.dob}</p>
            <p><strong>Blood Group:</strong> ${blood}</p>
            <p><strong>Father's Name:</strong> ${father}</p>
        </div>
        <div class="detail-card">
            <h3>Validity</h3>
            <p><strong>Valid Through:</strong> ${valid}</p>
            <p><strong>Issued Date:</strong> 01/06/2025</p>
            <p><strong>Status:</strong> Active</p>
        </div>
        <div class="detail-card">
            <h3>Contact Information</h3>
            <p><strong>Address:</strong> ${student.address}</p>
            <p><strong>Phone:</strong> ${student.contact}</p>
            <p><strong>Email:</strong> student@school.edu</p>
        </div>
    `;

    document.getElementById('verificationDetails').innerHTML = detailsHtml;
    document.getElementById('statusText').innerHTML = `<i class="fas fa-check-circle"></i> ID Verified Successfully!`;
}

// Setup tab switching
function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    document.getElementById('downloadAll').addEventListener('click', () => {
        alert('Download all QR codes feature is not implemented.');
    });
}

// Check ?id=... in URL and verify student
function checkUrlForStudentData(students) {
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');
    if (studentId) {
        const student = students.find(s => s.id === studentId);
        if (student) {
            showVerification(student);
        } else {
            document.getElementById('statusText').innerText = 'Invalid student ID';
        }
    }
}
