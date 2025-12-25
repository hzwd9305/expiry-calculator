/**
 * 格式化日期：年-月-日（兼容大月/小月/闰年月）
 * @param {Date} date 日期对象
 * @returns {string} 格式化字符串
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
}

/**
 * 初始化当前日期
 */
function initCurrentDate() {
    const now = new Date();
    document.getElementById('currentDate').textContent = formatDate(now);
}

/**
 * 快捷设置保质期（仅赋值天数）
 * @param {number} days 保质期天数
 */
function setShelfLife(days) {
    document.getElementById('shelfLife').value = days;
    calculateDates();
}

/**
 * 核心计算逻辑（最终正确版）：
 * 1. 超三日期 = 当前日期 - (保质期天数 ÷ 3) 天（向下取整，按天算）
 * 2. 到期日期 = 生产日期 + 保质期天数
 * 3. 贴签日期 = 到期日期 - 1天
 * 所有计算通过Date对象实现，自动区分大月/小月/闰年月
 */
function calculateDates() {
    // 1. 获取输入（纯天数）
    const productionDate = new Date(document.getElementById('productionDate').value);
    const shelfLifeDays = Number(document.getElementById('shelfLife').value);
    const currentDate = new Date();

    // 2. 输入校验
    if (isNaN(productionDate.getTime()) || isNaN(shelfLifeDays) || shelfLifeDays < 1) {
        return;
    }

    // 3. 超三日期：当前日期 - 保质期天数/3 天（向下取整）【核心修正：全按天】
    const overThreeDays = Math.floor(shelfLifeDays / 3); // 避免小数天，向下取整
    const overThreeDate = new Date(currentDate);
    overThreeDate.setDate(overThreeDate.getDate() - overThreeDays);

    // 4. 到期日期：生产日期 + 保质期天数
    const expiryDate = new Date(productionDate);
    expiryDate.setDate(expiryDate.getDate() + shelfLifeDays);

    // 5. 贴签日期：到期日期 - 1天
    const labelDate = new Date(expiryDate);
    labelDate.setDate(labelDate.getDate() - 1);

    // 6. 更新显示
    document.getElementById('overThreeDate').textContent = formatDate(overThreeDate);
    document.getElementById('expiryDate').textContent = formatDate(expiryDate);
    document.getElementById('labelDate').textContent = formatDate(labelDate);
}

/**
 * 页面初始化
 */
window.onload = function() {
    initCurrentDate();
    calculateDates();
    // 监听输入变化，实时计算
    document.getElementById('productionDate').addEventListener('change', calculateDates);
    document.getElementById('shelfLife').addEventListener('input', calculateDates);
};
