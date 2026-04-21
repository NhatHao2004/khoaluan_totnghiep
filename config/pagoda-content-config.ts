// Configuration file for pagoda content
// Dễ dàng thay đổi nội dung cho từng chùa mà không cần sửa code

export interface PagodaContentConfig {
  [templeId: string]: {
    detailedDescription?: string[];
    additionalImages?: string[];
  };
}

export const PAGODA_CONTENT_CONFIG: PagodaContentConfig = {
  'Chùa Âng': {
    detailedDescription: [
      'Chùa Âng là một trong những ngôi chùa Khmer cổ kính và nổi tiếng nhất tại Trà Vinh. Nằm giữa rừng cây xanh mát, chùa mang đến không gian thanh tịnh, yên bình.',
      'Kiến trúc chùa được xây dựng theo phong cách truyền thống Khmer với những đường nét tinh xảo, màu sắc rực rỡ đặc trưng.',
      'Bên trong chùa lưu giữ nhiều hiện vật quý giá và tượng Phật linh thiêng, thu hút đông đảo phật tử và du khách đến chiêm bái.'
    ],
    additionalImages: [
      'local://chuaang1',
      'local://chuahang'
    ],
  },
  
  'chua-hang': {
    detailedDescription: [
      'Chùa Hang nổi tiếng với kiến trúc độc đáo và không gian yên tĩnh. Đây là nơi tu hành của nhiều sư sãi Khmer và là điểm đến tâm linh quan trọng của cộng đồng.',
      'Ngôi chùa được xây dựng từ thế kỷ 19 với lối kiến trúc Khmer truyền thống, trang trí bằng những họa tiết tinh xảo.',
      'Chùa có không gian rộng rãi với sân vườn xanh mát, tạo cảm giác bình yên cho những ai đến thăm viếng.'
    ],
    additionalImages: [
       'local://chuahang'
    ],
  },

  // Có thể thêm cấu hình cho các chùa khác
  'chua-sleng-cu': {
    detailedDescription: [
      'Chùa Sleng Cu là một trong những ngôi chùa Khmer lâu đời nhất tại An Giang. Chùa có kiến trúc đặc trưng với mái cong vút, trang trí bằng những họa tiết rồng phượng tinh xảo.',
      'Nội thất chùa được trang trí bằng những bức tranh tường mô tả cuộc đời Đức Phật và các câu chuyện Phật giáo.',
      'Đây là trung tâm sinh hoạt tôn giáo và văn hóa quan trọng của cộng đồng Khmer địa phương.'
    ],
  },

  'Chùa Dơn Ta': {
    detailedDescription: [
      'Chùa Dơn Ta được xây dựng từ thế kỷ 16, là một trong những ngôi chùa Khmer cổ kính nhất tại tỉnh Trà Vinh.',
      'Kiến trúc chùa mang đậm phong cách Khmer truyền thống với những đường nét tinh xảo, màu sắc rực rỡ đặc trưng.',
      'Chùa là nơi sinh hoạt tôn giáo và văn hóa quan trọng của cộng đồng người Khmer địa phương.'
    ]
  },

  'Chùa Kompong Chrây': {
    detailedDescription: [
      'Chùa Kompong Chrây được biết đến với tháp chuông cao vút và khuôn viên rộng rãi với nhiều cây xanh.',
      'Nội thất chùa được trang trí bằng những bức tranh tường mô tả cuộc đời Đức Phật và các câu chuyện Phật giáo.',
      'Đây là trung tâm sinh hoạt văn hóa và tôn giáo quan trọng của cộng đồng Khmer tại Trà Vinh.'
    ]
  },

  'Chùa Sà Lôn': {
    detailedDescription: [
      'Chùa Sà Lôn là một trong những ngôi chùa Khmer quan trọng nhất tại Sóc Trăng, nổi tiếng với các lễ hội truyền thống.',
      'Mỗi năm, chùa tổ chức lễ hội Chol Chnam Thmay (Tết Khmer) thu hút hàng nghìn người tham dự.',
      'Kiến trúc chùa kết hợp hài hòa giữa phong cách truyền thống và hiện đại.'
    ]
  },

  'Chùa Chăn Răng': {
    detailedDescription: [
      'Chùa Chăn Răng được xây dựng với màu sắc vàng rực rỡ đặc trưng của kiến trúc Khmer.',
      'Đây là nơi tu học và sinh hoạt của nhiều sư sãi trẻ, góp phần bảo tồn văn hóa Phật giáo Khmer.',
      'Chùa có thư viện Phật học phong phú và tổ chức các lớp học tiếng Khmer cho trẻ em.'
    ]
  },

  'Chùa Pothi Somrong': {
    detailedDescription: [
      'Chùa Pothi Somrong được xây dựng từ thế kỷ 18, lưu giữ nhiều tượng Phật cổ có giá trị nghệ thuật cao.',
      'Khu vườn thiền của chùa được thiết kế theo phong cách Zen với nhiều loài hoa và cây cảnh đẹp.',
      'Chùa là nơi tổ chức các khóa tu thiền ngắn hạn cho phật tử và du khách.'
    ]
  },

  'Chùa Tà Pạ': {
    detailedDescription: [
      'Chùa Tà Pạ là một trong những ngôi chùa Khmer lớn nhất tại An Giang với khuôn viên rộng lớn.',
      'Mỗi năm, chùa tổ chức lễ hội Pchum Ben (lễ cúng tổ tiên) thu hút đông đảo phật tử tham dự.',
      'Chùa có trường học dạy tiếng Khmer và các môn văn hóa truyền thống cho trẻ em Khmer.'
    ]
  },

  'Chùa Xiêm Cán': {
    detailedDescription: [
      'Chùa Xiêm Cán là ngôi chùa Khmer duy nhất tại tỉnh Hậu Giang, được xây dựng vào đầu thế kỷ 20.',
      'Kiến trúc chùa kết hợp phong cách Khmer truyền thống với ảnh hưởng của kiến trúc Việt Nam.',
      'Chùa là trung tâm sinh hoạt tôn giáo và văn hóa của cộng đồng Khmer tại Hậu Giang.'
    ]
  }
};

// Default fallback content
export const DEFAULT_PAGODA_CONTENT = {
  detailedDescription: [
    'Đây là một trong những ngôi chùa Khmer cổ kính và nổi tiếng. Nằm giữa rừng cây xanh mát, chùa mang đến không gian thanh tịnh, yên bình.',
    'Kiến trúc chùa được xây dựng theo phong cách truyền thống Khmer với những đường nét tinh xảo, màu sắc rực rỡ đặc trưng.',
    'Bên trong chùa lưu giữ nhiều hiện vật quý giá và tượng Phật linh thiêng, thu hút đông đảo phật tử và du khách đến chiêm bái.'
  ]
};