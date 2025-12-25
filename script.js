// ==================== 初始化 ====================
function initializePage() {
    try {
        // 1. 设置默认日期（当前日期）
        const today = new Date();
        updateCurrentDate();
        
        // 2. 设置生产日期为30天前（示例数据）
        const defaultProductionDate = new Date(today);
        defaultProductionDate.setDate(today.getDate() - 30);
        document.getElementById('production-date').value = formatDateForInput(defaultProductionDate);
        
        // 3. 设置默认保质期15天（如截图所示）
        document.getElementById('shelf-life').value = 15;
        
        // 4. 设置输入变化自动计算
        setupAutoCalculate();
        
        // 5. 设置快捷按钮事件
        setupQuickButtons();
        
        // 6. 初始计算一次
        performCalculation();
        
    } catch (error) {
        console.error('初始化错误:', error);
    }
}

// ==================== 日期格式化函数 ====================
function formatDateForInput(date) {
    // 格式：YYYY-MM-DD 用于input[type="date"]
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function safeFormatDate(date) {
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

// 更新当前日期显示
function updateCurrentDate() {
    const today = new Date();
    document.getElementById('current-date-display').textContent = safeFormatDate(today);
}

// ==================== 自动计算设置 ====================
function setupAutoCalculate() {
    // 生产日期变化时计算
    document.getElementById('production-date').addEventListener('change', performCalculation);
    
    // 保质期输入时实时计算（防抖动）
    let calculationTimer;
    document.getElementById('shelf-life').addEventListener('input', function() {
        clearTimeout(calculationTimer);
        calculationTimer = setTimeout(performCalculation, 300);
    });
}

// ==================== 快捷按钮设置 ====================
function setupQuickButtons() {
    const quickButtons = document.querySelectorAll('.quick-btn');
    quickButtons.forEach(button => {
        button.addEventListener('click', function() {
            const days = parseInt(this.getAttribute('data-days'));
            if (!isNaN(days) && days > 0) {
                document.getElementById('shelf-life').value = days;
                performCalculation();
            }
        });
    });
}

// ==================== 核心计算 ====================
function performCalculation() {
    try {
        // 1. 获取输入值
        const productionDateStr = document.getElementById('production-date').value;
        const shelfLifeInput = document.getElementById('shelf-life').value;
        
        // 2. 验证保质期输入（超三日期需要这个）
        const shelfLife = parseFloat(shelfLifeInput);
        const hasValidShelfLife = !isNaN(shelfLife) && shelfLife > 0 && shelfLife <= 9999;
        
        // 3. 计算超三日期 = 当前日期 - (保质期天数 ÷ 3)
        const today = new Date();
        if (hasValidShelfLife) {
            const tertiaryDate = new Date(today);
            tertiaryDate.setDate(today.getDate() - Math.round(shelfLife / 3));
            document.getElementById('tertiary-date-display').textContent = safeFormatDate(tertiaryDate);
        } else {
            document.getElementById('tertiary-date-display').textContent = '--';
        }
        
        // 4. 验证生产日期（到期日期和贴签日期需要这个）
        if (!productionDateStr) {
            document.getElementById('expiry-date').textContent = '--';
            document.getElementById('reminder-date').textContent = '--';
            return;
        }
        
        if (!hasValidShelfLife) {
            document.getElementById('expiry-date').textContent = '--';
            document.getElementById('reminder-date').textContent = '--';
            return;
        }
        
        // 5. 计算到期日
        const productionDate = new Date(productionDateStr);
        if (isNaN(productionDate.getTime())) {
            document.getElementById('expiry-date').textContent = '--';
            document.getElementById('reminder-date').textContent = '--';
            return;
        }
        
        const expiryDate = new Date(productionDate);
        expiryDate.setDate(productionDate.getDate() + Math.floor(shelfLife));
        
        // 处理小数天数
        const decimalPart = shelfLife - Math.floor(shelfLife);
        if (decimalPart > 0) {
            expiryDate.setHours(expiryDate.getHours() + Math.round(decimalPart * 24));
        }
        
        // 6. 计算贴签日（到期日前1天）
        const reminderDate = new Date(expiryDate);
        reminderDate.setDate(reminderDate.getDate() - 1);
        
        // 7. 更新到期日期和贴签日期显示
        document.getElementById('expiry-date').textContent = safeFormatDate(expiryDate);
        document.getElementById('reminder-date').textContent = safeFormatDate(reminderDate);
        
    } catch (error) {
        console.error('计算错误:', error);
        document.getElementById('tertiary-date-display').textContent = '--';
        document.getElementById('expiry-date').textContent = '--';
        document.getElementById('reminder-date').textContent = '--';
    }
}

// ==================== 页面加载 ====================
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    // 每分钟更新一次当前日期
    setInterval(updateCurrentDate, 60000);
});
