// 初始化日期输入
function initializeDates() {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    
    // 设置生产日期为30天前
    const productionDate = new Date(today);
    productionDate.setDate(today.getDate() - 30);
    const formattedProduction = productionDate.toISOString().split('T')[0];
    
    document.getElementById('production-date').value = formattedProduction;
    updateProductionDateDisplay(formattedProduction);
}

// 格式化日期显示
function formatDateForDisplay(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '日期错误';
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}年${month}月${day}日`;
}

// 更新生产日期显示
function updateProductionDateDisplay(dateStr) {
    document.getElementById('production-date-display').textContent = formatDateForDisplay(dateStr);
}

// 更新保质期显示
function updateShelfLifeDisplay(days) {
    // 更新显示值
    document.getElementById('selected-days').textContent = days;
    document.getElementById('shelf-life').value = days;
    
    // 格式化保质期显示
    let displayText = days + '天';
    if (days === 365) {
        displayText = '1年';
    } else if (days === 730) {
        displayText = '2年';
    } else if (days === 1095) {
        displayText = '3年';
    } else if (days === 180) {
        displayText = '半年';
    }
    
    document.getElementById('shelf-life-display').textContent = displayText;
    
    // 更新滑轮位置
    updateWheelPosition(days);
}

// 生成滑轮数字项
function generateWheelItems() {
    const wheelItems = document.getElementById('wheel-items');
    wheelItems.innerHTML = '';
    
    // 生成1-1095天的选项（间隔5天）
    for (let i = 1; i <= 1095; i += 5) {
        const item = document.createElement('div');
        item.className = 'wheel-item';
        item.textContent = i;
        item.setAttribute('data-days', i);
        wheelItems.appendChild(item);
    }
    
    // 最后确保有1095这个选项
    const lastItem = document.createElement('div');
    lastItem.className = 'wheel-item';
    lastItem.textContent = '1095';
    lastItem.setAttribute('data-days', 1095);
    wheelItems.appendChild(lastItem);
}

// 更新滑轮位置
function updateWheelPosition(days) {
    const wheelItems = document.querySelectorAll('.wheel-item');
    
    // 移除之前的选中状态
    wheelItems.forEach(item => {
        item.classList.remove('selected');
    });
    
    // 找到最接近的选项
    let closestItem = null;
    let minDiff = Infinity;
    
    wheelItems.forEach(item => {
        const itemDays = parseInt(item.getAttribute('data-days'));
        const diff = Math.abs(itemDays - days);
        
        if (diff < minDiff) {
            minDiff = diff;
            closestItem = item;
        }
    });
    
    // 设置选中状态
    if (closestItem) {
        closestItem.classList.add('selected');
        
        // 滚动到选中项
        const wheelContainer = document.getElementById('wheel-items');
        const itemHeight = 60; // 每个选项高度
        const selectedIndex = Array.from(wheelItems).indexOf(closestItem);
        const targetPosition = -selectedIndex * itemHeight + 125; // 125是中间位置偏移
        
        wheelContainer.style.transform = `translateY(${targetPosition}px)`;
    }
}

// 计算到期日期
function calculateExpiry() {
    const productionDateStr = document.getElementById('production-date').value;
    const shelfLife = parseInt(document.getElementById('shelf-life').value);
    
    if (!productionDateStr || shelfLife <= 0) return;
    
    // 计算到期日期
    const productionDate = new Date(productionDateStr);
    const expiryDate = new Date(productionDate);
    expiryDate.setDate(productionDate.getDate() + shelfLife);
    
    // 更新显示
    updateProductionDateDisplay(productionDateStr);
    
    // 格式化到期日期显示
    const expiryStr = formatDateForDisplay(expiryDate.toISOString().split('T')[0]);
    document.getElementById('expiry-date').textContent = expiryStr;
}

// 初始化滑轮交互
function initWheelInteraction() {
    const wheelContainer = document.getElementById('ios-wheel');
    const wheelItems = document.getElementById('wheel-items');
    let isDragging = false;
    let startY = 0;
    let currentY = 0;
    let currentPosition = 0;
    const itemHeight = 60;
    
    // 初始位置（365天在中间）
    currentPosition = -Math.floor(365 / 5) * itemHeight + 125;
    wheelItems.style.transform = `translateY(${currentPosition}px)`;
    
    // 触摸开始
    wheelContainer.addEventListener('touchstart', function(e) {
        isDragging = true;
        startY = e.touches[0].clientY;
        wheelItems.style.transition = 'none';
    });
    
    // 触摸移动
    wheelContainer.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        
        // 限制滑动范围
        const maxPosition = 125;
        const minPosition = -((1095 / 5) * itemHeight) + 125;
        const newPosition = currentPosition + deltaY;
        
        if (newPosition > maxPosition) {
            currentPosition = maxPosition;
        } else if (newPosition < minPosition) {
            currentPosition = minPosition;
        } else {
            currentPosition = newPosition;
        }
        
        wheelItems.style.transform = `translateY(${currentPosition}px)`;
        startY = currentY;
        
        // 实时更新选中值
        updateSelectedValueFromPosition();
    });
    
    // 触摸结束
    wheelContainer.addEventListener('touchend', function() {
        if (!isDragging) return;
        isDragging = false;
        wheelItems.style.transition = 'transform 0.3s ease-out';
        
        // 吸附到最近的选项
        snapToNearestItem();
        calculateExpiry();
    });
    
    // 鼠标事件（桌面支持）
    wheelContainer.addEventListener('mousedown', function(e) {
        isDragging = true;
        startY = e.clientY;
        wheelItems.style.transition = 'none';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        currentY = e.clientY;
        const deltaY = currentY - startY;
        
        const maxPosition = 125;
        const minPosition = -((1095 / 5) * itemHeight) + 125;
        const newPosition = currentPosition + deltaY;
        
        if (newPosition > maxPosition) {
            currentPosition = maxPosition;
        } else if (newPosition < minPosition) {
            currentPosition = minPosition;
        } else {
            currentPosition = newPosition;
        }
        
        wheelItems.style.transform = `translateY(${currentPosition}px)`;
        startY = currentY;
        
        updateSelectedValueFromPosition();
    });
    
    document.addEventListener('mouseup', function() {
        if (!isDragging) return;
        isDragging = false;
        wheelItems.style.transition = 'transform 0.3s ease-out';
        snapToNearestItem();
        calculateExpiry();
    });
    
    // 根据位置更新选中值
    function updateSelectedValueFromPosition() {
        const items = document.querySelectorAll('.wheel-item');
        const centerIndex = Math.round((-currentPosition + 125) / itemHeight);
        
        if (items[centerIndex]) {
            const days = parseInt(items[centerIndex].getAttribute('data-days'));
            updateShelfLifeDisplay(days);
        }
    }
    
    // 吸附到最近的选项
    function snapToNearestItem() {
        const items = document.querySelectorAll('.wheel-item');
        const centerIndex = Math.round((-currentPosition + 125) / itemHeight);
        
        if (items[centerIndex]) {
            const targetIndex = Math.max(0, Math.min(items.length - 1, centerIndex));
            const days = parseInt(items[targetIndex].getAttribute('data-days'));
            
            currentPosition = -targetIndex * itemHeight + 125;
            wheelItems.style.transform = `translateY(${currentPosition}px)`;
            updateShelfLifeDisplay(days);
        }
    }
    
    // 点击选项直接选择
    wheelItems.addEventListener('click', function(e) {
        if (e.target.classList.contains('wheel-item')) {
            const days = parseInt(e.target.getAttribute('data-days'));
            updateShelfLifeDisplay(days);
            calculateExpiry();
        }
    });
}

// 设置快捷按钮
function setupPresetButtons() {
    document.querySelectorAll('.preset-btn').forEach(button => {
        button.addEventListener('click', function() {
            const days = parseInt(this.getAttribute('data-days'));
            updateShelfLifeDisplay(days);
            calculateExpiry();
        });
    });
}

// 设置当前年份
function setCurrentYear() {
    const year = new Date().getFullYear();
    document.getElementById('current-year').textContent = year;
}

// 事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    initializeDates();
    setCurrentYear();
    generateWheelItems();
    updateWheelPosition(365);
    
    // 设置交互
    initWheelInteraction();
    setupPresetButtons();
    
    // 日期变化自动计算
    document.getElementById('production-date').addEventListener('change', function() {
        calculateExpiry();
    });
    
    // 初始计算一次
    setTimeout(calculateExpiry, 100);
});

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    const currentDays = parseInt(document.getElementById('shelf-life').value);
    
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newDays = Math.min(1095, currentDays + 5);
        updateShelfLifeDisplay(newDays);
        calculateExpiry();
    }
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newDays = Math.max(1, currentDays - 5);
        updateShelfLifeDisplay(newDays);
        calculateExpiry();
    }
});
