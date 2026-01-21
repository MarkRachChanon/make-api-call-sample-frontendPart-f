import React from 'react'
import { useState, useEffect } from 'react';
import api from '../services/api';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        imageUrl: ''
    });

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    // ดึงข้อมูลสินค้าทั้งหมด
    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/products');
            setProducts(response.data.data);
        } catch (err) {
            setError('ไม่สามารถดึงข้อมูลได้');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    // useEffect สำหรับดึงข้อมูลครั้งแรก
    useEffect(() => {
        fetchProducts();
    }, []);

    // จัดการ input ใน form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // เปิด form สำหรับเพิ่มข้อมูล
    const handleAdd = () => {
        setEditMode(false);
        setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            category: '',
            imageUrl: ''
        });
        setShowForm(true);
    };

    // เปิด form สำหรับแก้ไขข้อมูล
    const handleEdit = (product) => {
        setEditMode(true);
        setCurrentId(product.id);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stock: product.stock,
            category: product.category || '',
            imageUrl: product.imageUrl || ''
        });
        setShowForm(true);
    };

    // บันทึกข้อมูล (เพิ่มหรือแก้ไข)
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            if (editMode) {
                // แก้ไขข้อมูล
                await api.put(`/products/${currentId}`, formData);
                alert('แก้ไขข้อมูลสำเร็จ!');
            } else {
                // เพิ่มข้อมูลใหม่
                await api.post('/products', formData);
                alert('เพิ่มข้อมูลสำเร็จ!');
            }

            setShowForm(false);
            fetchProducts(); // ดึงข้อมูลใหม่
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
            console.error('Error saving product:', err);
        } finally {
            setLoading(false);
        }
    };

    // ลบข้อมูล
    const handleDelete = async (id) => {
        if (!confirm('คุณแน่ใจที่จะลบข้อมูลนี้?')) return;

        try {
            setLoading(true);
            await api.delete(`/products/${id}`);
            alert('ลบข้อมูลสำเร็จ!');
            fetchProducts();
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
            console.error('Error deleting product:', err);
        } finally {
            setLoading(false);
        }
    };

    // กรองข้อมูลตามการค้นหา
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                            <i className="bi bi-box-seam-fill text-green-600"></i>
                            จัดการข้อมูลสินค้า
                        </h1>
                        <button
                            onClick={handleAdd}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                            <i className="bi bi-plus-circle-fill"></i>
                            เพิ่มสินค้า
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <i className="bi bi-search absolute left-3 top-3 text-gray-400"></i>
                            <input
                                type="text"
                                placeholder="ค้นหาด้วยชื่อสินค้าหรือหมวดหมู่..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            <i className="bi bi-exclamation-triangle-fill mr-2"></i>
                            {error}
                        </div>
                    )}

                    {/* Table */}
                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ชื่อสินค้า
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            หมวดหมู่
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ราคา
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            สต็อก
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            จัดการ
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                <i className="bi bi-inbox text-4xl mb-2 block"></i>
                                                ไม่มีข้อมูล
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.category || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ฿{product.price.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.stock}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="text-green-600 hover:text-green-900 mr-3"
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
                    )}
                </div>

                {/* Modal Form */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                {editMode ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
                            </h2>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        ชื่อสินค้า <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        คำอธิบาย
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        ราคา <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        จำนวนสต็อก
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        หมวดหมู่
                                    </label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        URL รูปภาพ
                                    </label>
                                    <input
                                        type="text"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                                    >
                                        {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default Products