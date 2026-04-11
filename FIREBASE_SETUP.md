# Hướng dẫn Setup Firebase cho KhmerGo

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" hoặc "Thêm dự án"
3. Đặt tên project: `khmergoo` hoặc tên bạn muốn
4. Tắt Google Analytics (không bắt buộc)
5. Click "Create project"

## Bước 2: Thêm Web App

1. Trong Firebase Console, click vào icon Web (</>) để thêm web app
2. Đặt tên app: "KhmerGo"
3. Click "Register app"
4. Copy Firebase configuration (firebaseConfig object)

## Bước 3: Cấu hình Firebase trong Project

1. Tạo file `.env` trong thư mục root:
```bash
cp .env.example .env
```

2. Paste Firebase config vào file `.env`:
```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

3. Cập nhật file `config/firebase.ts` để sử dụng env variables:
```typescript
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};
```

## Bước 4: Enable Firestore Database

1. Trong Firebase Console, vào "Firestore Database"
2. Click "Create database"
3. Chọn "Start in test mode" (cho development)
4. Chọn location gần nhất (asia-southeast1 cho Việt Nam)
5. Click "Enable"

## Bước 5: Enable Authentication (Optional)

1. Vào "Authentication" trong Firebase Console
2. Click "Get started"
3. Enable các phương thức đăng nhập bạn muốn:
   - Email/Password
   - Google
   - Facebook
   - etc.

## Bước 6: Enable Storage (Optional)

1. Vào "Storage" trong Firebase Console
2. Click "Get started"
3. Chọn "Start in test mode"
4. Click "Done"

## Bước 7: Tạo Collection và Sample Data

1. Vào Firestore Database
2. Click "Start collection"
3. Collection ID: `temples`
4. Thêm document mẫu:

```json
{
  "name": "Chùa Áng",
  "location": "Vĩnh Long",
  "description": "Chùa Khmer nổi tiếng tại Vĩnh Long",
  "imageUrl": "https://example.com/chua-ang.jpg",
  "latitude": 10.2397,
  "longitude": 105.9722,
  "category": "Chùa Khmer",
  "isFavorite": true
}
```

## Bước 8: Cập nhật Security Rules

Trong Firestore Database > Rules, cập nhật rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read for all
    match /temples/{temple} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /categories/{category} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Bước 9: Test Connection

Restart Expo development server:
```bash
npm start
```

## Cấu trúc Database

### Collection: temples
```typescript
{
  id: string (auto-generated)
  name: string
  location: string
  description: string
  imageUrl: string
  latitude: number
  longitude: number
  category: string
  isFavorite: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Collection: categories
```typescript
{
  id: string (auto-generated)
  name: string
  icon: string
  description: string
  order: number
}
```

### Collection: users (optional)
```typescript
{
  id: string (uid from auth)
  email: string
  displayName: string
  photoURL: string
  favorites: string[] (array of temple IDs)
  createdAt: timestamp
}
```

## Troubleshooting

### Lỗi: "Firebase: Error (auth/api-key-not-valid)"
- Kiểm tra lại API key trong file .env
- Đảm bảo không có khoảng trắng thừa

### Lỗi: "Firebase: Firebase App named '[DEFAULT]' already exists"
- Firebase đã được khởi tạo rồi
- Restart app

### Lỗi: "Missing or insufficient permissions"
- Kiểm tra Firestore Security Rules
- Đảm bảo rules cho phép read/write

## Next Steps

1. Thêm sample data vào Firestore
2. Test các functions trong `services/firebase-service.ts`
3. Tích hợp vào UI components
4. Thêm loading states và error handling
5. Implement authentication nếu cần
