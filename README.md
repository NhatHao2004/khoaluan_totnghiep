# KhmerGo - Ứng dụng khám phá văn hóa Khmer 🏛️

KhmerGo là một ứng dụng di động được phát triển bằng React Native và Expo, giúp người dùng khám phá và tìm hiểu về nền văn hóa Khmer phong phú tại Việt Nam.

## 🎯 Tính năng chính

- **Khám phá chùa Khmer**: Tìm hiểu về các ngôi chùa Khmer nổi tiếng
- **Văn hóa & Lễ hội**: Khám phá các lễ hội và truyền thống văn hóa Khmer
- **Ẩm thực**: Tìm hiểu về các món ăn đặc trưng của người Khmer
- **Địa điểm gần bạn**: Tự động tìm các địa điểm văn hóa Khmer xung quanh
- **Danh sách yêu thích**: Lưu lại những địa điểm bạn quan tâm
- **Học tiếng Khmer**: Tài liệu và bài học tiếng Khmer cơ bản
- **Trò chơi dân gian**: Tìm hiểu về các trò chơi truyền thống

## 🛠️ Công nghệ sử dụng

- **Frontend**: React Native với Expo
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **Navigation**: Expo Router với Tab Navigation
- **Location**: Expo Location API
- **UI Components**: Custom themed components

## 📱 Cài đặt và chạy ứng dụng

### Yêu cầu hệ thống
- Node.js (phiên bản 16 trở lên)
- npm hoặc yarn
- Expo CLI
- Android Studio (cho Android) hoặc Xcode (cho iOS)

### Cài đặt dependencies

```bash
npm install
```

### Chạy ứng dụng

```bash
npx expo start
```

Sau khi chạy lệnh trên, bạn có thể:
- Quét QR code bằng Expo Go app trên điện thoại
- Nhấn `a` để mở Android emulator
- Nhấn `i` để mở iOS simulator
- Nhấn `w` để mở trên web browser

## 🔧 Cấu hình Firebase

1. Tạo project mới trên [Firebase Console](https://console.firebase.google.com/)
2. Thêm ứng dụng Android/iOS vào project
3. Tải file cấu hình và đặt vào thư mục gốc:
   - `google-services.json` (Android)
   - `GoogleService-Info.plist` (iOS)
4. Cấu hình Firestore Database và Storage
5. Cập nhật Firebase config trong code

## 📂 Cấu trúc dự án

```
├── app/                    # Thư mục chính của ứng dụng
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Trang chủ
│   │   ├── favorites.tsx  # Trang yêu thích
│   │   └── profile.tsx    # Trang cá nhân
│   └── _layout.tsx        # Layout chính
├── components/            # Các component tái sử dụng
├── hooks/                 # Custom hooks
├── services/             # Firebase services
├── assets/               # Hình ảnh và tài nguyên
└── constants/            # Các hằng số và cấu hình
```

## 🎨 Tính năng nổi bật

### Trang chủ (Home)
- Header với background image và search bar
- Grid các danh mục dịch vụ (8 categories)
- Section "Danh mục yêu thích" với scroll ngang
- Section "Địa điểm gần bạn" với geolocation

### Trang yêu thích (Favorites)
- Danh sách các địa điểm đã được đánh dấu yêu thích
- Tự động refresh khi có thay đổi
- UI card đẹp mắt với thông tin chi tiết

### Tính năng Location
- Tự động detect vị trí người dùng
- Tìm các địa điểm trong bán kính 50km
- Hiển thị khoảng cách chính xác

## 🔄 Quản lý state và data

- Sử dụng custom hooks để quản lý data từ Firebase
- Auto-refresh khi focus vào screen
- Pull-to-refresh cho user experience tốt hơn
- Optimistic updates cho favorite actions

## 🌐 Đóng góp

Dự án này là một phần của khóa luận tốt nghiệp về việc bảo tồn và quảng bá văn hóa Khmer tại Việt Nam. Mọi đóng góp và phản hồi đều được hoan nghênh.

## 📄 License

Dự án này được phát triển cho mục đích giáo dục và nghiên cứu.

## 👥 Tác giả _ Lâm Nhật Hào

Khóa luận tốt nghiệp - Ứng dụng khám phá văn hóa Khmer

---

*Ứng dụng được phát triển với mục tiêu bảo tồn và lan tỏa nền văn hóa Khmer đặc sắc tại Việt Nam* 🇻🇳