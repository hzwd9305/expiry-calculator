// ==================== 日期计算工具函数 ====================
class DateCalculator {
    // 判断是否是闰年
    static isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }
    
    // 获取月份的天数（考虑闰年）
    static getDaysInMonth(year, month) {
        const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (month === 2 && this.isLeapYear(year)) {
            return 29;
        }
        return monthDays[month - 1];
    }
    
    // 添加天数（考虑闰年月）
    static addDays(startDate, daysToAdd) {
        const result = new Date(startDate);
        let remainingDays = Math.floor(daysToAdd);
        
        // 添加整天数
        while (remainingDays > 0) {
            const currentYear = result.getFullYear();
            const currentMonth = result.getMonth() + 1;
            const daysInCurrentMonth = this.getDaysInMonth(currentYear, currentMonth);
            const currentDay = result.getDate();
            
            const daysToEndOfMonth = daysInCurrentMonth - currentDay + 1;
            
            if (remainingDays >= daysToEndOfMonth) {
                // 跳到下个月
                result.setMonth(result.getMonth() + 1);
                result.setDate(1);
                remainingDays -= daysToEndOfMonth;
            } else {
                // 在当前月内添加
                result.setDate(currentDay + remainingDays);
                remainingDays = 0;
            }
        }
        
        // 处理小数部分（小时）
        const decimalPart = daysToAdd - Math.floor(daysToAdd);
        if (decimalPart > 0) {
            const hoursToAdd = Math.round(decimalPart * 24);
            result.setHours(result.getHours() + hoursToAdd);
        }
        
        return result;
    }
    
    // 减去天数
    static subtractDays(startDate, daysToSubtract) {
        const result = new Date(startDate);
        let remainingDays = Math.floor(daysToSubtract);
        
        while (remainingDays > 0) {
            const currentDay = result.getDate();
            
            if (remainingDays >= currentDay) {
                // 跳到上个月
                result.setMonth(result.getMonth() - 1);
                const newYear = result.getFullYear();
                const newMonth = result.getMonth() + 1;
                result.setDate(this.getDaysInMonth(newYear, newMonth));
                remainingDays -= currentDay;
            } else {
                // 在当前月内减去
                result.setDate(currentDay - remainingDays);
                remainingDays = 0;
            }
        }
        
        return result;
    }
    
    // 计算两个日期之间的天数差
    static getDaysBetween(date1, date2) {
        const timeDiff = Math.abs(date2.getTime() - date1.getTime());
        return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    }
}

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

        // 3. 设置下拉选择功能
        setupDropdownFunctionality();
        
        // 4. 设置输入变化自动计算
        setupAutoCalculate();
        
        // 5. 初始计算一次
        setTimeout(performCalculation, 100);

    } catch (error) {
        console.error('初始化错误:', error);
        showErrorMessage('初始化失败，请刷新页面重试');
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
    
    // 初始隐藏下拉面板
    dropdownPanel.style.display = 'none';
    
    // 1. 切换下拉面板显示
    dropdownToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        const isActive = dropdownPanel.style.display === 'block';
        
        if (isActive) {
            // 关闭面板
            dropdownPanel.style.display = 'none';
            dropdownToggle.classList.remove('active');
        } else {
            // 打开面板
            dropdownPanel.style.display = 'block';
            dropdownToggle.classList.add('active');
            
            // 同步滑块和手动输入框的值
            const currentValue = parseInt(shelfLifeInput.value) || 365;
            if (currentValue <= 999) {
                slider.value = currentValue;
                sliderValueDisplay.textContent = `${currentValue}天`;
            }
            manualInput.value = currentValue;
        }
    });
    
    // 2. 点击页面其他地方关闭下拉面板
    document.addEventListener('click', function(e) {
        if (!dropdownPanel.contains(e.target) && !dropdownToggle.contains(e.target)) {
            dropdownPanel.style.display = 'none';
            dropdownToggle.classList.remove('active');
        }
    });
    
    // 3. 快速选择按钮事件
    document.querySelectorAll('.quick-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const days = parseInt(this.dataset.days);
            if (!isNaN(days) && days >= 1 && days <= 9999) {
                setShelfLife(days);
                dropdownPanel.style.display = 'none';
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
    applyManualBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const value = parseInt(manualInput.value);
        if (!isNaN(value) && value >= 1 && value <= 9999) {
            setShelfLife(value);
            dropdownPanel.style.display = 'none';
            dropdownToggle.classList.remove('active');
            performCalculation();
        } else {
            showInputError('请输入1-9999之间的有效天数');
            manualInput.focus();
        }
    });
    
    // 6. 手动输入回车键支持
    manualInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyManualBtn.click();
        }
    });
    
    // 7. 主输入框变化同步滑块和手动输入框
    shelfLifeInput.addEventListener('input', function() {
        const value = parseInt(this.value);
        if (!isNaN(value) && value >= 1 && value <= 999) {
            slider.value = value;
            sliderValueDisplay.textContent = `${value}天`;
            manualInput.value = value;
        }
    });
    
    // 8. 防止下拉面板内的点击事件冒泡
    dropdownPanel.addEventListener('click', function(e) {
        e.stopPropagation();
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
}

function showInputError(message) {
    const input = document.getElementById('shelf-life');
    const originalBorderColor = input.style.borderColor;
    const originalBoxShadow = input.style.boxShadow;
    
    input.style.borderColor = '#dc3545';
    input.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.2)';
    
    setTimeout(() => {
        input.style.borderColor = originalBorderColor;
        input.style.boxShadow = originalBoxShadow;
    }, 2000);
}

function showErrorMessage(message) {
    console.error(message);
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
            return setTimeout(performCalculation, 100);
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

        // 3. 解析生产日期
        const productionDate = new Date(productionDateStr);
        if (isNaN(productionDate.getTime())) {
            // 日期无效，设置为今天
            const today = new Date();
            document.getElementById('production-date').value = today.toISOString().split('T')[0];
            return setTimeout(performCalculation, 100);
        }

        // 4. 计算到期日期（生产日期 + 保质期）
        const expiryDate = DateCalculator.addDays(productionDate, shelfLife);
        
        // 5. 计算贴签日期（到期日期 - 1天）
        const reminderDate = DateCalculator.subtractDays(expiryDate, 1);
        
        // 6. 计算超三日期（当前日期 - 保质期÷3）
        const today = new Date();
        const tertiaryDate = DateCalculator.subtractDays(today, Math.round(shelfLife / 3));

        // 7. 检查是否跨越闰年
        const isLeapYearInvolved = checkLeapYearInvolvement(productionDate, expiryDate);
        updateLeapYearNote(isLeapYearInvolved);

        // 8. 更新显示
        document.getElementById('expiry-date').textContent = safeFormatDate(expiryDate);
        document.getElementById('reminder-date').textContent = safeFormatDate(reminder
