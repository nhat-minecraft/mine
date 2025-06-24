// script.js

const API_URL = 'http://[YOUR_PUBLIC_IP]:5000/api/generate-key';

async function generateKey() {
    try {
        const response = await fetch(API_URL, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Chuyển hướng đến trang key với key nhận được
            window.location.href = `key.html?key=${data.key}`;
        } else {
            alert('Lỗi: ' + (data.message || 'Không thể tạo key'));
        }
    } catch (error) {
        console.error('Lỗi kết nối:', error);
        alert('Lỗi kết nối đến server');
    }
}

// Hiển thị key khi trang key.html được mở
function displayKey() {
    const urlParams = new URLSearchParams(window.location.search);
    const key = urlParams.get('key');
    
    if (key) {
        document.getElementById('key-value').innerText = key;
    } else {
        document.getElementById('key-display').innerHTML = `
            <h2>Không có key</h2>
            <p>Vui lòng quay lại trang chủ để nhận key</p>
        `;
    }
}

// Gọi hàm khi trang được tải
if (window.location.pathname.includes('key.html')) {
    displayKey();
}