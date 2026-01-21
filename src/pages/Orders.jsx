import React from 'react'
import { useState, useEffect } from 'react';
import api from '../services/api';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);

    // Query Demo States
    const [queryMode, setQueryMode] = useState('all');
    const [status, setStatus] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('desc');
    const [searchKeyword, setSearchKeyword] = useState('');

    // Form States
    const [formData, setFormData] = useState({
        customerName: '',
        email: '',
        phone: '',
        totalAmount: ''
    });

    // ดึงข้อมูลตาม Query Mode
    const fetchOrders = async () => {
        setLoading(true);
        setError(null);

        try {
            let endpoint = '';

            switch (queryMode) {
                case 'all':
                    endpoint = '/orders';
                    break;

                case 'projection':
                    endpoint = '/orders/q/projection';
                    break;

                case 'status':
                    endpoint = `/orders/q/status?status=${status}`;
                    break;

                case 'amount-range':
                    endpoint = `/orders/q/amount-range?min=${minAmount}&max=${maxAmount}`;
                    break;

                case 'date-range':
                    endpoint = `/orders/q/date-range?startDate=${startDate}&endDate=${endDate}`;
                    break;

                case 'sort':
                    endpoint = `/orders/q/sort?by=${sortBy}&dir=${sortDir}`;
                    break;

                case 'search':
                    const params = new URLSearchParams();
                    if (searchKeyword) params.append('keyword', searchKeyword);
                    if (status) params.append('status', status);
                    if (minAmount) params.append('minAmount', minAmount);
                    if (maxAmount) params.append('maxAmount', maxAmount);
                    if (startDate) params.append('startDate', startDate);
                    if (endDate) params.append('endDate', endDate);
                    if (sortBy) params.append('sort', sortBy);
                    if (sortDir) params.append('order', sortDir);
                    endpoint = `/orders/search?${params.toString()}`;
                    break;

                default:
                    endpoint = '/orders';
            }

            const response = await api.get(endpoint);
            setOrders(response.data.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('ไม่สามารถดึงข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
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
                totalAmount: parseFloat(formData.totalAmount)
            };

            if (editingOrder) {
                await api.put(`/orders/${editingOrder.id}`, submitData);
                alert('แก้ไขคำสั่งซื้อสำเร็จ');
            } else {
                await api.post('/orders', submitData);
                alert('เพิ่มคำสั่งซื้อสำเร็จ');
            }

            setShowForm(false);
            setEditingOrder(null);
            setFormData({
                customerName: '',
                email: '',
                phone: '',
                totalAmount: ''
            });
            fetchOrders();
        } catch (err) {
            console.error('Error saving order:', err);
            alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (order) => {
        setEditingOrder(order);
        setFormData({
            customerName: order.customerName,
            email: order.email,
            phone: order.phone || '',
            totalAmount: order.totalAmount.toString(),
            status: order.status
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณต้องการลบคำสั่งซื้อนี้หรือไม่?')) return;

        try {
            await api.delete(`/orders/${id}`);
            alert('ลบคำสั่งซื้อสำเร็จ');
            fetchOrders();
        } catch (err) {
            console.error('Error deleting order:', err);
            alert('ไม่สามารถลบคำสั่งซื้อได้');
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingOrder(null);
        setFormData({
            customerName: '',
            email: '',
            phone: '',
            totalAmount: ''
        });
    };

    const handleSearch = () => {
        fetchOrders();
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                icon: 'bi-hourglass-split',
                label: 'รอดำเนินการ'
            },
            completed: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                icon: 'bi-check-circle-fill',
                label: 'สำเร็จ'
            },
            cancelled: {
                bg: 'bg-red-100',
                text: 'text-red-800',
                icon: 'bi-x-circle-fill',
                label: 'ยกเลิก'
            }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
                <i className={`bi ${config.icon}`}></i> {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">
                            <i className="bi bi-cart-fill"></i> จัดการคำสั่งซื้อ (Query Demo)
                        </h1>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                        >
                            <i className="bi bi-plus-circle"></i> เพิ่มคำสั่งซื้อ
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">ทั้งหมด - GET /orders</option>
                            <option value="projection">Projection - เลือกคอลัมน์</option>
                            <option value="status">Status - กรองตามสถานะ</option>
                            <option value="amount-range">Amount Range - กรองยอดเงิน</option>
                            <option value="date-range">Date Range - กรองวันที่</option>
                            <option value="sort">Sorting - เรียงลำดับ</option>
                            <option value="search">Search - ค้นหาแบบรวม</option>
                        </select>
                    </div>

                    {/* Query Parameters */}
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6">
                        {queryMode === 'status' && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    <i className="bi bi-bookmark-fill"></i> กรองตามสถานะ (status):
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">-- เลือกสถานะ --</option>
                                    <option value="pending">รอดำเนินการ</option>
                                    <option value="completed">สำเร็จ</option>
                                    <option value="cancelled">ยกเลิก</option>
                                </select>
                                <button
                                    onClick={handleSearch}
                                    className="w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg"
                                >
                                    กรอง
                                </button>
                            </div>
                        )}

                        {queryMode === 'amount-range' && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    <i className="bi bi-cash-coin"></i> กรองช่วงยอดเงิน (min, max):
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        value={minAmount}
                                        onChange={(e) => setMinAmount(e.target.value)}
                                        placeholder="ยอดต่ำสุด"
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                    <input
                                        type="number"
                                        value={maxAmount}
                                        onChange={(e) => setMaxAmount(e.target.value)}
                                        placeholder="ยอดสูงสุด"
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    className="w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg"
                                >
                                    กรอง
                                </button>
                            </div>
                        )}

                        {queryMode === 'date-range' && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    <i className="bi bi-calendar-range-fill"></i> กรองช่วงวันที่ (startDate, endDate):
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    className="w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg"
                                >
                                    กรอง
                                </button>
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
                                        <option value="orderNumber">เลขที่คำสั่งซื้อ</option>
                                        <option value="customerName">ชื่อลูกค้า</option>
                                        <option value="totalAmount">ยอดเงิน</option>
                                        <option value="orderDate">วันที่สั่ง</option>
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
                                        placeholder="ค้นหาชื่อลูกค้าหรือเลขที่..."
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="px-3 py-2 border rounded-lg"
                                    >
                                        <option value="">สถานะ: ทั้งหมด</option>
                                        <option value="pending">รอดำเนินการ</option>
                                        <option value="completed">สำเร็จ</option>
                                        <option value="cancelled">ยกเลิก</option>
                                    </select>
                                    <input
                                        type="number"
                                        value={minAmount}
                                        onChange={(e) => setMinAmount(e.target.value)}
                                        placeholder="ยอดเงินต่ำสุด"
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                    <input
                                        type="number"
                                        value={maxAmount}
                                        onChange={(e) => setMaxAmount(e.target.value)}
                                        placeholder="ยอดเงินสูงสุด"
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        placeholder="วันที่เริ่มต้น"
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        placeholder="วันที่สิ้นสุด"
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-2 border rounded-lg"
                                    >
                                        <option value="orderDate">เรียง: วันที่</option>
                                        <option value="orderNumber">เรียง: เลขที่</option>
                                        <option value="customerName">เรียง: ชื่อ</option>
                                        <option value="totalAmount">เรียง: ยอดเงิน</option>
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
                                    className="w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg"
                                >
                                    <i className="bi bi-search"></i> ค้นหา
                                </button>
                            </div>
                        )}

                        {queryMode === 'all' && (
                            <div className="text-center text-gray-500 py-2">
                                <i className="bi bi-list-ul"></i> แสดงข้อมูลทั้งหมด (เรียงตามวันที่ล่าสุด)
                            </div>
                        )}

                        {queryMode === 'projection' && (
                            <div className="text-center text-gray-500 py-2">
                                <i className="bi bi-table"></i> แสดงเฉพาะ: ID, เลขที่, ชื่อลูกค้า, ยอดเงิน, สถานะ
                            </div>
                        )}
                    </div>

                    {/* Loading & Error */}
                    {loading && (
                        <div className="text-center py-4">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">เลขที่</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">ชื่อลูกค้า</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">อีเมล</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">ยอดเงิน</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">สถานะ</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">วันที่</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {orders.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                                    ไม่มีข้อมูล
                                                </td>
                                            </tr>
                                        ) : (
                                            orders.map((order) => (
                                                <tr key={order.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{order.orderNumber}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.customerName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">
                                                        ฿{order.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        {getStatusBadge(order.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(order.orderDate)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                        <button
                                                            onClick={() => handleEdit(order)}
                                                            className="text-blue-600 hover:text-blue-900 mr-4"
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

                            {/* Total Count */}
                            <div className="mt-4 text-sm text-gray-600">
                                จำนวนข้อมูล: <span className="font-bold">{orders.length}</span> รายการ
                            </div>
                        </>
                    )}

                    {/* Form Modal */}
                    {showForm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                                <h2 className="text-2xl font-bold mb-4">
                                    {editingOrder ? (
                                        <><i className="bi bi-pencil-square"></i> แก้ไขคำสั่งซื้อ</>
                                    ) : (
                                        <><i className="bi bi-plus-circle"></i> เพิ่มคำสั่งซื้อ</>
                                    )}
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อลูกค้า *</label>
                                        <input
                                            type="text"
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ยอดเงิน *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="totalAmount"
                                            value={formData.totalAmount}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    {editingOrder && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="pending">รอดำเนินการ</option>
                                                <option value="completed">สำเร็จ</option>
                                                <option value="cancelled">ยกเลิก</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg disabled:bg-gray-400"
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

export default Orders