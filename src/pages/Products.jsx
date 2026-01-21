import React from 'react'
import { useState, useEffect } from 'react';
import api from '../services/api';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Query Demo States
    const [queryMode, setQueryMode] = useState('all');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [inStock, setInStock] = useState('');
    const [category, setCategory] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('asc');
    const [searchKeyword, setSearchKeyword] = useState('');

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        imageUrl: ''
    });

    // ดึงข้อมูลตาม Query Mode
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);

        try {
            let endpoint = '';

            switch (queryMode) {
                case 'all':
                    endpoint = '/products';
                    break;

                case 'projection':
                    endpoint = '/products/q/projection';
                    break;

                case 'price-range':
                    endpoint = `/products/q/price-range?min=${minPrice}&max=${maxPrice}`;
                    break;

                case 'stock-filter':
                    endpoint = `/products/q/stock-filter?inStock=${inStock}`;
                    break;

                case 'category':
                    endpoint = `/products/q/category?category=${category}`;
                    break;

                case 'sort':
                    endpoint = `/products/q/sort?by=${sortBy}&dir=${sortDir}`;
                    break;

                case 'search':
                    const params = new URLSearchParams();
                    if (searchKeyword) params.append('keyword', searchKeyword);
                    if (category) params.append('category', category);
                    if (minPrice) params.append('minPrice', minPrice);
                    if (maxPrice) params.append('maxPrice', maxPrice);
                    if (inStock) params.append('inStock', inStock);
                    if (sortBy) params.append('sort', sortBy);
                    if (sortDir) params.append('order', sortDir);
                    endpoint = `/products/search?${params.toString()}`;
                    break;

                default:
                    endpoint = '/products';
            }

            const response = await api.get(endpoint);
            setProducts(response.data.data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('ไม่สามารถดึงข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [queryMode, sortBy, sortDir]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10)
            };

            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, submitData);
                alert('แก้ไขสินค้าสำเร็จ');
            } else {
                await api.post('/products', submitData);
                alert('เพิ่มสินค้าสำเร็จ');
            }

            setShowForm(false);
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                category: '',
                imageUrl: ''
            });
            fetchProducts();
        } catch (err) {
            console.error('Error saving product:', err);
            alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            stock: product.stock.toString(),
            category: product.category || '',
            imageUrl: product.imageUrl || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณต้องการลบสินค้านี้หรือไม่?')) return;

        try {
            await api.delete(`/products/${id}`);
            alert('ลบสินค้าสำเร็จ');
            fetchProducts();
        } catch (err) {
            console.error('Error deleting product:', err);
            alert('ไม่สามารถลบสินค้าได้');
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            category: '',
            imageUrl: ''
        });
    };

    const handleSearch = () => {
        fetchProducts();
    };
    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">
                            <i className="bi bi-box-seam-fill"></i> จัดการสินค้า (Query Demo)
                        </h1>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                        >
                            <i className="bi bi-plus-circle"></i> เพิ่มสินค้า
                        </button>
                    </div>

                    {/* Query Mode Selector */}
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="bi bi-funnel-fill"></i> เลือก Query Demo:
                        </label>
                        <select
                            value={queryMode}
                            onChange={(e) => setQueryMode(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">ทั้งหมด - GET /products</option>
                            <option value="projection">Projection - เลือกคอลัมน์</option>
                            <option value="price-range">Price Range - กรองช่วงราคา</option>
                            <option value="stock-filter">Stock Filter - กรองสต็อก</option>
                            <option value="category">Category - กรองหมวดหมู่</option>
                            <option value="sort">Sorting - เรียงลำดับ</option>
                            <option value="search">Search - ค้นหาแบบรวม</option>
                        </select>
                    </div>

                    {/* Query Parameters */}
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                        {queryMode === 'price-range' && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    <i className="bi bi-cash-coin"></i> กรองช่วงราคา (min, max):
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        placeholder="ราคาต่ำสุด"
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        placeholder="ราคาสูงสุด"
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                                >
                                    กรอง
                                </button>
                            </div>
                        )}

                        {queryMode === 'stock-filter' && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    <i className="bi bi-boxes"></i> กรองสถานะสต็อก (inStock):
                                </label>
                                <select
                                    value={inStock}
                                    onChange={(e) => setInStock(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">-- เลือก --</option>
                                    <option value="true">มีสินค้า (stock &gt; 0)</option>
                                    <option value="false">สินค้าหมด (stock &lt;= 0)</option>
                                </select>
                                <button
                                    onClick={handleSearch}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                                >
                                    กรอง
                                </button>
                            </div>
                        )}

                        {queryMode === 'category' && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    <i className="bi bi-tag-fill"></i> กรองตามหมวดหมู่ (category):
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="ใส่ชื่อหมวดหมู่..."
                                        className="flex-1 px-3 py-2 border rounded-lg"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                                    >
                                        กรอง
                                    </button>
                                </div>
                            </div>
                        )}

                        {queryMode === 'sort' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <i className="bi bi-bar-chart-fill"></i> เรียงตาม (by):
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="id">ID</option>
                                        <option value="name">ชื่อสินค้า</option>
                                        <option value="price">ราคา</option>
                                        <option value="stock">จำนวนสต็อก</option>
                                        <option value="createdAt">วันที่สร้าง</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <i className="bi bi-arrow-down-up"></i> ทิศทาง (dir):
                                    </label>
                                    <select
                                        value={sortDir}
                                        onChange={(e) => setSortDir(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="asc">น้อย → มาก (asc)</option>
                                        <option value="desc">มาก → น้อย (desc)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {queryMode === 'search' && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        placeholder="ค้นหาชื่อสินค้า..."
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        placeholder="กรองหมวดหมู่..."
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                    <input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        placeholder="ราคาต่ำสุด"
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        placeholder="ราคาสูงสุด"
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <select
                                    value={inStock}
                                    onChange={(e) => setInStock(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">สถานะสต็อก: ทั้งหมด</option>
                                    <option value="true">มีสินค้า</option>
                                    <option value="false">สินค้าหมด</option>
                                </select>
                                <div className="grid grid-cols-2 gap-3">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-2 border rounded-lg"
                                    >
                                        <option value="name">เรียง: ชื่อ</option>
                                        <option value="price">เรียง: ราคา</option>
                                        <option value="stock">เรียง: สต็อก</option>
                                        <option value="createdAt">เรียง: วันที่</option>
                                    </select>
                                    <select
                                        value={sortDir}
                                        onChange={(e) => setSortDir(e.target.value)}
                                        className="px-3 py-2 border rounded-lg"
                                    >
                                        <option value="asc">น้อย → มาก</option>
                                        <option value="desc">มาก → น้อย</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleSearch}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                                >
                                    <i className="bi bi-search"></i> ค้นหา
                                </button>
                            </div>
                        )}

                        {queryMode === 'all' && (
                            <div className="text-center text-gray-500 py-2">
                                <i className="bi bi-list-ul"></i> แสดงข้อมูลทั้งหมด (สินค้าที่เปิดขาย)
                            </div>
                        )}

                        {queryMode === 'projection' && (
                            <div className="text-center text-gray-500 py-2">
                                <i className="bi bi-table"></i> แสดงเฉพาะ: ID, ชื่อสินค้า, ราคา, สต็อก
                            </div>
                        )}
                    </div>

                    {/* Loading & Error */}
                    {loading && (
                        <div className="text-center py-4">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                            <p className="mt-2 text-gray-600">กำลังโหลด...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            <i className="bi bi-exclamation-triangle-fill"></i> {error}
                        </div>
                    )}

                    {/* Table */}
                    {!loading && !error && (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-100 border-b-2 border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">ชื่อสินค้า</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">หมวดหมู่</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">ราคา</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">สต็อก</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">สถานะ</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {products.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                                    ไม่มีข้อมูล
                                                </td>
                                            </tr>
                                        ) : (
                                            products.map((product) => (
                                                <tr key={product.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{product.id}</td>
                                                    <td className="px-6 py-4 text-sm">{product.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{product.category || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                                        ฿{product.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{product.stock}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        {product.stock > 0 ? (
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                                <i className="bi bi-check-circle-fill"></i> มีสินค้า
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                                <i className="bi bi-x-circle-fill"></i> สินค้าหมด
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                        <button
                                                            onClick={() => handleEdit(product)}
                                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                                        >
                                                            <i className="bi bi-pencil-square"></i> แก้ไข
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <i className="bi bi-trash-fill"></i> ลบ
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Total Count */}
                            <div className="mt-4 text-sm text-gray-600">
                                จำนวนข้อมูล: <span className="font-bold">{products.length}</span> รายการ
                            </div>
                        </>
                    )}

                    {/* Form Modal */}
                    {showForm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                                <h2 className="text-2xl font-bold mb-4">
                                    {editingProduct ? (
                                        <><i className="bi bi-pencil-square"></i> แก้ไขสินค้า</>
                                    ) : (
                                        <><i className="bi bi-plus-circle"></i> เพิ่มสินค้า</>
                                    )}
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ราคา *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนสต็อก *</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                                        <input
                                            type="text"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">URL รูปภาพ</label>
                                        <input
                                            type="text"
                                            name="imageUrl"
                                            value={formData.imageUrl}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg disabled:bg-gray-400"
                                        >
                                            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelForm}
                                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                                        >
                                            ยกเลิก
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Products