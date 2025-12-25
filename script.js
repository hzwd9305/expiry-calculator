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
 * 快捷设置保质期（仅赋值天数，无换算）
 * @param {number} days 保质期天数
 */
function setShelfLife(days) {
    document.getElementById('shelfLife').value = days;
    calculateDates();
}

/**
 * 核心计算逻辑（完全匹配你的要求）：
 * 1. 保质期输入：天数
 * 2. 超三日期：当前日期 - (保质期天数/30 ÷ 3) 个月（1月=30天换算）
 * 3. 到期日期：生产日期 + 保质期天数（按天算，自动区分大小月）
 * 4. 贴签日期：到期日期 - 1天
 */
function calculateDates() {
    // 1. 获取输入（仅天数）
    const productionDate = new Date(document.getElementById('productionDate').value);
    const shelfLifeDays = Number(document.getElementById('shelfLife').value);
    const currentDate = new Date();

    // 2. 输入校验
    if (isNaN(productionDate.getTime()) || isNaN(shelfLifeDays) || shelfLifeDays < 1) {
        return;
    }

    // 3. 超三日期计算：天数转月→减月份（示例：360天=12月→12/3=4月→当前日期-4月）
    const shelfLifeMonths = shelfLifeDays / 30; // 天数转月（1月=30天）
    const overThreeMonths = shelfLifeMonths / 3; // 保质期月数的1/3
    const overThreeDate = new Date(currentDate);
    overThreeDate.setMonth(overThreeDate.getMonth() - overThreeMonths);

    // 4. 到期日期计算：按天加，自动适配大小月/闰月
    const expiryDate = new Date(productionDate);
    expiryDate.setDate(expiryDate.getDate() + shelfLifeDays);

    // 5. 贴签日期：到期日期减1天
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
