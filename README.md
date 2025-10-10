# FlowerShop 🌸

FlowerShop là một nền tảng thương mại điện tử toàn diện giúp kết nối khách hàng, nhà bán hoa (florist) và quản trị viên trên cùng một hệ thống. Ứng dụng bao gồm backend Node.js/Express với MySQL, frontend React sử dụng Material UI, ví điện tử, đặt hàng, quản lý shop, chatbot hỗ trợ và màn hình chào mừng lazy-load tạo trải nghiệm hiện đại.

## Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng chính](#tính-năng-chính)
- [công nghệ](#công-nghệ)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Bắt đầu nhanh](#bắt-đầu-nhanh)
  - [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
  - [Cài đặt nhanh (Windows)](#cài-đặt-nhanh-windows)
  - [Cài đặt thủ công](#cài-đặt-thủ-công)
- [Biến môi trường](#biến-môi-trường)
- [Dữ liệu mẫu & tài khoản mặc định](#dữ-liệu-mẫu--tài-khoản-mặc-định)
- [Các script hữu ích](#các-script-hữu-ích)
- [Kiểm thử](#kiểm-thử)
- [API và tài nguyên](#api-và-tài-nguyên)
- [Ghi chú triển khai](#ghi-chú-triển-khai)

## Tổng quan

- Ứng dụng full-stack phục vụ mua bán hoa tươi với quy trình duyệt sản phẩm, đặt hàng, thanh toán qua ví và quản trị cửa hàng.
- Màn hình chào mừng Lazy Welcome với progress bar (0 → 100%) và hiệu ứng trái tim.
- Backend sử dụng Sequelize kết nối MySQL, cung cấp các REST API bảo mật bằng JWT.
- Frontend sử dụng React 18, Material UI 5, Redux Toolkit và Axios; hỗ trợ lazy loading, chatbot và dashboard động.

## Tính năng chính

### Dành cho khách hàng

- Đăng ký/đăng nhập, quản lý hồ sơ, đặt lại mật khẩu.
- Duyệt danh mục, xem chi tiết sản phẩm, đánh giá và sản phẩm nổi bật.
- Thêm sản phẩm vào giỏ, điều chỉnh số lượng, đặt hàng nhanh.
- Theo dõi lịch sử đơn, gửi yêu cầu đặt hàng đặc biệt.
- Chatbot hỗ trợ tự động và thông báo qua Snackbar.

### Dành cho florist

- Tạo/đăng ký shop, quản lý trạng thái duyệt.
- Thêm/sửa/xoá sản phẩm, quản lý tồn kho và hình ảnh (upload qua Imgbb API).
- Theo dõi đơn hàng, xử lý yêu cầu đặc biệt, xem dashboard doanh thu.

### Dành cho admin

- Quản lý người dùng, shop request, đơn hàng, sản phẩm và danh mục.
- Duyệt/khóa shop, xử lý yêu cầu rút tiền, theo dõi số liệu tổng quan.

### Nền tảng & hạ tầng

- Xác thực JWT, hashing mật khẩu bằng bcrypt.
- Ví điện tử, giao dịch nạp/rút, quản lý lịch sử.
- Upload hình ảnh qua Multer, phục vụ file tĩnh `/uploads`.
- Ghi log bằng morgan, bảo mật tiêu đề bằng helmet.
- Seed dữ liệu tự động khi cơ sở dữ liệu trống.

## công nghệ

| Layer        | Công nghệ chính                                                   |
| ------------ | ----------------------------------------------------------------- |
| Backend      | Node.js, Express.js, Sequelize, JWT, Multer, Helmet, Morgan       |
| CSDL         | MySQL 8+, Sequelize ORM, script `complete_database_setup.sql`     |
| Frontend     | React 18, React Router DOM 6, Redux Toolkit, Material UI 5, Axios |
| Công cụ khác | npm, Jest (backend), React Scripts (frontend), install/run `.bat` |

## Cấu trúc thư mục

```
project/
├── backend/
│   ├── config/              # Cấu hình Sequelize & kết nối DB
│   ├── controllers/         # Xử lý nghiệp vụ (auth, orders, wallet, ...)
│   ├── middleware/          # Middlewares (auth, validation)
│   ├── models/              # Sequelize models & associations
│   ├── routes/              # Định nghĩa REST API
│   ├── uploads/             # Thư mục chứa hình ảnh upload
│   └── server.js            # Điểm khởi động backend
├── frontend/
│   ├── public/
│   │   └── images/          # Ảnh nền lazyload, hero, favicon...
│   └── src/
│       ├── components/      # Header, Chatbot, LazyWelcome...
│       ├── pages/           # Home, Products, Dashboard, Orders...
│       ├── services/        # Axios client, interceptor
│       ├── store/           # Redux store & slices
│       └── utils/           # Logger, helper
├── install.bat              # Script cài đặt dependencies (Windows)
├── run.bat                  # Script chạy backend + frontend
├── complete_database_setup.sql
└── README.md
```

## Bắt đầu nhanh

### Yêu cầu hệ thống

- Node.js >= 16 & npm (khuyến nghị LTS).
- MySQL 8.x (local hoặc dịch vụ như XAMPP, WAMP, Docker, RDS, PlanetScale...).
- Git, PowerShell/CMD trên Windows.

### Cài đặt nhanh (Windows)

Sử dụng script tự động:

```powershell
./install.bat
```

Script sẽ:

1. Kiểm tra Node.js & npm.
2. Cài đặt dependencies cho backend và frontend.
3. Tạo file `.env` mẫu (nếu có `.env.example`).
4. Chuẩn bị thư mục upload.

Sau khi cấu hình `.env`, chạy toàn bộ ứng dụng bằng:

```powershell
./run.bat
```

Script mở hai cửa sổ terminal: backend (http://localhost:5000) và frontend (http://localhost:3000).

### Cài đặt thủ công

1. **Clone repository và cài đặt phụ thuộc**

   ```bash
   git clone https://github.com/kunhtml/project.git
   cd project
   cd backend && npm install && cd ..
   cd frontend && npm install && cd ..
   ```

2. **Cấu hình cơ sở dữ liệu MySQL**

   - Tạo database mới (ví dụ `flowershop`).
   - Import file `complete_database_setup.sql` nếu muốn schema có sẵn **hoặc** để backend tự `sequelize.sync()` tạo bảng khi chạy lần đầu.

3. **Thiết lập biến môi trường** (xem chi tiết bên dưới).

4. **Chạy backend**

   ```bash
   cd backend
   npm run dev        # sử dụng nodemon (hot reload)
   # hoặc: npm start  # chạy bằng node server.js
   ```

5. **Chạy frontend**

   ```bash
   cd frontend
   npm start
   ```

6. Mở http://localhost:3000 và đăng nhập bằng tài khoản seed để khám phá.

## Biến môi trường

Tạo file `.env` riêng cho backend và frontend.

#### Backend (`backend/.env`)

```env
# Server Configuration
PORT=5000                    # Port chạy backend server (có thể đổi thành 3001, 8000, v.v.)
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306                 # Port MySQL (mặc định 3306)
DB_NAME=flowershop_mysql
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=7d

# Optional
CORS_ORIGIN=http://localhost:3000
```

> **Lưu ý:**
>
> - Đổi `PORT` nếu port 5000 đã được sử dụng (ví dụ: 3001, 8000)
> - `CORS_ORIGIN` không bắt buộc nhưng nên đặt khi triển khai production
> - Nếu dùng hosting MySQL, cập nhật các biến kết nối tương ứng

#### Frontend (`frontend/.env`)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api  # Đổi port 5000 nếu backend chạy port khác

# Image Upload API
REACT_APP_FREEIMAGE_KEY=6d207e02198a847aa98d0a2a901485a5

# Webpack Dev Server (fix CORS issues)
DANGEROUSLY_DISABLE_HOST_CHECK=true
WDS_SOCKET_HOST=localhost
WDS_SOCKET_PORT=3000
```

> **Lưu ý:**
>
> - Nếu đổi backend PORT (ví dụ: 3001), nhớ cập nhật `REACT_APP_API_URL=http://localhost:3001/api`
> - `REACT_APP_FREEIMAGE_KEY` đã được cấu hình sẵn cho upload ảnh
> - Có thể để trống `REACT_APP_API_URL` (frontend fallback `http://localhost:5000/api`)

- Có thể để trống `REACT_APP_API_URL` (frontend fallback `http://localhost:5000/api`).

## Dữ liệu mẫu & tài khoản mặc định

Khi `users` trống, backend sẽ seed dữ liệu mẫu:
| Vai trò | Email | Mật khẩu |
|-----------|--------------------------|--------------|
| Admin | admin@flowershop.com | admin123 |
| Florist | florist@flowershop.com | florist123 |
| Customer | customer@flowershop.com | customer123 |
| Customer2 | customer2@flowershop.com | customer123 |

Ngoài ra có dữ liệu mẫu về category, shop, sản phẩm, ví và yêu cầu đặt hàng đặc biệt.

## Các script hữu ích

| Vị trí   | Lệnh            | Mô tả                                   |
| -------- | --------------- | --------------------------------------- |
| backend  | `npm run dev`   | Chạy server với nodemon                 |
| backend  | `npm start`     | Chạy server production mode             |
| backend  | `npm test`      | Chạy Jest tests (nếu có)                |
| frontend | `npm start`     | Chạy React app ở port 3000              |
| frontend | `npm run build` | Build frontend production               |
| frontend | `npm test`      | Chạy react-scripts test (watch mode)    |
| root     | `install.bat`   | Cài dependencies cho cả dự án (Windows) |
| root     | `run.bat`       | Khởi chạy backend & frontend cùng lúc   |

## Đổi Port Server

Nếu port mặc định (5000 cho backend, 3000 cho frontend) đã được sử dụng:

### Backend (đổi từ 5000 sang port khác)

1. Mở `backend/.env`
2. Sửa dòng: `PORT=5000` → `PORT=3001` (hoặc port bất kỳ)
3. Khởi động lại backend server

### Frontend (cập nhật API URL)

1. Mở `frontend/.env`
2. Sửa dòng: `REACT_APP_API_URL=http://localhost:5000/api` → `REACT_APP_API_URL=http://localhost:3001/api`
3. Khởi động lại frontend

### Frontend (đổi port React app)

Để đổi port React app (mặc định 3000):

```bash
cd frontend
set PORT=3001 && npm start  # Windows CMD
$env:PORT=3001; npm start   # Windows PowerShell
PORT=3001 npm start         # Mac/Linux
```

Hoặc tạo file `frontend/.env` và thêm:

```
PORT=3001
```

## Kiểm thử

- **Backend**: Jest đã được cấu hình. Thêm test vào `backend/__tests__/` hoặc cấu trúc bạn chọn, sau đó chạy `npm test`.
- **Frontend**: Sử dụng `npm test` (react-scripts) để chạy unit test component (nếu được viết).
- Đảm bảo MySQL đang chạy trước khi kiểm thử backend.

## API và tài nguyên

- **Base URL**: `http://localhost:5000/api`
- Các module chính:
  - `auth`: `/api/auth/register`, `/api/auth/login`
  - `users`: quản lý người dùng & phân quyền
  - `products`: CRUD sản phẩm, upload hình ảnh, lọc theo danh mục/featured
  - `categories`: CRUD danh mục hoa
  - `shops`: tạo, duyệt và theo dõi shop
  - `orders`: đặt hàng, lịch sử, quản lý trạng thái
  - `wallet`: số dư, giao dịch, yêu cầu rút tiền
  - `special-orders`: xử lý yêu cầu đặt hoa tùy chỉnh
- Xem thêm trong thư mục `backend/routes/` và `controllers/` để biết chi tiết tham số.

## Ghi chú triển khai

- Cập nhật `NODE_ENV=production` và `CORS_ORIGIN` bằng domain thực tế.
- Cấu hình reverse proxy/HTTPS (Nginx/Apache) để phục vụ backend.
- Build frontend (`npm run build`) và deploy lên Netlify/Vercel hoặc phục vụ tĩnh qua Nginx.
- Sử dụng dịch vụ MySQL được quản lý (RDS, PlanetScale, ClearDB) để đảm bảo độ tin cậy.
- Thiết lập storage cho thư mục `backend/uploads` (S3, Cloud Storage) nếu triển khai production.

---

Nếu bạn gặp vấn đề hoặc có đề xuất tính năng mới, hãy tạo issue/pull request. Chúc bạn xây dựng một shop hoa trực tuyến rực rỡ! 🌺
