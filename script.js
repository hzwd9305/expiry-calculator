// ==================== 全局变量 ====================
let lastAlertType = null;
let isInitialized = false;

// ==================== 初始化 ====================
function init() {
    if (isInitialized) return;
    isInitialized = true;
    
    console.log('开始初始化...');
    
    try {
        // 1. 设置当前年份
        const today = new Date();
        document.getElementById('current-year').textContent = today.getFullYear();
        console.log('设置年份:', today.getFullYear());
        
        // 2. 设置默认生产日期（30天前）
        const productionDate = new Date(today);
        productionDate.setDate(today.getDate() - 30);
        
        // 确保格式正确
        const year = productionDate.getFullYear();
        const month = String(productionDate.getMonth() + 1).padStart(2, '0');
        const day = String(productionDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        document.getElementById('production-date').value = formattedDate;
        console.log('设置生产日期:', formattedDate);
        
        // 3. 立即更新当前日期显示
        updateCurrentDate();
        
        // 4. 设置弹窗事件
        setupAlert();
        
        // 5. 设置事件监听
        setupEvents();
        
        // 6. 立即执行首次计算
        console.log('开始首次计算...');
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
        if (!date || isNaN(date.getTime())) {
            console.log('日期无效:', date);
            return '--';
        }
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
    } catch (e) {
        console.error('日期格式化错误:', e);
        return '日期错误';
    }
}

function getMonthDifference(date1, date2) {
    try {
        if (!date1 || !date2 || isNaN(date1.getTime()) || isNaN(date2.getTime())) {
            console.log('日期无效，无法计算月份差');
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
        console.log('检查商品状态:', {
            生产日期: formatDateDisplay(productionDate),
            到期日期: formatDateDisplay(expiryDate),
            超三日期: formatDateDisplay(tertiaryDate),
            当前日期: formatDateDisplay(currentDate),
            保质期: shelfLife
        });
        
        if (!productionDate || !expiryDate || !tertiaryDate || !currentDate ||
            isNaN(productionDate.getTime()) || isNaN(expiryDate.getTime()) || 
            isNaN(tertiaryDate.getTime()) || isNaN(currentDate.getTime())) {
            console.log('日期无效，跳过检查');
            return null;
        }
        
        const prodDate = new Date(productionDate.getFullYear(), productionDate.getMonth(), productionDate.getDate());
        const expDate = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
        const tertDate = new Date(tertiaryDate.getFullYear(), tertiaryDate.getMonth(), tertiaryDate.getDate());
        const curDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        
        console.log('标准化日期:', {
            生产日期: formatDateDisplay(prodDate),
            超三日期: formatDateDisplay(tertDate),
            当前日期: formatDateDisplay(curDate)
        });
        
        // 检查生产日期是否是未来
        if (prodDate.getTime() > curDate.getTime()) {
            console.log('生产日期是未来日期，跳过检查');
            return null;
        }
        
        // 检查是否过期
        if (curDate.getTime() > expDate.getTime()) {
            console.log('商品已过期');
            return { type: 'expired', message: '商品已过期，不可流入' };
        }
        
        // 计算月份差
        const monthDiff = getMonthDifference(curDate, tertDate);
        if (monthDiff === null) return null;
        
        const compareValue = shelfLife / 3 / 30;
        
        console.log('超三检查计算:', {
            月份差: monthDiff,
            比较值: compareValue,
            差值: Math.abs(monthDiff) - compareValue
        });
        
        const absMonthDiff = Math.abs(monthDiff);
        const diff = absMonthDiff - compareValue;
        
        if (diff > 0.1) {
            console.log('判断为: 已经超三');
            return { type: 'tertiary_expired', message: '商品超三，咨询店长是否收货' };
        } else if (Math.abs(diff) <= 0.2) {
            console.log('判断为: 刚刚超三');
            return { type: 'tertiary_just', message: '刚刚超三，咨询店长是否收货' };
        } else if (diff < -0.1) {
            if (prodDate.getTime() > tertDate.getTime() && 
                prodDate.getFullYear() === tertDate.getFullYear()) {
                console.log('判断为: 日期较大');
                return { type: 'large', message: '日期较大，咨询店长是否收货' };
            }
        }
        
        console.log('状态正常，无需提醒');
        return null;
        
    } catch (error) {
        console.error('检查商品状态错误:', error);
        return null;
    }
}

function updateCurrentDate() {
    try {
        const today = new Date();
        const formatted = formatDateDisplay(today);
        console.log('更新当前日期:', formatted);
        document.getElementById('current-date').textContent = formatted;
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
        console.log('生产日期变化:', this.value);
        if (!this.value) return;
        calculate();
    });
    
    shelfLifeInput.addEventListener('input', function() {
        console.log('保质期输入:', this.value);
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
            console.log('点击快捷按钮:', days + '天');
            if (!isNaN(days) && days >= 1 && days <= 9999) {
                shelfLifeInput.value = days;
                calculate();
            }
        });
    });
}

// ==================== 核心计算 ====================
function calculate() {
    console.log('开始计算...');
    
    try {
        // 1. 获取输入值
        const prodDateStr = document.getElementById('production-date').value;
        const shelfLifeStr = document.getElementById('shelf-life').value;
        
        console.log('输入值:', {
            生产日期: prodDateStr,
            保质期: shelfLifeStr
        });
        
        // 2. 输入验证
        if (!prodDateStr || !shelfLifeStr) {
            console.log('输入为空，跳过计算');
            return;
        }
        
        const shelfLife = parseInt(shelfLifeStr);
        if (isNaN(shelfLife) || shelfLife < 1) {
            console.log('保质期无效，跳过计算');
            return;
        }
        
        // 3. 解析生产日期
        const productionDate = new Date(prodDateStr);
        if (isNaN(productionDate.getTime())) {
            console.log('生产日期解析失败');
            return;
        }
        
        // 4. 获取当前日期
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log('当前日期:', formatDateDisplay(today));
        
        // 5. 计算到期日期
        const expiryDate = new Date(productionDate);
        expiryDate.setDate(productionDate.getDate() + shelfLife);
        console.log('到期日期:', formatDateDisplay(expiryDate));
        
        // 6. 计算贴签日期
        const reminderDate = new Date(expiryDate);
        reminderDate.setDate(expiryDate.getDate() - 1);
        console.log('贴签日期:', formatDateDisplay(reminderDate));
        
        // 7. 计算超三日期
        const oneThirdShelfLife = Math.round(shelfLife / 3);
        const tertiaryDate = new Date(today);
        tertiaryDate.setDate(today.getDate() - oneThirdShelfLife);
        console.log('超三日期:', formatDateDisplay(tertiaryDate), '计算天数:', oneThirdShelfLife);
        
        // 8. 更新显示
        document.getElementById('expiry-date').textContent = formatDateDisplay(expiryDate);
        document.getElementById('reminder-date').textContent = formatDateDisplay(reminderDate);
        document.getElementById('tertiary-date').textContent = formatDateDisplay(tertiaryDate);
        
        console.log('显示更新完成');
        
        // 9. 检查状态
        const status = checkProductStatus(productionDate, expiryDate, tertiaryDate, today, shelfLife);
        if (status) {
            console.log('显示弹窗:', status);
            showAlert(status.type, status.message);
        }
        
    } catch (error) {
        console.error('计算错误:', error);
    }
}

// ==================== 页面加载 ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM加载完成，开始初始化');
        init();
    });
} else {
    console.log('DOM已就绪，立即初始化');
    init();
}

setInterval(updateCurrentDate, 60000);
