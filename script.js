// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
});

function initializeCalculator() {
    // 设置当前日期
    updateCurrentDate();
    
    // 设置默认值
    const today = new Date();
    const defaultProductionDate = new Date(today);
    document.getElementById('production-date').value = formatDateForInput(defaultProductionDate);
    document.getElementById('shelf-life').value = 15;
    
    // 绑定事件
    setupEventListeners();
    
    // 初始计算
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

// 更新当前日期显示
function updateCurrentDate() {
    const today = new Date();
    document.getElementById('current-date').textContent = formatDateForDisplay(today);
}

// ==================== 事件绑定 ====================
function setupEventListeners() {
    // 生产日期变化
    document.getElementById('production-date').addEventListener('change', calculateAllDates);
    
    // 保质期输入
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
        // 获取输入值
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
        
        // 验证生产日期
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
