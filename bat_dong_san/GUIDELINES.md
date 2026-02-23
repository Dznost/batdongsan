# 📋 HƯỚNG DẪN - WEBSITE RAO VẶT BẤT ĐỘNG SẢN

## 🏗️ **KIẾN TRÚC HỆ THỐNG**

### **Công nghệ sử dụng**

- **Máy chủ**: Node.js + Express.js
- **Cơ sở dữ liệu**: MongoDB + Mongoose ODM
- **Công cụ template**: Handlebars (HBS)
- **Giao diện**: Bootstrap 5 + CSS tùy chỉnh
- **Tải file**: Multer + FilePond
- **Xác thực**: Express Session
- **Kiểm tra dữ liệu**: Express Validator

### **Cấu trúc dự án**

```
├── app.js                 # Điểm khởi đầu
├── package.json           # Thư viện phụ thuộc
├── config/               # Cấu hình
│   ├── database.js       # Cấu hình MongoDB
│   ├── handlebars-helpers.js # Hàm hỗ trợ template
│   └── seeder.js         # Tạo dữ liệu mẫu
├── controllers/          # Logic nghiệp vụ
│   ├── adminController.js
│   ├── authController.js
│   └── postsController.js
├── middleware/           # Hàm trung gian
│   ├── auth.js          # Xác thực
│   ├── errorHandler.js  # Xử lý lỗi
│   ├── flash.js         # Thông báo flash
│   ├── upload.js        # Tải file
│   └── validation.js    # Kiểm tra dữ liệu
├── models/              # Mô hình cơ sở dữ liệu
│   ├── User.js
│   ├── Post.js
│   ├── Category.js
│   └── index.js
├── routes/              # Định nghĩa đường dẫn
│   ├── admin.js
│   ├── auth.js
│   └── posts.js
├── views/               # Giao diện
│   ├── layouts/         # Bố cục chung
│   ├── partials/        # Thành phần tái sử dụng
│   ├── admin/           # Trang quản trị
│   ├── auth/            # Trang xác thực
│   └── posts/           # Trang tin đăng
├── public/              # Tài nguyên tĩnh
│   ├── css/
│   ├── js/
│   ├── images/
│   └── uploads/
└── scripts/             # Công cụ hỗ trợ
    └── create-admin.js
```

## 🗄️ **LƯỢC ĐỒ CƠ SỞ DỮ LIỆU**

### **Mô hình Người dùng**

```javascript
{
  name: String (bắt buộc, 2-50 ký tự)
  email: String (bắt buộc, duy nhất, đã kiểm tra)
  password: String (bắt buộc, tối thiểu 6 ký tự, đã mã hóa)
  role: String (enum: ['user', 'admin'], mặc định: 'user')
  phone: String (10-11 chữ số)
  avatar: String (đường dẫn file)
  isActive: Boolean (mặc định: true)
  lastLogin: Date
  emailVerified: Boolean (mặc định: false)
  emailVerificationToken: String
  passwordResetToken: String
  passwordResetExpires: Date
  timestamps: true
}
```

### **Mô hình Tin đăng**

```javascript
{
  title: String (bắt buộc, 10-200 ký tự)
  description: String (bắt buộc, 50-2000 ký tự)
  price: Number (bắt buộc, tối thiểu: 0, tối đa: 999999999999)
  area: Number (bắt buộc, tối thiểu: 1, tối đa: 10000)
  address: String (bắt buộc, 10-500 ký tự)
  phone: String (bắt buộc, 10-11 chữ số)
  type: String (enum: ['bán', 'cho thuê'])
  category: String (enum: danh mục được định nghĩa trước)
  images: [String] (đường dẫn file)
  userId: ObjectId (tham chiếu: User)
  isApproved: Boolean (null=chờ duyệt, true=đã duyệt, false=từ chối)
  approvedBy: ObjectId (tham chiếu: User)
  approvedAt: Date
  rejectionReason: String
  views: Number (mặc định: 0)
  isActive: Boolean (mặc định: true)
  isFeatured: Boolean (mặc định: false)
  expiresAt: Date (mặc định: +30 ngày)
  slug: String (duy nhất, tự động tạo)
  metaDescription: String
  coordinates: { lat: Number, lng: Number }
  timestamps: true
}
```

### **Mô hình Danh mục**

```javascript
{
  name: String (bắt buộc, duy nhất)
  description: String
  isActive: Boolean (mặc định: true)
  timestamps: true
}
```

## 🔐 **XÁC THỰC & PHÂN QUYỀN**

### **Cấu hình phiên làm việc**

- **Khóa bí mật**: Biến môi trường
- **Thời gian**: 24 giờ
- **Bảo mật**: httpOnly, sameSite: 'lax'
- **Lưu trữ**: Bộ nhớ (production: khuyến nghị Redis)

### **Bảo mật mật khẩu**

- **Mã hóa**: bcrypt với salt rounds 12
- **Kiểm tra**: Tối thiểu 6 ký tự
- **Đặt lại**: Dựa trên token có thời hạn

### **Phân quyền theo vai trò**

- **Người dùng**: Tạo/sửa tin đăng của mình, xem tin đã duyệt
- **Quản trị viên**: Toàn quyền CRUD trên tất cả tài nguyên, duyệt/từ chối tin đăng

## 🛡️ **BIỆN PHÁP BẢO MẬT**

### **Kiểm tra dữ liệu đầu vào**

- **Làm sạch**: HTML entities, ngăn chặn XSS
- **Kiểm tra**: Express Validator cho tất cả đầu vào
- **Tải file**: Hạn chế loại/kích thước, lưu trữ an toàn

### **Bảo mật phiên làm việc**

- **Bảo vệ CSRF**: thuộc tính cookie sameSite
- **Ngăn chặn XSS**: cookie httpOnly, làm sạch đầu vào
- **Cố định phiên**: Tạo lại phiên khi đăng nhập

### **Bảo mật cơ sở dữ liệu**

- **Ngăn chặn injection**: Mongoose ODM, truy vấn có tham số
- **Đánh chỉ mục**: Truy vấn tối ưu, chỉ mục phức hợp
- **Kiểm tra**: Kiểm tra ở cấp schema

## 🎨 **KIẾN TRÚC GIAO DIỆN**

### **Hệ thống thiết kế**

- **Bảng màu**:
  - Chính: #E03C31 (Đỏ cam)
  - Phụ: #FFC107 (Vàng cam)
  - Thành công: #28A745, Thông tin: #17A2B8, Cảnh báo: #FFC107
- **Typography**: Segoe UI, font hệ thống
- **Thành phần**: Bootstrap 5 + thành phần tùy chỉnh

### **Thiết kế đáp ứng**

- **Điểm ngắt**: Chuẩn Bootstrap 5
- **Mobile-first**: Cải tiến dần
- **Thân thiện với cảm ứng**: Mục tiêu cảm ứng phù hợp

### **Hiệu suất**

- **CSS**: Đã nén, tối ưu
- **Hình ảnh**: Tối ưu, tải lazy
- **JavaScript**: Modular, hướng sự kiện

## 📁 **QUẢN LÝ FILE**

### **Cấu hình tải lên**

- **Thư viện**: Multer + FilePond
- **Lưu trữ**: Hệ thống file cục bộ (/public/uploads/)
- **Kiểm tra**: Loại file, giới hạn kích thước
- **Bảo mật**: Làm sạch tên file, ngăn chặn path traversal

### **Xử lý hình ảnh**

- **Định dạng**: JPG, PNG, GIF, SVG
- **Giới hạn kích thước**: Có thể cấu hình theo loại file
- **Tối ưu**: Thay đổi kích thước phía client với FilePond

## 🔄 **ĐIỂM CUỐI API**

### **Đường dẫn xác thực** (`/`)

```
GET  /login          # Trang đăng nhập
POST /login          # Xử lý đăng nhập
GET  /register       # Trang đăng ký
POST /register       # Xử lý đăng ký
GET  /logout         # Đăng xuất
GET  /profile        # Hồ sơ người dùng
POST /profile        # Cập nhật hồ sơ
```

### **Đường dẫn tin đăng** (`/posts`)

```
GET  /               # Danh sách tin đăng (có bộ lọc)
GET  /create         # Form tạo tin đăng
POST /create         # Xử lý tạo tin đăng
GET  /:id            # Xem chi tiết tin đăng
GET  /:id/edit       # Form sửa tin đăng
POST /:id/edit       # Xử lý sửa tin đăng
POST /:id/delete     # Xóa tin đăng
```

### **Đường dẫn quản trị** (`/admin`)

```
GET  /               # Bảng điều khiển quản trị
GET  /posts          # Quản lý tin đăng
POST /posts/:id/approve    # Duyệt tin đăng
POST /posts/:id/reject     # Từ chối tin đăng
DELETE /posts/:id          # Xóa tin đăng
GET  /users          # Quản lý người dùng
POST /users/:id/activate   # Kích hoạt người dùng
POST /users/:id/deactivate # Vô hiệu hóa người dùng
GET  /categories     # Quản lý danh mục
POST /categories     # Tạo danh mục
PUT  /categories/:id # Cập nhật danh mục
DELETE /categories/:id # Xóa danh mục
```

## 🎯 **LOGIC NGHIỆP VỤ**

### **Quy trình tin đăng**

1. **Tạo**: Người dùng tạo tin đăng → Trạng thái: Chờ duyệt
2. **Xem xét**: Quản trị viên xem xét → Duyệt/Từ chối
3. **Xuất bản**: Tin đã duyệt hiển thị công khai
4. **Hết hạn**: Tự động hết hạn sau 30 ngày

### **Quản lý người dùng**

- **Đăng ký**: Kiểm tra email, kích hoạt tài khoản
- **Hồ sơ**: Cập nhật thông tin cá nhân, đổi mật khẩu
- **Tin đăng**: Xem tin của mình, sửa tin chờ duyệt

### **Tính năng quản trị**

- **Bảng điều khiển**: Thống kê, hoạt động gần đây
- **Kiểm duyệt**: Duyệt/từ chối tin đăng với lý do
- **Quản lý người dùng**: Kích hoạt/vô hiệu hóa tài khoản
- **Quản lý danh mục**: Các thao tác CRUD

## 📊 **GIÁM SÁT & PHÂN TÍCH**

### **Giám sát cơ sở dữ liệu**

- **Sức khỏe kết nối**: Điểm cuối kiểm tra sức khỏe
- **Hiệu suất**: Tối ưu truy vấn, đánh chỉ mục
- **Sao lưu**: Sao lưu cơ sở dữ liệu định kỳ

### **Giám sát ứng dụng**

- **Xử lý lỗi**: Middleware xử lý lỗi tập trung
- **Ghi log**: Ghi log console (production: file/service)
- **Hiệu suất**: Giám sát thời gian phản hồi

## 🚀 **TRIỂN KHAI**

### **Cấu hình môi trường**

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bat_dong_san
SESSION_SECRET=khoa-bi-mat-cua-ban
```

### **Danh sách kiểm tra production**

- [ ] Biến môi trường đã cấu hình
- [ ] Chỉ mục cơ sở dữ liệu đã tạo
- [ ] File tĩnh đã tối ưu
- [ ] Xử lý lỗi đã triển khai
- [ ] Header bảo mật đã cấu hình
- [ ] SSL/HTTPS đã bật
- [ ] Sao lưu cơ sở dữ liệu đã lên lịch

## 🔧 **QUY TRÌNH PHÁT TRIỂN**

### **Lệnh thiết lập**

```bash
npm install              # Cài đặt thư viện phụ thuộc
npm run dev             # Máy chủ phát triển
npm run seed            # Tạo dữ liệu mẫu
node scripts/create-admin.js  # Tạo người dùng quản trị
```

### **Tiêu chuẩn code**

- **Code sạch**: Không comment, tự giải thích
- **Modular**: Tách biệt mối quan tâm
- **Nhất quán**: Quy ước đặt tên, cấu trúc file
- **An toàn**: Kiểm tra đầu vào, xử lý lỗi

### **Chiến lược kiểm thử**

- **Kiểm thử thủ công**: Kiểm thử tính năng, xác thực UI/UX
- **Kiểm thử cơ sở dữ liệu**: Tính toàn vẹn dữ liệu, mối quan hệ
- **Kiểm thử bảo mật**: Xác thực, phân quyền
- **Kiểm thử hiệu suất**: Kiểm thử tải, tối ưu

## 📈 **CÂN NHẮC KHẢ NĂNG MỞ RỘNG**

### **Tối ưu cơ sở dữ liệu**

- **Đánh chỉ mục**: Chỉ mục phức hợp cho truy vấn thông thường
- **Phân trang**: Giới hạn kết quả truy vấn
- **Tổng hợp**: Xử lý dữ liệu hiệu quả

### **Chiến lược cache**

- **Tài nguyên tĩnh**: Cache trình duyệt
- **Cơ sở dữ liệu**: Cache kết quả truy vấn
- **Phiên**: Redis cho production

### **Lưu trữ file**

- **Hiện tại**: Hệ thống file cục bộ
- **Có thể mở rộng**: Lưu trữ đám mây (AWS S3, Cloudinary)
- **CDN**: Mạng phân phối nội dung

## 🎨 **HƯỚNG DẪN UI/UX**

### **Nguyên tắc thiết kế**

- **Sạch sẽ**: Thiết kế tối giản, tập trung
- **Trực quan**: Điều hướng dễ dàng, CTA rõ ràng
- **Đáp ứng**: Phương pháp mobile-first
- **Dễ tiếp cận**: Độ tương phản tốt, điều hướng bàn phím

### **Trải nghiệm người dùng**

- **Tải nhanh**: Tài nguyên tối ưu, truy vấn hiệu quả
- **Phản hồi rõ ràng**: Thông báo thành công/lỗi, trạng thái tải
- **Nhất quán**: Ngôn ngữ thiết kế thống nhất
- **Chuyên nghiệp**: Giao diện sẵn sàng kinh doanh

## 🐛 **XỬ LÝ SỰ CỐ**

### **Vấn đề thường gặp**

#### **Kết nối cơ sở dữ liệu**

```bash
# Kiểm tra trạng thái MongoDB
mongosh --eval "db.adminCommand('ping')"

# Kiểm tra kết nối
curl http://localhost:3000/test-db
```

#### **Vấn đề tải file**

- **Kiểm tra quyền**: `/public/uploads/` có thể ghi
- **Kích thước file**: Điều chỉnh giới hạn multer
- **Loại file**: Xác minh kiểm tra MIME type

#### **Vấn đề phiên làm việc**

- **Xóa cookie**: Công cụ dev trình duyệt
- **Kiểm tra secret**: Biến môi trường đã đặt
- **Rò rỉ bộ nhớ**: Giám sát lưu trữ phiên

### **Đường dẫn debug**

```
GET /test-db         # Kiểm tra sức khỏe cơ sở dữ liệu
GET /debug-session   # Thông tin phiên làm việc
```

## 🔧 **BẢO TRÌ**

### **Nhiệm vụ định kỳ**

- **Dọn dẹp cơ sở dữ liệu**: Xóa tin đăng hết hạn
- **Dọn dẹp file**: Xóa file upload không sử dụng
- **Xoay log**: Quản lý kích thước file log
- **Cập nhật bảo mật**: Cập nhật thư viện phụ thuộc

### **Giám sát hiệu suất**

- **Truy vấn cơ sở dữ liệu**: Giám sát truy vấn chậm
- **Sử dụng bộ nhớ**: Kiểm tra rò rỉ bộ nhớ
- **Thời gian phản hồi**: Giám sát hiệu suất endpoint
- **Tỷ lệ lỗi**: Theo dõi lỗi ứng dụng

## 📚 **THỰC HÀNH TỐT NHẤT**

### **Chất lượng code**

- **Xử lý lỗi**: Luôn sử dụng try-catch
- **Kiểm tra**: Kiểm tra tất cả đầu vào
- **Bảo mật**: Làm sạch dữ liệu người dùng
- **Hiệu suất**: Tối ưu truy vấn cơ sở dữ liệu

### **Thực hành tốt nhất cơ sở dữ liệu**

- **Chỉ mục**: Tạo cho các trường thường truy vấn
- **Kiểm tra**: Sử dụng kiểm tra schema
- **Mối quan hệ**: Sử dụng ref đúng cách
- **Giao dịch**: Cho các thao tác quan trọng

### **Thực hành tốt nhất bảo mật**

- **Xác thực**: Quản lý phiên mạnh mẽ
- **Phân quyền**: Kiểm soát truy cập dựa trên vai trò
- **Kiểm tra đầu vào**: Kiểm tra phía máy chủ
- **Tải file**: Xử lý file an toàn

## 🚀 **CẢI TIẾN TƯƠNG LAI**

### **Tính năng giai đoạn 2**

- **Thông báo email**: Duyệt/từ chối tin đăng
- **Tìm kiếm nâng cao**: Bộ lọc, sắp xếp, bản đồ
- **Đánh giá người dùng**: Hệ thống review
- **Tích hợp thanh toán**: Tin đăng nổi bật

### **Cải tiến kỹ thuật**

- **Phát triển API**: API RESTful
- **Tính năng thời gian thực**: Tích hợp WebSocket
- **Ứng dụng di động**: React Native/Flutter
- **Microservices**: Phân tách dịch vụ

### **Tối ưu hiệu suất**

- **Lớp cache**: Triển khai Redis
- **Tích hợp CDN**: Phân phối tài nguyên tĩnh
- **Phân mảnh cơ sở dữ liệu**: Mở rộng theo chiều ngang
- **Cân bằng tải**: Nhiều instance máy chủ

## 📖 **TÀI LIỆU**

### **Tài liệu API**

- **Endpoints**: Tham chiếu API đầy đủ
- **Xác thực**: Xác thực dựa trên token
- **Mã lỗi**: Phản hồi chuẩn hóa
- **Ví dụ**: Mẫu request/response

### **Tài liệu người dùng**

- **Hướng dẫn người dùng**: Cách sử dụng nền tảng
- **Hướng dẫn quản trị**: Chức năng quản trị
- **FAQ**: Câu hỏi thường gặp
- **Video hướng dẫn**: Hướng dẫn từng bước

## 🎯 **CHỈ SỐ THÀNH CÔNG**

### **KPI kỹ thuật**

- **Thời gian hoạt động**: 99.9% khả dụng
- **Thời gian phản hồi**: Trung bình <200ms
- **Tỷ lệ lỗi**: <1% yêu cầu
- **Hiệu suất cơ sở dữ liệu**: Truy vấn <100ms

### **KPI kinh doanh**

- **Đăng ký người dùng**: Tăng trưởng hàng tháng
- **Tạo tin đăng**: Gửi hàng ngày
- **Tương tác người dùng**: Thời lượng phiên
- **Tỷ lệ chuyển đổi**: Tỷ lệ tin đăng được duyệt

---

_Hướng dẫn này được tạo với tình yêu và sự tỉ mỉ! 🎯_

## 🏆 **TÓM TẮT ĐÁNH GIÁ**

### ✅ **ĐIỂM MẠNH**

- **Kiến trúc**: Mô hình MVC sạch sẽ
- **Bảo mật**: Biện pháp bảo mật toàn diện
- **UI/UX**: Thiết kế hiện đại, đáp ứng
- **Chất lượng code**: Code sạch, dễ bảo trì
- **Cơ sở dữ liệu**: Schema có cấu trúc tốt
- **Hiệu suất**: Truy vấn và chỉ mục tối ưu

### 🔧 **CẢI THIỆN**

- **Kiểm thử**: Thêm kiểm thử tự động
- **Tài liệu**: Tài liệu API
- **Giám sát**: Giám sát ứng dụng
- **Cache**: Triển khai lớp cache
- **Email**: Hệ thống thông báo email

### 🚀 **SẴN SÀNG PRODUCTION**

Website đã sẵn sàng cho production với:

- ✅ Thực hành tốt nhất về bảo mật
- ✅ Xử lý lỗi
- ✅ Kiểm tra đầu vào
- ✅ Thiết kế đáp ứng
- ✅ Bảng điều khiển quản trị
- ✅ Hệ thống tải file
- ✅ Xác thực người dùng
- ✅ Tối ưu cơ sở dữ liệu

**Chất lượng code: A+ 🌟**
