/*
 * TOÀN BỘ NỘI DUNG WEBSITE NẰM Ở ĐÂY.
 * Sửa file này để thay tên, ngày giờ, địa điểm, câu chuyện, ảnh, Q&A...
 * Những chỗ ghi "MẪU" là nội dung giả định, cần thay bằng thông tin thật.
 *
 * Ảnh: đặt file vào thư mục images/ rồi điền đường dẫn vào "src",
 * ví dụ src: "images/hero.jpg". Để trống src thì hiện khối màu giữ chỗ.
 * tone: "olive" | "sand" | "clay" | "ink" | "stone"
 */
window.WEDDING = {
  config: {
    // Mã mở admin.html khi CHƯA dùng Google Sheet. File này khách đọc được nên chỉ để tránh xem nhầm.
    // Khi đã điền remoteEndpoint, mã được kiểm tra ở Apps Script (ADMIN_CODE trong Code.gs), không dùng mã này.
    adminCode: "demo-local-1010",
    // URL web app của Google Apps Script (kết thúc bằng /exec). Xem SETUP_GOOGLE_SHEET.md.
    // Để trống thì dữ liệu chỉ lưu trên từng thiết bị.
    remoteEndpoint: "https://script.google.com/macros/s/AKfycbyWvHvTLQSvvJ4V_HUTYJd-k2inGMERNWmZqgoQem03BrvVAEQswmixQSTE-CUq6OczkA/exec",
    // Bật true để hiện mục mừng cưới trong Q&A.
    showGift: false
  },

  couple: {
    bride: "Hà Vy",
    groom: "Thanh An",
    monogram: "V & A",
    hashtag: "#VyAn101026",
    tagline: "Mời bạn đến chung vui trong ngày chúng mình về chung một nhà."
  },

  event: {
    title: "Lễ cưới Hà Vy & Thanh An",
    start: "2026-10-10T17:30:00+07:00",
    end: "2026-10-10T22:00:00+07:00",
    rsvpDeadline: "2026-10-07T23:59:59+07:00",
    dateLabel: "Thứ Bảy, 10.10.2026",
    timeLabel: "17:30",
    rsvpDeadlineLabel: "07.10.2026"
  },

  // MẪU: địa điểm giả định
  venue: {
    name: "The Glasshouse",
    address: "12 Đường Ven Sông, Thảo Điền, Quận 2, TP. Hồ Chí Minh",
    mapQuery: "Thảo Điền, Quận 2, TP. Hồ Chí Minh",
    notes: [
      { label: "Gửi xe", text: "Bãi xe ô tô và xe máy miễn phí ngay trong khuôn viên." },
      { label: "Di chuyển", text: "Cách trung tâm Quận 1 khoảng 20 phút. Nên đặt xe công nghệ nếu bạn dự định nâng ly." },
      { label: "Thời tiết", text: "Lễ diễn ra ngoài vườn, tiệc trong nhà kính. Nếu mưa, toàn bộ chuyển vào trong." }
    ],
    image: { src: "", tone: "stone", label: "Venue", alt: "Không gian nhà kính nơi tổ chức lễ cưới" }
  },

  hero: {
    image: { src: "", tone: "olive", label: "Hà Vy & Thanh An", alt: "Ảnh chân dung Hà Vy và Thanh An" }
  },

  // MẪU: câu chuyện giả định
  story: [
    {
      year: "2019",
      title: "Một chiều mưa ở Đà Lạt",
      text: "Hai người lạ trú mưa dưới cùng một mái hiên quán cà phê. Vy mượn An chiếc sạc điện thoại, An mượn Vy mười lăm phút trò chuyện. Mười lăm phút ấy kéo dài đến tận tối.",
      image: { src: "", tone: "stone", label: "2019", alt: "Quán cà phê ở Đà Lạt nơi hai người gặp nhau" }
    },
    {
      year: "2021",
      title: "Sài Gòn, hai đầu thành phố",
      text: "Những bữa tối nấu vội, những cuộc gọi video qua mùa giãn cách, và một danh sách dài các nơi sẽ đi cùng nhau khi mọi thứ trở lại bình thường.",
      image: { src: "", tone: "sand", label: "2021", alt: "Bữa tối tại nhà của hai người" }
    },
    {
      year: "2024",
      title: "Căn bếp chung đầu tiên",
      text: "Chúng mình dọn về một căn hộ nhỏ có ban công nhiều nắng. An học cách pha cà phê đúng ý Vy, Vy học cách chịu đựng playlist của An.",
      image: { src: "", tone: "clay", label: "2024", alt: "Ban công căn hộ đầu tiên của hai người" }
    },
    {
      year: "2025",
      title: "Lời cầu hôn trên đồi",
      text: "Quay lại Đà Lạt, đúng mái hiên năm ấy. Lần này không mưa, chỉ có một chiếc nhẫn và một câu hỏi mà cả hai đã biết trước câu trả lời.",
      image: { src: "", tone: "olive", label: "2025", alt: "Khoảnh khắc cầu hôn ở Đà Lạt" }
    }
  ],

  // span: "tall" | "wide" | "sq" quyết định kích thước ô ảnh trong lưới
  gallery: [
    { src: "", tone: "olive", label: "01", alt: "Ảnh cưới 01", span: "tall" },
    { src: "", tone: "sand", label: "02", alt: "Ảnh cưới 02", span: "wide" },
    { src: "", tone: "ink", label: "03", alt: "Ảnh cưới 03", span: "sq" },
    { src: "", tone: "clay", label: "04", alt: "Ảnh cưới 04", span: "sq" },
    { src: "", tone: "stone", label: "05", alt: "Ảnh cưới 05", span: "wide" },
    { src: "", tone: "olive", label: "06", alt: "Ảnh cưới 06", span: "tall" },
    { src: "", tone: "sand", label: "07", alt: "Ảnh cưới 07", span: "sq" },
    { src: "", tone: "ink", label: "08", alt: "Ảnh cưới 08", span: "sq" }
  ],

  // MẪU: lịch trình giả định
  schedule: [
    { time: "17:30", title: "Đón khách", text: "Cocktail chào mừng và chụp ảnh tại sân vườn." },
    { time: "18:15", title: "Lễ thành hôn", text: "Nghi thức trao nhẫn dưới vòm cây, kéo dài khoảng 25 phút." },
    { time: "19:00", title: "Tiệc tối", text: "Thực đơn năm món phục vụ tại bàn, cùng những lời chúc từ gia đình." },
    { time: "20:30", title: "Điệu nhảy đầu tiên", text: "Cắt bánh, rót rượu và mở sàn nhảy." },
    { time: "21:00", title: "After-party", text: "Playlist do chính các bạn gợi ý. Kết thúc lúc 22:00." }
  ],

  dressCode: {
    title: "Trang trọng, tông trung tính",
    text: "Chúng mình mong có một khung hình hài hòa với màu của khu vườn. Suit, váy dài hoặc áo dài đều rất hợp.",
    palette: [
      { name: "Kem", hex: "#EFE7D8" },
      { name: "Be", hex: "#D8C7AC" },
      { name: "Olive", hex: "#5B6140" },
      { name: "Nâu", hex: "#7A5C45" },
      { name: "Đen", hex: "#1E1D1A" }
    ],
    dos: ["Suit hoặc vest tông trầm", "Váy midi, váy dài, áo dài", "Giày đế bằng hoặc đế vuông vì có đi trên cỏ"],
    donts: ["Trắng toàn thân", "Màu neon hoặc họa tiết quá nổi", "Quần short, dép lê"]
  },

  qa: [
    { q: "Tôi cần xác nhận tham dự trước ngày nào?", a: "Vui lòng RSVP trước ngày 07.10.2026 để chúng mình sắp xếp chỗ ngồi và thực đơn." },
    { q: "Tôi có thể đi cùng người thân không?", a: "Có. Bạn chọn số người đi cùng ngay trong form RSVP, tối đa 4 người." },
    { q: "Trẻ em có được tham dự không?", a: "Rất hoan nghênh. Hãy tính các bé vào số người đi cùng để chúng mình chuẩn bị ghế phù hợp." },
    { q: "Tôi ăn chay hoặc bị dị ứng thực phẩm thì sao?", a: "Hãy ghi rõ trong mục chế độ ăn của form RSVP, bếp sẽ chuẩn bị phần riêng cho bạn." },
    { q: "Nếu trời mưa thì sao?", a: "Phần lễ sẽ chuyển vào nhà kính. Lịch trình không thay đổi." },
    { q: "Tôi có thể chụp ảnh trong buổi lễ không?", a: "Trong 25 phút làm lễ, chúng mình mong bạn cất điện thoại để cùng tận hưởng khoảnh khắc. Sau đó thì cứ thoải mái, và đừng quên hashtag." },
    { q: "Tôi đã RSVP nhưng muốn thay đổi?", a: "Mở lại trang này trên cùng thiết bị và bấm \"Chỉnh sửa\" ở mục RSVP, hoặc nhắn trực tiếp cho chúng mình." }
  ],

  // MẪU: chỉ hiện khi config.showGift = true
  gift: {
    q: "Tôi muốn gửi quà mừng thì thế nào?",
    a: "Sự có mặt của bạn đã là món quà. Nếu bạn vẫn muốn gửi, thông tin chuyển khoản: Ngân hàng MẪU, số tài khoản 0000 0000 00, chủ tài khoản HA VY."
  },

  // MẪU: liên hệ giả định
  contact: [
    { name: "Hà Vy", phone: "0900 000 001" },
    { name: "Thanh An", phone: "0900 000 002" }
  ],

  thanks: {
    title: "Cảm ơn bạn đã đến",
    text: "Ngày 10.10.2026 đã trọn vẹn nhờ có bạn. Chúng mình sẽ sớm gửi ảnh đến mọi người."
  }
};
