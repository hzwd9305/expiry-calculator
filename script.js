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
        
        // 2. 显示当前年份
        document.getElementById('current-year').textContent = today.getFullYear();
        
        // 3. 更新当前日期显示
        updateCurrentDate();
        
        // 4. 设置事件监听
        setupEventListeners();
        
        // 5. 立即执行计算
        performCalculation();
        
    } catch (error) {
        console.error('初始化错误:', error);
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

// ==================== 事件监听设置 ====================
function setupEventListeners() {
    const productionDateInput = document.getElementById('production-date');
    const shelfLifeInput = document.getElementById('shelf-life');
    
    // 生产日期变化时计算
    productionDateInput.addEventListener('change', performCalculation);
    
    // 保质期输入时实时计算
    shelfLifeInput.addEventListener('input', performCalculation);
    
    // 常用日期按钮事件
    document.querySelectorAll('.quick-btn').forEach(button => {
        button.addEventListener('click', function() {
            const days = parseInt(this.dataset.days);
            if (!isNaN(days) && days >= 1 && days <= 9999) {
                shelfLifeInput.value = days;
                shelfLifeInput.focus();
                performCalculation();
            }
        });
    });
}

// ==================== 核心计算逻辑 ====================
function performCalculation() {
    try {
        // 1. 获取输入值
        const productionDateStr = document.getElementById('production-date').value;
        const shelfLifeValue = document.getElementById('shelf-life').value;
        
        // 2. 验证输入
        if (!productionDateStr) return;
        
        const shelfLife = parseFloat(shelfLifeValue);
        if (isNaN(shelfLife) || shelfLife <= 0) return;
        
        // 3. 解析生产日期
        const productionDate = new Date(productionDateStr);
        if (isNaN(productionDate.getTime())) return;
        
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
        
        // 7. 格式化并显示结果
        document.getElementById('expiry-date').textContent = safeFormatDate(expiryDate);
        document.getElementById('reminder-date').textContent = safeFormatDate(reminderDate);
        document.getElementById('tertiary-date-display').textContent = safeFormatDate(tertiaryDate);
        
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
            leapYearNote.classList.add('show');
        } else {
            leapYearNote.classList.remove('show');
        }
        
    } catch (error) {
        console.error('计算错误:', error);
    }
}

// ==================== 页面加载 ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

// 每分钟更新当前日期
setInterval(updateCurrentDate, 60000);
