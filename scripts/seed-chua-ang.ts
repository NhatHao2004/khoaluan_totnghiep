import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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

const CHUA_ANG_QUIZ = {
  title: "Tìm hiểu về Chùa Âng",
  description: "Khám phá vẻ đẹp kiến trúc và lịch sử lâu đời của ngôi chùa Khmer cổ kính tại Trà Vinh.",
  imageUrl: "https://vcdn1-dulich.vnecdn.net/2021/03/10/Chua-Ang-1-1615365518.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Z3fU5sP6YFp8aR-xZ9U6Rg",
  categoryId: "history",
  category: "Văn hóa",
  totalQuestions: 5,
  maxPoints: 50,
  duration: 5,
  difficulty: "easy",
  difficultyText: "Dễ",
  isActive: true,
  createdAt: new Date()
};

const QUESTIONS = [
  {
    questionText: "Chùa Âng được xây dựng vào khoảng thời gian nào?",
    options: ["Thế kỷ 10", "Thế kỷ 12", "Thế kỷ 16", "Thế kỷ 18"],
    correctOptionIndex: 0,
    points: 10,
    explanation: "Chùa Âng (tên đầy đủ là Wat Angkor Raigborei) được xây dựng cổ xưa nhất vào khoảng năm 990 (thế kỷ thứ 10)."
  },
  {
    questionText: "Chùa Âng nằm trong môi trường như thế nào?",
    options: ["Giữa trung tâm thành phố", "Gần biển", "Giữa rừng cây xanh mát", "Trên núi cao"],
    correctOptionIndex: 2,
    points: 10,
    explanation: "Chùa Âng nằm trong khuôn viên thắng cảnh Ao Bà Om, xung quanh là những hàng cây cổ thụ hàng trăm năm tuổi xanh mát."
  },
  {
    questionText: "Kiến trúc của chùa Âng mang phong cách gì?",
    options: ["Hiện đại", "Cổ điển phương Tây", "Truyền thống Khmer", "Gothic"],
    correctOptionIndex: 2,
    points: 10,
    explanation: "Chùa Âng là một trong những ngôi chùa tiêu biểu nhất cho phong cách kiến trúc chùa Khmer ở Nam Bộ."
  },
  {
    questionText: "Điều gì làm nổi bật kiến trúc của chùa Âng?",
    options: ["Màu sắc đơn giản", "Đường nét tinh xảo và gam màu rực rỡ", "Kết cấu bằng thép hiện đại", "Thiết kế tối giản"],
    correctOptionIndex: 1,
    points: 10,
    explanation: "Ngôi chùa nổi bật với những hoa văn chạm khắc tinh xảo, rực rỡ mang đậm dấu ấn nghệ thuật Khmer cổ."
  },
  {
    questionText: "Vai trò của chùa Âng đối với cộng đồng Khmer là gì?",
    options: ["Trung tâm thương mại", "Khu vui chơi giải trí", "Trung tâm sinh hoạt văn hóa", "Nơi sản xuất thủ công"],
    correctOptionIndex: 2,
    points: 10,
    explanation: "Chùa không chỉ là nơi tu hành mà còn là trung tâm giáo dục, sinh hoạt văn hóa tinh thần quan trọng của đồng bào Khmer."
  }
];

async function seed() {
  try {
    console.log('🚀 Đang đẩy dữ liệu Chùa Âng lên Firebase...');
    const quizRef = await addDoc(collection(db, 'quizzes'), CHUA_ANG_QUIZ);
    console.log(`✅ Đã tạo Quiz ID: ${quizRef.id}`);
    
    const questionsCollection = collection(db, 'quizzes', quizRef.id, 'questions');
    for (const q of QUESTIONS) {
      await addDoc(questionsCollection, q);
    }
    console.log('🎉 Thành công! Bạn hãy mở app và kiểm tra nhé.');
    process.exit(0);
  } catch (e) {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  }
}

seed();
