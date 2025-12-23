// 初始化日期输入为今天
function initializeDates() {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    
    // 设置生产日期为30天前
    const productionDate = new Date(today);
    productionDate.setDate(today.getDate() - 30);
    const formattedProduction = productionDate.toISOString().split('T')[0];
    
    document.getElementById('production-date').value = formattedProduction;
    updateProductionDateDisplay(formattedProduction);
}

// 格式化日期显示（修复乱码）
function formatDateForDisplay(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        return '日期格式错误';
    }
    
    // 使用本地化格式，避免乱码
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}年${month}月${day}日`;
}

// 更新生产日期显示
function updateProductionDateDisplay(dateStr) {
    const displayStr = formatDateForDisplay(dateStr);
    document.getElementById('production-date-display').textContent = displayStr;
}

// 更新保质期显示
function updateShelfLifeDisplay(days) {
    document.getElementById('shelf-life-value').textContent = days;
    document.getElementById('shelf-life').value = days;
    
    // 格式化保质期显示
    let displayText = days + '天';
    if (days === 365) {
        displayText = '1年';
    } else if (days === 730) {
        displayText = '2年';
    } else if (days === 1095) {
        displayText = '3年';
    } else if (days === 180) {
        displayText = '半年';
    }
    
    document.getElementById('shelf-life-display').textContent = displayText;
}

// 计算到期日期
function calculateExpiry() {
    const productionDateStr = document.getElementById('production-date').value;
    const shelfLife = parseInt(document.getElementById('shelf-life').value);
    
    if (!productionDateStr) {
        return;
    }
    
    if (shelfLife <= 0) {
        return;
    }
    
    // 计算到期日期
    const productionDate = new Date(productionDateStr);
    const expiryDate = new Date(productionDate);
    expiryDate.setDate(productionDate.getDate() + shelfLife);
    
    // 更新显示
    updateProductionDateDisplay(productionDateStr);
    updateShelfLifeDisplay(shelfLife);
    
    // 格式化到期日期显示
    const expiryStr = formatDateForDisplay(expiryDate.toISOString().split('T')[0]);
    document.getElementById('expiry-date').textContent = expiryStr;
}

// 滚轮控制
function setupWheelControls() {
    const slider = document.getElementById('shelf-life-slider');
    const decreaseBtn = document.getElementById('decrease-btn');
    const increaseBtn = document.getElementById('increase-btn');
    
    // 滑块变化
    slider.addEventListener('input', function() {
        const days = parseInt(this.value);
        updateShelfLifeDisplay(days);
        calculateExpiry();
    });
    
    // 减少按钮
    decreaseBtn.addEventListener('click', function() {
        let days = parseInt(document.getElementById('shelf-life').value);
        days = Math.max(1, days - 1);
        slider.value = days;
        updateShelfLifeDisplay(days);
        calculateExpiry();
    });
    
    // 增加按钮
    increaseBtn.addEventListener('click', function() {
        let days = parseInt(document.getElementById('shelf-life').value);
        days = Math.min(1095, days + 1);
        slider.value = days;
        updateShelfLifeDisplay(days);
        calculateExpiry();
    });
    
    // 预设按钮
    document.querySelectorAll('.preset-btn').forEach(button => {
        button.addEventListener('click', function() {
            const days = parseInt(this.getAttribute('data-days'));
            slider.value = days;
            updateShelfLifeDisplay(days);
            calculateExpiry();
        });
    });
}

// 设置当前年份
function setCurrentYear() {
    const year = new Date().getFullYear();
    document.getElementById('current-year').textContent = year;
}

// 事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    initializeDates();
    setCurrentYear();
    
    // 设置滚轮控制
    setupWheelControls();
    
    // 计算按钮
    document.getElementById('calculate-btn').addEventListener('click', calculateExpiry);
    
    // 日期变化自动计算
    document.getElementById('production-date').addEventListener('change', function() {
        calculateExpiry();
    });
    
    // 初始计算一次
    setTimeout(calculateExpiry, 100);
});

// 添加快捷键支持
document.addEventListener('keydown', function(e) {
    // 上下箭头控制保质期
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        let days = parseInt(document.getElementById('shelf-life').value);
        days = Math.min(1095, days + 1);
        document.getElementById('shelf-life-slider').value = days;
        updateShelfLifeDisplay(days);
        calculateExpiry();
    }
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        let days = parseInt(document.getElementById('shelf-life').value);
        days = Math.max(1, days - 1);
        document.getElementById('shelf-life-slider').value = days;
        updateShelfLifeDisplay(days);
        calculateExpiry();
    }
    
    // 数字键快速选择
    if (e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const daysMap = { '1': 30, '2': 90, '3': 180, '4': 365, '5': 730 };
        const days = daysMap[e.key];
        if (days) {
            document.getElementById('shelf-life-slider').value = days;
            updateShelfLifeDisplay(days);
            calculateExpiry();
        }
    }
});
