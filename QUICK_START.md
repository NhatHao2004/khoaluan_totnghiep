# 🚀 HƯỚNG DẪN NHANH - FIREBASE SETUP

## ✅ CHECKLIST

- [ ] Tạo Firebase project
- [ ] Copy Firebase config
- [ ] Tạo file .env với credentials
- [ ] Enable Firestore Database
- [ ] Thêm sample data
- [ ] Test connection

---

## 📋 CÁC BƯỚC THỰC HIỆN

### 1️⃣ TẠO FIREBASE PROJECT (2 phút)

```
1. Vào: https://console.firebase.google.com/
2. Click "Thêm dự án"
3. Tên: khmergoo
4. Tắt Google Analytics
5. Click "Tạo dự án"
```

### 2️⃣ LẤY FIREBASE CONFIG (1 phút)

```
1. Click icon Web (</>)
2. Tên app: KhmerGo
3. Click "Đăng ký ứng dụng"
4. COPY đoạn firebaseConfig
```

Bạn sẽ thấy:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "khmergoo.firebaseapp.com",
  projectId: "khmergoo",
  ...
};
```

### 3️⃣ TẠO FILE .ENV (30 giây)

Mở file `.env` trong project và paste:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=khmergoo.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=khmergoo
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=khmergoo.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456...
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456...
```

⚠️ **QUAN TRỌNG:** Thay thế bằng giá trị thật từ bước 2!

### 4️⃣ ENABLE FIRESTORE (1 phút)

```
1. Menu trái > "Firestore Database"
2. Click "Tạo cơ sở dữ liệu"
3. Chọn "Chế độ thử nghiệm"
4. Vị trí: asia-southeast1
5. Click "Bật"
```

### 5️⃣ THÊM SAMPLE DATA (2 phút)

```
1. Click "Bắt đầu bộ sưu tập"
2. Collection ID: temples
3. Click "Tiếp theo"
4. Thêm document:
```

**Document 1:**
| Field | Type | Value |
|-------|------|-------|
| name | string | Chùa Áng |
| location | string | Vĩnh Long |
| description | string | Chùa Khmer nổi tiếng |
| imageUrl | string | https://via.placeholder.com/400x300 |
| category | string | Chùa Khmer |
| isFavorite | boolean | true |
| latitude | number | 10.2397 |
| longitude | number | 105.9722 |

Click "Lưu", sau đó thêm document thứ 2 tương tự với tên "Chùa Hang"

### 6️⃣ CẬP NHẬT RULES (30 giây)

```
1. Tab "Quy tắc" (Rules)
2. Paste code này:
```

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

```
3. Click "Xuất bản"
```

### 7️⃣ RESTART APP VÀ TEST (1 phút)

```bash
# Stop Expo server (Ctrl+C)
# Start lại
npm start
```

Mở app, bạn sẽ thấy loading screen, sau đó trang Home với data từ Firebase!

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Firebase: Error (auth/api-key-not-valid)"
➡️ Kiểm tra lại API key trong file .env

### Lỗi: "Missing or insufficient permissions"
➡️ Kiểm tra Firestore Rules, đảm bảo allow read: if true

### App không hiển thị data
➡️ Mở Console trong Expo, xem có lỗi gì không
➡️ Kiểm tra collection name phải là "temples"

### Không thấy file .env
➡️ File .env có thể bị ẩn, bật hiển thị file ẩn
➡️ Hoặc tạo mới: `echo "" > .env`

---

## 📱 KIỂM TRA KẾT QUẢ

Sau khi setup xong, bạn sẽ thấy:
- ✅ Loading screen khi mở app
- ✅ Trang Home hiển thị danh sách chùa từ Firebase
- ✅ Section "Danh mục yêu thích" có data thật
- ✅ Section "Địa điểm gần bạn" có data thật

---

## 🎯 NEXT STEPS

1. Thêm nhiều data hơn vào Firestore
2. Upload hình ảnh thật lên Firebase Storage
3. Implement tính năng tìm kiếm
4. Thêm authentication
5. Implement favorite toggle
6. Thêm map view với Google Maps

---

## 📞 CẦN TRỢ GIÚP?

Nếu gặp vấn đề, check:
1. File FIREBASE_SETUP.md (hướng dẫn chi tiết)
2. Firebase Console > Firestore > Data tab
3. Expo terminal logs
4. Browser console (nếu chạy web)
