// ==================== 修改部分：超三日期计算 ====================

// 在 calculate() 函数中，修改超三日期的计算方式：

// 修改前（按天计算）：
// const oneThirdShelfLife = Math.round(shelfLife / 3);
// const tertiaryDate = new Date(today);
// tertiaryDate.setDate(today.getDate() - oneThirdShelfLife);

// 修改后（按月计算）：
function calculate() {
    try {
        // ... 前面的代码保持不变 ...
        
        // 7. 计算超三日期（当前日期 - (保质期÷3转换为月)）
        // 将保质期÷3的天数转换为月份（取整）
        const oneThirdDays = shelfLife / 3;
        const monthsToSubtract = Math.floor(oneThirdDays / 30); // 30天≈1个月
        
        const tertiaryDate = new Date(today);
        tertiaryDate.setMonth(today.getMonth() - monthsToSubtract);
        
        console.log('超三日期计算:', {
            保质期: shelfLife,
            '保质期÷3': oneThirdDays,
            减去月数: monthsToSubtract,
            超三日期: formatDateDisplay(tertiaryDate)
        });
        
        // ... 后面的代码保持不变 ...
        
    } catch (error) {
        console.error('计算错误:', error);
    }
}

// ==================== 修改部分：检查商品状态函数 ====================

// 修改 checkProductStatus() 函数，确保规则独立：

function checkProductStatus(productionDate, expiryDate, tertiaryDate, currentDate, shelfLife) {
    try {
        console.log('检查商品状态:', {
            生产日期: formatDateDisplay(productionDate),
            到期日期: formatDateDisplay(expiryDate),
            超三日期: formatDateDisplay(tertiaryDate),
            当前日期: formatDateDisplay(currentDate),
            保质期: shelfLife
        });
        
        // 0. 验证所有日期有效性
        if (!productionDate || !expiryDate || !tertiaryDate || !currentDate ||
            isNaN(productionDate.getTime()) || isNaN(expiryDate.getTime()) || 
            isNaN(tertiaryDate.getTime()) || isNaN(currentDate.getTime())) {
            console.log('日期无效，跳过检查');
            return null;
        }
        
        const prodDate = new Date(productionDate.getFullYear(), productionDate.getMonth(), productionDate.getDate());
        const expDate = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
        const tertDate = new Date(tertiaryDate.getFullYear(), tertiaryDate.getMonth(), tertiaryDate.getDate());
        const curDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        
        // 1. 排除未来日期
        if (prodDate.getTime() > curDate.getTime()) {
            console.log('生产日期是未来日期，跳过所有检查');
            return null;
        }
        
        // ========== 规则一：过期检查（最高优先级） ==========
        if (curDate.getTime() > expDate.getTime()) {
            console.log('规则一：商品已过期');
            return { type: 'expired', message: '商品已过期，不可流入' };
        }
        
        // ========== 规则二：超三检查 ==========
        // 计算当前日期与超三日期的月份差
        const monthDiff = getMonthDifference(curDate, tertDate);
        if (monthDiff === null) return null;
        
        // 计算比较值（保质期÷3，转换为月）
        const oneThirdDays = shelfLife / 3;
        const compareValue = oneThirdDays / 30; // 转换为月
        
        console.log('规则二：超三检查', {
            月份差: monthDiff,
            比较值: compareValue,
            差值: Math.abs(monthDiff) - compareValue
        });
        
        const absMonthDiff = Math.abs(monthDiff);
        
        // 判断超三状态
        if (absMonthDiff > compareValue + 0.1) { // 已经超三
            console.log('规则二：已经超三');
            return { type: 'tertiary_expired', message: '商品超三，咨询店长是否收货' };
        } else if (Math.abs(absMonthDiff - compareValue) <= 0.15) { // 刚刚超三
            console.log('规则二：刚刚超三');
            return { type: 'tertiary_just', message: '刚刚超三，咨询店长是否收货' };
        }
        
        // 如果未超三，继续检查规则三
        
        // ========== 规则三：日期较大检查（独立检查） ==========
        console.log('规则三：日期较大检查');
        console.log('生产日期 vs 超三日期:', {
            生产日期: formatDateDisplay(prodDate),
            超三日期: formatDateDisplay(tertDate),
            生产晚于超三: prodDate.getTime() > tertDate.getTime(),
            同一年份: prodDate.getFullYear() === tertDate.getFullYear()
        });
        
        // 条件：1. 生产日期 > 超三日期 且 2. 同一年份
        if (prodDate.getTime() > tertDate.getTime() && 
            prodDate.getFullYear() === tertDate.getFullYear()) {
            console.log('规则三：日期较大');
            return { type: 'large', message: '日期较大，咨询店长是否收货' };
        }
        
        // ========== 规则四：正常情况 ==========
        console.log('规则四：正常，不提醒');
        return null;
        
    } catch (error) {
        console.error('检查商品状态错误:', error);
        return null;
    }
}

// ==================== 修改部分：getMonthDifference 函数优化 ====================

// 优化月份差计算，更精确
function getMonthDifference(date1, date2) {
    try {
        if (!date1 || !date2 || isNaN(date1.getTime()) || isNaN(date2.getTime())) {
            console.log('日期无效，无法计算月份差');
            return null;
        }
        
        // 计算总月数差
        const months1 = date1.getFullYear() * 12 + date1.getMonth();
        const months2 = date2.getFullYear() * 12 + date2.getMonth();
        
        let monthDiff = months2 - months1;
        
        // 调整天数部分
        const day1 = date1.getDate();
        const day2 = date2.getDate();
        
        if (day2 < day1) {
            // 如果date2的日期小于date1的日期，借一个月
            monthDiff--;
            
            // 计算上个月的天数
            const prevMonth = new Date(date2);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
            const daysInPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate();
            
            // 计算小数部分
            const dayFraction = (daysInPrevMonth - day1 + day2) / daysInPrevMonth;
            monthDiff += dayFraction;
        } else {
            // 计算小数部分
            const dayFraction = (day2 - day1) / 30; // 近似
            monthDiff += dayFraction;
        }
        
        return parseFloat(monthDiff.toFixed(2));
    } catch (error) {
        console.error('计算月份差错误:', error);
        return null;
    }
}
