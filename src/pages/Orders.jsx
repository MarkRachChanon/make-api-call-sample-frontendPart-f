import React from 'react'
import { useState, useEffect } from 'react';
import api from '../services/api';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        customerName: '',
        email: '',
        phone: '',
        totalAmount: '',
        status: 'pending'
    });

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // ดึงข้อมูลคำสั่งซื้อทั้งหมด
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/orders');
            setOrders(response.data.data);
        } catch (err) {
            setError('ไม่สามารถดึงข้อมูลได้');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    // useEffect สำหรับดึงข้อมูลครั้งแรก
    useEffect(() => {
        fetchOrders();
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
            customerName: '',
            email: '',
            phone: '',
            totalAmount: '',
            status: 'pending'
        });
        setShowForm(true);
    };

    // เปิด form สำหรับแก้ไขข้อมูล
    const handleEdit = (order) => {
        setEditMode(true);
        setCurrentId(order.id);
        setFormData({
            customerName: order.customerName,
            email: order.email,
            phone: order.phone || '',
            totalAmount: order.totalAmount,
            status: order.status
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
                await api.put(`/orders/${currentId}`, formData);
                alert('แก้ไขข้อมูลสำเร็จ!');
            } else {
                // เพิ่มข้อมูลใหม่
                await api.post('/orders', formData);
                alert('เพิ่มข้อมูลสำเร็จ!');
            }

            setShowForm(false);
            fetchOrders(); // ดึงข้อมูลใหม่
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
            console.error('Error saving order:', err);
        } finally {
            setLoading(false);
        }
    };

    // ลบข้อมูล
    const handleDelete = async (id) => {
        if (!confirm('คุณแน่ใจที่จะลบข้อมูลนี้?')) return;

        try {
            setLoading(true);
            await api.delete(`/orders/${id}`);
            alert('ลบข้อมูลสำเร็จ!');
            fetchOrders();
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
            console.error('Error deleting order:', err);
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันแสดงสถานะ
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'รอดำเนินการ' },
            completed: { color: 'bg-green-100 text-green-800', text: 'สำเร็จ' },
            cancelled: { color: 'bg-red-100 text-red-800', text: 'ยกเลิก' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                {config.text}
            </span>
        );
    };

    // กรองข้อมูลตามการค้นหาและสถานะ
    const filteredOrders = orders.filter(order => {
        const matchSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || order.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                            <i className="bi bi-cart-fill text-orange-600"></i>
                            จัดการคำสั่งซื้อ
                        </h1>
                        <button
                            onClick={handleAdd}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
                        >
                            <i className="bi bi-plus-circle-fill"></i>
                            เพิ่มคำสั่งซื้อ
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <i className="bi bi-search absolute left-3 top-3 text-gray-400"></i>
                            <input
                                type="text"
                                placeholder="ค้นหาด้วยชื่อลูกค้าหรือเลขที่คำสั่งซื้อ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="all">ทุกสถานะ</option>
                                <option value="pending">รอดำเนินการ</option>
                                <option value="completed">สำเร็จ</option>
                                <option value="cancelled">ยกเลิก</option>
                            </select>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
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
                                            เลขที่
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ชื่อลูกค้า
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            อีเมล
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ยอดรวม
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            สถานะ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            จัดการ
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                <i className="bi bi-inbox text-4xl mb-2 block"></i>
                                                ไม่มีข้อมูล
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {order.orderNumber}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {order.customerName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {order.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ฿{order.totalAmount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {getStatusBadge(order.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEdit(order)}
                                                        className="text-orange-600 hover:text-orange-900 mr-3"
                                                    >
                                                        <i className="bi bi-pencil-square"></i> แก้ไข
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(order.id)}
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
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                {editMode ? 'แก้ไขคำสั่งซื้อ' : 'เพิ่มคำสั่งซื้อใหม่'}
                            </h2>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        ชื่อลูกค้า <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        อีเมล <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        เบอร์โทร
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        ยอดรวม <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="totalAmount"
                                        value={formData.totalAmount}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                {editMode && (
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            สถานะ
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option value="pending">รอดำเนินการ</option>
                                            <option value="completed">สำเร็จ</option>
                                            <option value="cancelled">ยกเลิก</option>
                                        </select>
                                    </div>
                                )}

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
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400"
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

export default Orders