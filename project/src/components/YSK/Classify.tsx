import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideBar, Card, Image, Tag, List, InfiniteScroll, Toast, SpinLoading } from 'antd-mobile';
import { GET } from '../../Axios/api';
import styles from './ModuleCSS/Classify.module.css';
import TabBar from './TabBar';

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  color: string[];
  category: string;
}

interface Category {
  key: string;
  title: string;
}

// 自定义Hook: 处理分类和商品数据逻辑
const useCategoryProducts = () => {
    const [categories, setCategories] = useState<Category[]>([
        { key: 'all', title: '全部' }
    ]);
    const [activeKey, setActiveKey] = useState('all');
    const [allProducts, setAllProducts] = useState<{ [key: string]: Product[] }>({});
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [dataLoaded, setDataLoaded] = useState(false); // 记录数据是否已加载
    const pageSize = 10;



    // 获取分类商品数据
    const fetchCategoryProducts = useCallback(async (category: string, page = 1, isLoadMore = false) => {
        try {
            setLoading(true);
            setError(null);
            const url = category === 'all' 
                ? `/YSK/shop?page=${page}&pageSize=${pageSize}`
                : `/YSK/shop?category=${category}&page=${page}&pageSize=${pageSize}`;
            
            const response = await GET(url);
            if (response.data.success) {
                const { list, pagination } = response.data.data;

                setAllProducts(prev => ({
                    ...prev,
                    [category]: isLoadMore ? [...(prev[category] || []), ...list] : list
                }));

                setCurrentPage(pagination.current);
                setHasMore(pagination.hasMore);
            } else {
                // 如果API返回失败，显示错误信息
                setError('获取商品数据失败');
            }
        } catch (error) {
            console.error('获取商品失败:', error);
            setError('获取商品数据失败');
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    // 从后端获取分类数据
    const fetchCategories = useCallback(async () => {
        try {
            setError(null);
            const response = await GET('/YSK/shop/categories');
            if (response.data.success) {
                const categoryList = response.data.data;
                const formattedCategories = [
                    { key: 'all', title: '全部' },
                    ...categoryList.map((category: string) => ({
                        key: category,
                        title: category
                    }))
                ];
                setCategories(formattedCategories);
                
                // 获取所有分类的商品数据
                await Promise.all(formattedCategories.map(cat => 
                    fetchCategoryProducts(cat.key, 1, false)
                ));
                setDataLoaded(true); // 标记数据已加载
            } else {
                Toast.show('获取分类失败');
                setCategories([{ key: 'all', title: '全部' }]);
                setError('获取分类失败，已加载默认分类');
                setDataLoaded(true); // 即使失败也标记为已加载，避免重复请求
            }
        } catch (error) {
            console.error('获取分类失败:', error);
            Toast.show('获取分类失败');
            setCategories([{ key: 'all', title: '全部' }]);
            setError('获取分类失败，已加载默认分类');
            setDataLoaded(true); // 即使失败也标记为已加载，避免重复请求
        }
    }, [fetchCategoryProducts]);

    // 触底加载更多
    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;
        await fetchCategoryProducts(activeKey, currentPage + 1, true);
    }, [loading, hasMore, activeKey, currentPage, fetchCategoryProducts]);

    return {
        categories,
        activeKey,
        setActiveKey,
        allProducts,
        loading,
        hasMore,
        currentPage,
        error,
        pageSize,
        fetchCategories,
        fetchCategoryProducts,
        loadMore,
        dataLoaded
    };
};

export default function Classify() {
    const navigate = useNavigate();
    const {
        categories,
        activeKey,
        setActiveKey,
        allProducts,
        loading,
        hasMore,
        error,
        loadMore,
        fetchCategories,
        fetchCategoryProducts,
        dataLoaded
    } = useCategoryProducts();
    
    const mainRef = useRef<HTMLDivElement>(null);

    // 处理商品点击事件
    const handleProductClick = (product: Product) => {
        navigate(`/shoppdetail`, { 
            state: { product } 
        });
    };

    // 切换分类 - 使用useCallback优化性能
    const handleCategoryChange = useCallback((key: string) => {
        setActiveKey(key);
        
        // 滚动到对应位置
        const element = document.getElementById(`category-${key}`);
        if (element && mainRef.current) {
            mainRef.current.scrollTo({
                top: element.offsetTop - 60,
                behavior: 'smooth'
            });
        }
    }, [setActiveKey]);

    // 监听滚动事件，更新左侧高亮 - 使用useCallback优化性能
    const handleScroll = useCallback(() => {
        if (!mainRef.current) return;
        
        const scrollTop = mainRef.current.scrollTop;
        let currentKey = categories[0]?.key || 'all';
        
        for (const category of categories) {
            const element = document.getElementById(`category-${category.key}`);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= 100) { // 100px的偏移量
                    currentKey = category.key;
                } else {
                    break;
                }
            }
        }
        
        if (currentKey !== activeKey) {
            setActiveKey(currentKey);
        }
    }, [categories, activeKey, setActiveKey]);

    // 初始化加载分类数据
    useEffect(() => {
        if (!dataLoaded) {
            fetchCategories();
        }
    }, [fetchCategories, dataLoaded]);

    // 添加滚动事件监听
    useEffect(() => {
        const mainElement = mainRef.current;
        if (mainElement) {
            mainElement.addEventListener('scroll', handleScroll);
            return () => {
                mainElement.removeEventListener('scroll', handleScroll);
            };
        }
    }, [handleScroll]);

    // 使用useMemo优化商品卡片组件
    const ProductCard = useMemo(() => {
        return ({ product }: { product: Product }) => (
            <Card 
                className={styles.productCard}
                onClick={() => handleProductClick(product)}
            >
                <div className={styles.productContent}>
                    <Image 
                        src={product.image} 
                        width={80} 
                        height={80} 
                        fit="cover"
                        className={styles.productImage}
                        fallback={<div className={styles.imagePlaceholder}>图片加载失败</div>}
                    />
                    <div className={styles.productInfo}>
                        <div>
                            <div className={styles.productName}>
                                {product.name}
                            </div>
                            {product.color.length > 0 && (
                                <Tag color="primary" className={styles.colorTag}>
                                    {product.color[0]}
                                </Tag>
                            )}
                        </div>
                        <div className={styles.productPrice}>
                            ¥{product.price}
                        </div>
                    </div>
                </div>
            </Card>
        );
    }, []);

    // 渲染错误提示
    const renderError = useMemo(() => {
        if (!error) return null;
        return (
            <div className={styles.errorTip}>
                {error}
            </div>
        );
    }, [error]);

    return (
        <div className={styles.container}>
            {/* 错误提示 */}
            {renderError}
            
            {/* 左侧分类导航 - 固定不滚动 */}
            <div className={styles.side}>
                <SideBar 
                    activeKey={activeKey} 
                    onChange={handleCategoryChange}
                >
                    {categories.map(item => (
                        <SideBar.Item 
                            key={item.key} 
                            title={item.title}
                        />
                    ))}
                </SideBar>
            </div>

            {/* 右侧内容区域 - 可滚动 */}
            <div 
                ref={mainRef}
                className={styles.main}
            >
                {/* 为每个分类创建对应的内容区域 */}
                {categories.map(category => (
                    <div key={category.key} id={`category-${category.key}`} className={styles.categorySection}>
                        <h2>{category.title}</h2>
                        
                        {/* 显示对应分类的商品 */}
                        {allProducts[category.key] && allProducts[category.key].length > 0 ? (
                            <List>
                                {allProducts[category.key].map((product) => (
                                    <List.Item key={product._id}>
                                        <ProductCard product={product} />
                                    </List.Item>
                                ))}
                                {category.key === activeKey && (
                                    <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
                                        {loading ? (
                                            <div className={styles.loadingMore}>
                                                <SpinLoading color="primary" />
                                                <span>加载中...</span>
                                            </div>
                                        ) : hasMore ? (
                                            <span>上拉加载更多</span>
                                        ) : (
                                            <span>没有更多了</span>
                                        )}
                                    </InfiniteScroll>
                                )}
                            </List>
                        ) : (
                            <div className={styles.loadingContainer}>
                                <SpinLoading color="primary" />
                                <span>加载中...</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* 底部标签栏 */}
            <TabBar />
        </div>
    );
}