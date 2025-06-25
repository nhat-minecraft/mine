// script.js
let API_URL = 'https://ba9e-2001-ee0-78c9-da10-cad9-d2ff-fe31-f9a4.ngrok-free.app/api';

// Tạo session ID và lưu vào localStorage
function getOrCreateSessionId() {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2) + 
                   Date.now().toString(36);
        localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
}

// Mở link xác thực
function openVerificationLink(link) {
    const win = window.open(link, '_blank');
    
    // Kiểm tra khi tab đóng
    const checkClosed = setInterval(() => {
        if (newWindow.closed) {
            clearInterval(checkClosed);
            // Kiểm tra lại trạng thái sau khi đóng tab
            setTimeout(() => checkAllLinksStatus(), 2000);
        }
    }, 500);

}

// Kiểm tra trạng thái truy cập link
async function checkLinkStatus(link) {
    try {
        const sessionId = getOrCreateSessionId();
        const response = await fetch(`${API_URL}/check-link-status`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                url: link,
                session_id: sessionId
            })
        });
        
        const data = await response.json();
        return data.accessed;
    } catch (error) {
        console.error('Lỗi kết nối:', error);
        return false;
    }
}

// Cập nhật giao diện cho link
function updateLinkStatus(link, accessed) {
    const linkElements = document.querySelectorAll(`.link-btn`);
    
    linkElements.forEach(element => {
        if (element.dataset.link === link) {
            if (accessed) {
                element.innerHTML = `<i class="fas fa-check"></i> Đã truy cập`;
                element.classList.add('accessed');
            } else {
                element.innerHTML = `Truy cập ${element.textContent.includes('Link 1') ? 'Link 1' : 'Link 2'}`;
                element.classList.remove('accessed');
            }
        }
    });
}

// Kiểm tra trạng thái tất cả link
async function checkAllLinksStatus() {
    const link1Btn = document.getElementById('link1-btn');
    const link2Btn = document.getElementById('link2-btn');
    
    const link1 = link1Btn.getAttribute('data-link');
    const link2 = link2Btn.getAttribute('data-link');
    
    const link1Status = await checkLinkStatus(link1);
    updateLinkStatus(link1, link1Status);
    
    const link2Status = await checkLinkStatus(link2);
    updateLinkStatus(link2, link2Status);
    
    // Cập nhật trạng thái nút "Nhận Key"
    const generateKeyBtn = document.getElementById('generate-key-btn');
    if (link1Status && link2Status) {
        generateKeyBtn.disabled = false;
        generateKeyBtn.innerHTML = `<i class="fas fa-key"></i> Nhận Key Ngay`;
        generateKeyBtn.classList.add('active');
    } else {
        generateKeyBtn.disabled = true;
        generateKeyBtn.innerHTML = `<i class="fas fa-key"></i> Vui lòng truy cập đủ 2 link`;
        generateKeyBtn.classList.remove('active');
    }
    
    return link1Status && link2Status;
}

// Nhận key
async function generateKey() {
    const sessionId = getOrCreateSessionId();
    
    // Kiểm tra lại trạng thái link (để chắc chắn)
    const allLinksAccessed = await checkAllLinksStatus();
    if (!allLinksAccessed) {
        alert('Bạn cần truy cập cả 2 link trước khi nhận key');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/generate-key`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ session_id: sessionId })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            window.location.href = `key.html?key=${data.key}`;
        } else {
            alert(`Lỗi: ${data.message}`);
        }
    } catch (error) {
        console.error('Lỗi kết nối:', error);
        alert('Lỗi kết nối đến server');
    }
}

// Khởi chạy khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    // Lưu API_URL vào sessionStorage để sử dụng trên các trang khác
    sessionStorage.setItem('API_URL', API_URL);
    
    // Hiển thị session ID
    const sessionId = getOrCreateSessionId();
    document.getElementById('session-info').textContent = sessionId;
    
    // Gán sự kiện cho các nút
    document.getElementById('link1-btn').addEventListener('click', function() {
        const link = this.getAttribute('data-link');
        openVerificationLink(link);
    });
    
    document.getElementById('link2-btn').addEventListener('click', function() {
        const link = this.getAttribute('data-link');
        openVerificationLink(link);
    });
    
    document.getElementById('generate-key-btn').addEventListener('click', generateKey);
    
    // Kiểm tra trạng thái link
    checkAllLinksStatus();
});
