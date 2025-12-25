// ==================== 初始化 ====================
function initializePage() {
    try {
        // 1. 设置生产日期为30天前
        const today = new Date();
        const productionDate = new Date(today);
        productionDate.setDate(today.getDate() - 30);
        document.getElementById('production-date').value = productionDate.toISOString().split('T')[0];

        // 2. 显示当前日期和年份
        updateCurrentDate();
        document.getElementById('current-year').textContent = today.getFullYear();

        // 3. 设置输入变化自动计算
        setupAutoCalculate();
        
        // 4. 初始计算一次
        setTimeout(performCalculation, 100);

    } catch (error) {
        console.error('初始化错误:', error);
        alert('页面加载失败，请刷新');
    }
}

// ==================== 日期格式化 ====================
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

// ==================== 核心计算 ====================
function performCalculation() {
    try {
        // 1. 获取输入值
        const productionDateStr = document.getElementById('production-date').value;
        const shelfLifeInput = document.getElementById('shelf-life').value;
        
        // 2. 验证输入
        if (!productionDateStr) return;
        
        const shelfLife = parseFloat(shelfLifeInput);
        if (isNaN(shelfLife) || shelfLife <= 0) return;
        if (shelfLife > 9999) return;

        // 3. 计算到期日
        const productionDate = new Date(productionDateStr);
        if (isNaN(productionDate.getTime())) return;

        const expiryDate = new Date(productionDate);
        expiryDate.setDate(productionDate.getDate() + Math.floor(shelfLife));

        // 处理小数天数
        const decimalPart = shelfLife - Math.floor(shelfLife);
        if (decimalPart > 0) {
            expiryDate.setHours(expiryDate.getHours() + Math.round(decimalPart * 24));
        }

        // 4. 计算贴签日（到期日前1天）
        const reminderDate = new Date(expiryDate);
        reminderDate.setDate(reminderDate.getDate() - 1);

        // 5. 计算超三日期 = 当前日期 - (保质期天数 ÷ 3)
        const today = new Date();
        const tertiaryDate = new Date(today);
        tertiaryDate.setDate(today.getDate() - Math.round(shelfLife / 3));

        // 6. 更新显示
        document.getElementById('expiry-date').textContent = safeFormatDate(expiryDate);
        document.getElementById('reminder-date').textContent = safeFormatDate(reminderDate);
        document.getElementById('tertiary-date-display').textContent = safeFormatDate(tertiaryDate);

    } catch (error) {
        console.error('计算错误:', error);
        // 静默失败，不显示错误
    }
}

// ==================== 页面加载 ====================
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    
    // 每分钟更新一次当前日期
    setInterval(updateCurrentDate, 60000);
});
