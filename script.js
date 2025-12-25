// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    init();
    // 每分钟更新当前日期
    setInterval(updateCurrentDate, 60000);
});

// 初始化
function init() {
    try {
        // 设置年份
        document.getElementById('current-year').textContent = new Date().getFullYear();
        
        // 设置默认生产日期（30天前）
        const today = new Date();
        const productionDate = new Date(today);
        productionDate.setDate(today.getDate() - 30);
        const formattedDate = formatDateForInput(productionDate);
        document.getElementById('production-date').value = formattedDate;
        
        // 立即更新当前日期显示
        updateCurrentDate();
        
        // 设置事件监听
        setupEvents();
        
        // 立即执行首次计算
        setTimeout(calculate, 100); // 小延迟确保DOM更新
        
    } catch (error) {
        console.error('初始化错误:', error);
    }
}

// 工具函数：格式化日期为输入框格式
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 更新当前日期
function updateCurrentDate() {
    try {
        const today = new Date();
        const formatted = formatDate(today);
        document.getElementById('current-date').textContent = formatted;
        
        // 如果当前日期显示正常，重新计算超三日期
        calculate();
        
    } catch (error) {
        console.error('更新当前日期错误:', error);
    }
}

// 格式化日期显示
function formatDate(date) {
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

// 设置事件监听
function setupEvents() {
    // 生产日期变化
    document.getElementById('production-date').addEventListener('change', calculate);
    
    // 保质期变化
    document.getElementById('shelf-life').addEventListener('input', calculate);
    
    // 常用按钮点击
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const days = this.dataset.days;
            document.getElementById('shelf-life').value = days;
            calculate();
        });
    });
}

// 核心计算函数
function calculate() {
    try {
        // 获取输入值
        const prodDateStr = document.getElementById('production-date').value;
        const shelfLifeStr = document.getElementById('shelf-life').value;
        
        // 验证输入
        if (!prodDateStr || !shelfLifeStr) {
            console.log('输入为空');
            return;
        }
        
        const shelfLife = parseInt(shelfLifeStr);
        if (isNaN(shelfLife) || shelfLife < 1) {
            console.log('保质期无效:', shelfLifeStr);
            return;
        }
        
        console.log('生产日期:', prodDateStr, '保质期:', shelfLife);
        
        // 计算日期
        const prodDate = new Date(prodDateStr);
        if (isNaN(prodDate.getTime())) {
            console.log('生产日期解析失败');
            return;
        }
        
        // 到期日期 = 生产日期 + 保质期
        const expiryDate = new Date(prodDate);
        expiryDate.setDate(expiryDate.getDate() + shelfLife);
        
        // 贴签日期 = 到期日期 - 1天
        const reminderDate = new Date(expiryDate);
        reminderDate.setDate(reminderDate.getDate() - 1);
        
        // 超三日期 = 当前日期 - (保质期 ÷ 3)
        const today = new Date();
        const tertiaryDate = new Date(today);
        tertiaryDate.setDate(today.getDate() - Math.round(shelfLife / 3));
        
        console.log('计算结果:', {
            expiry: expiryDate,
            reminder: reminderDate,
            tertiary: tertiaryDate
        });
        
        // 更新显示
        document.getElementById('expiry-date').textContent = formatDate(expiryDate);
        document.getElementById('reminder-date').textContent = formatDate(reminderDate);
        document.getElementById('tertiary-date').textContent = formatDate(tertiaryDate);
        
    } catch (error) {
        console.error('计算错误:', error);
    }
}
