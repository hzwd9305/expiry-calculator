// ==================== 全局变量 ====================
let lastAlertType = null; // 记录上次弹窗类型，避免重复弹窗
let isInitialized = false;

// ==================== 初始化 ====================
function init() {
    if (isInitialized) return;
    isInitialized = true;
    
    try {
        // 1. 设置年份
        document.getElementById('current-year').textContent = new Date().getFullYear();
        
        // 2. 设置默认生产日期（30天前）
        const today = new Date();
        const productionDate = new Date(today);
        productionDate.setDate(today.getDate() - 30);
        document.getElementById('production-date').value = formatDateForInput(productionDate);
        
        // 3. 立即更新当前日期显示
        updateCurrentDate();
        
        // 4. 设置弹窗事件
        setupAlert();
        
        // 5. 设置事件监听
        setupEvents();
        
        // 6. 立即执行首次计算
        setTimeout(calculate, 100);
        
    } catch (error) {
        console.error('初始化错误:', error);
    }
}

// ==================== 弹窗系统 ====================
function setupAlert() {
    const overlay = document.getElementById('alert-overlay');
    const alertBtn = document.getElementById('alert-btn');
    
    // 关闭弹窗
    function closeAlert() {
        overlay.style.display = 'none';
        lastAlertType = null; // 重置记录
    }
    
    // 点击按钮关闭
    alertBtn.addEventListener('click', closeAlert);
    
    // 点击遮罩层关闭
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeAlert();
        }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.style.display === 'flex') {
            closeAlert();
        }
    });
}

// 显示弹窗
function showAlert(type, message) {
    // 如果已经是相同类型的弹窗，不重复显示
    if (lastAlertType === type) return;
    
    lastAlertType = type;
    
    const overlay = document.getElementById('alert-overlay');
    const alertBox = document.getElementById('alert-box');
    const alertIcon = document.getElementById('alert-icon');
    const alertTitle = document.getElementById('alert-title');
    const alertMessage = document.getElementById('alert-message');
    
    // 设置内容和样式
    alertBox.className = 'alert-box ' + type;
    alertMessage.textContent = message;
    
    // 根据类型设置图标和标题
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
    
    // 显示弹窗
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

// 计算两个日期之间的自然月差（精确到小数）
function getMonthDifference(date1, date2) {
    try {
        if (!date1 || !date2 || isNaN(date1.getTime()) || isNaN(date2.getTime())) {
            return null;
        }
        
        // 确保date1是较早的日期
        let earlyDate = date1 < date2 ? date1 : date2;
        let lateDate = date1 < date2 ? date2 : date1;
        
        // 计算年份和月份差
        let yearDiff = lateDate.getFullYear() - earlyDate.getFullYear();
        let monthDiff = lateDate.getMonth() - earlyDate.getMonth();
        
        // 计算总月数
        let totalMonths = yearDiff * 12 + monthDiff;
        
        // 调整天数差
        let dayDiff = lateDate.getDate() - earlyDate.getDate();
        let dayFraction = dayDiff / 30; // 近似转换为月份小数
        
        // 如果晚日期的日期小于早日期的日期，需要借月
        if (dayDiff < 0) {
            totalMonths--;
            // 计算上个月的天数
            let lastMonth = new Date(lateDate);
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            let daysInLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).getDate();
            dayFraction = (daysInLastMonth + dayDiff) / 30;
        }
        
        let result = totalMonths + dayFraction;
        
        // 如果是date1比date2晚，返回负数
        if (date1 > date2) {
            result = -result;
        }
        
        return parseFloat(result.toFixed(2));
    } catch (error) {
        console.error('计算月份差错误:', error);
        return null;
    }
}

// 检查商品状态（按照优先级）
function checkProductStatus(productionDate, expiryDate, tertiaryDate, currentDate, shelfLife) {
    try {
        // 1. 验证所有日期有效性
        if (!productionDate || !expiryDate || !tertiaryDate || !currentDate ||
            isNaN(productionDate.getTime()) || isNaN(expiryDate.getTime()) || 
            isNaN(tertiaryDate.getTime()) || isNaN(currentDate.getTime())) {
            return null;
        }
        
        // 2. 标准化日期（去掉时间部分）
        const prodDate = new Date(productionDate.getFullYear(), productionDate.getMonth(), productionDate.getDate());
        const expDate = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
        const tertDate = new Date(tertiaryDate.getFullYear(), tertiaryDate.getMonth(), tertiaryDate.getDate());
        const curDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        
        // ========== 第一优先级：检查是否过期 ==========
        if (curDate.getTime() > expDate.getTime()) {
            return { type: 'expired', message: '商品已过期，不可流入' };
        }
        
        // ========== 第二优先级：超三检查 ==========
        // 计算当前日期与超三日期的月份差
        const monthDiff = getMonthDifference(curDate, tertDate);
        if (monthDiff === null) return null;
        
        // 计算比较值（保质期÷3，转换为月）
        const compareValue = shelfLife / 3 / 30; // 近似转换为月
        
        console.log('超三检查:', {
            当前日期: formatDateDisplay(curDate),
            超三日期: formatDateDisplay(tertDate),
            月份差: monthDiff,
            比较值: compareValue,
            保质期: shelfLife
        });
        
        // 判断超三状态（注意：monthDiff是当前日期-超三日期，应该是正数）
        if (Math.abs(monthDiff) > compareValue) {
            return { type: 'tertiary_expired', message: '商品超三，咨询店长是否收货' };
        } else if (Math.abs(Math.abs(monthDiff) - compareValue) < 0.1) { // 允许微小误差
            return { type: 'tertiary_just', message: '刚刚超三，咨询店长是否收货' };
        } else {
            // 未超三，继续判断其他状态
            // ========== 第三优先级：日期较大检查 ==========
            // 计算生产日期与超三日期的天数差
            const timeDiff = prodDate.getTime() - tertDate.getTime();
            const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
            
            if (daysDiff > 0 && prodDate.getFullYear() === tertDate.getFullYear()) {
                return { type: 'large', message: '日期较大，咨询店长是否收货' };
            }
        }
        
        return null;
        
    } catch (error) {
        console.error('检查商品状态错误:', error);
        return null;
    }
}

// 更新当前日期
function updateCurrentDate() {
    try {
        const today = new Date();
        document.getElementById('current-date').textContent = formatDateDisplay(today);
        // 当前日期变化时需要重新计算
        calculate();
    } catch (error) {
        console.error('更新当前日期错误:', error);
    }
}

// ==================== 事件监听 ====================
function setupEvents() {
    const productionDateInput = document.getElementById('production-date');
    const shelfLifeInput = document.getElementById('shelf-life');
    
    // 生产日期变化
    productionDateInput.addEventListener('change', function() {
        if (!this.value) return;
        calculate();
    });
    
    // 保质期变化
    shelfLifeInput.addEventListener('input', function() {
        const value = parseInt(this.value);
        if (isNaN(value) || value < 1) {
            this.value = 365; // 恢复默认值
        } else if (value > 9999) {
            this.value = 9999; // 限制最大值
        }
        calculate();
    });
    
    // 常用按钮点击
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
        // 1. 获取输入值
        const prodDateStr = document.getElementById('production-date').value;
        const shelfLifeStr = document.getElementById('shelf-life').value;
        
        // 2. 输入验证
        if (!prodDateStr || !shelfLifeStr) {
            console.log('输入为空');
            return;
        }
        
        const shelfLife = parseInt(shelfLifeStr);
        if (isNaN(shelfLife) || shelfLife < 1) {
            console.log('保质期无效');
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
        
        // 5. 计算到期日期
        const expiryDate = new Date(productionDate);
        expiryDate.setDate(productionDate.getDate() + shelfLife);
        
        // 6. 计算贴签日期
        const reminderDate = new Date(expiryDate);
        reminderDate.setDate(expiryDate.getDate() - 1);
        
        // 7. 计算超三日期（当前日期 - 保质期÷3）
        const oneThirdShelfLife = Math.round(shelfLife / 3);
        const tertiaryDate = new Date(today);
        tertiaryDate.setDate(today.getDate() - oneThirdShelfLife);
        
        // 8. 更新显示
        document.getElementById('expiry-date').textContent = formatDateDisplay(expiryDate);
        document.getElementById('reminder-date').textContent = formatDateDisplay(reminderDate);
        document.getElementById('tertiary-date').textContent = formatDateDisplay(tertiaryDate);
        
        // 9. 检查商品状态并显示弹窗（按照优先级）
        const status = checkProductStatus(productionDate, expiryDate, tertiaryDate, today, shelfLife);
        if (status) {
            console.log('显示弹窗:', status);
            showAlert(status.type, status.message);
        } else {
            console.log('状态正常，不显示弹窗');
        }
        
    } catch (error) {
        console.error('计算错误:', error);
        // 静默失败，不显示错误给用户
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

// 每分钟更新当前日期
setInterval(updateCurrentDate, 60000);
