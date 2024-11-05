// 数据存储结构
let dataStore = JSON.parse(localStorage.getItem('vehicleData')) || {};

// 添加数据保存函数
function saveData() {
    localStorage.setItem('vehicleData', JSON.stringify(dataStore));
}

// 初始化图表数据
const data = {
    labels: ['蒙F', '内蒙地区', '黑', '吉', '辽', '京', '津', '冀', '其他地区'],
    datasets: [{
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: [
            '#2196F3', '#1976D2', '#4CAF50', '#8BC34A', '#FFC107', 
            '#FF5722', '#9C27B0', '#3F51B5', '#795548'
        ]
    }]
};

// 初始化柱状图
const barChart = new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: data,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.raw}辆`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: '车辆数量'
                }
            }
        }
    }
});

// 初始化饼图
const pieChart = new Chart(document.getElementById('pieChart'), {
    type: 'pie',
    data: data,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: window.innerWidth < 768 ? 'bottom' : 'right',
                labels: {
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    },
                    boxWidth: window.innerWidth < 768 ? 12 : 15,
                    generateLabels: function(chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            const dataset = data.datasets[0];
                            const total = dataset.data.reduce((a, b) => a + b, 0);
                            
                            return data.labels.map((label, i) => {
                                const value = dataset.data[i];
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                                return {
                                    text: `${label}: ${value}辆 (${percentage})`,
                                    fillStyle: dataset.backgroundColor[i],
                                    strokeStyle: dataset.backgroundColor[i],
                                    lineWidth: 2,
                                    hidden: isNaN(dataset.data[i]) || dataset.data[i] === 0,
                                    index: i
                                };
                            });
                        }
                        return [];
                    }
                }
            }
        }
    }
});

// 更新总数显示
function updateTotalCount() {
    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
    document.getElementById('totalCount').textContent = total;
}

// 获取今天的日期字符串 YYYY-MM-DD
function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

// 初始化或获取当天的数据
function initializeDayData(dateStr) {
    if (!dataStore[dateStr]) {
        dataStore[dateStr] = {
            '蒙F': 0, '内蒙地区': 0, '黑': 0, '吉': 0, 
            '辽': 0, '京': 0, '津': 0, '冀': 0, '其他地区': 0
        };
        saveData(); // 保存新初始化的数据
    }
    return dataStore[dateStr];
}

// 更新图表显示
function updateCharts(dateData) {
    data.datasets[0].data = data.labels.map(label => dateData[label] || 0);
    barChart.update();
    pieChart.update();
    updateTotalCount();
}

// 计算日期范围内的数据
function calculateDateRangeData(startDate, endDate) {
    const result = {
        '蒙F': 0, '内蒙地区': 0, '黑': 0, '吉': 0, 
        '辽': 0, '京': 0, '津': 0, '冀': 0, '其他地区': 0
    };
    
    for (let date in dataStore) {
        if (date >= startDate && date <= endDate) {
            for (let region in dataStore[date]) {
                result[region] += dataStore[date][region];
            }
        }
    }
    return result;
}

// 导出数据为CSV
function exportToCSV(startDate, endDate) {
    const data = calculateDateRangeData(startDate, endDate);
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    let csv = '地区,数量,占比\n';
    
    for (let region in data) {
        const percentage = total > 0 ? ((data[region] / total) * 100).toFixed(1) : '0';
        csv += `${region},${data[region]},${percentage}%\n`;
    }
    
    // 添加总计行
    csv += `总计,${total},100%\n`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `车牌统计_${startDate}_${endDate}.csv`;
    link.click();
}

// 事件监听器设置
document.addEventListener('DOMContentLoaded', function() {
    const today = getTodayString();
    document.getElementById('startDate').value = today;
    document.getElementById('endDate').value = today;
    
    // 初始化当天数据
    const dayData = initializeDayData(today);
    
    // 更新图表显示
    updateCharts(dayData);
});

// 修改按钮点击事件
document.querySelectorAll('.region-btn').forEach(button => {
    button.addEventListener('click', function() {
        const region = this.dataset.region;
        const today = getTodayString();
        const dayData = initializeDayData(today);
        
        // 增加对应地区的数量
        dayData[region]++;
        saveData(); // 保存更新后的数据
        
        // 更新图表显示
        updateCharts(dayData);
        
        // 添加点击动画效果
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 100);
    });
});

// 添加移动端触摸事件支持
document.querySelectorAll('.region-btn').forEach(button => {
    button.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const region = this.dataset.region;
        const today = getTodayString();
        const dayData = initializeDayData(today);
        
        // 增加对应地区的数量
        dayData[region]++;
        saveData(); // 保存更新后的数据
        
        // 更新图表显示
        updateCharts(dayData);
        
        // 添加点击动画效果
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 100);
    });
});

// 修改重置按钮事件
document.getElementById('resetBtn').addEventListener('click', function() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    for (let date in dataStore) {
        if (date >= startDate && date <= endDate) {
            delete dataStore[date];
        }
    }
    saveData(); // 保存重置后的数据
    updateCharts(calculateDateRangeData(startDate, endDate));
});