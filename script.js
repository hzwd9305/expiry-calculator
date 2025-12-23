// ==================== 乱码检查和修复机制 ====================

// 检查字符串是否包含乱码字符
function containsGarbledText(str) {
    if (!str) return false;
    
    // 常见的乱码字符范围（包括全角符号等）
    const garbledRanges = [
        /[\uff00-\uffef]/, // 全角字符（除了正常的全角数字和字母）
        /[\u3000-\u303f]/, // CJK标点符号
        /[\u2000-\u206f]/, // 通用标点
        /[\ufff0-\uffff]/, // 特殊字符
        /[\u0080-\u00ff]/  // 拉丁文补充
    ];
    
    // 允许的正常全角字符（中文、日文、韩文、正常标点）
    const allowedChars = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/;
    
    for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i);
        
        // 跳过正常的字母、数字、标点
        if (/[a-zA-Z0-9\s\-:\/.,]/.test(char)) continue;
        if (allowedChars.test(char)) continue;
        
        // 检查是否在乱码范围内
        for (const range of garbledRanges) {
            if (range.test(char)) {
                console.warn('检测到乱码字符:', char, '在位置', i, '字符串:', str);
                return true;
            }
        }
    }
    
    return false;
}

// 修复日期字符串
function fixDateString(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return '';
    
    // 移除所有非数字字符，只保留数字
    const numbers = dateStr.replace(/[^\d]/g, '');
    
    if (numbers.length >= 8) {
        // 格式化为YYYY-MM-DD
        const year = numbers.substr(0, 4);
        const month = numbers.substr(4, 2);
        const day = numbers.substr(6, 2);
        
        // 验证日期有效性
        const date = new Date(`${year}-${month}-${day}`);
        if (!isNaN(date.getTime())) {
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
    
    return '';
}

// 安全格式化日期显示（绝对不出现乱码）
function safeFormatDate(dateStr) {
    if (!dateStr) return '--';
    
    try {
        // 首先尝试修复日期字符串
        const fixedDateStr = fixDateString(dateStr);
        const date = new Date(fixedDateStr || dateStr);
        
        if (isNaN(date.getTime())) {
            throw new Error('无效日期');
        }
        
        // 使用直接拼接方法，避免本地化问题
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        return `${year}年${month}月${day}日`;
        
    } catch (error) {
        console.error('日期格式化错误:', error, '原始字符串:', dateStr);
        return '日期格式错误';
    }
}

// 显示错误信息
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

// 清除错误信息
function clearError() {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
        errorEl.classList.remove('show');
    }
}

// ==================== 核心计算功能 ====================

// 初始化日期
function initializeDates() {
    try {
        const today = new Date();
        const productionDate = new Date(today);
        productionDate.setDate(today.getDate() - 30);
        
        // 格式化为ISO字符串（不会有乱码）
        const formattedProduction = productionDate.toISOString().split('T')[0];
        
        document.getElementById('production-date').value = formattedProduction;
        updateDisplay('production-date-display', safeFormatDate(formattedProduction));
        
    } catch (error) {
        console.error('初始化日期错误:', error);
        showError('日期初始化失败，请手动选择日期');
    }
}

// 更新显示
function updateDisplay(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        // 检查要显示的内容是否包含乱码
        if (containsGarbledText(text)) {
            console.warn('显示内容包含乱码，已过滤:', text);
            element.textContent = '显示错误';
        } else {
            element.textContent = text;
        }
    }
}

// 验证输入
function validateInputs() {
    const dateInput = document.getElementById('production-date').value;
    const daysInput = document.getElementById('shelf-life').value;
    
    clearError();
    
    // 检查日期
    if (!dateInput) {
        showError('请选择生产日期');
        return false;
    }
    
    // 检查保质期天数
    const days = parseFloat(daysInput);
    if (isNaN(days) || days <= 0) {
        showError('保质期必须是大于0的数字');
        return false;
    }
    
    if (days > 9999) {
        showError('保质期不能超过9999天');
        return false;
    }
    
    // 检查输入是否包含乱码
    if (containsGarbledText(dateInput) || containsGarbledText(daysInput.toString())) {
        showError('检测到异常字符，请重新输入');
        return false;
    }
    
    return { date: dateInput, days: days };
}

// 精准计算到期日期
function calculateExpiry() {
    try {
        const validated = validateInputs();
        if (!validated) return;
        
        const { date: productionDateStr, days: shelfLife } = validated;
        
        // 创建日期对象
        const productionDate = new Date(productionDateStr);
        if (isNaN(productionDate.getTime())) {
            showError('生产日期格式错误');
            return;
        }
        
        // 精准计算到期日期（处理闰年等）
        const expiryDate = new Date(productionDate);
        expiryDate.setDate(productionDate.getDate() + Math.floor(shelfLife));
        
        // 如果包含小数天，添加小时部分
        const decimalPart = shelfLife - Math.floor(shelfLife);
        if (decimalPart > 0) {
            expiryDate.setHours(expiryDate.getHours() + Math.round(decimalPart * 24));
        }
        
        // 更新显示
        updateDisplay('production-date-display', safeFormatDate(productionDateStr));
        updateDisplay('shelf-life-display', formatShelfLife(shelfLife));
        updateDisplay('expiry-date', safeFormatDate(expiryDate.toISOString().split('T')[0]));
        
    } catch (error) {
        console.error('计算错误:', error);
        showError('计算失败，请检查输入');
    }
}

// 格式化保质期显示
function formatShelfLife(days) {
    if (days === 365) return '1年';
    if (days === 730) return '2年';
    if (days === 1095) return '3年';
    if (days === 180) return '半年';
    if (days < 1) return days.toFixed(2) + '天';
    if (days % 1 !== 0) return days.toFixed(1) + '天';
    return days + '天';
}

// ==================== 事件处理 ====================

// 设置快捷按钮
function setupQuickButtons() {
    document.querySelectorAll('.quick-btn').forEach(button => {
        button.addEventListener('click', function() {
            const days = this.getAttribute('data-days');
            document.getElementById('shelf-life').value = days;
            calculateExpiry();
        });
    });
}

// 设置当前年份
function setCurrentYear() {
    const year = new Date().getFullYear();
    document.getElementById('current-year').textContent = year;
}

// 输入框自动计算
function setupAutoCalculate() {
    const inputs = [
        document.getElementById('production-date'),
        document.getElementById('shelf-life')
    ];
    
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('change', calculateExpiry);
            input.addEventListener('input', function() {
                clearError();
            });
        }
    });
}

// 回车键计算
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            calculateExpiry();
        }
    });
}

// 页面加载初始化
document.addEventListener('DOMContentLoaded', function() {
    try {
        // 基础初始化
        initializeDates();
        setCurrentYear();
        setupQuickButtons();
        setupAutoCalculate();
        setupKeyboardShortcuts();
        
        // 初始计算
        setTimeout(calculateExpiry, 100);
        
        // 全局错误捕获
        window.addEventListener('error', function(e) {
            console.error('全局错误:', e.error);
            showError('系统错误，请刷新页面重试');
        });
        
    } catch (error) {
        console.error('初始化失败:', error);
        showError('页面加载失败，请刷新重试');
    }
});

// 全局导出（供调试）
window.checkGarbledText = containsGarbledText;
window.fixDate = fixDateString;
window.safeFormatDate = safeFormatDate;
