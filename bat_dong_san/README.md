# 🚀 HƯỚNG DẪN CHẠY CODE - WEBSITE RAO VẶT BẤT ĐỘNG SẢN

## 📋 **YÊU CẦU HỆ THỐNG**

### **Phần mềm cần thiết**

- **Node.js**: Phiên bản 16.0 trở lên
- **MongoDB**: Phiên bản 5.0 trở lên
- **Git**: Để clone source code
- **Code Editor**: VS Code (khuyến nghị)

### **Kiểm tra phiên bản**

```bash
node --version          # Kiểm tra Node.js
npm --version           # Kiểm tra npm
mongod --version        # Kiểm tra MongoDB
git --version           # Kiểm tra Git
```

## 🔧 **BƯỚC 1: CÀI ĐẶT THƯ VIỆN**

### **Cài đặt dependencies**

```bash
# Cài đặt tất cả thư viện cần thiết
npm install

# Quá trình này sẽ:
# - Tạo thư mục node_modules/
# - Tải về tất cả thư viện trong package.json
# - Có thể mất 2-5 phút tùy tốc độ mạng
```

## ⚙️ **BƯỚC 2: CẤU HÌNH BIẾN MÔI TRƯỜNG**

### **Nội dung file .env**

```env
# Cấu hình cơ bản
NODE_ENV=development
PORT=3000

# Cơ sở dữ liệu
MONGODB_URI=mongodb://localhost:27017/bat_dong_san

# Bảo mật
SESSION_SECRET=your-super-secret-key-here-change-this-in-production

# Tùy chọn (có thể để trống)
MONGODB_TEST_URI=mongodb://localhost:27017/bat_dong_san_test
```

### **Lưu ý quan trọng**

- **Thay đổi SESSION_SECRET**: Sử dụng chuỗi ngẫu nhiên dài
- **Không commit file .env**: File này chứa thông tin nhạy cảm
- **Kiểm tra .gitignore**: Đảm bảo .env đã được ignore

## 🌱 **BƯỚC 3: TẠO DỮ LIỆU MẪU**

### **Chạy seeder**

```bash
# Tạo dữ liệu mẫu cho database
npm run seed

# Lệnh này sẽ:
# - Tạo các collection cần thiết
# - Thêm dữ liệu mẫu cho categories
# - Tạo một số user và post mẫu
```

## 🚀 **BƯỚC 6: CHẠY ỨNG DỤNG**

### **Chế độ phát triển**

```bash
# Chạy với nodemon (tự động restart khi có thay đổi)
npm run dev

# Hoặc chạy trực tiếp
npm start
```

### **Kiểm tra ứng dụng đã chạy**

```bash
# Bạn sẽ thấy thông báo:
# 🚀 Server is running on http://localhost:3000
# ✅ MongoDB connected: localhost
# 📊 Database: bat_dong_san
# 🌍 Environment: development
```

### **Mở trình duyệt**

```
# Truy cập các URL sau:
http://localhost:3000                    # Trang chủ
http://localhost:3000/login             # Đăng nhập
http://localhost:3000/register          # Đăng ký
http://localhost:3000/admin             # Quản trị (cần đăng nhập admin)
http://localhost:3000/test-db           # Kiểm tra database
```

## 🔍 **BƯỚC 7: KIỂM TRA CHỨC NĂNG**

### **Kiểm tra trang chủ**

- ✅ Trang chủ hiển thị đúng
- ✅ Navigation bar hoạt động
- ✅ Tin đăng mẫu hiển thị
- ✅ Form tìm kiếm hoạt động

### **Kiểm tra đăng ký/đăng nhập**

```bash
# Tạo tài khoản mới
1. Vào http://localhost:3000/register
2. Điền thông tin đăng ký
3. Kiểm tra đăng ký thành công

# Đăng nhập
1. Vào http://localhost:3000/login
2. Sử dụng tài khoản vừa tạo
3. Kiểm tra đăng nhập thành công
```

### **Kiểm tra admin panel**

```bash
# Đăng nhập admin
1. Sử dụng tài khoản admin đã tạo
2. Vào http://localhost:3000/admin
3. Kiểm tra dashboard hiển thị
4. Kiểm tra các chức năng quản lý
```

### **Kiểm tra tạo tin đăng**

```bash
# Tạo tin đăng mới
1. Đăng nhập với tài khoản user
2. Vào "Đăng tin"
3. Điền form và upload ảnh
4. Kiểm tra tin đăng được tạo
```

## 🎉 **CHÚC MỪNG!**

Nếu bạn đã hoàn thành tất cả các bước trên, website đã sẵn sàng để sử dụng!

**Các tính năng chính:**

- ✅ Đăng ký/Đăng nhập người dùng
- ✅ Tạo và quản lý tin đăng
- ✅ Upload hình ảnh
- ✅ Tìm kiếm và lọc tin đăng
- ✅ Admin panel quản trị
- ✅ Responsive design

**Happy Coding! 🚀**
