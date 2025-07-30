document.addEventListener('DOMContentLoaded', function() {
    // Load student data
    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            generateIDCards(data.students);
            setupEventListeners();
            checkUrlForStudentData();
        })
        .catch(error => {
            console.error('Error loading student data:', error);
            document.getElementById('cardsContainer').innerHTML = 
                '<p class="error">Error loading student data. Please try again later.</p>';
        });

    function generateIDCards(students) {
        const cardsContainer = document.getElementById('cardsContainer');
        if (!cardsContainer) return;

        cardsContainer.innerHTML = ''; // Clear existing cards
        
        const currentUrl = new URL(window.location.href);
        
        students.forEach(student => {
            // Create shareable URL
            const shareUrl = new URL(currentUrl);
            const studentData = JSON.stringify({
                id: student.id,
                name: student.name,
                class: student.class,
                photo: student.photo,
                dob: student.dob,
                contact: student.contact,
                address: student.address,
                school: student.school.name
            });
            shareUrl.searchParams.set('qrdata', encodeURIComponent(studentData));
            shareUrl.hash = 'verification';
            
            // Create card
            const card = document.createElement('article');
            card.className = 'id-card';
            card.innerHTML = `
                <header class="header">
                    ${student.school.name}
                    <div class="sub-header">${student.school.address}
                        <p>session: ${student.school.session}</p>
                    </div>
                </header>
                <section class="body-section">
                    <div class="photo-container">
                        <div class="photo" aria-label="Photo of ${student.name}">
                            <img 
                                src="${student.photo}" 
                                alt="Portrait photo of ${student.name}" 
                                onerror="this.src='https://via.placeholder.com/110x120?text=Student+Photo'"
                            />
                        </div>
                        <div class="qr-code-container" id="qr-${student.id}"></div>
                    </div>
                    <div class="details">
                        <div class="signature">
                            <div class="chairman-sign">[signature]</div>
                            <div class="chairman-title">Principal</div>
                        </div>
                        <h1 class="name">${student.name.toUpperCase()}</h1>
                        <div class="info-list">
                            <div class="info-item">
                                <span class="info-label">ID:</span>
                                <span class="info-value">${student.id}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Class:</span>
                                <span class="info-value">${student.class}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">DOB:</span>
                                <span class="info-value">${student.dob}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Contact:</span>
                                <span class="info-value">${student.contact}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Address:</span>
                                <span class="address-value">${student.address.replace(/,/g, ',<br />')}</span>
                            </div>
                        </div>
                    </div>
                </section>
            `;
            
            cardsContainer.appendChild(card);

            // Generate QR code
            setTimeout(() => {
                const qrContainer = document.getElementById(`qr-${student.id}`);
                if (qrContainer && typeof QRCode !== 'undefined') {
                    try {
                        new QRCode(qrContainer, {
                            text: shareUrl.toString(),
                            width: 100,
                            height: 100,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        });
                    } catch (e) {
                        console.error('QR generation error:', e);
                        qrContainer.innerHTML = '<p>QR Error</p>';
                    }
                }
            }, 100);
        });
    }

    function displayStudentData(student) {
        const verificationDetails = document.getElementById('verificationDetails');
        const statusText = document.getElementById('statusText');
        const photoPlaceholder = document.querySelector('.photo-placeholder');
        
        if (!student) {
            verificationDetails.innerHTML = '';
            photoPlaceholder.innerHTML = 'Student Photo';
            statusText.textContent = 'Invalid QR code. Please scan a valid student ID QR code.';
            statusText.style.color = '#e74c3c';
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
                <span class="verified-value">${student.school}</span>
            </div>
        `;
        
        statusText.textContent = `Student verified: ${student.name} (${student.id})`;
        statusText.style.color = '#27ae60';
    }

    function initQRScanner() {
        const qrScannerContainer = document.getElementById('qr-scanner-container');
        if (!qrScannerContainer) return;
        
        qrScannerContainer.innerHTML = '';
        
        if (!document.getElementById('verification')) return;
        
        if (typeof Html5QrcodeScanner === 'undefined') {
            qrScannerContainer.innerHTML = '<p>QR scanner library not loaded. Please refresh the page.</p>';
            return;
        }
        
        const scanner = new Html5QrcodeScanner(
            "qr-scanner-container", 
            { 
                fps: 10,
                qrbox: { width: 250, height: 250 },
                rememberLastUsedCamera: true
            },
            false
        );
        
        scanner.render((decodedText) => {
            try {
                const url = new URL(window.location.href);
                url.searchParams.set('qrdata', encodeURIComponent(decodedText));
                url.hash = 'verification';
                window.history.pushState({}, '', url);
                
                const studentData = JSON.parse(decodedText);
                displayStudentData(studentData);
                
                scanner.clear();
                
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

    function checkUrlForStudentData() {
        const urlParams = new URLSearchParams(window.location.search);
        const qrData = urlParams.get('qrdata');
        
        if (qrData) {
            try {
                document.querySelector('[data-tab="verification"]').click();
                const studentData = JSON.parse(decodeURIComponent(qrData));
                displayStudentData(studentData);
                
                const qrScannerContainer = document.getElementById('qr-scanner-container');
                if (qrScannerContainer) {
                    qrScannerContainer.innerHTML = '';
                    const rescanBtn = document.createElement('button');
                    rescanBtn.className = 'action-btn print';
                    rescanBtn.innerHTML = '<i class="fas fa-qrcode"></i> Rescan QR Code';
                    rescanBtn.onclick = () => {
                        qrScannerContainer.innerHTML = '';
                        initQRScanner();
                    };
                    qrScannerContainer.appendChild(rescanBtn);
                }
            } catch (e) {
                console.error('Error parsing URL QR data:', e);
                displayStudentData(null);
            }
        }
    }

    function setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(tabId).classList.add('active');
                
                if (tabId === 'verification') {
                    initQRScanner();
                }
            });
        });

        // Download button
        document.getElementById('downloadAll')?.addEventListener('click', () => {
            alert('This would download all QR codes in a real implementation');
        });
    }
});