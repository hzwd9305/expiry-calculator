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
        
        // 4. 设置下拉选择功能
        setupDropdownFunctionality();
        
        // 5. 初始计算一次
        setTimeout(performCalculation, 100);

    } catch (error) {
        console.error('初始化错误:', error);
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

// ==================== 下拉选择功能设置 ====================
function setupDropdownFunctionality() {
    const dropdownToggle = document.getElementById('shelf-life-dropdown-toggle');
    const dropdownPanel = document.getElementById('shelf-life-dropdown-panel');
    const shelfLifeInput = document.getElementById('shelf-life');
    const slider = document.getElementById('shelf-life-slider');
    const sliderValueDisplay = document.getElementById('slider-value-display');
    const manualInput = document.getElementById('manual-input');
    const applyManualBtn = document.getElementById('apply-manual-input');
    
    // 1. 切换下拉面板显示
    dropdownToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownPanel.classList.toggle('active');
        dropdownToggle.classList.toggle('active');
    });
    
    // 2. 点击页面其他地方关闭下拉面板
    document.addEventListener('click', function(e) {
        if (!dropdownPanel.contains(e.target) && !dropdownToggle.contains(e.target)) {
            dropdownPanel.classList.remove('active');
            dropdownToggle.classList.remove('active');
        }
    });
    
    // 3. 快速选择按钮事件
    document.querySelectorAll('.quick-btn').forEach(button => {
        button.addEventListener('click', function() {
            const days = parseInt(this.dataset.days);
            if (!isNaN(days) && days >= 1 && days <= 9999) {
                setShelfLife(days);
                dropdownPanel.classList.remove('active');
                dropdownToggle.classList.remove('active');
                performCalculation();
            }
        });
    });
    
    // 4. 滑动选择器事件
    slider.addEventListener('input', function() {
        const value = parseInt(this.value);
        sliderValueDisplay.textContent = `${value}天`;
        setShelfLife(value);
        performCalculation();
    });
    
    // 5. 手动输入应用按钮
    applyManualBtn.addEventListener('click', function() {
        const value = parseInt(manualInput.value);
        if (!isNaN(value) && value >= 1 && value <= 9999) {
            setShelfLife(value);
            dropdownPanel.classList.remove('active');
            dropdownToggle.classList.remove('active');
            performCalculation();
        } else {
            showInputError('请输入1-9999之间的有效天数');
        }
    });
    
    // 6. 手动输入回车键支持
    manualInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyManualBtn.click();
        }
    });
    
    // 7. 主输入框变化同步滑块和手动输入框
    shelfLifeInput.addEventListener('input', function() {
        const value = parseInt(this.value);
        if (!isNaN(value) && value >= 1 && value <= 999) {
            slider.value = value;
            sliderValueDisplay.textContent = `${value}天`;
        }
    });
}

// ==================== 防错机制 ====================
function setShelfLife(days) {
    const shelfLifeInput = document.getElementById('shelf-life');
    const slider = document.getElementById('shelf-life-slider');
    const manualInput = document.getElementById('manual-input');
    
    // 验证输入
    if (isNaN(days) || days < 1) {
        days = 1;
    } else if (days > 9999) {
        days = 9999;
    }
    
    // 更新所有相关输入
    shelfLifeInput.value = days;
    
    if (days <= 999) {
        slider.value = days;
        document.getElementById('slider-value-display').textContent = `${days}天`;
    }
    
    manualInput.value = days;
    
    // 触发输入事件以触发计算
    shelfLifeInput.dispatchEvent(new Event('input'));
}

function showInputError(message) {
    // 简单错误提示
    const input = document.getElementById('shelf-life');
    input.style.borderColor = '#dc3545';
    input.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
    
    setTimeout(() => {
        input.style.borderColor = '#e0e0e0';
        input.style.boxShadow = 'none';
    }, 2000);
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
        if (!productionDateStr) {
            // 如果生产日期为空，设置为今天
            const today = new Date();
            document.getElementById('production-date').value = today.toISOString().split('T')[0];
            return performCalculation(); // 递归调用
        }
        
        const shelfLife = parseFloat(shelfLifeInput);
        if (isNaN(shelfLife) || shelfLife <= 0) {
            setShelfLife(365); // 恢复默认值
            return;
        }
        if (shelfLife > 9999) {
            setShelfLife(9999); // 限制最大值
            return;
        }

        // 3. 计算到期日
        const productionDate = new Date(productionDateStr);
        if (isNaN(productionDate.getTime())) {
            // 日期无效，设置为今天
            const today = new Date();
            document.getElementById('production-date').value = today.toISOString().split('T')[0];
            return performCalculation(); // 递归调用
        }

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
        setShelfLife(365); // 恢复默认值
    }
}

// ==================== 页面加载 ====================
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    
    // 每分钟更新一次当前日期
    setInterval(updateCurrentDate, 60000);
    
    // 防止下拉面板内的点击事件冒泡
    document.querySelector('.dropdown-panel').addEventListener('click', function(e) {
        e.stopPropagation();
    });
});
