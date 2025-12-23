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

// 判断是否为闰年
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// 计算两个日期之间的闰年天数
function countLeapYears(startDate, endDate) {
    let leapYearCount = 0;
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    
    for (let year = startYear; year <= endYear; year++) {
        if (isLeapYear(year)) {
            leapYearCount++;
        }
    }
    
    return leapYearCount;
}

// 计算考虑闰年的日期
function calculateDateWithLeapYears(startDate, daysToAdd, includeLeapYear) {
    // 如果不包含闰年，直接加天数
    if (!includeLeapYear) {
        const result = new Date(startDate);
        result.setDate(result.getDate() + daysToAdd);
        return result;
    }
    
    // 包含闰年：逐日计算（更精确）
    let result = new Date(startDate);
    let remainingDays = daysToAdd;
    
    while (remainingDays > 0) {
        result.setDate(result.getDate() + 1);
        remainingDays--;
    }
    
    return result;
}

// 计算到期日期
function calculateExpiry() {
    const productionDateStr = document.getElementById('production-date').value;
    let shelfLife = parseInt(document.getElementById('shelf-life').value);
    const currentDateStr = document.getElementById('current-date').value;
    const includeLeapYear = document.getElementById('include-leap-year').checked;
    
    if (!productionDateStr || !currentDateStr) {
        alert('请填写完整日期信息！');
        return;
    }
    
    if (shelfLife <= 0) {
        alert('保质期必须大于0天！');
        return;
    }
    
    const productionDate = new Date(productionDateStr);
    const currentDate = new Date(currentDateStr);
    
    // 计算到期日期
    const expiryDate = calculateDateWithLeapYears(productionDate, shelfLife, includeLeapYear);
    
    // 计算剩余天数
    const timeDiff = expiryDate.getTime() - currentDate.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // 计算闰年信息
    const leapYearCount = countLeapYears(productionDate, expiryDate);
    const isExpiryYearLeap = isLeapYear(expiryDate.getFullYear());
    
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
    
    // 显示闰年信息
    showLeapYearInfo(leapYearCount, isExpiryYearLeap, includeLeapYear);
}

// 显示闰年信息
function showLeapYearInfo(leapYearCount, isExpiryYearLeap, includeLeapYear) {
    // 移除旧的闰年信息
    const oldNote = document.getElementById('leap-year-note');
    if (oldNote) {
        oldNote.remove();
    }
    
    const resultCard = document.querySelector('.result-card');
    
    if (!includeLeapYear) {
        // 如果不包含闰年，添加说明
        const note = document.createElement('div');
        note.id = 'leap-year-note';
        note.className = 'leap-year-note';
        note.innerHTML = `
            <i class="fas fa-info-circle"></i>
            当前为简单计算模式，未包含闰年额外天数（2月29日）。
            如需精确到日期的计算，请勾选"包含闰年天数"选项。
        `;
        resultCard.appendChild(note);
        return;
    }
    
    if (leapYearCount > 0) {
        const note = document.createElement('div');
        note.id = 'leap-year-note';
        note.className = 'leap-year-note';
        
        let infoText = `<i class="fas fa-info-circle"></i> `;
        
        if (leapYearCount === 1) {
            infoText += `此期间包含 <strong>${leapYearCount}个闰年</strong>（已精确计算2月29日）`;
        } else {
            infoText += `此期间包含 <strong>${leapYearCount}个闰年</strong>（已精确计算所有闰日）`;
        }
        
        if (isExpiryYearLeap) {
            infoText += `，且到期年份为闰年`;
        }
        
        infoText += `。计算已包含所有闰日。`;
        
        note.innerHTML = infoText;
        resultCard.appendChild(note);
    } else {
        // 没有闰年
        const note = document.createElement('div');
        note.id = 'leap-year-note';
        note.className = 'leap-year-note';
        note.innerHTML = `
            <i class="fas fa-check-circle"></i>
            此期间不包含闰年，简单计算与精确计算结果一致。
        `;
        resultCard.appendChild(note);
    }
}

// 快速选择按钮功能
function setupQuickButtons() {
    document.querySelectorAll('.quick-btn').forEach(button => {
        button.addEventListener('click', function() {
            const days = parseInt(this.getAttribute('data-days'));
            document.getElementById('shelf-life').value = days;
            calculateExpiry();
        });
    });
}

// 重置表单
function resetForm() {
    initializeDates();
    document.getElementById('shelf-life').value = 365;
    document.getElementById('include-leap-year').checked = true;
    
    document.getElementById('expiry-date').textContent = '--';
    document.getElementById('days-left').textContent = '--';
    document.getElementById('status').textContent = '--';
    document.getElementById('status').style.color = '';
    document.getElementById('status').style.backgroundColor = '';
    
    // 移除闰年信息
    const oldNote = document.getElementById('leap-year-note');
    if (oldNote) {
        oldNote.remove();
    }
}

// 演示闰年计算示例
function demonstrateLeapYearExample() {
    console.log('=== 闰年计算演示 ===');
    console.log('示例1: 2020年2月27日 + 2天');
    
    const date1 = new Date('2020-02-27');
    const withLeapYear = new Date(date1);
    withLeapYear.setDate(date1.getDate() + 2);
    console.log('包含闰年:', withLeapYear.toLocaleDateString()); // 2020/2/29
    
    console.log('\n示例2: 2021年2月27日 + 2天');
    const date2 = new Date('2021-02-27');
    const withoutLeapYear = new Date(date2);
    withoutLeapYear.setDate(date2.getDate() + 2);
    console.log('不包含闰年:', withoutLeapYear.toLocaleDateString()); // 2021/3/1
}

// 事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    initializeDates();
    
    // 设置快速按钮
    setupQuickButtons();
    
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
    
    // 闰年选项变化自动计算
    document.getElementById('include-leap-year').addEventListener('change', calculateExpiry);
    
    // 初始计算一次
    setTimeout(calculateExpiry, 100);
    
    // 控制台演示
    demonstrateLeapYearExample();
});

// 测试函数（控制台使用）
window.testLeapYear = function() {
    console.log('=== 闰年测试 ===');
    console.log('2020是闰年?', isLeapYear(2020)); // true
    console.log('2021是闰年?', isLeapYear(2021)); // false
    console.log('2000是闰年?', isLeapYear(2000)); // true
    console.log('1900是闰年?', isLeapYear(1900)); // false
    
    const start = new Date('2020-01-01');
    const end = new Date('2024-12-31');
    console.log('2020-2024闰年数:', countLeapYears(start, end)); // 2
};
