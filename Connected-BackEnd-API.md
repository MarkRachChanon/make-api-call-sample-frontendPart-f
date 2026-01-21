# Part 2: เชื่อมต่อกับ Backend API

เอกสารนี้สำหรับครูผู้สอนในการสอนนักศึกษาเชื่อมต่อ Frontend กับ Backend API

---

## เนื้อหาที่จะสอน

1. การเชื่อมต่อ API ด้วย Axios
2. การจัดการ State ด้วย useState และ useEffect
3. CRUD Operations ทั้ง 3 Resources (Members, Products, Orders)
4. การจัดการ Form และ Modal
5. การค้นหาและกรองข้อมูล

---

## ก่อนเริ่มสอน

### ✅ ตรวจสอบว่า Backend ทำงาน

```bash
# Terminal 1: รัน Backend
cd member-api
npm start
```

**ต้องเห็นข้อความ:**
```
==================================================
🚀 Server: http://localhost:4000
📚 API Docs: http://localhost:4000/api-docs
👥 Members API: http://localhost:4000/members
📦 Products API: http://localhost:4000/products
🛒 Orders API: http://localhost:4000/orders
==================================================
```

### ✅ ตรวจสอบว่า CORS ติดตั้งแล้ว

ตรวจสอบไฟล์ `member-api/package.json` ต้องมี:

```json
{
  "dependencies": {
    "cors": "^2.8.5"
  }
}
```

ถ้ายังไม่มี:
```bash
cd member-api
npm install cors
```

### ✅ ตรวจสอบ CORS Config ใน Backend

ไฟล์ `member-api/src/index.js` ต้องมี:

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

---

## หัวข้อที่ 1: หน้า Members (CRUD สมาชิก)

### วัตถุประสงค์การเรียนรู้

1. ใช้ `useState` จัดการข้อมูลและ Form
2. ใช้ `useEffect` ดึงข้อมูลครั้งแรก
3. เรียก API ด้วย `axios`
4. แสดงข้อมูลในตาราง
5. เพิ่ม/แก้ไข/ลบข้อมูล

---

### ไฟล์: `src/pages/Members.jsx`

```jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

function Members() {
  // ========== STATE MANAGEMENT ==========
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // ========== API FUNCTIONS ==========
  
  // ฟังก์ชันดึงข้อมูลสมาชิกทั้งหมด
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/members');
      setMembers(response.data.data);
    } catch (err) {
      setError('ไม่สามารถดึงข้อมูลได้');
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลครั้งแรกเมื่อ component โหลด
  useEffect(() => {
    fetchMembers();
  }, []);

  // ========== FORM HANDLERS ==========
  
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
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: ''
    });
    setShowForm(true);
  };

  // เปิด form สำหรับแก้ไขข้อมูล
  const handleEdit = (member) => {
    setEditMode(true);
    setCurrentId(member.id);
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone || '',
      address: member.address || ''
    });
    setShowForm(true);
  };

  // ========== CRUD OPERATIONS ==========
  
  // บันทึกข้อมูล (เพิ่มหรือแก้ไข)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      if (editMode) {
        // PUT: แก้ไขข้อมูล
        await api.put(`/members/${currentId}`, formData);
        alert('แก้ไขข้อมูลสำเร็จ!');
      } else {
        // POST: เพิ่มข้อมูลใหม่
        await api.post('/members', formData);
        alert('เพิ่มข้อมูลสำเร็จ!');
      }
      
      setShowForm(false);
      fetchMembers(); // รีเฟรชข้อมูล
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
      console.error('Error saving member:', err);
    } finally {
      setLoading(false);
    }
  };

  // ลบข้อมูล
  const handleDelete = async (id) => {
    if (!confirm('คุณแน่ใจที่จะลบข้อมูลนี้?')) return;
    
    try {
      setLoading(true);
      // DELETE: ลบข้อมูล
      await api.delete(`/members/${id}`);
      alert('ลบข้อมูลสำเร็จ!');
      fetchMembers(); // รีเฟรชข้อมูล
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
      console.error('Error deleting member:', err);
    } finally {
      setLoading(false);
    }
  };

  // ========== FILTER & SEARCH ==========
  
  // กรองข้อมูลตามการค้นหา
  const filteredMembers = members.filter(member =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ========== RENDER ==========
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <i className="bi bi-people-fill text-blue-600"></i>
            จัดการข้อมูลสมาชิก
          </h1>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <i className="bi bi-plus-circle-fill"></i>
            เพิ่มสมาชิก
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-3 text-gray-400"></i>
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อ, นามสกุล หรืออีเมล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                    ชื่อ-นามสกุล
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    อีเมล
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    เบอร์โทร
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      <i className="bi bi-inbox text-4xl mb-2 block"></i>
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
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
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editMode ? 'แก้ไขสมาชิก' : 'เพิ่มสมาชิกใหม่'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  ชื่อ <span className="text-red-500">*</span>
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

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  นามสกุล <span className="text-red-500">*</span>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;
```

---

## คำอธิบายโค้ด Members

### 1. State Management

```javascript
// ข้อมูลที่ดึงมาจาก API
const [members, setMembers] = useState([]);

// สถานะการโหลด
const [loading, setLoading] = useState(false);

// ข้อความ Error
const [error, setError] = useState(null);

// ควบคุม Form
const [showForm, setShowForm] = useState(false);
const [editMode, setEditMode] = useState(false);
const [currentId, setCurrentId] = useState(null);

// ข้อมูลใน Form
const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: ''
});
```

### 2. useEffect - ดึงข้อมูลครั้งแรก

```javascript
useEffect(() => {
  fetchMembers();
}, []); // [] = ทำงานครั้งเดียวตอน component โหลด
```

### 3. API Calls

**GET - ดึงข้อมูล:**
```javascript
const response = await api.get('/members');
setMembers(response.data.data);
```

**POST - เพิ่มข้อมูล:**
```javascript
await api.post('/members', formData);
```

**PUT - แก้ไขข้อมูล:**
```javascript
await api.put(`/members/${currentId}`, formData);
```

**DELETE - ลบข้อมูล:**
```javascript
await api.delete(`/members/${id}`);
```

### 4. Error Handling

```javascript
try {
  // ทำงาน API
} catch (err) {
  // จัดการ Error
  setError('ไม่สามารถดึงข้อมูลได้');
  console.error('Error:', err);
} finally {
  // ทำงานเสมอ
  setLoading(false);
}
```

---

## หัวข้อที่ 2: หน้า Products (CRUD สินค้า)

### ความแตกต่างจาก Members

1. **มี stock (จำนวนสต็อก)** - ต้องแปลงเป็น Integer
2. **มี price (ราคา)** - ต้องแปลงเป็น Float
3. **มีการแสดงราคาด้วย `toLocaleString()`**

### ไฟล์: `src/pages/Products.jsx`

```jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '0',  // ⬅️ ค่าเริ่มต้น '0'
    category: '',
    imageUrl: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  // ดึงข้อมูลสินค้า
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdd = () => {
    setEditMode(false);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '0',  // ⬅️ Reset เป็น '0'
      category: '',
      imageUrl: ''
    });
    setShowForm(true);
  };

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

  // ⬇️ สำคัญ: แปลง stock เป็น Int, price เป็น Float
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // เตรียมข้อมูลก่อนส่ง
      const dataToSend = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),  // ⬅️ แปลงเป็น Float
        stock: formData.stock ? parseInt(formData.stock) : 0,  // ⬅️ แปลงเป็น Int
        category: formData.category || null,
        imageUrl: formData.imageUrl || null
      };
      
      if (editMode) {
        await api.put(`/products/${currentId}`, dataToSend);
        alert('แก้ไขข้อมูลสำเร็จ!');
      } else {
        await api.post('/products', dataToSend);
        alert('เพิ่มข้อมูลสำเร็จ!');
      }
      
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
      console.error('Error saving product:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
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
                  placeholder="0"
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
  );
}

export default Products;
```

---

## คำอธิบายโค้ด Products

### จุดสำคัญที่ต่างจาก Members

#### 1. การแปลงข้อมูลก่อนส่ง API

```javascript
const dataToSend = {
  name: formData.name,
  description: formData.description || null,
  price: parseFloat(formData.price),  // ⬅️ แปลง String เป็น Float
  stock: formData.stock ? parseInt(formData.stock) : 0,  // ⬅️ แปลง String เป็น Int
  category: formData.category || null,
  imageUrl: formData.imageUrl || null
};
```

**ทำไมต้องแปลง?**
- Form input ส่งออกมาเป็น **String** เสมอ
- Backend (Prisma) ต้องการ **Float** สำหรับ price
- Backend (Prisma) ต้องการ **Int** สำหรับ stock

#### 2. การแสดงราคา

```javascript
฿{product.price.toLocaleString()}
```

**ผลลัพธ์:**
- `1500` → `฿1,500`
- `12000` → `฿12,000`

---

## หัวข้อที่ 3: หน้า Orders (CRUD คำสั่งซื้อ)

### ความพิเศษของ Orders

1. **Status Badge** - แสดงสถานะด้วยสีต่างกัน
2. **Filter ตามสถานะ** - Dropdown กรองสถานะ
3. **Order Number** - สร้างอัตโนมัติโดย Backend

### จุดเด่น: ฟังก์ชัน Status Badge

```javascript
const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { 
      color: 'bg-yellow-100 text-yellow-800', 
      text: 'รอดำเนินการ' 
    },
    completed: { 
      color: 'bg-green-100 text-green-800', 
      text: 'สำเร็จ' 
    },
    cancelled: { 
      color: 'bg-red-100 text-red-800', 
      text: 'ยกเลิก' 
    }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      {config.text}
    </span>
  );
};
```

**ผลลัพธ์:**
- `pending` → 🟡 รอดำเนินการ (สีเหลือง)
- `completed` → 🟢 สำเร็จ (สีเขียว)
- `cancelled` → 🔴 ยกเลิก (สีแดง)

### จุดเด่น: Filter ตามสถานะ

```javascript
// State สำหรับเก็บสถานะที่เลือก
const [filterStatus, setFilterStatus] = useState('all');

// กรองข้อมูล
const filteredOrders = orders.filter(order => {
  const matchSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
  const matchStatus = filterStatus === 'all' || order.status === filterStatus;
  return matchSearch && matchStatus;
});
```

---

## สรุป CRUD Operations

### HTTP Methods

| Method | ใช้สำหรับ | Axios Code |
|--------|----------|-----------|
| **GET** | ดึงข้อมูล | `api.get('/members')` |
| **POST** | เพิ่มข้อมูล | `api.post('/members', data)` |
| **PUT** | แก้ไขข้อมูล | `api.put('/members/1', data)` |
| **DELETE** | ลบข้อมูล | `api.delete('/members/1')` |

---

## ปัญหาที่อาจเจอและวิธีแก้

### 1. ERR_CONNECTION_REFUSED

**สาเหตุ:** Backend ไม่ทำงาน

**วิธีแก้:**
```bash
cd member-api
npm start
```

---

### 2. CORS Error

**สาเหตุ:** ไม่มี CORS หรือ CORS ไม่ถูกต้อง

**วิธีแก้:**
```bash
npm install cors
```

แก้ไข `src/index.js`:
```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

---

### 3. Error 500 - Products (Invalid stock)

**สาเหตุ:** ส่ง stock เป็น String แทน Int

**วิธีแก้:**

**Frontend:**
```javascript
stock: formData.stock ? parseInt(formData.stock) : 0
```

**Backend:**
```javascript
stock: stock ? parseInt(stock, 10) : 0
```

---

## แบบฝึกหัดสำหรับนักศึกษา

### ระดับพื้นฐาน

1. เพิ่มข้อมูลสมาชิก 3 คน
2. แก้ไขอีเมลของสมาชิก
3. ลบสมาชิกที่ไม่ต้องการ
4. ค้นหาสมาชิกด้วยชื่อ

### ระดับกลาง

1. เพิ่มสินค้า 5 รายการ พร้อมราคาและสต็อก
2. ใช้ฟังก์ชันค้นหาสินค้าตามหมวดหมู่
3. แก้ไขราคาสินค้า
4. สร้างคำสั่งซื้อและเปลี่ยนสถานะ

### ระดับสูง

1. เพิ่ม Pagination (แบ่งหน้า)
2. เพิ่มการ Sort (เรียงลำดับ)
3. เพิ่มการ Export ข้อมูล
4. ปรับปรุง UI ให้สวยงาม

---

## เอกสารอ้างอิง

- [React Hooks](https://react.dev/reference/react)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Bootstrap Icons](https://icons.getbootstrap.com/)

---

## สรุป Part 2

✅ **สิ่งที่เรียนรู้:**
1. การใช้ `useState` และ `useEffect`
2. การเรียก API ด้วย Axios (GET, POST, PUT, DELETE)
3. การจัดการ Form และ Validation
4. การค้นหาและกรองข้อมูล
5. การแสดงข้อมูลในตาราง
6. การจัดการ Error และ Loading

✅ **ทักษะที่ได้:**
- Full-stack Development (Frontend + Backend)
- RESTful API Integration
- State Management
- CRUD Operations
- UI/UX Design

---

## ขั้นตอนต่อไป

1. Deploy Backend ไปยัง Server
2. Deploy Frontend ไปยัง Hosting
3. เพิ่ม Authentication (Login/Register)
4. เพิ่ม Authorization (สิทธิ์การใช้งาน)
5. เพิ่ม File Upload
6. เพิ่ม Real-time Updates

---

**จบ Part 2** 🎉

ขอบคุณที่ติดตามครับ!