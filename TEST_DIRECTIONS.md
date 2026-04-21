# Test Directions Navigation Fix

## Vấn đề đã sửa
- **Trước**: Từ pagoda-detail → directions → back → quiz (SAI)
- **Sau**: Từ pagoda-detail → directions → back → pagoda-detail (ĐÚNG)

## Cách hoạt động mới
1. **Từ pagoda-detail**: Truyền `source: 'pagoda-detail'` → back về pagoda-detail
2. **Từ index (gần bạn)**: Truyền `source: 'index'` → back về trang chủ
3. **Từ explore**: Truyền `source: 'explore'` → back về explore
4. **Fallback**: Nếu không có source → thử router.back() → nếu không được thì về home

## Test cases cần kiểm tra

### 1. Test từ Pagoda Detail ✅
1. Trang chủ → Chùa Khmer → Chọn chùa → Chi tiết chùa
2. Nhấn "Chỉ đường" → Trang Directions
3. Nhấn nút back ← → **Phải về trang chi tiết chùa (không phải quiz)**

### 2. Test từ Index (Gần bạn) ✅
1. Trang chủ → Xem "Địa điểm gần bạn"
2. Nhấn nút → → Trang Directions  
3. Nhấn nút back ← → **Phải về trang chủ**

### 3. Test từ Explore ✅
1. Tab Explore → Chọn chùa
2. Nhấn icon navigate → Trang Directions
3. Nhấn nút back ← → **Phải về trang Explore**

## Code changes

### directions.tsx
```tsx
const handleBackPress = () => {
  const source = params.source as string;
  
  if (source === 'pagoda-detail') {
    router.push({ pathname: '/pagoda-detail', params: {...} });
  } else if (source === 'explore') {
    router.push('/explore');
  } else if (source === 'index') {
    router.push('/');
  } else {
    // Fallback
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  }
};
```

### Các trang gọi directions
- **pagoda-detail.tsx**: Thêm `source: 'pagoda-detail'`
- **index.tsx**: Thêm `source: 'index'`  
- **explore.tsx**: Thêm `source: 'explore'`