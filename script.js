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
    document.querySelector('.card-value.current').textContent = formatDate(now);
}

/**
 * 快捷设置保质期并触发计算
 * @param {number} days 保质期天数
 */
function setShelfLife(days) {
    document.getElementById('shelfLife').value = days;
    calculateDates();
}

/**
 * 核心计算逻辑：按规则计算超三/到期/贴签日期，兼容闰年月
 */
function calculateDates() {
    // 1. 获取输入值
    const productionDate = new Date(document.getElementById('productionDate').value);
    const shelfLifeDays = Number(document.getElementById('shelfLife').value);
    const currentDate = new Date();

    // 2. 输入校验
    if (isNaN(productionDate.getTime()) || isNaN(shelfLifeDays) || shelfLifeDays < 1) {
        return;
    }

    // 3. 计算到期日期：生产日期 + 保质期天数
    const expiryDate = new Date(productionDate);
    expiryDate.setDate(expiryDate.getDate() + shelfLifeDays);

    // 4. 计算超三日期：当前日期 - 保质期天数 × 1/3（向下取整）
    const overThreeDays = Math.floor(shelfLifeDays / 3);
    const overThreeDate = new Date(currentDate);
    overThreeDate.setDate(overThreeDate.getDate() - overThreeDays);

    // 5. 计算贴签日期：到期日期 - 1天
    const labelDate = new Date(expiryDate);
    labelDate.setDate(labelDate.getDate() - 1);

    // 6. 更新页面显示
    document.querySelector('.card-value.over-three').textContent = formatDate(overThreeDate);
    document.querySelector('.card-value.expiry').textContent = formatDate(expiryDate);
    document.querySelector('.card-value.label').textContent = formatDate(labelDate);
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
