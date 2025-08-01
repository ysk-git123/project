import React, { useState, useEffect } from 'react';
import {
  NavBar,
  Card,
  Image,
  Tag,
  List,
  InfiniteScroll,
  Toast
} from 'antd-mobile';
import { useNavigate, useParams } from 'react-router-dom';
import { GET } from '../../Axios/api';
import styles from './Shou.module.css';

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  color: string[];
  category: string;
}

// 分类名称映射
const categoryNames: Record<string, string> = {
  '短袖': '短袖',
  '卫衣': '卫衣',
  '长袖': '长袖',
  '外套': '外套',
  '裤子': '裤子',
  '裙子': '裙子',
  '鞋靴': '鞋靴',
  '配饰': '配饰',
};

export default function CategoryPage() {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // 当前页码
  const pageSize = 10; // 每页数量

  // 获取分类商品数据
  const fetchCategoryProducts = async (page = 1, isLoadMore = false) => {
    try {
      setLoading(true);
      const response = await GET(`/YSK/shop?category=${category}&page=${page}&pageSize=${pageSize}`);
      if (response.data.success) {
        const { list, pagination } = response.data.data;

        if (isLoadMore) {
          // 加载更多时，追加数据
          setProducts(prev => [...prev, ...list]);
        } else {
          // 首次加载或刷新时，替换数据
          setProducts(list);
        }

        setCurrentPage(pagination.current);
        setHasMore(pagination.hasMore);
        console.log(`${category}分类第${page}页商品:`, list);
      }
    } catch (error) {
      console.error('获取商品失败:', error);
      Toast.show('获取商品失败');
    } finally {
      setLoading(false);
    }
  };

  // 触底加载更多
  const loadMore = async () => {
    if (loading || !hasMore) return;
    await fetchCategoryProducts(currentPage + 1, true);
  };

  useEffect(() => {
    if (category) {
      fetchCategoryProducts(1, false);
    }
  }, [category]);

  // 返回首页
  const handleBack = () => {
    navigate(-1);
  };

  // 商品卡片
  const ProductCard = ({ product }: { product: Product }) => (
    <Card className={styles['product-card']}>
      <div className={styles['product-image']}>
        <Image src={product.image} width="100%" height={200} fit="cover" />
        {product.color.length > 0 && (
          <Tag color="primary" className={styles['color-tag']}>
            {product.color[0]}
          </Tag>
        )}
      </div>
      <div className={styles['product-info']}>
        <div className={styles['product-name']}>{product.name}</div>
        <div className={styles['product-price']}>¥{product.price}</div>
      </div>
    </Card>
  );

  const categoryName = categoryNames[category || ''] || category;

  return (
    <div className={styles['mobile-shop']}>
      {/* 顶部导航栏 */}
      <NavBar
        className={styles['shop-navbar']}
        onBack={handleBack}
      >
        {categoryName}
      </NavBar>

      {/* 商品列表 */}
      <div className={styles['products-container']}>
        <List>
          <div className={styles['products-grid']}>
            {products.length === 0 && !loading && (
              <div className={styles['empty-container']}>
                {categoryName}分类暂无商品
              </div>
            )}
            {products.map((product) => (
              <div key={product._id} className={styles['product-item']}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />
        </List>
      </div>
    </div>
  );
} 