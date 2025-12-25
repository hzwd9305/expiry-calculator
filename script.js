// ==================== 核心状态与初始化 ====================
let currentDaysTotal = 0; // 当前累计的天数

function initializePage() {
    try {
        // 1. 初始化生产日期为30天前
        const today = new Date();
        const productionDate = new Date(today);
        productionDate.setDate(today.getDate() - 30);
        const formattedProduction = productionDate.toISOString().split('T')[0];
        document.getElementById('production-date').value = formattedProduction;

        // 2. 设置页脚年份
        document.getElementById('current-year').textContent = today.getFullYear();

        // 3. 初始化并显示当前日期
        updateCurrentDateDisplay();

        // 4. 初始化按钮和事件
        setupQuickButtons();
        setupCalculateButton();
        setupAutoCalculate();

        // 5. 初始计算一次
        setTimeout(performCalculation, 100);

    } catch (error) {
        console.error('页面初始化错误:', error);
        showError('页面初始化失败，请刷新');
    }
}

// ==================== 日期显示与计算 ====================
// 安全格式化日期（防乱码）
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

// 更新“当前日期”显示
function updateCurrentDateDisplay() {
    const today = new Date();
    document.getElementById('current-date-display').textContent = safeFormatDate(today);
}

// ==================== 按钮累加逻辑 ====================
function setupQuickButtons() {
    // 获取所有保质期按钮和清除按钮
    const quickBtns = document.querySelectorAll('.quick-btn[data-days]');
    const clearBtn = document.getElementById('clear-days-btn');

    // 为每个保质期按钮绑定累加点击事件
    quickBtns.forEach(button => {
        button.addEventListener('click', function() {
            const daysToAdd = parseInt(this.getAttribute('data-days'));
            if (!isNaN(daysToAdd) && daysToAdd > 0) {
                addDays(daysToAdd, this); // 传入被点击的按钮元素
            }
        });
    });

    // 清除按钮事件
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            currentDaysTotal = 0;
            updateDaysDisplay();
            // 清除后也触发一次计算
            setTimeout(performCalculation, 50);
        });
    }
}

// 累加天数并更新显示
function addDays(days, clickedButton) {
    // 1. 累加
    currentDaysTotal += days;

    // 2. 更新输入框和提示的显示
    updateDaysDisplay();

    // 3. 给被点击的按钮一个视觉反馈
    if (clickedButton) {
        clickedButton.classList.add('added');
        setTimeout(() => {
            clickedButton.classList.remove('added');
        }, 400);
    }

    // 4. 自动触发计算
    setTimeout(performCalculation, 100);
}

// 更新总天数的显示（输入框和提示文字）
function updateDaysDisplay() {
    const inputElement = document.getElementById('shelf-life');
    const sumDisplayElement = document.getElementById('current-days-sum');

    if (inputElement) {
        inputElement.value = currentDaysTotal;
    }
    if (sumDisplayElement) {
        sumDisplayElement.textContent = currentDaysTotal;
    }
}

// ==================== 计算与验证逻辑 ====================
// 设置计算按钮事件
function setupCalculateButton() {
    const calculateBtn = document.getElementById('calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', performCalculation);
    }
    // 保留回车键计算功能
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            performCalculation();
        }
    });
}

// 设置输入变化自动计算
function setupAutoCalculate() {
    const dateInput = document.getElementById('production-date');
    if (dateInput) {
        dateInput.addEventListener('change', performCalculation);
    }
}

// 验证输入的有效性
function validateInputs() {
    const dateInput = document.getElementById('production-date').value;

    if (!dateInput) {
        showError('请选择生产日期');
        return false;
    }

    if (currentDaysTotal <= 0) {
        showError('请通过下方按钮添加保质期天数');
        return false;
    }

    if (currentDaysTotal > 9999) {
        showError('总保质期天数不能超过9999天');
        return false;
    }

    return {
        date: dateInput,
        days: currentDaysTotal
    };
}

// 执行核心计算并更新结果
function performCalculation() {
    try {
        clearError();

        // 1. 验证
        const validated = validateInputs();
        if (!validated) return;

        const { date: productionDateStr, days: shelfLife } = validated;

        // 2. 计算到期日
        const productionDate = new Date(productionDateStr);
        if (isNaN(productionDate.getTime())) {
            showError('生产日期格式错误');
            return;
        }

        const expiryDate = new Date(productionDate);
        expiryDate.setDate(productionDate.getDate() + Math.floor(shelfLife));

        // 处理小数部分（如果有）
        const decimalPart = shelfLife - Math.floor(shelfLife);
        if (decimalPart > 0) {
            expiryDate.setHours(expiryDate.getHours() + Math.round(decimalPart * 24));
        }

        // 3. 计算贴签日（到期日前1天）
        const reminderDate = new Date(expiryDate);
        reminderDate.setDate(reminderDate.getDate() - 1);

        // 4. 【核心】计算超三日期 = 当前日期 - (保质期天数 ÷ 3)
        const today = new Date();
        const tertiaryDate = new Date(today);
        const daysToSubtract = Math.round(shelfLife / 3); // 保质期天数 ÷ 3，四舍五入
        tertiaryDate.setDate(today.getDate() - daysToSubtract);

        // 5. 更新所有显示
        document.getElementById('production-date-display').textContent = safeFormatDate(productionDate);
        document.getElementById('expiry-date').textContent = safeFormatDate(expiryDate);
        document.getElementById('reminder-date').textContent = safeFormatDate(reminderDate);
        document.getElementById('tertiary-date-display').textContent = safeFormatDate(tertiaryDate);

    } catch (error) {
        console.error('计算过程中发生错误:', error);
        showError('计算失败，请检查输入');
    }
}

// ==================== 工具函数 ====================
function showError(message) {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
        setTimeout(() => {
            errorEl.classList.remove('show');
        }, 5000);
    }
}

function clearError() {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
        errorEl.classList.remove('show');
    }
}

// ==================== 页面加载 ====================
// 当页面完全加载后执行初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePage();

    // 每10秒更新一次当前日期（保持最新）
    setInterval(updateCurrentDateDisplay, 10000);

    // 全局错误捕获
    window.addEventListener('error', function(e) {
        console.error('未捕获的错误:', e.error);
        showError('发生意外错误，请刷新页面');
    });
});
