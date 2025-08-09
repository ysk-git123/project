<template>
  <div class="statistics-container">
    <div class="page-header">
      <!-- <h2>交易统计</h2> -->
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

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="card-content">
          <div class="card-title">总交易额</div>
          <div class="card-value">{{ totalAmount }}</div>
          <div class="card-change"><span class="increase">+18.2%</span> 较上月</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="card-content">
          <div class="card-title">订单总数</div>
          <div class="card-value">{{ totalOrders }}</div>
          <div class="card-change"><span class="increase">+12.5%</span> 较上月</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="card-content">
          <div class="card-title">平均客单价</div>
          <div class="card-value">{{ avgOrderValue }}</div>
          <div class="card-change"><span class="increase">+5.3%</span> 较上月</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="card-content">
          <div class="card-title">转化率</div>
          <div class="card-value">{{ conversionRate }}</div>
          <div class="card-change"><span class="decrease">-1.2%</span> 较上月</div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>交易趋势</span>
          </div>
        </template>
        <div class="chart-content">
          <!-- 使用ECharts的交易趋势图 -->
          <div ref="trendChartRef" style="width: 100%; height: 300px"></div>
        </div>
      </el-card>

      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>交易分类</span>
          </div>
        </template>
        <div class="chart-content">
          <!-- 使用ECharts的交易分类饼图 -->
          <div ref="categoryChartRef" style="width: 100%; height: 300px"></div>
        </div>
      </el-card>
    </div>

    <!-- 交易明细表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>交易明细</span>
        </div>
      </template>
      <el-table :data="transactionDetails" style="width: 100%">
        <el-table-column prop="id" label="交易ID" width="180" />
        <el-table-column prop="date" label="交易日期" width="180" />
        <el-table-column prop="customer" label="客户名称" width="200" />
        <el-table-column prop="amount" label="交易金额" width="180" />
        <el-table-column prop="category" label="交易类型" width="150" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.status === '已完成'
                  ? 'success'
                  : scope.row.status === '进行中'
                    ? 'warning'
                    : 'danger'
              "
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue';
  import { ElTag, ElMessage } from 'element-plus';
  import * as echarts from 'echarts';

  // 日期范围
  const dateRange = ref<[Date, Date]>([new Date('2023-11-01'), new Date('2023-11-30')]);

  // 统计数据
  const totalAmount = ref('¥2,580,650.00');
  const totalOrders = ref('23,580');
  const avgOrderValue = ref('¥109.5');
  const conversionRate = ref('3.8%');

  // 交易趋势数据
  const transactionTrendData = ref([
    { date: '11/01', amount: 75000 },
    { date: '11/02', amount: 82000 },
    { date: '11/03', amount: 78000 },
    { date: '11/04', amount: 91000 },
    { date: '11/05', amount: 85000 },
    { date: '11/06', amount: 72000 },
    { date: '11/07', amount: 68000 },
    { date: '11/08', amount: 83000 },
    { date: '11/09', amount: 89000 },
    { date: '11/10', amount: 94000 },
    { date: '11/11', amount: 150000 },
    { date: '11/12', amount: 135000 },
    { date: '11/13', amount: 82000 },
    { date: '11/14', amount: 76000 },
    { date: '11/15', amount: 88000 },
    { date: '11/16', amount: 92000 },
    { date: '11/17', amount: 85000 },
    { date: '11/18', amount: 79000 },
    { date: '11/19', amount: 73000 },
    { date: '11/20', amount: 86000 },
    { date: '11/21', amount: 91000 },
    { date: '11/22', amount: 88000 },
    { date: '11/23', amount: 95000 },
    { date: '11/24', amount: 82000 },
    { date: '11/25', amount: 78000 },
    { date: '11/26', amount: 84000 },
    { date: '11/27', amount: 89000 },
    { date: '11/28', amount: 93000 },
    { date: '11/29', amount: 87000 },
    { date: '11/30', amount: 91000 },
  ]);

  // 交易分类数据
  const transactionCategoryData = ref([
    { name: '商品销售', value: 1850000 },
    { name: '服务订阅', value: 420000 },
    { name: '会员充值', value: 210000 },
    { name: '其他收入', value: 100650 },
  ]);

  // 交易明细数据
  const transactionDetails = ref([
    {
      id: 'TX20231130001',
      date: '2023-11-30',
      customer: '张三',
      amount: '¥1,250.00',
      category: '商品销售',
      status: '已完成',
    },
    {
      id: 'TX20231130002',
      date: '2023-11-30',
      customer: '李四',
      amount: '¥890.00',
      category: '服务订阅',
      status: '已完成',
    },
    {
      id: 'TX20231129001',
      date: '2023-11-29',
      customer: '王五',
      amount: '¥1,560.00',
      category: '商品销售',
      status: '已完成',
    },
    {
      id: 'TX20231129002',
      date: '2023-11-29',
      customer: '赵六',
      amount: '¥2,380.00',
      category: '会员充值',
      status: '已完成',
    },
    {
      id: 'TX20231128001',
      date: '2023-11-28',
      customer: '钱七',
      amount: '¥950.00',
      category: '商品销售',
      status: '已完成',
    },
    {
      id: 'TX20231128002',
      date: '2023-11-28',
      customer: '孙八',
      amount: '¥1,850.00',
      category: '服务订阅',
      status: '进行中',
    },
    {
      id: 'TX20231127001',
      date: '2023-11-27',
      customer: '周九',
      amount: '¥1,320.00',
      category: '商品销售',
      status: '已完成',
    },
    {
      id: 'TX20231127002',
      date: '2023-11-27',
      customer: '吴十',
      amount: '¥3,200.00',
      category: '会员充值',
      status: '已完成',
    },
    {
      id: 'TX20231126001',
      date: '2023-11-26',
      customer: '郑十一',
      amount: '¥780.00',
      category: '商品销售',
      status: '已完成',
    },
    {
      id: 'TX20231126002',
      date: '2023-11-26',
      customer: '王十二',
      amount: '¥1,450.00',
      category: '其他收入',
      status: '已完成',
    },
  ]);

  // 图表引用
  const trendChartRef = ref<HTMLDivElement | null>(null);
  const categoryChartRef = ref<HTMLDivElement | null>(null);

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
      // 初始化交易趋势图
      if (trendChartRef.value) {
        const trendChart = echarts.init(trendChartRef.value);
        const trendOption = {
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
            data: transactionTrendData.value.map((item) => item.date),
            axisLabel: {
              interval: 2,
              rotate: 30,
            },
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              formatter: '¥{value}',
            },
          },
          series: [
            {
              data: transactionTrendData.value.map((item) => item.amount),
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
        trendChart.setOption(trendOption);

        // 监听窗口大小变化，调整图表大小
        window.addEventListener('resize', () => {
          trendChart.resize();
        });
      }

      // 初始化交易分类饼图
      if (categoryChartRef.value) {
        const categoryChart = echarts.init(categoryChartRef.value);
        const categoryOption = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)',
          },
          legend: {
            orient: 'vertical',
            left: 10,
            data: transactionCategoryData.value.map((item) => item.name),
          },
          series: [
            {
              name: '交易分类',
              type: 'pie',
              radius: '70%',
              center: ['50%', '50%'],
              data: transactionCategoryData.value,
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
              color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C'],
            },
          ],
        };
        categoryChart.setOption(categoryOption);

        // 监听窗口大小变化，调整图表大小
        window.addEventListener('resize', () => {
          categoryChart.resize();
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
    console.log('交易统计页面加载完成');
    initCharts();
  });
</script>

<style scoped lang="scss">
  .statistics-container {
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
