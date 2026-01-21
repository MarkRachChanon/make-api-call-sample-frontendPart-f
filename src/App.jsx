import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Members from './pages/Members';
import Products from './pages/Products';
import Orders from './pages/Orders';

const App = () => {
  return (
    <>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-100">
          <Navbar />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/members" element={<Members />} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<Orders />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </>
  )
}

export default App