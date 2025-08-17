<template>
  <div class="finance-container">
    <div class="page-header">
      <div ref="exportHeader" class="export-header">
        <h3>综合统计</h3>
        <p class="export-date">{{ exportDateText }}</p>
      </div>
      <div><el-button @click="handleExport">导出</el-button></div>
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

    <div ref="exportContent" class="export-content">
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
      <!-- </div> -->

      <!-- <div ref="exportContainer" class="export-container"> -->
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
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ElMessage } from 'element-plus';
  // import * as echarts from 'echarts';
  // 导入导出相关库
  // import * as XLSX from 'xlsx';
  // import { saveAs } from 'file-saver';
  // 导出图片
  import html2canvas from 'html2canvas';

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

  // 导出日期文本
  const exportDateText = computed(() => {
    return `统计日期: ${formatDate(dateRange.value[0])} 至 ${formatDate(dateRange.value[1])}`;
  });
  console.log(exportDateText);

  // 导出相关的DOM引用
  const exportHeader = ref<HTMLDivElement | null>(null);
  const exportContent = ref<HTMLDivElement | null>(null);

  // 导出
  const handleExport = () => {
    if (!exportHeader.value || !exportContent.value) {
      ElMessage.error('导出失败，请稍后再试');
      return;
    }

    // 创建一个临时容器来合并头部和内容
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '800px';
    tempContainer.style.padding = '20px';
    tempContainer.style.backgroundColor = '#fff';
    tempContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';

    // 克隆头部和内容
    const headerClone = exportHeader.value.cloneNode(true) as HTMLElement;
    const contentClone = exportContent.value.cloneNode(true) as HTMLElement;

    // 添加到临时容器
    tempContainer.appendChild(headerClone);
    tempContainer.appendChild(contentClone);
    document.body.appendChild(tempContainer);

    // 使用html2canvas捕获临时容器
    html2canvas(tempContainer, {
      scale: 2, // 提高分辨率
      useCORS: true,
      logging: false,
    })
      .then((canvas) => {
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `财务统计_${formatDate(new Date())}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // 清理临时容器
        document.body.removeChild(tempContainer);

        ElMessage.success('导出成功');
      })
      .catch((error) => {
        console.error('导出失败:', error);
        ElMessage.error('导出失败，请稍后重试');
        document.body.removeChild(tempContainer);
      });
  };

  // 处理日期范围变化
  const handleDateChange = (range: [Date, Date] | null) => {
    if (range) {
      ElMessage.success(`已选择日期范围: ${formatDate(range[0])} 至 ${formatDate(range[1])}`);
      // 实际项目中，这里会调用API获取对应日期范围的数据
      // 更新图表数据
      // updateCharts();
    }
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };
</script>

<style scoped lang="scss">
  .finance-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
  }

  .export-header {
    text-align: center;
    margin-bottom: 20px;
  }

  .export-date {
    font-size: 16px;
    color: #303133;
    margin-top: 10px;
  }

  .export-content {
    width: 100%;
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
