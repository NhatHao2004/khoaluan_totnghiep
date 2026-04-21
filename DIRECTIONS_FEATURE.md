# Tính năng Chỉ đường (Directions) - KhmerGo App

## Tổng quan
Tính năng Chỉ đường được thiết kế để giúp người dùng dễ dàng tìm đường đến các chùa Khmer một cách thuận tiện và đầy đủ thông tin.

## Các tính năng chính

### 1. Giao diện Directions (`app/directions.tsx`)
- **Thông tin chùa**: Hiển thị ảnh, tên, địa chỉ và khoảng cách đến chùa
- **Lựa chọn phương tiện**: Xe hơi, đi bộ, xe buýt với thời gian ước tính
- **Tích hợp ứng dụng bản đồ**: Google Maps, Apple Maps, Waze
- **Chức năng chia sẻ**: Chia sẻ vị trí chùa
- **Lưu ý văn hóa**: Hướng dẫn cách ứng xử khi đi chùa

### 2. Tích hợp Navigation
- Thêm screen `directions` vào `_layout.tsx` (ẩn khỏi tab bar)
- Kết nối từ nút "Chỉ đường" trong `pagoda-detail.tsx`
- Kết nối từ nút direction trong `index.tsx` (địa điểm gần bạn)
- Tích hợp vào trang `explore.tsx` mới

### 3. Trang Explore mới (`app/explore.tsx`)
- **Gần bạn**: Hiển thị chùa gần vị trí người dùng (100km)
- **Tất cả chùa**: Danh sách đầy đủ các chùa Khmer
- **Nút chỉ đường**: Trên mỗi card chùa
- **Navigation**: Đến trang chi tiết hoặc directions

### 4. Cập nhật trang Index
- Kết nối category "Điểm đến" với trang Explore
- Thêm chức năng chỉ đường cho "Địa điểm gần bạn"

## Cách sử dụng

### Từ trang chi tiết chùa:
1. Vào trang chi tiết chùa bất kỳ
2. Nhấn nút "Chỉ đường" màu cam
3. Chọn phương tiện di chuyển
4. Nhấn vào ứng dụng bản đồ muốn sử dụng

### Từ trang chủ:
1. Xem phần "Địa điểm gần bạn"
2. Nhấn nút mũi tên (→) trên card chùa
3. Được chuyển đến trang Directions

### Từ trang Explore:
1. Nhấn tab "Explore" (compass icon)
2. Xem chùa gần bạn hoặc tất cả chùa
3. Nhấn icon navigate trên card chùa

## Tính năng kỹ thuật

### Tính toán khoảng cách:
- Sử dụng công thức Haversine
- Tính toán thời gian di chuyển ước tính
- Hỗ trợ 3 phương tiện: xe hơi (40km/h), đi bộ (5km/h), xe buýt (25km/h)

### Tích hợp bản đồ:
- **Google Maps**: Mở với tham số direction và travel mode
- **Apple Maps**: Sử dụng URL scheme của Apple Maps
- **Waze**: Mở với tọa độ và chế độ navigation

### Xử lý lỗi:
- Kiểm tra quyền truy cập vị trí
- Xử lý trường hợp không có tọa độ chùa
- Thông báo lỗi khi không thể mở ứng dụng bản đồ

## Cấu trúc file

```
app/
├── directions.tsx          # Trang chỉ đường chính
├── explore.tsx            # Trang khám phá (đã cập nhật)
├── index.tsx              # Trang chủ (đã cập nhật)
├── pagoda-detail.tsx      # Chi tiết chùa (đã cập nhật)
└── _layout.tsx            # Navigation layout (đã cập nhật)
```

## Dependencies sử dụng
- `expo-location`: Lấy vị trí người dùng
- `expo-linking`: Mở ứng dụng bản đồ bên ngoài
- `@expo/vector-icons`: Icons cho UI
- `react-native`: Components cơ bản

## Lưu ý văn hóa
Tính năng bao gồm phần "Lưu ý khi đi chùa" với các hướng dẫn:
- Mặc trang phục lịch sự
- Cởi giày dép trước khi vào khu thờ phụng
- Giữ im lặng và tôn trọng không gian thiêng liêng
- Xin phép trước khi chụp ảnh

## Tương lai phát triển
- Tích hợp real-time traffic từ Google Maps API
- Thêm chức năng lưu route yêu thích
- Hỗ trợ offline maps
- Thêm thông tin giao thông công cộng chi tiết
- Tích hợp với Grab/Uber để gọi xe