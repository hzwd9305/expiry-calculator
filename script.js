// ========== 平台检测与优化 ==========
const platform = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    isWindows: /Windows/.test(navigator.userAgent),
    isMac: /Macintosh|Mac Intel|MacPPC|Mac68K/.test(navigator.userAgent),
    isChrome: /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent),
    isFirefox: /Firefox/.test(navigator.userAgent),
    isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
    isEdge: /Edg/.test(navigator.userAgent),
    isWechat: /MicroMessenger/.test(navigator.userAgent)
};

// 显示平台提示
function showPlatformHint() {
    const hintEl = document.getElementById('platform-hint');
    if (!hintEl) return;
    
    let hint = '';
    if (platform.isMobile) {
        hint = '📱 移动端优化版';
        if (platform.isIOS) hint += ' (iOS)';
        if (platform.isAndroid) hint += ' (Android)';
    } else {
        hint = '💻 电脑端优化版';
        if (platform.isWindows) hint += ' (Windows)';
        if (platform.isMac) hint += ' (Mac)';
    }
    
    if (platform.isWechat) hint += ' | 建议在浏览器中打开';
    
    hintEl.textContent = hint;
}

// 控制PC提示显示
function togglePCHints() {
    const pcHints = document.getElementById('pc-hints');
    if (pcHints) {
        pcHints.style.display = platform.isMobile ? 'none' : 'block';
    }
}

// 优化全平台输入体验
function optimizePlatformInputs() {
    const numberInput = document.getElementById('shelf-life');
    if (numberInput) {
        // 设置正确的输入模式
        if (platform.isMobile) {
            numberInput.setAttribute('inputmode', 'decimal');
        } else {
            numberInput.setAttribute('inputmode', 'numeric');
        }
    }
    
    // 防止iOS缩放
    if (platform.isIOS) {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                setTimeout(() => {
                    document.body.style.zoom = '100%';
                }, 100);
            });
        });
    }
}

// ========== 乱码检查和修复机制 ==========
function containsGarbledText(str) {
    if (!str || typeof str !== 'string') return false;
    
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
                console.warn('检测到乱码字符:', char);
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
        
        // 计算贴签日期（到期日 - 1天）
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

// ========== 事件处理（全平台优化） ==========
function setupQuickButtons() {
    const quickBtns = document.querySelectorAll('.quick-btn');
    
    quickBtns.forEach(button => {
        // 点击事件
        button.addEventListener('click', handleQuickButton);
        
        // 触摸事件（移动端）
        button.addEventListener('touchstart', function(e) {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function(e) {
            this.style.transform = 'scale(1)';
            e.preventDefault();
            handleQuickButton.call(this);
        });
        
        // 鼠标事件（桌面端）
        button.addEventListener('mouseenter', function() {
            if (!platform.isMobile) {
                this.style.transform = 'translateY(-2px)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
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
                if (platform.isMobile && this.id === 'shelf-life' && this.value.length > 0) {
                    setTimeout(calculateExpiry, 500);
                }
            });
            
            // 优化移动端输入体验
            if (platform.isMobile) {
                input.addEventListener('focus', function() {
                    setTimeout(() => {
                        this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                });
            }
        }
    });
}

// ========== 键盘快捷键系统（桌面端优化） ==========
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // 阻止快捷键在输入框中生效
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            // 允许在输入框中使用部分快捷键
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                calculateExpiry();
                return;
            }
            
            if (e.key === 'Escape') {
                e.target.blur();
                return;
            }
            
            // 输入框内禁用其他快捷键
            return;
        }
        
        // 全局快捷键
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                calculateExpiry();
                break;
                
            case 'Escape':
                clearError();
                break;
                
            case 'r':
            case 'R':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    calculateExpiry();
                }
                break;
                
            // 数字快捷键对应快捷按钮
            case '1':
                document.querySelector('.quick-btn[data-days="30"]')?.click();
                break;
            case '2':
                document.querySelector('.quick-btn[data-days="90"]')?.click();
                break;
            case '3':
                document.querySelector('.quick-btn[data-days="180"]')?.click();
                break;
            case '4':
                document.querySelector('.quick-btn[data-days="365"]')?.click();
                break;
            case '5':
                document.querySelector('.quick-btn[data-days="730"]')?.click();
                break;
                
            // 上下箭头调整保质期天数
            case 'ArrowUp':
                e.preventDefault();
                adjustShelfLife(1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                adjustShelfLife(-1);
                break;
                
            // 空格键计算
            case ' ':
                if (e.target.tagName !== 'BUTTON') {
                    e.preventDefault();
                    calculateExpiry();
                }
                break;
        }
    });
    
    // 保质期微调函数
    function adjustShelfLife(delta) {
        const input = document.getElementById('shelf-life');
        if (input) {
            let value = parseFloat(input.value) || 365;
            value = Math.max(1, Math.min(9999, value + delta));
            input.value = Math.round(value);
            calculateExpiry();
        }
    }
}

// ========== 按钮防抖和反馈 ==========
function setupButtonDebounce() {
    const calculateBtn = document.getElementById('calculate-btn');
    let isCalculating = false;
    
    // 点击事件
    calculateBtn.addEventListener('click', function() {
        if (!isCalculating) {
            isCalculating = true;
            calculateExpiry();
            
            // 视觉反馈
            this.style.opacity = '0.8';
            setTimeout(() => {
                this.style.opacity = '1';
                isCalculating = false;
            }, 500);
        }
    });
    
    // 桌面端悬停效果
    if (!platform.isMobile) {
        calculateBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        calculateBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    }
    
    // 移动端触摸反馈
    calculateBtn.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
    });
    
    calculateBtn.addEventListener('touchend', function() {
        this.style.transform = 'scale(1)';
    });
}

// ========== 实用工具功能 ==========
function setupUtilityFunctions() {
    // 复制网址功能
    const copyBtn = document.getElementById('copy-url');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                showCopySuccess();
            }).catch(err => {
                // 备用方案
                const textArea = document.createElement('textarea');
                textArea.value = url;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showCopySuccess();
            });
        });
    }
    
    // 打印功能
    const printBtn = document.getElementById('print-page');
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
    }
    
    function showCopySuccess() {
        const successEl = document.getElementById('copy-success');
        if (successEl) {
            successEl.classList.add('show');
            setTimeout(() => {
                successEl.classList.remove('show');
            }, 2000);
        }
    }
}

// ========== 页面加载初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    try {
        // 平台检测与提示
        showPlatformHint();
        togglePCHints();
        optimizePlatformInputs();
        
        // 基础初始化
        initializeDates();
        setCurrentYear();
        setupQuickButtons();
        setupAutoCalculate();
        setupKeyboardShortcuts();
        setupButtonDebounce();
        setupUtilityFunctions();
        
        // 初始计算
        setTimeout(calculateExpiry, 300);
        
        // 全局错误捕获
        window.addEventListener('error', function(e) {
            console.error('全局错误:', e.error);
            showError('系统错误，请刷新页面重试');
        });
        
        // PWA优化
        if (window.matchMedia('(display-mode: standalone)').matches) {
            document.body.style.overflow = 'hidden';
            document.getElementById('platform-hint').textContent += ' | 📲 已安装为APP';
        }
        
        // 网络状态检测
        window.addEventListener('offline', function() {
            showError('网络连接已断开，计算功能仍可用');
        });
        
        window.addEventListener('online', function() {
            clearError();
        });
        
        // 页面可见性API（标签页切换优化）
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                // 页面重新显示时重新计算（防止日期变化）
                calculateExpiry();
            }
        });
        
    } catch (error) {
        console.error('初始化失败:', error);
        showError('页面加载失败，请刷新重试');
    }
});

// Service Worker注册（PWA增强）
if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/expiry-calculator/sw.js').catch(err => {
            console.log('ServiceWorker 注册失败（不影响使用）:', err);
        });
    });
}

// 浏览器控制台友好提示
console.log('%c🧮 到期计算器 - 全平台适配版', 'color: #6a11cb; font-size: 16px; font-weight: bold;');
console.log('%c✓ 已适配所有手机和电脑浏览器', 'color: #48bb78;');
console.log('%c✓ 支持键盘快捷键和触摸操作', 'color: #4299e1;');
