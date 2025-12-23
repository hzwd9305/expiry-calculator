// 初始化日期输入为今天
function initializeDates() {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    
    // 设置生产日期为30天前
    const productionDate = new Date(today);
    productionDate.setDate(today.getDate() - 30);
    const formattedProduction = productionDate.toISOString().split('T')[0];
    
    document.getElementById('production-date').value = formattedProduction;
}

// 计算到期日期
function calculateExpiry() {
    const productionDateStr = document.getElementById('production-date').value;
    const shelfLife = parseInt(document.getElementById('shelf-life').value);
    
    if (!productionDateStr) {
        alert('请选择生产日期！');
        return;
    }
    
    if (shelfLife <= 0) {
        alert('保质期必须大于0天！');
        return;
    }
    
    // 计算到期日期
    const productionDate = new Date(productionDateStr);
    const expiryDate = new Date(productionDate);
    expiryDate.setDate(productionDate.getDate() + shelfLife);
    
    // 格式化日期显示（不要星期几）
    const formatDate = (date) => {
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    // 更新结果
    document.getElementById('expiry-date').textContent = formatDate(expiryDate);
    document.getElementById('shelf-life-display').textContent = shelfLife + '天';
}

// 快速选择按钮功能
function setupQuickButtons() {
    document.querySelectorAll('.quick-btn').forEach(button => {
        button.addEventListener('click', function() {
            const days = parseInt(this.getAttribute('data-days'));
            document.getElementById('shelf-life').value = days;
            calculateExpiry(); // 自动计算
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
    
    // 设置快速按钮
    setupQuickButtons();
    
    // 计算按钮
    document.getElementById('calculate-btn').addEventListener('click', calculateExpiry);
    
    // 输入框变化自动计算
    document.getElementById('production-date').addEventListener('change', calculateExpiry);
    document.getElementById('shelf-life').addEventListener('input', calculateExpiry);
    
    // 初始计算一次
    setTimeout(calculateExpiry, 100);
});

// 添加快捷键支持
document.addEventListener('keydown', function(e) {
    // Enter键计算
    if (e.key === 'Enter') {
        calculateExpiry();
    }
    
    // 数字快捷键
    if (e.key >= '1' && e.key <= '5') {
        const daysMap = { '1': 30, '2': 90, '3': 180, '4': 365, '5': 730 };
        if (daysMap[e.key]) {
            document.getElementById('shelf-life').value = daysMap[e.key];
            calculateExpiry();
        }
    }
});
