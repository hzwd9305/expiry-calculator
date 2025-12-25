// ========== 设备检测与优化 ==========
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

// 优化移动端输入体验
function optimizeMobileInput() {
    if (isMobile) {
        // 设置正确的输入模式
        const numberInput = document.getElementById('shelf-life');
        if (numberInput) {
            numberInput.setAttribute('inputmode', 'decimal');
        }
        
        // 防止iOS缩放
        document.addEventListener('focusin', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                setTimeout(() => {
                    document.body.style.zoom = '100%';
                }, 100);
            }
        });
        
        document.addEventListener('focusout', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                setTimeout(() => {
                    document.body.style.zoom = '100%';
                }, 100);
            }
        });
    }
}

// ========== 乱码检查和修复机制 ==========
function containsGarbledText(str) {
    if (!str || typeof str !== 'string') return false;
    
    // 常见的乱码字符范围
    const garbledRanges = [
        /[\uff00-\uffef]/,
        /[\u3000-\u303f]/,
        /[\u2000-\u206f]/,
        /[\ufff0-\uffff]/,
        /[\u0080-\u00ff]/
    ];
    
    const allowedChars = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/;
    
    for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i);
        if (/[a-zA-Z0-9\s\-:\/.,]/.test(char)) continue;
        if (allowedChars.test(char)) continue;
        
        for (const range of garbledRanges) {
            if (range.test(char)) {
                console.warn('检测到乱码字符:', char, '在位置', i);
                return true;
            }
        }
    }
    
    return false;
}

function fixDateString(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return '';
    
    const numbers = dateStr.replace(/[^\d]/g, '');
    
    if (numbers.length >= 8) {
        const year = numbers.substr(0, 4);
        const month = numbers.substr(4, 2);
        const day = numbers.substr(6, 2);
        
        const date = new Date(`${year}-${month}-${day}`);
        if (!isNaN(date.getTime())) {
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
    
    return '';
}

function safeFormatDate(dateStr) {
    if (!dateStr) return '--';
    
    try {
        const fixedDateStr = fixDateString(dateStr);
        const date = new Date(fixedDateStr || dateStr);
        
        if (isNaN(date.getTime())) {
            throw new Error('无效日期');
        }
        
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        // 直接拼接，避免本地化问题
        return `${year}年${month}月${day}日`;
        
    } catch (error) {
        console.error('日期格式化错误:', error);
        return '日期格式错误';
    }
}

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

// ========== 核心计算功能 ==========
function initializeDates() {
    try {
        const today = new Date();
        const productionDate = new Date(today);
        productionDate.setDate(today.getDate() - 30);
        
        const formattedProduction = productionDate.toISOString().split('T')[0];
        
        document.getElementById('production-date').value = formattedProduction;
        updateDisplay('production-date-display', safeFormatDate(formattedProduction));
        
    } catch (error) {
        console.error('初始化日期错误:', error);
        showError('日期初始化失败，请手动选择日期');
    }
}

function updateDisplay(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        if (containsGarbledText(text)) {
            console.warn('显示内容包含乱码，已过滤:', text);
            element.textContent = '显示错误';
        } else {
            element.textContent = text;
        }
    }
}

function validateInputs() {
    const dateInput = document.getElementById('production-date').value;
    const daysInput = document.getElementById('shelf-life').value;
    
    clearError();
    
    if (!dateInput) {
        showError('请选择生产日期');
        return false;
    }
    
    const days = parseFloat(daysInput);
    if (isNaN(days) || days <= 0) {
        showError('保质期必须是大于0的数字');
        return false;
    }
    
    if (days > 9999) {
        showError('保质期不能超过9999天');
        return false;
    }
    
    if (containsGarbledText(dateInput) || containsGarbledText(daysInput.toString())) {
        showError('检测到异常字符，请重新输入');
        return false;
    }
    
    return { date: dateInput, days: days };
}

function calculateExpiry() {
    try {
        const validated = validateInputs();
        if (!validated) return;
        
        const { date: productionDateStr, days: shelfLife } = validated;
        
        const productionDate = new Date(productionDateStr);
        if (isNaN(productionDate.getTime())) {
            showError('生产日期格式错误');
            return;
        }
        
        // 计算到期日期（自动处理闰年）
        const expiryDate = new Date(productionDate);
        expiryDate.setDate(productionDate.getDate() + Math.floor(shelfLife));
        
        const decimalPart = shelfLife - Math.floor(shelfLife);
        if (decimalPart > 0) {
            expiryDate.setHours(expiryDate.getHours() + Math.round(decimalPart * 24));
        }
        
        // 计算提醒日期（到期日 - 1天）
        const reminderDate = new Date(expiryDate);
        reminderDate.setDate(reminderDate.getDate() - 1);
        
        // 更新所有显示
        updateDisplay('production-date-display', safeFormatDate(productionDateStr));
        updateDisplay('shelf-life-display', formatShelfLife(shelfLife));
        updateDisplay('expiry-date', safeFormatDate(expiryDate.toISOString().split('T')[0]));
        updateDisplay('reminder-date', safeFormatDate(reminderDate.toISOString().split('T')[0]));
        
    } catch (error) {
        console.error('计算错误:', error);
        showError('计算失败，请检查输入');
    }
}

function formatShelfLife(days) {
    if (days === 365) return '1年';
    if (days === 730) return '2年';
    if (days === 1095) return '3年';
    if (days === 180) return '半年';
    if (days < 1) return days.toFixed(2) + '天';
    if (days % 1 !== 0) return days.toFixed(1) + '天';
    return days + '天';
}

// ========== 事件处理 ==========
function setupQuickButtons() {
    const quickBtns = document.querySelectorAll('.quick-btn');
    quickBtns.forEach(button => {
        // 同时支持点击和触摸
        button.addEventListener('click', handleQuickButton);
        button.addEventListener('touchend', function(e) {
            e.preventDefault();
            handleQuickButton.call(this);
        });
    });
    
    function handleQuickButton() {
        const days = this.getAttribute('data-days');
        document.getElementById('shelf-life').value = days;
        calculateExpiry();
    }
}

function setCurrentYear() {
    const year = new Date().getFullYear();
    document.getElementById('current-year').textContent = year;
}

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
                // 移动端实时计算优化
                if (isMobile && this.id === 'shelf-life' && this.value.length > 0) {
                    setTimeout(calculateExpiry, 300);
                }
            });
            
            // 优化移动端输入体验
            if (isMobile) {
                input.addEventListener('focus', function() {
                    setTimeout(() => {
                        this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                });
            }
        }
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            calculateExpiry();
        }
        
        // 移动端虚拟键盘完成按钮
        if (e.key === 'Go' || e.key === 'Search' || e.key === 'Send') {
            e.preventDefault();
            calculateExpiry();
        }
    });
}

// 防止重复提交
function setupButtonDebounce() {
    const calculateBtn = document.getElementById('calculate-btn');
    let isCalculating = false;
    
    calculateBtn.addEventListener('click', function() {
        if (!isCalculating) {
            isCalculating = true;
            calculateExpiry();
            
            // 按钮反馈效果
            this.style.opacity = '0.8';
            setTimeout(() => {
                this.style.opacity = '1';
                isCalculating = false;
            }, 500);
        }
    });
    
    // 触摸反馈
    calculateBtn.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
    });
    
    calculateBtn.addEventListener('touchend', function() {
        this.style.transform = 'scale(1)';
    });
}

// ========== 页面加载初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    try {
        // 设备优化
        optimizeMobileInput();
        
        // 基础初始化
        initializeDates();
        setCurrentYear();
        setupQuickButtons();
        setupAutoCalculate();
        setupKeyboardShortcuts();
        setupButtonDebounce();
        
        // 初始计算
        setTimeout(calculateExpiry, 300);
        
        // 全局错误捕获
        window.addEventListener('error', function(e) {
            console.error('全局错误:', e.error);
            showError('系统错误，请刷新页面重试');
        });
        
        // 防止页面滚动（PWA优化）
        if (window.matchMedia('(display-mode: standalone)').matches) {
            document.body.style.overflow = 'hidden';
        }
        
        // 离线检测
        window.addEventListener('offline', function() {
            showError('网络连接已断开，部分功能可能受限');
        });
        
        window.addEventListener('online', function() {
            clearError();
        });
        
    } catch (error) {
        console.error('初始化失败:', error);
        showError('页面加载失败，请刷新重试');
    }
});

// PWA安装提示（可选）
if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/expiry-calculator/sw.js').catch(err => {
            console.log('ServiceWorker 注册失败:', err);
        });
    });
}
