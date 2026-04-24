import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDInHeTU4IWo4kVVsho62WcK6Vg9f83vfg",
  authDomain: "khmergo-ba0b0.firebaseapp.com",
  projectId: "khmergo-ba0b0",
  storageBucket: "khmergo-ba0b0.firebasestorage.app",
  messagingSenderId: "563133852511",
  appId: "1:563133852511:web:f5b7f2aebeab097a3064ea"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CATEGORIES = [
  {
    id: "places",
    name: "Chùa Khmer",
    description: "Tìm hiểu về các ngôi chùa Khmer nổi tiếng",
    icon: "business",
    color: "#4caf50",
    displayOrder: 1
  },
  {
    id: "history",
    name: "Văn hóa",
    description: "Khám phá lịch sử và văn hóa truyền thống",
    icon: "library",
    color: "#2196f3",
    displayOrder: 2
  },
  {
    id: "food",
    name: "Ẩm thực",
    description: "Món ăn truyền thống đặc sắc",
    icon: "restaurant",
    color: "#ff9800",
    displayOrder: 3
  }
];

async function updateSystem() {
  try {
    // 1. Dọn dẹp danh mục
    console.log('🧹 Đang dọn dẹp danh mục cũ...');
    const catSnapshot = await getDocs(collection(db, 'quizCategories'));
    for (const d of catSnapshot.docs) {
      await deleteDoc(doc(db, 'quizCategories', d.id));
    }

    // 2. Nạp danh mục mới
    console.log('🚀 Đang nạp danh mục: Chùa Khmer, Văn hóa, Ẩm thực...');
    for (const cat of CATEGORIES) {
      await setDoc(doc(db, 'quizCategories', cat.id), cat);
    }

    // 3. Cập nhật bộ Quiz Chùa Âng vào mục 'Chùa Khmer' (places)
    console.log('📝 Đang chuyển bộ Quiz Chùa Âng sang mục "Chùa Khmer"...');
    const quizSnapshot = await getDocs(collection(db, 'quizzes'));
    for (const d of quizSnapshot.docs) {
      if (d.data().title.includes('Chùa Âng')) {
        await updateDoc(doc(db, 'quizzes', d.id), {
          categoryId: "places",
          category: "Chùa Khmer"
        });
        console.log(`✅ Đã cập nhật xong Quiz: ${d.data().title}`);
      }
    }

    console.log('🎉 Hoàn thành! Bạn hãy kiểm tra lại giao diện nhé.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

updateSystem();
