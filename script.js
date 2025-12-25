// ==================== 全局变量 ====================
let isInitialized = false;

// ==================== 初始化 ====================
function initializePage() {
    if (isInitialized) return;
    isInitialized = true;
    
    try {
        // 1. 设置生产日期为30天前
        const today = new Date();
        const productionDate = new Date(today);
        productionDate.setDate(today.getDate() - 30);
        
        // 格式化日期为 YYYY-MM-DD
        const year = productionDate.getFullYear();
        const month = String(productionDate.getMonth() + 1).padStart(2, '0');
        const day = String(productionDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        document.getElementById('production-date').value = formattedDate;
        
        // 2. 显示当前日期和年份
        updateCurrentDate();
        document.getElementById('current-year').textContent = today.getFullYear();
        
        // 3. 设置下拉选择功能
        setupDropdownFunctionality();
        
        // 4. 设置输入变化自动计算
        setupAutoCalculate();
        
        // 5. 立即执行一次计算（不延迟）
        performCalculation();
        
    } catch (error) {
        console.error('初始化错误:', error);
        showError('初始化失败，请刷新页面重试');
    }
}

// ==================== 工具函数 ====================
function safeFormatDate(date) {
    try {
        if (!date || isNaN(date.getTime())) return '--';
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
    } catch (e) {
        console.error('日期格式化错误:', e);
        return '日期错误';
    }
}

function updateCurrentDate() {
    try {
        const today = new Date();
        document.getElementById('current-date-display').textContent = safeFormatDate(today);
    } catch (e) {
        console.error('更新当前日期错误:', e);
    }
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
                shelfLifeInput.value = days;
                closeDropdown();
                performCalculation();
            }
        });
    });
    
    // 3. 滑动选择器事件
    slider.addEventListener('input', function() {
        const value = parseInt(this.value);
        sliderValueDisplay.textContent = `${value}天`;
        shelfLifeInput.value = value;
        performCalculation();
    });
    
    // 4. 手动输入应用按钮
    applyManualBtn.addEventListener('click', function() {
        const value = parseInt(manualInput.value);
        if (!isNaN(value) && value >= 1 && value <= 9999) {
            shelfLifeInput.value = value;
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

// ==================== 自动计算设置 ====================
function setupAutoCalculate() {
    const productionDateInput = document.getElementById('production-date');
    const shelfLifeInput = document.getElementById('shelf-life');
    
    // 生产日期变化时计算
    productionDateInput.addEventListener('change', function() {
        console.log('生产日期变化:', this.value);
        performCalculation();
    });
    
    // 保质期输入时实时计算
    shelfLifeInput.addEventListener('input', function() {
        console.log('保质期输入:', this.value);
        performCalculation();
    });
}

// ==================== 核心计算逻辑 ====================
function performCalculation() {
    try {
        console.log('开始计算...');
        
        // 1. 获取输入值
        const productionDateStr = document.getElementById('production-date').value;
        const shelfLifeInput = document.getElementById('shelf-life');
        const shelfLifeValue = shelfLifeInput.value;
        
        console.log('生产日期:', productionDateStr);
        console.log('保质期:', shelfLifeValue);
        
        // 2. 验证输入
        if (!productionDateStr) {
            console.error('生产日期为空');
            return;
        }
        
        const shelfLife = parseFloat(shelfLifeValue);
        if (isNaN(shelfLife) || shelfLife <= 0) {
            console.error('保质期无效:', shelfLifeValue);
            return;
        }
        
        // 3. 解析生产日期
        const productionDate = new Date(productionDateStr);
        if (isNaN(productionDate.getTime())) {
            console.error('生产日期解析失败:', productionDateStr);
            return;
        }
        
        console.log('解析的生产日期:', productionDate);
        
        // 4. 计算到期日期（生产日期 + 保质期）
        const expiryDate = new Date(productionDate);
        expiryDate.setDate(expiryDate.getDate() + shelfLife);
        
        // 5. 计算贴签日期（到期日期 - 1天）
        const reminderDate = new Date(expiryDate);
        reminderDate.setDate(reminderDate.getDate() - 1);
        
        // 6. 计算超三日期（当前日期 - (保质期 ÷ 3)）
        const today = new Date();
        const oneThirdOfShelfLife = Math.round(shelfLife / 3);
        const tertiaryDate = new Date(today);
        tertiaryDate.setDate(today.getDate() - oneThirdOfShelfLife);
        
        console.log('计算结果:');
        console.log('到期日期:', expiryDate);
        console.log('贴签日期:', reminderDate);
        console.log('超三日期:', tertiaryDate);
        
        // 7. 格式化并显示结果
        const expiryDateStr = safeFormatDate(expiryDate);
        const reminderDateStr = safeFormatDate(reminderDate);
        const tertiaryDateStr = safeFormatDate(tertiaryDate);
        
        console.log('格式化结果:');
        console.log('到期:', expiryDateStr);
        console.log('贴签:', reminderDateStr);
        console.log('超三:', tertiaryDateStr);
        
        document.getElementById('expiry-date').textContent = expiryDateStr;
        document.getElementById('reminder-date').textContent = reminderDateStr;
        document.getElementById('tertiary-date-display').textContent = tertiaryDateStr;
        
        // 8. 检查是否跨越闰年
        const startYear = productionDate.getFullYear();
        const endYear = expiryDate.getFullYear();
        let isLeapYearInvolved = false;
        
        for (let year = startYear; year <= endYear; year++) {
            if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
                isLeapYearInvolved = true;
                break;
            }
        }
        
        const leapYearNote = document.getElementById('leap-year-note');
        if (isLeapYearInvolved) {
            leapYearNote.style.display = 'flex';
        } else {
            leapYearNote.style.display = 'none';
        }
        
        console.log('计算完成');
        
    } catch (error) {
        console.error('计算错误:', error);
        showError('计算过程中出现错误，请检查输入');
    }
}

// ==================== 错误处理 ====================
function showInputError(message) {
    const shelfLifeInput = document.getElementById('shelf-life');
    shelfLifeInput.style.borderColor = '#dc3545';
    setTimeout(() => {
        shelfLifeInput.style.borderColor = '';
    }, 2000);
}

function showError(message) {
    console.error(message);
    // 可以在这里添加用户可见的错误提示
}

// ==================== 页面加载 ====================
// 等待DOM完全加载
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM已加载，开始初始化');
        initializePage();
    });
} else {
    console.log('DOM已就绪，立即初始化');
    initializePage();
}

// 每分钟更新当前日期
setInterval(updateCurrentDate, 60000);
