// script.js - 到期计算器逻辑文件

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
});

function initializeCalculator() {
    // 只更新当前日期
    updateCurrentDate();
    
    // 保质期默认15天
    document.getElementById('shelf-life').value = 15;
    
    // 生产日期保持空白，不设置默认值
    // 注意：这里不设置生产日期的值
    
    // 绑定事件
    setupEventListeners();
    
    // 初始计算（只会计算超三日期）
    calculateAllDates();
}

// ==================== 日期格式化 ====================
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateForDisplay(date) {
    if (!date || isNaN(date.getTime())) return '--';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function updateCurrentDate() {
    const today = new Date();
    document.getElementById('current-date').textContent = formatDateForDisplay(today);
}

// ==================== 事件绑定 ====================
function setupEventListeners() {
    // 生产日期变化时计算
    document.getElementById('production-date').addEventListener('change', calculateAllDates);
    
    // 保质期输入时实时计算（防抖动）
    let timer;
    document.getElementById('shelf-life').addEventListener('input', function() {
        clearTimeout(timer);
        timer = setTimeout(calculateAllDates, 300);
    });
    
    // 快捷按钮
    document.querySelectorAll('.quick-days button').forEach(button => {
        button.addEventListener('click', function() {
            const days = parseInt(this.getAttribute('data-days'));
            if (!isNaN(days) && days > 0) {
                document.getElementById('shelf-life').value = days;
                calculateAllDates();
            }
        });
    });
}

// ==================== 核心计算 ====================
function calculateAllDates() {
    try {
        const productionDateStr = document.getElementById('production-date').value;
        const shelfLifeInput = document.getElementById('shelf-life').value;
        
        // 验证保质期
        const shelfLife = parseFloat(shelfLifeInput);
        if (isNaN(shelfLife) || shelfLife <= 0) {
            resetDates();
            return;
        }
        
        // 计算超三日期（当前日期 - 保质期的三分之一）
        const today = new Date();
        const tertiaryDate = new Date(today);
        tertiaryDate.setDate(today.getDate() - Math.floor(shelfLife / 3));
        document.getElementById('tertiary-date').textContent = formatDateForDisplay(tertiaryDate);
        
        // 如果生产日期为空，只显示超三日期
        if (!productionDateStr) {
            document.getElementById('expiry-date').textContent = '--';
            document.getElementById('reminder-date').textContent = '--';
            return;
        }
        
        // 计算到期日期
        const productionDate = new Date(productionDateStr);
        if (isNaN(productionDate.getTime())) {
            document.getElementById('expiry-date').textContent = '--';
            document.getElementById('reminder-date').textContent = '--';
            return;
        }
        
        const expiryDate = new Date(productionDate);
        expiryDate.setDate(productionDate.getDate() + Math.floor(shelfLife));
        document.getElementById('expiry-date').textContent = formatDateForDisplay(expiryDate);
        
        // 计算贴签日期（到期前1天）
        const reminderDate = new Date(expiryDate);
        reminderDate.setDate(expiryDate.getDate() - 1);
        document.getElementById('reminder-date').textContent = formatDateForDisplay(reminderDate);
        
    } catch (error) {
        console.error('计算错误:', error);
        resetDates();
    }
}

function resetDates() {
    document.getElementById('tertiary-date').textContent = '--';
    document.getElementById('expiry-date').textContent = '--';
    document.getElementById('reminder-date').textContent = '--';
}

// 每分钟更新当前日期
setInterval(updateCurrentDate, 60000);
