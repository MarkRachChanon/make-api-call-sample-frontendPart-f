import React from 'react'

const Home = () => {
    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        ยินดีต้อนรับสู่ระบบจัดการข้อมูล
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Member API Management System
                    </p>

                    {/* Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                        {/* Members Card */}
                        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                            <div className="text-blue-600 text-5xl mb-4">
                                <i className="bi bi-people-fill"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                สมาชิก
                            </h3>
                            <p className="text-gray-600">
                                จัดการข้อมูลสมาชิกทั้งหมด
                            </p>
                        </div>

                        {/* Products Card */}
                        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                            <div className="text-green-600 text-5xl mb-4">
                                <i className="bi bi-box-seam-fill"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                สินค้า
                            </h3>
                            <p className="text-gray-600">
                                จัดการข้อมูลสินค้าทั้งหมด
                            </p>
                        </div>

                        {/* Orders Card */}
                        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                            <div className="text-orange-600 text-5xl mb-4">
                                <i className="bi bi-cart-fill"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                คำสั่งซื้อ
                            </h3>
                            <p className="text-gray-600">
                                จัดการคำสั่งซื้อทั้งหมด
                            </p>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="mt-12 bg-blue-50 p-6 rounded-lg">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                            <i className="bi bi-book-fill"></i>
                            คำแนะนำสำหรับนักศึกษา
                        </h2>
                        <div className="text-left max-w-2xl mx-auto">
                            <p className="text-gray-700 mb-2 flex items-center gap-2">
                                <i className="bi bi-check-circle-fill text-green-600"></i>
                                ระบบนี้ใช้ <strong>React + Vite</strong> ในการพัฒนา Frontend
                            </p>
                            <p className="text-gray-700 mb-2 flex items-center gap-2">
                                <i className="bi bi-check-circle-fill text-green-600"></i>
                                ใช้ <strong>Tailwind CSS</strong> สำหรับตกแต่ง UI
                            </p>
                            <p className="text-gray-700 mb-2 flex items-center gap-2">
                                <i className="bi bi-check-circle-fill text-green-600"></i>
                                ใช้ <strong>Axios</strong> ในการเรียก API
                            </p>
                            <p className="text-gray-700 mb-2 flex items-center gap-2">
                                <i className="bi bi-check-circle-fill text-green-600"></i>
                                ใช้ <strong>React Router</strong> ในการจัดการหน้า
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home