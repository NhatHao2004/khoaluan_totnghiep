export interface DiscoveryItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl: any;
  category: string;
  detailedContent?: string[];
  location?: string;
}

export const DISCOVERY_DATA: Record<string, DiscoveryItem[]> = {
  culture: [
    {
      id: 'cult-1',
      title: 'Trang phục Phum Srok',
      subtitle: 'Nét đẹp truyền thống',
      description: 'Tìm hiểu về cách dệt và ý nghĩa hoa văn trên trang phục người Khmer.',
      imageUrl: require('@/assets/images/vanhoa.jpg'),
      category: 'culture',
      detailedContent: [
        'Trang phục truyền thống của người Khmer không chỉ là quần áo mà còn là tác phẩm nghệ thuật...',
        'Họa tiết trên xà rông thường phản ánh các điển tích tôn giáo và thiên nhiên vùng sông nước.'
      ]
    },
    {
      id: 'cult-2',
      title: 'Múa Chhay dăm',
      subtitle: 'Vũ điệu trống sa dăm',
      description: 'Điệu múa trống sôi động trong các dịp lễ Tết của Phum Srok.',
      imageUrl: require('@/assets/images/hoithoai.jpg'),
      category: 'culture',
      detailedContent: ['Múa Chhay dăm là di sản văn hóa phi vật thể quốc gia...']
    },
    {
      id: 'cult-3',
      title: 'Nghệ thuật Rô-băm',
      subtitle: 'Kịch múa cổ điển',
      description: 'Loại hình nghệ thuật sân khấu cung đình đỉnh cao của người Khmer.',
      imageUrl: require('@/assets/images/hoithoai.jpg'),
      category: 'culture'
    },
    {
      id: 'cult-4',
      title: 'Lễ hội Ok Om Bok',
      subtitle: 'Lễ cúng Trăng',
      description: 'Lễ hội quan trọng nhất trong năm của người Khmer Nam Bộ.',
      imageUrl: require('@/assets/images/hoithoai.jpg'),
      category: 'culture'
    },
    {
      id: 'cult-5',
      title: 'Kiến trúc Chùa Tháp',
      subtitle: 'Tinh hoa điêu khắc',
      description: 'Giải mã các biểu tượng linh vật trên mái chùa Khmer.',
      imageUrl: require('@/assets/images/chuaang1.jpg'),
      category: 'culture'
    }
  ],
  cuisine: [
    {
      id: 'food-1',
      title: 'Bún nước lèo',
      subtitle: 'Đặc sản Trà Vinh',
      description: 'Sự kết hợp tinh tế giữa mắm bò hóc và các loại rau đồng.',
      imageUrl: require('@/assets/images/amthuc.jpg'),
      category: 'cuisine',
      detailedContent: ['Bún nước lèo là linh hồn của ẩm thực Khmer Nam Bộ...']
    },
    {
      id: 'food-2',
      title: 'Mắm Bò Hóc',
      subtitle: 'Prahok truyền thống',
      description: 'Gia vị không thể thiếu trong mọi bữa ăn của người Khmer.',
      imageUrl: require('@/assets/images/amok.jpg'),
      category: 'cuisine'
    },
    {
      id: 'food-3',
      title: 'Bánh Ống',
      subtitle: 'Quà quê dân dã',
      description: 'Món bánh thơm mùi lá dứa và nước cốt dừa béo ngậy.',
      imageUrl: require('@/assets/images/nombanh.jpg'),
      category: 'cuisine'
    },
    {
      id: 'food-4',
      title: 'Cơm Rượu',
      subtitle: 'Vị ngọt nồng nàn',
      description: 'Món ăn truyền thống trong các dịp lễ Tết Chol Chnam Thmay.',
      imageUrl: require('@/assets/images/amok.jpg'),
      category: 'cuisine'
    },
    {
      id: 'food-5',
      title: 'Cốm Dẹp',
      subtitle: 'Hương vị mùa trăng',
      description: 'Món ăn gắn liền với lễ hội cúng trăng Ok Om Bok.',
      imageUrl: require('@/assets/images/amok.jpg'),
      category: 'cuisine'
    }
  ],
  education: [
    {
      id: 'lang-1',
      title: 'Bảng chữ cái Khmer',
      subtitle: 'Nhập môn ngôn ngữ',
      description: 'Hướng dẫn cách đọc và viết 33 phụ âm cơ bản.',
      imageUrl: require('@/assets/images/Learn.jpg'),
      category: 'education'
    },
    {
      id: 'lang-2',
      title: 'Câu chào hỏi thông dụng',
      subtitle: 'Giao tiếp cơ bản',
      description: 'Học cách chào "Chum reap sour" và các câu xã giao.',
      imageUrl: require('@/assets/images/hoithoai.jpg'),
      category: 'education'
    },
    {
      id: 'lang-3',
      title: 'Số đếm từ 1 đến 10',
      subtitle: 'Toán học cơ bản',
      description: 'Cách đọc số đếm trong đời thường của người Khmer.',
      imageUrl: require('@/assets/images/Learn.jpg'),
      category: 'education'
    },
    {
      id: 'lang-4',
      title: 'Tên các ngày trong tuần',
      subtitle: 'Thời gian biểu',
      description: 'Tìm hiểu cách gọi tên 7 ngày trong tuần tiếng Khmer.',
      imageUrl: require('@/assets/images/Learn.jpg'),
      category: 'education'
    },
    {
      id: 'lang-5',
      title: 'Gia đình và người thân',
      subtitle: 'Từ vựng chủ đề',
      description: 'Học cách gọi tên các thành viên trong gia đình.',
      imageUrl: require('@/assets/images/giadinh.jpg'),
      category: 'education'
    }
  ],
  games: [
    {
      id: 'game-1',
      title: 'Đẩy gậy',
      subtitle: 'Sức mạnh và ý chí',
      description: 'Trò chơi dân gian thể hiện tinh thần thượng võ.',
      imageUrl: require('@/assets/images/games.jpg'),
      category: 'games'
    },
    {
      id: 'game-2',
      title: 'Kéo co',
      subtitle: 'Tình đoàn kết',
      description: 'Môn thi đấu tập thể không thể thiếu trong lễ hội.',
      imageUrl: require('@/assets/images/hoithoai.jpg'),
      category: 'games'
    },
    {
      id: 'game-3',
      title: 'Nhảy bao bố',
      subtitle: 'Sự khéo léo',
      description: 'Trò chơi mang lại tiếng cười cho cả phum sóc.',
      imageUrl: require('@/assets/images/hoithoai.jpg'),
      category: 'games'
    },
    {
      id: 'game-4',
      title: 'Đập nồi đất',
      subtitle: 'Thử thách mù',
      description: 'Trò chơi đòi hỏi sự định hướng và lắng nghe.',
      imageUrl: require('@/assets/images/hoithoai.jpg'),
      category: 'games'
    },
    {
      id: 'game-5',
      title: 'Chọi gà',
      subtitle: 'Trò chơi truyền thống',
      description: 'Một nét sinh hoạt văn hóa dân gian lâu đời.',
      imageUrl: require('@/assets/images/hoithoai.jpg'),
      category: 'games'
    }
  ],
  challenges: [
    {
      id: 'chal-1',
      title: 'Người kể chuyện hay',
      subtitle: 'Thử thách kể điển tích',
      description: 'Thử thách thuật lại một câu chuyện về vua Baksei Chamkrong.',
      imageUrl: require('@/assets/images/quiz.jpg'),
      category: 'challenges'
    },
    {
      id: 'chal-2',
      title: 'Đầu bếp Khmer',
      subtitle: 'Thử thách nấu Amok',
      description: 'Tự tay chuẩn bị nguyên liệu cho món Amok truyền thống.',
      imageUrl: require('@/assets/images/amok.jpg'),
      category: 'challenges'
    },
    {
      id: 'chal-3',
      title: 'Nghệ nhân múa',
      subtitle: 'Thử thách múa Saravane',
      description: 'Học và quay lại một đoạn múa Saravane cơ bản.',
      imageUrl: require('@/assets/images/hoithoai.jpg'),
      category: 'challenges'
    },
    {
      id: 'chal-4',
      title: 'Kẻ sĩ Khmer',
      subtitle: 'Thử thách viết chữ',
      description: 'Tập viết câu châm ngôn Khmer bằng bút lông.',
      imageUrl: require('@/assets/images/Learn.jpg'),
      category: 'challenges'
    },
    {
      id: 'chal-5',
      title: 'Thám hiểm Phum Srok',
      subtitle: 'Thử thách check-in',
      description: 'Ghé thăm 3 ngôi chùa khác nhau trong cùng một ngày.',
      imageUrl: require('@/assets/images/hoithoai.jpg'),
      category: 'challenges'
    }
  ]
};

export const getDiscoveryItems = (categoryId: string, limit: number = 5): DiscoveryItem[] => {
  const items = DISCOVERY_DATA[categoryId] || [];
  // Shuffle and pick
  return [...items].sort(() => 0.5 - Math.random()).slice(0, limit);
};
