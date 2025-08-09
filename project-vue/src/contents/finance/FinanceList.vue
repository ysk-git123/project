<template>
  <div class="finance-container">
    <div class="page-header">
      <!-- <h2>综合统计</h2> -->
      <div><el-button>导出</el-button></div>
      <div class="date-range">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateChange"
        />
      </div>
    </div>

    <!-- 订单统计表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>订单统计</span>
        </div>
      </template>
      <el-table :data="orderStatistics" style="width: 100%">
        <el-table-column prop="name" label="统计项" width="300" />
        <el-table-column prop="value" label="数值" width="300" />
      </el-table>
    </el-card>

    <!-- 会员统计表格 -->
    <el-card class="table-card" style="margin-top: 24px">
      <template #header>
        <div class="card-header">
          <span>会员统计</span>
        </div>
      </template>
      <el-table :data="memberStatistics" style="width: 100%">
        <el-table-column prop="name" label="统计项" width="300" />
        <el-table-column prop="value" label="数值" width="300" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue';
  import { ElMessage } from 'element-plus';
  import * as echarts from 'echarts';

  // 日期范围
  const dateRange = ref<[Date, Date]>([new Date('2023-01-01'), new Date('2023-12-31')]);

  // 订单统计数据
  const orderStatistics = ref([
    { name: '销售总额', value: '¥1,000,000.00' },
    { name: '有效订单总数', value: '10,000' },
    { name: '有效订单总额', value: '¥1,000,000.00' },
    { name: '无效订单总数 (取消或超时关闭)', value: '100' },
    { name: '无效订单总额', value: '¥10,000.00' },
    { name: '已成交订单总数', value: '100,000' },
    { name: '已成交订单综合', value: '¥1,000,000.00' },
  ]);

  // 会员统计数据
  const memberStatistics = ref([
    { name: '用户总数', value: '1,000,000' },
    { name: '有订单用户', value: '100,000' },
    { name: '用户订单总数', value: '100,000' },
    { name: '用户购物总额', value: '¥1,000,000.00' },
    { name: '用户购买率', value: '9.99%' },
    { name: '用户平均订单数', value: '0.1' },
    { name: '用户平均购物额', value: '¥1,000.00' },
  ]);

  // 销售趋势数据
  const salesTrendData = ref([
    { month: '1月', sales: 95000 },
    { month: '2月', sales: 120000 },
    { month: '3月', sales: 110000 },
    { month: '4月', sales: 135000 },
    { month: '5月', sales: 140000 },
    { month: '6月', sales: 160000 },
    { month: '7月', sales: 155000 },
    { month: '8月', sales: 170000 },
    { month: '9月', sales: 180000 },
    { month: '10月', sales: 175000 },
    { month: '11月', sales: 190000 },
    { month: '12月', sales: 210000 },
  ]);

  // 支出分类数据
  const expenseCategoryData = ref([
    { name: '采购成本', value: 250000 },
    { name: '员工薪资', value: 180000 },
    { name: '房租水电', value: 80000 },
    { name: '营销费用', value: 60000 },
    { name: '其他支出', value: 58540 },
  ]);

  // 图表引用
  const salesTrendRef = ref<HTMLDivElement | null>(null);
  const expenseCategoryRef = ref<HTMLDivElement | null>(null);

  // 处理日期范围变化
  const handleDateChange = (range: [Date, Date] | null) => {
    if (range) {
      ElMessage.success(`已选择日期范围: ${formatDate(range[0])} 至 ${formatDate(range[1])}`);
      // 实际项目中，这里会调用API获取对应日期范围的数据
      // 更新图表数据
      updateCharts();
    }
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  // 初始化图表
  const initCharts = () => {
    nextTick(() => {
      // 初始化销售趋势图
      if (salesTrendRef.value) {
        const salesChart = echarts.init(salesTrendRef.value);
        const salesOption = {
          tooltip: {
            trigger: 'axis',
            formatter: '{b}: ¥{c}',
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          },
          xAxis: {
            type: 'category',
            data: salesTrendData.value.map((item) => item.month),
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              formatter: '¥{value}',
            },
          },
          series: [
            {
              data: salesTrendData.value.map((item) => item.sales),
              type: 'line',
              smooth: true,
              symbol: 'circle',
              symbolSize: 8,
              itemStyle: {
                color: '#409EFF',
              },
              emphasis: {
                focus: 'series',
                itemStyle: {
                  color: '#409EFF',
                  borderColor: '#fff',
                  borderWidth: 2,
                  shadowBlur: 10,
                  shadowColor: 'rgba(0, 0, 0, 0.3)',
                },
              },
              lineStyle: {
                width: 3,
                color: '#409EFF',
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
                  { offset: 1, color: 'rgba(64, 158, 255, 0.1)' },
                ]),
              },
            },
          ],
        };
        salesChart.setOption(salesOption);

        // 监听窗口大小变化，调整图表大小
        window.addEventListener('resize', () => {
          salesChart.resize();
        });
      }

      // 初始化支出分类饼图
      if (expenseCategoryRef.value) {
        const expenseChart = echarts.init(expenseCategoryRef.value);
        const expenseOption = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)',
          },
          legend: {
            orient: 'vertical',
            left: 10,
            data: expenseCategoryData.value.map((item) => item.name),
          },
          series: [
            {
              name: '支出分类',
              type: 'pie',
              radius: '70%',
              center: ['50%', '50%'],
              data: expenseCategoryData.value,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
              label: {
                formatter: '{b}: {d}%',
              },
              labelLine: {
                show: true,
              },
              color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'],
            },
          ],
        };
        expenseChart.setOption(expenseOption);

        // 监听窗口大小变化，调整图表大小
        window.addEventListener('resize', () => {
          expenseChart.resize();
        });
      }
    });
  };

  // 更新图表数据
  const updateCharts = () => {
    // 这里可以根据新的日期范围更新图表数据
    // 为简化示例，我们复用相同的数据
    initCharts();
  };

  // 页面加载时执行
  onMounted(() => {
    console.log('财务统计页面加载完成');
    initCharts();
  });
</script>

<style scoped lang="scss">
  .finance-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .date-range {
    width: 370px;
  }

  .stats-cards {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .stat-card {
    width: calc(25% - 16px);
    margin-bottom: 16px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
    }
  }

  .card-content {
    padding: 20px;
  }

  .card-title {
    font-size: 14px;
    color: #909399;
    margin-bottom: 10px;
  }

  .card-value {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 6px;
  }

  .card-change {
    font-size: 12px;
    color: #909399;
  }

  .increase {
    color: #67c23a;
  }

  .decrease {
    color: #f56c6c;
  }

  .charts-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .chart-card {
    width: calc(50% - 16px);
    margin-bottom: 16px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chart-content {
    padding: 20px;
  }

  .table-card {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  /* 响应式设计 */
  @media (max-width: 1200px) {
    .stat-card {
      width: calc(33.33% - 16px);
    }
  }

  @media (max-width: 992px) {
    .stat-card {
      width: calc(50% - 16px);
    }

    .chart-card {
      width: 100%;
    }
  }

  @media (max-width: 768px) {
    .stat-card {
      width: 100%;
    }

    .page-header {
      flex-direction: column;
      align-items: flex-start;

      .date-range {
        width: 100%;
        margin-top: 16px;
      }
    }
  }
</style>
