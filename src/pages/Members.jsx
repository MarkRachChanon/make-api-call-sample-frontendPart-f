import React from 'react'
import { useState, useEffect } from 'react';
import api from '../services/api';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    // Query Demo States
    const [queryMode, setQueryMode] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [emailDomain, setEmailDomain] = useState('');
    const [phonePrefix, setPhonePrefix] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('asc');

    // Form States
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: ''
    });

    // ดึงข้อมูลตาม Query Mode
    const fetchMembers = async () => {
        setLoading(true);
        setError(null);

        try {
            let endpoint = '';

            switch (queryMode) {
                case 'all':
                    endpoint = '/members';
                    break;

                case 'projection':
                    endpoint = '/members/q/projection';
                    break;

                case 'name-search':
                    endpoint = `/members/q/name-search?keyword=${searchKeyword}`;
                    break;

                case 'email-filter':
                    endpoint = `/members/q/email-filter?domain=${emailDomain}`;
                    break;

                case 'phone-filter':
                    endpoint = `/members/q/phone-filter?prefix=${phonePrefix}`;
                    break;

                case 'sort':
                    endpoint = `/members/q/sort?by=${sortBy}&dir=${sortDir}`;
                    break;

                case 'search':
                    const params = new URLSearchParams();
                    if (searchKeyword) params.append('keyword', searchKeyword);
                    if (emailDomain) params.append('email', emailDomain);
                    if (phonePrefix) params.append('phone', phonePrefix);
                    if (sortBy) params.append('sort', sortBy);
                    if (sortDir) params.append('order', sortDir);
                    endpoint = `/members/search?${params.toString()}`;
                    break;

                default:
                    endpoint = '/members';
            }

            const response = await api.get(endpoint);
            setMembers(response.data.data);
        } catch (err) {
            console.error('Error fetching members:', err);
            setError('ไม่สามารถดึงข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
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
            if (editingMember) {
                await api.put(`/members/${editingMember.id}`, formData);
                alert('แก้ไขสมาชิกสำเร็จ');
            } else {
                await api.post('/members', formData);
                alert('เพิ่มสมาชิกสำเร็จ');
            }

            setShowForm(false);
            setEditingMember(null);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: ''
            });
            fetchMembers();
        } catch (err) {
            console.error('Error saving member:', err);
            alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (member) => {
        setEditingMember(member);
        setFormData({
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            phone: member.phone || '',
            address: member.address || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณต้องการลบสมาชิกนี้หรือไม่?')) return;

        try {
            await api.delete(`/members/${id}`);
            alert('ลบสมาชิกสำเร็จ');
            fetchMembers();
        } catch (err) {
            console.error('Error deleting member:', err);
            alert('ไม่สามารถลบสมาชิกได้');
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingMember(null);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: ''
        });
    };

    const handleSearch = () => {
        fetchMembers();
    };
    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">
                            <i className="bi bi-people-fill"></i> จัดการสมาชิก (Query Demo)
                        </h1>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                        >
                            <i className="bi bi-plus-circle"></i> เพิ่มสมาชิก
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">ทั้งหมด - GET /members</option>
                            <option value="projection">Projection - เลือกคอลัมน์</option>
                            <option value="name-search">Name Search - ค้นหาชื่อ</option>
                            <option value="email-filter">Email Filter - กรองอีเมล</option>
                            <option value="phone-filter">Phone Filter - กรองเบอร์</option>
                            <option value="sort">Sorting - เรียงลำดับ</option>
                            <option value="search">Search - ค้นหาแบบรวม</option>
                        </select>
                    </div>

                    {/* Query Parameters */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                        {queryMode === 'name-search' && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    <i className="bi bi-search"></i> ค้นหาชื่อหรือนามสกุล (keyword):
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="ใส่คำค้นหา..."
                                        className="flex-1 px-3 py-2 border rounded-lg"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                                    >
                                        ค้นหา
                                    </button>
                                </div>
                            </div>
                        )}

                        {queryMode === 'email-filter' && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    <i className="bi bi-envelope-fill"></i> กรองตาม Domain (domain):
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={emailDomain}
                                        onChange={(e) => setEmailDomain(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="เช่น gmail, yahoo..."
                                        className="flex-1 px-3 py-2 border rounded-lg"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                                    >
                                        กรอง
                                    </button>
                                </div>
                            </div>
                        )}

                        {queryMode === 'phone-filter' && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    <i className="bi bi-phone-fill"></i> กรองตาม Prefix (prefix):
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={phonePrefix}
                                        onChange={(e) => setPhonePrefix(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="เช่น 081, 089..."
                                        className="flex-1 px-3 py-2 border rounded-lg"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
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
                                        <option value="firstName">ชื่อ</option>
                                        <option value="lastName">นามสกุล</option>
                                        <option value="email">อีเมล</option>
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        placeholder="ค้นหาชื่อ..."
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        value={emailDomain}
                                        onChange={(e) => setEmailDomain(e.target.value)}
                                        placeholder="กรองอีเมล..."
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        value={phonePrefix}
                                        onChange={(e) => setPhonePrefix(e.target.value)}
                                        placeholder="กรองเบอร์..."
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-2 border rounded-lg"
                                    >
                                        <option value="firstName">เรียง: ชื่อ</option>
                                        <option value="lastName">เรียง: นามสกุล</option>
                                        <option value="email">เรียง: อีเมล</option>
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
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                                >
                                    <i className="bi bi-search"></i> ค้นหา
                                </button>
                            </div>
                        )}

                        {queryMode === 'all' && (
                            <div className="text-center text-gray-500 py-2">
                                <i className="bi bi-list-ul"></i> แสดงข้อมูลทั้งหมด (ไม่มีการกรอง)
                            </div>
                        )}

                        {queryMode === 'projection' && (
                            <div className="text-center text-gray-500 py-2">
                                <i className="bi bi-table"></i> แสดงเฉพาะ: ID, ชื่อ, นามสกุล, อีเมล
                            </div>
                        )}
                    </div>

                    {/* Loading & Error */}
                    {loading && (
                        <div className="text-center py-4">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                ชื่อ-นามสกุล
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                อีเมล
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                เบอร์โทร
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                ที่อยู่
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                จัดการ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {members.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                    ไม่มีข้อมูล
                                                </td>
                                            </tr>
                                        ) : (
                                            members.map((member) => (
                                                <tr key={member.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {member.id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {member.firstName} {member.lastName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {member.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {member.phone || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {member.address || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                        <button
                                                            onClick={() => handleEdit(member)}
                                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                                        >
                                                            <i className="bi bi-pencil-square"></i> แก้ไข
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(member.id)}
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
                                จำนวนข้อมูล: <span className="font-bold">{members.length}</span> รายการ
                            </div>
                        </>
                    )}

                    {/* Form Modal */}
                    {showForm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                                <h2 className="text-2xl font-bold mb-4">
                                    {editingMember ? (
                                        <><i className="bi bi-pencil-square"></i> แก้ไขสมาชิก</>
                                    ) : (
                                        <><i className="bi bi-plus-circle"></i> เพิ่มสมาชิก</>
                                    )}
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ชื่อ *
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            นามสกุล *
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            อีเมล *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            เบอร์โทร
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ที่อยู่
                                        </label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg disabled:bg-gray-400"
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

export default Members