import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <>
            <nav className="bg-blue-600 text-white shadow-lg">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="text-xl font-bold flex items-center gap-2">
                            <i className="bi bi-database-fill"></i>
                            Member API System
                        </Link>

                        {/* Menu */}
                        <div className="flex space-x-4">
                            <Link
                                to="/"
                                className="px-3 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <i className="bi bi-house-fill"></i>
                                หน้าแรก
                            </Link>
                            <Link
                                to="/members"
                                className="px-3 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <i className="bi bi-people-fill"></i>
                                สมาชิก
                            </Link>
                            <Link
                                to="/products"
                                className="px-3 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <i className="bi bi-box-seam-fill"></i>
                                สินค้า
                            </Link>
                            <Link
                                to="/orders"
                                className="px-3 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <i className="bi bi-cart-fill"></i>
                                คำสั่งซื้อ
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Navbar