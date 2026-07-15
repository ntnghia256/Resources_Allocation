# Resource Allocation AI Dashboard (Frontend)

Hệ thống quản lý phân bổ nhân lực dự án tích hợp trợ lý AI thông minh, được phát triển bằng **React.js (Vite) + TypeScript** kết hợp **Tailwind CSS v3**.

---

## 🛠️ Công Nghệ Sử Dụng

- **Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v3 (hỗ trợ Light/Dark mode switcher bằng lớp `.dark`)
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **HTTP Client**: Axios (có cấu hình Proxy chuyển tiếp `/api` tránh lỗi CORS)

---

## 🚀 Tính Năng Chính

1. **Báo Cáo Tổng Quan (Dashboard)**:
   - Tổng quan thống kê (KPIs) về số nhân sự, dự án, số nhân sự đang quá tải, và hiệu suất sử dụng tổng thể.
   - **Báo cáo Utilization**: Thống kê % workload hiện tại của từng người dưới dạng thanh tiến trình trực quan.
   - **Báo cáo Available Resources**: Danh sách nhân viên còn công suất trống (% allocation < 100%) và sẵn sàng nhận việc.
   - **Báo cáo Overloaded Employees**: Cảnh báo đỏ cho những nhân sự quá công suất (> 90%).
2. **Quản Lý Nhân Sự (Employee)**: Danh sách nhân viên, thông tin liên hệ, chi tiết dự án đang tham gia và tổng công suất hiện tại.
3. **Quản Lý Dự Án (Project)**: Danh sách, thông tin khách hàng, trạng thái (`PLANNING`, `ACTIVE`, `COMPLETED`) và đội ngũ tham gia dự án.
4. **Phân Bổ Nhân Sự (Resource Allocation)**:
   - Form phân bổ nhân sự vào dự án với kiểm soát chặt chẽ các **Business Rules** tại client trước khi đẩy lên Backend.
   - Hỗ trợ sửa/hủy phân bổ.
5. **Trợ Lý AI Thông Minh (AI Console)**:
   - **AI Resource Recommendation**: Nhập ngôn ngữ tự nhiên để tìm kiếm nhân sự phù hợp (ví dụ: *"Tìm Java Developer còn trống 50% available"*).
   - **AI Risk Detection**: Nhập kế hoạch dự án tiếp theo để AI cảnh báo rủi ro về mặt capacity đội ngũ (ví dụ: *"Dự án NCG cần thêm 2 Developer"*).

---

## 🔒 Kiểm Soát Nghiệp Vụ Tại Client (Business Rules Validation)

Hệ thống tích hợp sẵn các bộ kiểm tra logic chặt chẽ:
- **Rule 1**: Tỷ lệ phân bổ đơn lẻ phải nằm trong khoảng: `0 < allocation <= 100%`.
- **Rule 2**: Tổng tỷ lệ phân bổ của một nhân viên qua tất cả các dự án đang chạy **không được vượt quá 100%**. Khi tạo hoặc sửa phân bổ, hệ thống sẽ tính tổng tải và hiển thị cảnh báo ngay trên form.
- **Rule 3**: **Không cho phép phân bổ nhân viên vào dự án đã hoàn thành (`COMPLETED`)**. Dropdown chọn dự án sẽ ẩn các dự án này đi, và có cơ chế validate chặn ở API service.

---

## 🔌 Chế Độ Hoạt Động Kép (Sandbox Offline & Live Online)

Hệ thống sở hữu cơ chế tự động nhận diện kết nối Backend vô cùng thông minh:
- Khi khởi động, ứng dụng sẽ thử kết nối với Backend Spring Boot (`http://localhost:8080`).
- **Nếu kết nối thành công (Online)**: Dữ liệu được đồng bộ hóa và lưu trữ trực tiếp vào cơ sở dữ liệu PostgreSQL.
- **Nếu kết nối thất bại (Offline)**: Ứng dụng tự động chuyển sang chế độ **Sandbox (Mock Data)**. Bạn vẫn có thể thực hiện mọi thao tác thêm/sửa/xóa nhân viên, dự án, phân bổ và chatbot AI hoàn toàn tương tác như bình thường trực tiếp trên trình duyệt mà không cần khởi chạy Backend. Giao diện Sidebar phía dưới cùng sẽ hiển thị nhãn cảnh báo trạng thái để bạn dễ dàng nhận biết.

---

## 🏃 Hướng Dẫn Khởi Chạy

### 1. Cài đặt các gói phụ thuộc (Dependencies)
```bash
npm install --legacy-peer-deps
```

### 2. Khởi chạy ở chế độ phát triển (Development Mode)
```bash
npm run dev
```
Trình duyệt sẽ mở ứng dụng tại: `http://localhost:5173/`

### 3. Biên dịch dự án (Build Production)
```bash
npm run build
```
Sản phẩm đầu ra nằm trong thư mục `/dist` sẵn sàng để triển khai lên máy chủ web (như Nginx, Hostings).
