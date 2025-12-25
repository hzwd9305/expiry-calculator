/**
 * 格式化日期为「年」月「日」日格式，兼容闰年月
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
}

/**
 * 初始化当前日期显示
 */
function initCurrentDate() {
    const now = new Date();
    document.getElementById('currentDate').textContent = formatDate(now);
}

/**
 * 快捷设置保质期（按天）
 * @param {number} days 保质期天数
 */
function setShelfLife(days) {
    document.getElementById('shelfLife').value = days;
    calculateDates();
}

/**
 * 核心计算逻辑：输入天数自动换算月数（1月=30天），超三日期按月份计算
 */
function calculateDates() {
    // 1. 获取输入值（保质期为天数）
    const productionDate = new Date(document.getElementById('productionDate').value);
    const shelfLifeDays = Number(document.getElementById('shelfLife').value);
    const currentDate = new Date();

    // 2. 输入校验
    if (isNaN(productionDate.getTime()) || isNaN(shelfLifeDays) || shelfLifeDays < 1) {
        return;
    }

    // 3. 天数转月数（1月=30天，保留小数）
    const shelfLifeMonths = shelfLifeDays / 30;

    // 4. 计算到期日期：生产日期 + 保质期天数（兼容闰年月）
    const expiryDate = new Date(productionDate);
    expiryDate.setDate(expiryDate.getDate() + shelfLifeDays);

    // 5. 计算超三日期：当前日期 - (保质期月数 ÷ 3)
    const overThreeMonths = shelfLifeMonths / 3;
    const overThreeDate = new Date(currentDate);
    overThreeDate.setMonth(overThreeDate.getMonth() - overThreeMonths);

    // 6. 计算贴签日期：到期日期 - 1天
    const labelDate = new Date(expiryDate);
    labelDate.setDate(labelDate.getDate() - 1);

    // 7. 更新页面显示
    document.getElementById('overThreeDate').textContent = formatDate(overThreeDate);
    document.getElementById('expiryDate').textContent = formatDate(expiryDate);
    document.getElementById('labelDate').textContent = formatDate(labelDate);
}

/**
 * 页面加载完成后初始化
 */
window.onload = function() {
    initCurrentDate();
    calculateDates(); // 初始计算
    // 监听输入变化，实时重新计算
    document.getElementById('productionDate').addEventListener('change', calculateDates);
    document.getElementById('shelfLife').addEventListener('input', calculateDates);
};
