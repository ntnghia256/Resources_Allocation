# Resource Allocation Management System

Hệ thống quản lý và phân bổ nhân sự (Resource Allocation Management System) dành cho các công ty outsourcing, hỗ trợ quản lý thông tin nhân viên, dự án, kiểm soát phân bổ năng suất (workload) và tích hợp các tính năng AI hỗ trợ.

---

## Công Nghệ Sử Dụng (Tech Stack)

- **Backend:** Java 21, Spring Boot 3.3.2, Spring Data JPA
- **Database:** PostgreSQL 15 (chạy trên Docker container)
- **Mapping:** ModelMapper 3.2.1
- **API Doc:** Springdoc OpenAPI (Swagger UI)
- **AI Integration:** Spring AI (OpenAI Chat Client) kèm **Rule-based Fallback** tự động

---

## Hướng Dẫn Cài Đặt và Khởi Chạy

### Bước 1: Khởi động Database bằng Docker
Mở terminal tại thư mục gốc của dự án (nơi chứa file `docker-compose.yaml`) và chạy lệnh:
```bash
docker compose up -d
```
*Lưu ý: PostgreSQL được map sang cổng **`5433`** trên máy host để tránh xung đột với các service Postgres cài đặt sẵn trên máy.*

### Bước 2: Chạy ứng dụng Spring Boot
Di chuyển vào thư mục `BE/Resource_Allocation` và khởi chạy ứng dụng:
```bash
cd BE/Resource_Allocation
.\mvnw spring-boot:run
```
Ứng dụng sẽ chạy mặc định ở cổng **`8080`**.

### Bước 3: Chạy bộ unit test
Để kiểm tra tính toàn vẹn và logic nghiệp vụ của các Business Rules:
```bash
.\mvnw clean test
```

---

## Hướng Dẫn Kiểm Thử API

### 1. Swagger UI (Kiểm thử trực quan qua trình duyệt)
Sau khi ứng dụng khởi chạy thành công, truy cập đường link sau:
**[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**

### 2. Import Postman Collection
Dự án có đi kèm file Postman Collection hoàn chỉnh nằm tại thư mục gốc:
`Resource_Allocation_Postman_Collection.json`

**Cách dùng:**
1. Mở phần mềm Postman.
2. Chọn **Import** -> kéo thả file `Resource_Allocation_Postman_Collection.json` vào.
3. Chạy thử nghiệm các request mẫu đã được chuẩn bị sẵn (Employee, Project, Allocation, Report, AI).

---

## Các Tính Năng Nổi Bật

### Định dạng ngày đa dạng (Multi-Format Dates)
Mọi API tiếp nhận ngày (`startDate`, `endDate`) hỗ trợ đồng thời hai định dạng sau:
1. Định dạng Việt Nam: `dd/MM/yyyy` (ví dụ: `15/07/2026`).
2. Định dạng Quốc tế: `yyyy-MM-dd` (ví dụ: `2026-07-15`).

*Phản hồi (Response) trả về luôn luôn hiển thị theo định dạng Việt Nam `dd/MM/yyyy` để đảm bảo tính thống nhất dữ liệu.*

### Tính năng AI Bonus với Cơ chế Rule-based Fallback
Hệ thống cung cấp 2 endpoint AI chính tại `/ai/recommend` và `/ai/risk-detect`:
1. **AI Resource Recommendation:** Nhận prompt tự nhiên (e.g. *"Tìm Java Developer còn tối thiểu 50% available"*) và trả đề xuất JSON.
2. **AI Risk Detection:** Gửi kế hoạch nhân sự (e.g. *"Sprint tới cần thêm 2 Java Developer"*) để cảnh báo rủi ro capacity.

**Cơ chế hoạt động:**
- Nếu cấu hình biến môi trường `OPENAI_API_KEY`, ứng dụng sử dụng LLM của OpenAI để phân tích thông minh.
- Nếu **không cấu hình API Key**, hệ thống sẽ tự động kích hoạt **Rule-based Fallback** - tự động phân tích cú pháp ngôn ngữ tự nhiên bằng regex, tính toán trực tiếp số liệu thời gian thực từ database và trả ra kết quả chính xác 100%, bảo đảm API không bao giờ bị lỗi kết nối hoặc gián đoạn.

---

## Cấu Trúc Mã Nguồn (Restructured Architecture)

```text
src/main/java/com/fpt/resource_allocation/
├── config/            # Cấu hình Security, Swagger, AI, ModelMapper, Custom Deserializer
├── controller/        # REST Controllers (API Endpoints + AiController)
├── dto/               # Request/Response Data Transfer Objects
├── entity/            # JPA Entities (Employee, Project, Allocation)
├── exception/         # Exception Classes & Global Exception Handler
├── repository/        # Spring Data JPA Repositories
└── service/           # Business Services & implementations (JPA + AiService)
```
