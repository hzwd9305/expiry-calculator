// ==================== 全局变量 ====================
let lastAlertType = null;
let isInitialized = false;

// ==================== 初始化 ====================
function init() {
    if (isInitialized) return;
    isInitialized = true;
    
    try {
        const today = new Date();
        document.getElementById('current-year').textContent = today.getFullYear();
        
        const productionDate = new Date(today);
        productionDate.setDate(today.getDate() - 30);
        document.getElementById('production-date').value = formatDateForInput(productionDate);
        
        updateCurrentDate();
        setupAlert();
        setupEvents();
        
        setTimeout(calculate, 100);
        
    } catch (error) {
        console.error('初始化错误:', error);
    }
}

// ==================== 弹窗系统 ====================
function setupAlert() {
    const overlay = document.getElementById('alert-overlay');
    const alertBtn = document.getElementById('alert-btn');
    
    function closeAlert() {
        overlay.style.display = 'none';
        lastAlertType = null;
    }
    
    alertBtn.addEventListener('click', closeAlert);
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeAlert();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.style.display === 'flex') {
            closeAlert();
        }
    });
}

function showAlert(type, message) {
    if (lastAlertType === type) return;
    
    lastAlertType = type;
    
    const overlay = document.getElementById('alert-overlay');
    const alertBox = document.getElementById('alert-box');
    const alertIcon = document.getElementById('alert-icon');
    const alertTitle = document.getElementById('alert-title');
    const alertMessage = document.getElementById('alert-message');
    
    alertBox.className = 'alert-box ' + type;
    alertMessage.textContent = message;
    
    switch(type) {
        case 'expired':
            alertIcon.textContent = '❌';
            alertTitle.textContent = '商品已过期';
            break;
        case 'tertiary_just':
            alertIcon.textContent = '⚠️';
            alertTitle.textContent = '刚刚超三';
            break;
        case 'tertiary_expired':
            alertIcon.textContent = '❌';
            alertTitle.textContent = '已经超三';
            break;
        case 'large':
            alertIcon.textContent = '📅';
            alertTitle.textContent = '日期较大';
            break;
    }
    
    overlay.style.display = 'flex';
}

// ==================== 工具函数 ====================
function formatDateForInput(date) {
    if (!date || isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateDisplay(date) {
    try {
        if (!date || isNaN(date.getTime())) return '--';
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
    } catch (e) {
        return '日期错误';
    }
}

function getMonthDifference(date1, date2) {
    try {
        if (!date1 || !date2 || isNaN(date1.getTime()) || isNaN(date2.getTime())) {
            return null;
        }
        
        let earlyDate = date1 < date2 ? date1 : date2;
        let lateDate = date1 < date2 ? date2 : date1;
        
        let yearDiff = lateDate.getFullYear() - earlyDate.getFullYear();
        let monthDiff = lateDate.getMonth() - earlyDate.getMonth();
        
        let totalMonths = yearDiff * 12 + monthDiff;
        
        let dayDiff = lateDate.getDate() - earlyDate.getDate();
        let dayFraction = dayDiff / 30;
        
        if (dayDiff < 0) {
            totalMonths--;
            let lastMonth = new Date(lateDate);
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            let daysInLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).getDate();
            dayFraction = (daysInLastMonth + dayDiff) / 30;
        }
        
        let result = totalMonths + dayFraction;
        
        if (date1 > date2) {
            result = -result;
        }
        
        return parseFloat(result.toFixed(2));
    } catch (error) {
        console.error('计算月份差错误:', error);
        return null;
    }
}

function checkProductStatus(productionDate, expiryDate, tertiaryDate, currentDate, shelfLife) {
    try {
        if (!productionDate || !expiryDate || !tertiaryDate || !currentDate ||
            isNaN(productionDate.getTime()) || isNaN(expiryDate.getTime()) || 
            isNaN(tertiaryDate.getTime()) || isNaN(currentDate.getTime())) {
            return null;
        }
        
        const prodDate = new Date(productionDate.getFullYear(), productionDate.getMonth(), productionDate.getDate());
        const expDate = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
        const tertDate = new Date(tertiaryDate.getFullYear(), tertiaryDate.getMonth(), tertiaryDate.getDate());
        const curDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        
        if (prodDate.getTime() > curDate.getTime()) {
            return null;
        }
        
        if (prodDate.getFullYear() > curDate.getFullYear()) {
            return null;
        }
        
        if (curDate.getTime() > expDate.getTime()) {
            return { type: 'expired', message: '商品已过期，不可流入' };
        }
        
        const monthDiff = getMonthDifference(curDate, tertDate);
        if (monthDiff === null) return null;
        
        const compareValue = shelfLife / 3 / 30;
        
        const absMonthDiff = Math.abs(monthDiff);
        const diff = absMonthDiff - compareValue;
        
        if (diff > 0.1) {
            return { type: 'tertiary_expired', message: '商品超三，咨询店长是否收货' };
        } else if (Math.abs(diff) <= 0.2) {
            return { type: 'tertiary_just', message: '刚刚超三，咨询店长是否收货' };
        } else if (diff < -0.1) {
            if (prodDate.getTime() > tertDate.getTime() && 
                prodDate.getFullYear() === tertDate.getFullYear()) {
                return { type: 'large', message: '日期较大，咨询店长是否收货' };
            }
        }
        
        return null;
        
    } catch (error) {
        console.error('检查商品状态错误:', error);
        return null;
    }
}

function updateCurrentDate() {
    try {
        const today = new Date();
        document.getElementById('current-date').textContent = formatDateDisplay(today);
        calculate();
    } catch (error) {
        console.error('更新当前日期错误:', error);
    }
}

// ==================== 事件监听 ====================
function setupEvents() {
    const productionDateInput = document.getElementById('production-date');
    const shelfLifeInput = document.getElementById('shelf-life');
    
    productionDateInput.addEventListener('change', function() {
        if (!this.value) return;
        calculate();
    });
    
    shelfLifeInput.addEventListener('input', function() {
        const value = parseInt(this.value);
        if (isNaN(value) || value < 1) {
            this.value = 365;
        } else if (value > 9999) {
            this.value = 9999;
        }
        calculate();
    });
    
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const days = parseInt(this.dataset.days);
            if (!isNaN(days) && days >= 1 && days <= 9999) {
                shelfLifeInput.value = days;
                calculate();
            }
        });
    });
}

// ==================== 核心计算 ====================
function calculate() {
    try {
        const prodDateStr = document.getElementById('production-date').value;
        const shelfLifeStr = document.getElementById('shelf-life').value;
        
        if (!prodDateStr || !shelfLifeStr) return;
        
        const shelfLife = parseInt(shelfLifeStr);
        if (isNaN(shelfLife) || shelfLife < 1) return;
        
        const productionDate = new Date(prodDateStr);
        if (isNaN(productionDate.getTime())) return;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const expiryDate = new Date(productionDate);
        expiryDate.setDate(productionDate.getDate() + shelfLife);
        
        const reminderDate = new Date(expiryDate);
        reminderDate.setDate(expiryDate.getDate() - 1);
        
        const oneThirdShelfLife = Math.round(shelfLife / 3);
        const tertiaryDate = new Date(today);
        tertiaryDate.setDate(today.getDate() - oneThirdShelfLife);
        
        document.getElementById('expiry-date').textContent = formatDateDisplay(expiryDate);
        document.getElementById('reminder-date').textContent = formatDateDisplay(reminderDate);
        document.getElementById('tertiary-date').textContent = formatDateDisplay(tertiaryDate);
        
        const status = checkProductStatus(productionDate, expiryDate, tertiaryDate, today, shelfLife);
        if (status) {
            showAlert(status.type, status.message);
        }
        
    } catch (error) {
        console.error('计算错误:', error);
    }
}

// ==================== 页面加载 ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        init();
    });
} else {
    init();
}

setInterval(updateCurrentDate, 60000);
