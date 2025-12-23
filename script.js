// 初始化日期输入为今天
function initializeDates() {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    
    // 设置生产日期为30天前
    const productionDate = new Date(today);
    productionDate.setDate(today.getDate() - 30);
    const formattedProduction = productionDate.toISOString().split('T')[0];
    
    document.getElementById('production-date').value = formattedProduction;
    document.getElementById('current-date').value = formattedToday;
}

// 计算到期日期
function calculateExpiry() {
    const productionDateStr = document.getElementById('production-date').value;
    const shelfLife = parseInt(document.getElementById('shelf-life').value);
    const currentDateStr = document.getElementById('current-date').value;
    
    if (!productionDateStr || !currentDateStr) {
        alert('请填写完整日期信息！');
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
    
    // 计算剩余天数
    const currentDate = new Date(currentDateStr);
    const timeDiff = expiryDate.getTime() - currentDate.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // 格式化日期显示
    const formatDate = (date) => {
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };
    
    // 更新结果
    document.getElementById('expiry-date').textContent = formatDate(expiryDate);
    document.getElementById('days-left').textContent = daysLeft;
    
    // 更新状态
    const statusElement = document.getElementById('status');
    if (daysLeft > 30) {
        statusElement.textContent = '安全期内';
        statusElement.style.color = '#28a745';
        statusElement.style.backgroundColor = '#d4edda';
    } else if (daysLeft > 0) {
        statusElement.textContent = '即将到期';
        statusElement.style.color = '#ffc107';
        statusElement.style.backgroundColor = '#fff3cd';
    } else if (daysLeft === 0) {
        statusElement.textContent = '今天到期';
        statusElement.style.color = '#dc3545';
        statusElement.style.backgroundColor = '#f8d7da';
    } else {
        statusElement.textContent = '已过期';
        statusElement.style.color = '#721c24';
        statusElement.style.backgroundColor = '#f5c6cb';
    }
}

// 重置表单
function resetForm() {
    initializeDates();
    document.getElementById('shelf-life').value = 365;
    
    document.getElementById('expiry-date').textContent = '--';
    document.getElementById('days-left').textContent = '--';
    document.getElementById('status').textContent = '--';
    document.getElementById('status').style.color = '';
    document.getElementById('status').style.backgroundColor = '';
}

// 事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    initializeDates();
    
    // 计算按钮
    document.getElementById('calculate-btn').addEventListener('click', calculateExpiry);
    
    // 重置按钮
    document.getElementById('reset-btn').addEventListener('click', resetForm);
    
    // 输入框回车计算
    document.getElementById('shelf-life').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateExpiry();
        }
    });
    
    // 日期变化自动计算
    document.getElementById('production-date').addEventListener('change', calculateExpiry);
    document.getElementById('current-date').addEventListener('change', calculateExpiry);
    
    // 初始计算一次
    setTimeout(calculateExpiry, 100);
});

// 添加一个快捷测试函数（控制台可用）
window.testDates = function() {
    const testCases = [
        { production: '2023-01-01', shelfLife: 365, current: '2023-12-01' },
        { production: '2023-06-01', shelfLife: 180, current: '2023-12-01' },
        { production: '2023-11-01', shelfLife: 30, current: '2023-12-01' }
    ];
    
    console.log('测试用例：');
    testCases.forEach((test, i) => {
        console.log(`用例 ${i+1}:`, test);
    });
};