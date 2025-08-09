<template>
  <div class="statistics-goods-container">
    <!-- 商品类目销售分析 -->
    <el-card class="analysis-card">
      <template #header>
        <div class="card-header">
          <span>商品类目销售分析</span>
          <div class="header-actions">
            <el-button type="primary" size="small" class="export-btn">导出</el-button>
            <el-radio-group v-model="dateRange1" class="date-radio-group">
              <el-radio label="昨天">昨天</el-radio>
              <el-radio label="最近7天">最近7天</el-radio>
              <el-radio label="最近30天">最近30天</el-radio>
            </el-radio-group>
            <el-date-picker
              v-model="customDateRange1"
              type="daterange"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              format="YYYY-MM-DD"
            />
          </div>
        </div>
      </template>

      <div class="chart-container">
        <div ref="categoryChartRef" class="pie-chart" style="width: 100%; height: 300px"></div>
      </div>

      <el-table :data="categoryData" style="width: 100%" class="category-table">
        <el-table-column prop="category" label="商品分类" width="180" />
        <el-table-column prop="salesVolume" label="销量 (件)" width="120" />
        <el-table-column prop="proportion" label="占比" width="100" />
        <el-table-column prop="salesAmount" label="销售额 (元)" width="150" />
        <el-table-column prop="amountProportion" label="占比" width="100" />
      </el-table>
    </el-card>

    <!-- 商品销售明细 -->
    <el-card class="details-card">
      <template #header>
        <div class="card-header">
          <span>商品销售明细</span>
          <div class="header-actions">
            <div class="sort-container">
              <span>排序方式</span>
              <el-select v-model="sortMethod" size="small" class="sort-select">
                <el-option label="排序方式" value="default"></el-option>
                <el-option label="销量从高到低" value="salesVolumeDesc"></el-option>
                <el-option label="销量从低到高" value="salesVolumeAsc"></el-option>
                <el-option label="销售额从高到低" value="salesAmountDesc"></el-option>
                <el-option label="销售额从低到高" value="salesAmountAsc"></el-option>
              </el-select>
            </div>
            <el-button type="primary" size="small" class="export-btn">导出</el-button>
            <el-radio-group v-model="dateRange2" class="date-radio-group">
              <el-radio label="昨天">昨天</el-radio>
              <el-radio label="最近7天">最近7天</el-radio>
              <el-radio label="最近30天">最近30天</el-radio>
            </el-radio-group>
            <el-date-picker
              v-model="customDateRange2"
              type="daterange"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              format="YYYY-MM-DD"
            />
          </div>
        </div>
      </template>

      <el-table :data="goodsDetailsData" style="width: 100%" class="details-table">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="index" label="序号" width="80" />
        <el-table-column prop="name" label="商品名称" width="200" />
        <el-table-column prop="views" label="浏览量" width="100" />
        <el-table-column prop="viewers" label="浏览人数" width="100" />
        <el-table-column prop="payers" label="付款人数" width="100" />
        <el-table-column prop="conversionRate" label="单品转化率" width="120" />
        <el-table-column prop="salesVolume" label="销售数量" width="100" />
        <el-table-column prop="salesAmount" label="销售金额" width="120" />
      </el-table>

      <div class="pagination-container">
        <div class="pagination-info">共20页/200条数据 每页显示 20</div>
        <el-pagination
          v-model:current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          layout="prev, pager, next, jumper"
          :total="200"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue';
  import * as echarts from 'echarts';
  import { ElMessage } from 'element-plus';

  // 日期范围选择
  const dateRange1 = ref('昨天');
  const customDateRange1 = ref<[Date, Date] | null>([
    new Date('2018-02-05'),
    new Date('2018-02-11'),
  ]);
  const dateRange2 = ref('昨天');
  const customDateRange2 = ref<[Date, Date] | null>([
    new Date('2018-02-05'),
    new Date('2018-02-11'),
  ]);

  // 排序方式
  const sortMethod = ref('default');

  // 当前页码
  const currentPage = ref(1);

  // 图表引用
  const categoryChartRef = ref<HTMLDivElement | null>(null);

  // 商品分类数据
  const categoryData = ref([
    {
      category: '男士',
      salesVolume: 306,
      proportion: '30.6%',
      salesAmount: '¥20,000',
      amountProportion: '50%',
    },
    {
      category: '女士',
      salesVolume: 194,
      proportion: '19.4%',
      salesAmount: '¥10,000',
      amountProportion: '25%',
    },
    {
      category: '童装',
      salesVolume: 86,
      proportion: '8.6%',
      salesAmount: '¥5,000',
      amountProportion: '12.5%',
    },
    {
      category: 'OUTLETS',
      salesVolume: 44,
      proportion: '4.4%',
      salesAmount: '¥2,000',
      amountProportion: '5%',
    },
    {
      category: '双肩背包',
      salesVolume: 200,
      proportion: '20%',
      salesAmount: '¥1,000',
      amountProportion: '2.5%',
    },
    {
      category: '超轻背包',
      salesVolume: 170,
      proportion: '17%',
      salesAmount: '¥2,000',
      amountProportion: '5%',
    },
  ]);

  // 商品销售明细数据
  const goodsDetailsData = ref(
    Array.from({ length: 10 }, (_, index) => ({
      index: index + 1,
      name: '2019新款冲锋衣',
      views: 1000,
      viewers: 500,
      payers: 200,
      conversionRate: '20%',
      salesVolume: 500,
      salesAmount:
        index % 5 === 0
          ? '¥2,000'
          : index % 5 === 1
            ? '¥1,000'
            : index % 5 === 2
              ? '¥5,000'
              : '¥2,000',
    })),
  );

  // 初始化饼图
  const initCategoryChart = () => {
    nextTick(() => {
      if (categoryChartRef.value) {
        const chart = echarts.init(categoryChartRef.value);

        const option = {
          title: {
            text: '一级分类商品',
            left: 'center',
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)',
          },
          legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            data: ['男士', '女士', '童装', 'OUTLETS', '双肩背包', '超轻背包'],
          },
          series: [
            {
              name: '商品分类',
              type: 'pie',
              radius: '55%',
              center: ['40%', '50%'],
              data: [
                { value: 306, name: '男士' },
                { value: 194, name: '女士' },
                { value: 86, name: '童装' },
                { value: 44, name: 'OUTLETS' },
                { value: 200, name: '双肩背包' },
                { value: 170, name: '超轻背包' },
              ],
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
              color: ['#1E88E5', '#43A047', '#FB8C00', '#26C6DA', '#EF5350', '#7E57C2'],
            },
          ],
        };

        chart.setOption(option);

        // 监听窗口大小变化，调整图表大小
        window.addEventListener('resize', () => {
          chart.resize();
        });
      }
    });
  };

  // 处理日期范围变化
  // 绑定日期选择器的 change 事件需要该函数，暂时先保留该函数，后续可根据实际需求绑定事件
  const handleDateChange = (type: number, range: string | [Date, Date] | null) => {
    if (range) {
      ElMessage.success(
        `已选择日期范围: ${typeof range === 'string' ? range : `${formatDate(range[0])} ~ ${formatDate(range[1])}`}`,
      );
      // 实际项目中，这里会调用API获取对应日期范围的数据
    }
  };
  console.log('商品统计页面加载完成', handleDateChange);

  // 格式化日期
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  // 页面加载时执行
  onMounted(() => {
    console.log('商品统计页面加载完成');
    initCategoryChart();
  });
</script>

<style scoped lang="scss">
  .statistics-goods-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
  }

  .analysis-card,
  .details-card {
    margin-bottom: 24px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .export-btn {
    margin-right: 10px;
  }

  .date-radio-group {
    display: flex;
    align-items: center;
  }

  .date-radio-group .el-radio {
    margin-right: 10px;
  }

  .chart-container {
    padding: 20px;
    display: flex;
    justify-content: center;
  }

  .category-table,
  .details-table {
    margin-top: 20px;
  }

  .sort-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sort-select {
    width: 120px;
  }

  .pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    margin-top: 20px;
  }

  .pagination-info {
    color: #606266;
    font-size: 14px;
  }

  /* 响应式设计 */
  @media (max-width: 1200px) {
    .header-actions {
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  @media (max-width: 768px) {
    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .header-actions {
      width: 100%;
    }

    .pagination-container {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }
</style>
