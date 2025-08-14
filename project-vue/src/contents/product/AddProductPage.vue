<template>
  <div class="add-product-page">
    <el-card>
      <template #header>
        <h2>添加商品</h2>
      </template>

      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" class="product-form">
        <!-- 商品名称 -->
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入商品名称" maxlength="100" show-word-limit />
        </el-form-item>

        <!-- 商品分类 -->
        <el-form-item label="商品分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择商品分类" style="width: 100%"
            :disabled="categories.length === 0">
            <el-option v-for="category in categories" :key="category" :label="category" :value="category" />
          </el-select>
          <div v-if="categories.length === 0" class="category-error">
            <el-alert title="分类数据加载失败" description="请检查网络连接或联系管理员" type="error" :closable="false" show-icon />
          </div>
        </el-form-item>

        <!-- 商品价格 -->
        <el-form-item label="商品价格" prop="price">
          <el-input-number v-model="formData.price" :min="0.01" :max="99999" :precision="2" :step="0.01"
            style="width: 100%" placeholder="请输入商品价格" :controls="true" controls-position="right"
            :formatter="(value: number) => `¥${value}`" :parser="(value: string) => value.replace('¥', '')" />
          <div class="price-tip">价格范围：¥0.01 - ¥99,999.00</div>
        </el-form-item>

        <!-- 商品图片 -->
        <el-form-item label="商品图片" prop="image">
          <div class="image-upload-container">

            
            <el-upload 
              class="image-uploader" 
              :http-request="customUpload"
              :show-file-list="false"
              :on-success="handleImageSuccess" 
              :on-error="handleImageError" 
              :before-upload="beforeImageUpload"
              accept="image/*"
              name="file"
              drag
            >
              <img v-if="formData.image" :src="formData.image" class="uploaded-image" @error="handleImageLoadError" />
              <div v-else class="upload-placeholder">
                <el-icon class="image-uploader-icon">
                  <Plus />
                </el-icon>
                <div class="upload-text">点击或拖拽上传图片</div>
              </div>
            </el-upload>
            
            <!-- 图片预览和删除 -->
            <div v-if="formData.image" class="image-actions">
              <el-button type="primary" size="small" @click="previewImage">预览</el-button>
              <el-button type="danger" size="small" @click="removeImage">删除</el-button>
            </div>
          </div>
          <div class="upload-tip">支持 JPG、PNG、WEBP 格式，建议尺寸 800x800</div>
        </el-form-item>

        <!-- 商品颜色 -->
        <el-form-item label="商品颜色" prop="color">
          <div class="color-selector">
            <el-tag v-for="color in availableColors" :key="color"
              :class="{ 'selected': formData.color.includes(color) }" @click="toggleColor(color)" class="color-tag">
              {{ color }}
            </el-tag>
            <el-input v-if="showCustomColor" v-model="customColor" placeholder="输入自定义颜色" size="small"
              style="width: 120px; margin-left: 10px;" @keyup.enter="addCustomColor" />
            <el-button v-if="!showCustomColor" type="primary" link @click="showCustomColor = true" size="small">
              添加颜色
            </el-button>
          </div>
        </el-form-item>

        <!-- 商品尺码 -->
        <el-form-item label="商品尺码" prop="size">
          <div class="size-selector">
            <el-tag v-for="size in availableSizes" :key="size" :class="{ 'selected': formData.size.includes(size) }"
              @click="toggleSize(size)" class="size-tag">
              {{ size }}
            </el-tag>
            <el-input v-if="showCustomSize" v-model="customSize" placeholder="输入自定义尺码" size="small"
              style="width: 120px; margin-left: 10px;" @keyup.enter="addCustomSize" />
            <el-button v-if="!showCustomSize" type="primary" link @click="showCustomSize = true" size="small">
              添加尺码
            </el-button>
          </div>
        </el-form-item>

        <!-- 商品库存 -->
        <el-form-item label="商品库存" prop="stock">
          <el-input-number v-model="formData.stock" :min="0" :precision="0" placeholder="请输入商品库存" />
        </el-form-item>

        <!-- 商品描述 -->
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入商品详细描述" maxlength="500"
            show-word-limit />
        </el-form-item>



        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            提交审核
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { getCategories, addProduct } from '../../axios/api';

// 定义图片上传响应类型
interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    filename: string;
    originalname: string;
    size: number;
    mimetype: string;
    url: string;
  };
}

// 表单数据
const formData = reactive({
  name: '',
  category: '',
  price: 0.01,
  image: '',
  color: [] as string[],
  size: [] as string[],
  description: '',
  stock: 0
});

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '商品名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '价格必须大于0', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传商品图片', trigger: 'change' }
  ],
  color: [
    { required: true, message: '请选择商品颜色', trigger: 'change' },
    { type: 'array', min: 1, message: '至少选择一个颜色', trigger: 'change' }
  ],
  size: [
    { required: true, message: '请选择商品尺码', trigger: 'change' },
    { type: 'array', min: 1, message: '至少选择一个尺码', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' },
    { min: 10, max: 500, message: '商品描述长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入商品库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存不能小于0', trigger: 'blur' }
  ]
};

// 可用选项
const categories = ref<string[]>([]);
const availableColors = ref([
  '白色', '黑色', '蓝色', '红色', '绿色', '黄色', '紫色', '橙色', '粉色', '灰色', '棕色'
]);
const availableSizes = ref(['XS', 'S', 'M', 'L', 'XL', 'XXL']);

// 自定义输入
const customColor = ref('');
const customSize = ref('');
const showCustomColor = ref(false);
const showCustomSize = ref(false);

// 表单引用
const formRef = ref();
const submitting = ref(false);

// 自定义上传函数
interface UploadOptions {
  file: File;
  onSuccess: (response: UploadResponse) => void;
  onError: (error: unknown) => void;
}

const customUpload = async (options: UploadOptions) => {
  try {
    const formData = new FormData();
    formData.append('file', options.file);
    
    // 使用axios发送请求，自动携带token
    const response = await fetch('/upload/product', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      options.onSuccess(result);
    } else {
      options.onError(new Error('上传失败'));
    }
  } catch (error) {
    console.error('上传错误:', error);
    options.onError(error);
  }
};

// 获取分类列表
const getCategoriesList = async () => {
  try {
    // 调用API获取分类列表
    const response = await getCategories();
    if (response.success && response.data) {
      categories.value = response.data;
      
    } else {
      // API调用失败，显示错误信息
      console.error('获取分类失败:', response.message);
      ElMessage.error(`获取分类失败: ${response.message || '未知错误'}`);
      categories.value = []; // 清空分类列表
    }
  } catch (err) {
    console.error('获取分类失败:', err);
    ElMessage.error('网络错误，无法获取分类列表');
    categories.value = []; // 清空分类列表
  }
};

// 切换颜色选择
const toggleColor = (color: string) => {
  const index = formData.color.indexOf(color);
  if (index > -1) {
    formData.color.splice(index, 1);
  } else {
    formData.color.push(color);
  }
};

// 切换尺码选择
const toggleSize = (size: string) => {
  const index = formData.size.indexOf(size);
  if (index > -1) {
    formData.size.splice(index, 1);
  } else {
    formData.size.push(size);
  }
};

// 添加自定义颜色
const addCustomColor = () => {
  if (customColor.value.trim() && !availableColors.value.includes(customColor.value.trim())) {
    availableColors.value.push(customColor.value.trim());
    formData.color.push(customColor.value.trim());
    customColor.value = '';
    showCustomColor.value = false;
  }
};

// 添加自定义尺码
const addCustomSize = () => {
  if (customSize.value.trim() && !availableSizes.value.includes(customSize.value.trim())) {
    availableSizes.value.push(customSize.value.trim());
    formData.size.push(customSize.value.trim());
    customSize.value = '';
    showCustomSize.value = false;
  }
};

// 图片上传成功
const handleImageSuccess = (response: UploadResponse) => {
  if (response.success && response.data) {
    // 构建完整的图片URL，使用相对路径避免硬编码
    const imageUrl = response.data.url;
    formData.image = imageUrl;
    
    ElMessage.success('图片上传成功');
  } else {
    ElMessage.error(response.message || '图片上传失败');
  }
};

// 图片上传失败
const handleImageError = () => {
  ElMessage.error('图片上传失败');
};

// 图片加载错误处理
const handleImageLoadError = (_event: Event) => {
  ElMessage.error('图片加载失败，请检查图片路径');
};

// 图片上传前验证
const beforeImageUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 预览图片
const previewImage = () => {
  if (formData.image) {
    // 使用Element Plus的图片预览组件
    const img = new Image();
    img.src = formData.image;
    img.onload = () => {
      // 这里可以集成Element Plus的图片预览功能
      window.open(formData.image, '_blank');
    };
  }
};

// 删除图片
const removeImage = () => {
  formData.image = '';
  ElMessage.success('图片已删除');
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    // 添加确认对话框
    try {
      await ElMessageBox.confirm(
        '确定要提交商品进行审核吗？提交后将进入审核流程。',
        '确认提交',
        {
          confirmButtonText: '确定提交',
          cancelButtonText: '取消',
          type: 'info',
        }
      );
    } catch (confirmError) { // eslint-disable-line @typescript-eslint/no-unused-vars
      // 用户取消提交
      return;
    }

    submitting.value = true;

    // 调用API提交商品数据
    try {
      const store = useStore();
      const merchantCode = store.state.userInfo?.merchantCode;
      
      if (!merchantCode) {
        ElMessage.error('商家代码未找到，请重新登录');
        return;
      }
      
      const response = await addProduct({
        ...formData,
        merchantCode,
        status: 'pending', // 审核状态：pending-审核中
        createTime: new Date().toISOString()
      });
      
      if (response.success) {
        ElMessage.success('商品提交成功，等待审核');
      } else {
        ElMessage.error(response.message || '商品提交失败');
        return;
      }
    } catch (apiError) {
      console.error('API调用失败:', apiError);
      ElMessage.error('网络错误，商品提交失败');
      return;
    }

    // 重置表单
    resetForm();

  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    submitting.value = false;
  }
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  formData.image = '';
  formData.color = [];
  formData.size = [];
};

onMounted(() => {
  getCategoriesList();
});
</script>

<style scoped lang="scss">
  .add-product-page {
    padding: 1.5rem;

  .product-form {
    max-width: 800px;
    margin: 0 auto;

    .image-upload-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .image-uploader {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      width: 200px;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        border-color: #409eff;
      }

      .uploaded-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .image-uploader-icon {
        font-size: 28px;
        color: #8c939d;
      }

      .upload-text {
        font-size: 12px;
        color: #8c939d;
        text-align: center;
      }
    }

    .image-actions {
      display: flex;
      gap: 8px;
      justify-content: center;
    }

    .upload-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 8px;
    }

    .price-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
      line-height: 1.4;
    }

    .category-error {
      margin-top: 8px;
    }

    .color-selector,
    .size-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;

      .color-tag,
      .size-tag {
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        &.selected {
          background-color: #409eff;
          color: white;
          border-color: #409eff;
        }
      }
    }
  }
  }
</style>
