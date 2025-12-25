// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializePage();
    } catch (error) {
        console.error('页面加载错误:', error);
        showError('页面初始化失败，请刷新重试');
    }
});

function initializePage() {
    // 1. 设置生产日期为30天前（手机电脑通用）
    const today = new Date();
    const productionDate = new Date(today);
    productionDate.setDate(today.getDate() - 30);
    
    // 格式化日期为 YYYY-MM-DD
    const formattedDate = formatDateForInput(productionDate);
    document.getElementById('production-date').value = formattedDate;
    
    // 2. 显示当前日期和年份
    updateCurrentDate();
    document.getElementById('current-year').textContent = today.getFullYear();
    
    // 3. 设置下拉选择功能
    setupDropdownFunctionality();
    
    // 4. 设置输入变化自动计算
    setupAutoCalculate();
    
    // 5. 初始计算
    setTimeout(() => {
        performCalculation();
    }, 100);
}

// ==================== 工具函数 ====================
function formatDateForInput(date) {
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
    
    // 创建手机端遮罩层
    let overlay = document.querySelector('.dropdown-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'dropdown-overlay';
        document.body.appendChild(overlay);
    }
    
    // 1. 切换下拉面板显示
    function toggleDropdown() {
        const isActive = dropdownPanel.classList.contains('active');
        
        if (isActive) {
            // 关闭面板
            dropdownPanel.classList.remove('active');
            dropdownToggle.classList.remove('active');
            overlay.classList.remove('active');
        } else {
            // 打开面板
            dropdownPanel.classList.add('active');
            dropdownToggle.classList.add('active');
            overlay.classList.add('active');
            
            // 同步滑块和手动输入框的值
            const currentValue = parseInt(shelfLifeInput.value) || 365;
            if (currentValue <= 999) {
                slider.value = currentValue;
                sliderValueDisplay.textContent = `${currentValue}天`;
            }
            manualInput.value = currentValue;
        }
    }
    
    // 桌面端和移动端事件
    dropdownToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDropdown();
    });
    
    // 手机端触摸事件
    dropdownToggle.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleDropdown();
    }, { passive: false });
    
    // 点击遮罩层关闭
    overlay.addEventListener('click', function() {
        dropdownPanel.classList.remove('active');
        dropdownToggle.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // 2. 快速选择按钮事件
    document.querySelectorAll('.quick-btn').forEach(button => {
        button.addEventListener('click', function() {
            const days = parseInt(this.dataset.days);
            if (!isNaN(days) && days >= 1 && days <= 9999) {
                setShelfLife(days);
                closeDropdown();
                performCalculation();
            }
        });
        
        // 手机端触摸事件
        button.addEventListener('touchstart', function(e) {
            e.stopPropagation();
        });
    });
    
    // 3. 滑动选择器事件
    slider.addEventListener('input', function() {
        const value = parseInt(this.value);
        sliderValueDisplay.textContent = `${value}天`;
        setShelfLife(value);
        performCalculation();
    });
    
    // 4. 手动输入应用按钮
    applyManualBtn.addEventListener('click', function() {
        const value = parseInt(manualInput.value);
        if (!isNaN(value) && value >= 1 && value <= 9999) {
            setShelfLife(value);
            closeDropdown();
            performCalculation();
        } else {
            showInputError('请输入1-9999之间的有效天数');
            manualInput.focus();
        }
    });
    
    // 5. 手动输入回车键支持
    manualInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyManualBtn.click();
        }
    });
    
    // 6. 点击页面其他地方关闭下拉面板
    document.addEventListener('click', function(e) {
        if (!dropdownPanel.contains(e.target) && !dropdownToggle.contains(e.target)) {
            closeDropdown();
        }
    });
    
    // 关闭下拉面板函数
    function closeDropdown() {
        dropdownPanel.classList.remove('active');
        dropdownToggle.classList.remove('active');
        overlay.classList.remove('active');
    }
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
    const shelfLifeInput = document.getElementById('shelf-life');
    const originalBorder = shelfLifeInput.style.borderColor;
    
    shelfLifeInput.style.borderColor = '#dc3545';
    shelfLifeInput.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.2)';
    
    setTimeout(() => {
        shelfLifeInput.style.borderColor = originalBorder;
        shelfLifeInput.style.boxShadow = 'none';
    }, 2000);
}

function showError(message) {
    console.error(message);
}

// ==================== 自动计算设置 ====================
function setupAutoCalculate() {
    const productionDateInput = document.getElementById('production-date');
    const shelfLifeInput = document.getElementById('shelf-life');
    
    // 生产日期变化时计算
    productionDateInput.addEventListener('change', performCalculation);
    
    // 保质期输入时实时计算（防抖动）
    let calculationTimer;
    shelfLifeInput.addEventListener('input', function() {
        clearTimeout(calculationTimer);
        calculationTimer = setTimeout(performCalculation, 300);
    });
}

// ==================== 日期计算函数 ====================
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function subtractDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
}

// 检查是否跨越闰年
function checkLeapYearInvolvement(startDate, endDate) {
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    
    for (let year = startYear; year <= endYear; year++) {
        if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
            return true;
        }
    }
    return false;
}

// ==================== 核心计算逻辑 ====================
function performCalculation() {
    try {
        // 1. 获取输入值
        const productionDateStr = document.getElementById('production-date').value;
        const shelfLifeInput = document.getElementById('shelf-life').value;
        
        // 2. 验证生产日期
        if (!productionDateStr) {
            // 如果生产日期为空，设置为今天
            const today = new Date();
            document.getElementById('production-date').value = formatDateForInput(today);
            return setTimeout(performCalculation, 100);
        }
        
        // 3. 验证保质期
        const shelfLife = parseFloat(shelfLifeInput);
        if (isNaN(shelfLife) || shelfLife <= 0) {
            setShelfLife(365); // 恢复默认值
            return;
        }
        if (shelfLife > 9999) {
            setShelfLife(9999); // 限制最大值
            return;
        }

        // 4. 解析生产日期
        const productionDate = new Date(productionDateStr);
        if (isNaN(productionDate.getTime())) {
            // 日期无效，设置为今天
            const today = new Date();
            document.getElementById('production-date').value = formatDateForInput(today);
            return setTimeout(performCalculation, 100);
        }

        // 5. 计算到期日期（生产日期 + 保质期）
        const expiryDate = addDays(productionDate, shelfLife);
        
        // 6. 计算贴签日期（到期日期 - 1天）
        const reminderDate = subtractDays(expiryDate, 1);
        
        // 7. 计算超三日期（当前日期 - (保质期 ÷ 3)）优先计算括号里
        const today = new Date();
        const oneThirdOfShelfLife = Math.round(shelfLife / 3);
        const tertiaryDate = subtractDays(today, oneThirdOfShelfLife);

        // 8. 检查是否跨越闰年
        const isLeapYearInvolved = checkLeapYearInvolvement(productionDate, expiryDate);
        const leapYearNote = document.getElementById('leap-year-note');
        if (isLeapYearInvolved) {
            leapYearNote.style.display = 'flex';
        } else {
            leapYearNote.style.display = 'none';
        }

        // 9. 更新显示
        document.getElementById('expiry-date').textContent = safeFormatDate(expiryDate);
        document.getElementById('reminder-date').textContent = safeFormatDate(reminderDate);
        document.getElementById('tertiary-date-display').textContent = safeFormatDate(tertiaryDate);

    } catch (error) {
        console.error('计算错误:', error);
        showError('计算过程中出现错误，请检查输入');
        setShelfLife(365); // 恢复默认值
    }
}

// ==================== 每分钟更新当前日期 ====================
setInterval(updateCurrentDate, 60000);
