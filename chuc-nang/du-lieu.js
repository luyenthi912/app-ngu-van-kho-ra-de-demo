(function () {
  const KHOA_TU_BO_SUNG = "kho_ngu_lieu_the_tu_bo_sung";

  const TIEU_CHI = [
    { so: "1", ten: "Tính trọn vẹn", hoi: "Đoạn trích có đủ ý, đọc độc lập vẫn hiểu được không" },
    { so: "2", ten: "Giá trị", hoi: "Có giá trị tư tưởng, thẩm mĩ và phù hợp lứa tuổi không" },
    { so: "3", ten: "Khớp lớp và bài", hoi: "Đúng thể loại, đủ yếu tố để hỏi theo yêu cầu cần đạt của bài không" },
    { so: "4", ten: "Khả năng đặt câu hỏi", hoi: "Đủ chất liệu cho mức Biết, Hiểu, Vận dụng và cho phần Viết không" },
    { so: "5", ten: "Dung lượng", hoi: "Số chữ có hợp với độ dài thường dùng của lớp không, có cần lời dẫn hay cắt bớt không" },
    { so: "6", ten: "Độ mới", hoi: "Có trùng sách giáo khoa hoặc quá quen trong các bộ đề không" },
    { so: "7", ten: "Chú thích", hoi: "Từ khó, điển tích, bối cảnh nào cần giải thích" }
  ];

  const DS_LOP = [6, 7, 8, 9, 10, 11, 12];

  const CAY_DE_TAI = [
    { ten: "Gia đình", con: ["Người mẹ", "Người cha", "Ông bà", "Anh chị em", "Tình cảm gia đình"] },
    { ten: "Quê hương, đất nước", con: ["Quê hương, làng quê", "Đất nước", "Biển đảo", "Miền núi, dân tộc thiểu số", "Phố phường, đô thị"] },
    { ten: "Chiến tranh và lịch sử", con: ["Chiến tranh, người lính", "Người anh hùng", "Lãnh tụ", "Lịch sử dân tộc", "Cuộc sống sau chiến tranh"] },
    { ten: "Con người trong xã hội", con: ["Người nông dân", "Người phụ nữ", "Người trí thức", "Người nghệ sĩ", "Người lao động", "Trẻ em, tuổi thơ", "Tuổi trẻ", "Xã hội phong kiến", "Đời sống thường ngày"] },
    { ten: "Tình cảm con người", con: ["Tình yêu đôi lứa", "Tình bạn", "Thầy trò, nhà trường", "Tình làng nghĩa xóm"] },
    { ten: "Thiên nhiên", con: ["Thiên nhiên, cảnh vật", "Mùa, thời tiết", "Loài vật"] },
    { ten: "Kì ảo, tâm linh", con: ["Thần linh, thế giới kì ảo", "Phong tục, tín ngưỡng"] },
    { ten: "Văn chương, nghệ thuật", con: ["Văn chương, người viết", "Ngôn ngữ, tiếng Việt", "Nghệ thuật truyền thống", "Đọc sách"] },
    { ten: "Vấn đề đời sống (nghị luận, thông tin)", con: ["Văn hóa, di sản", "Giáo dục, học tập", "Khoa học, vũ trụ", "Công nghệ, trí tuệ nhân tạo", "Không gian số, mạng xã hội", "Môi trường, khí hậu", "Sức khỏe", "Lối sống, đạo đức", "Hòa bình, hội nhập"] }
  ];
  const DS_DE_TAI = CAY_DE_TAI.flatMap(n => n.con);

  const CAY_LOP = [
    { ten: "THCS", con: ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"] },
    { ten: "THPT", con: ["Lớp 10", "Lớp 11", "Lớp 12"] }
  ];
  const CAY_THE_LOAI = [
    { ten: "Thơ", con: ["Thơ lục bát", "Thơ bốn chữ, năm chữ", "Thơ sáu chữ, bảy chữ, tám chữ", "Thơ song thất lục bát", "Thơ Đường luật", "Thơ hai-cư", "Thơ tự do", "Thơ trữ tình", "Thơ có yếu tố tự sự, miêu tả", "Thơ trào phúng"] },
    { ten: "Ca dao, tục ngữ", con: ["Ca dao", "Tục ngữ"] },
    { ten: "Truyện", con: ["Thần thoại", "Truyền thuyết", "Truyện cổ tích", "Truyện đồng thoại", "Truyện ngụ ngôn", "Truyện cười", "Truyện truyền kì", "Truyện thơ Nôm", "Truyện thơ dân gian", "Truyện ngắn", "Truyện lịch sử", "Truyện khoa học viễn tưởng", "Truyện trinh thám", "Tiểu thuyết"] },
    { ten: "Sử thi", con: ["Sử thi"] },
    { ten: "Kí", con: ["Hồi kí", "Du kí", "Nhật kí", "Tùy bút", "Tản văn", "Phóng sự"] },
    { ten: "Kịch", con: ["Chèo", "Tuồng", "Bi kịch", "Hài kịch"] },
    { ten: "Nghị luận", con: ["Nghị luận xã hội", "Nghị luận văn học", "Nghị luận trung đại (chiếu, cáo, hịch)"] },
    { ten: "Văn bản thông tin", con: ["Văn bản thông tin"] }
  ];
  const TEN_BAI = {
    6: ["Tôi và các bạn", "Gõ cửa trái tim", "Yêu thương và chia sẻ", "Quê hương yêu dấu", "Những nẻo đường xứ sở", "Chuyện kể về những người anh hùng", "Thế giới cổ tích", "Khác biệt và gần gũi", "Trái Đất - ngôi nhà chung", "Cuốn sách tôi yêu"],
    7: ["Bầu trời tuổi thơ", "Khúc nhạc tâm hồn", "Cội nguồn yêu thương", "Giai điệu đất nước", "Màu sắc trăm miền", "Bài học cuộc sống", "Thế giới viễn tưởng", "Trải nghiệm để trưởng thành", "Hòa điệu với tự nhiên", "Trang sách và cuộc sống"],
    8: ["Câu chuyện của lịch sử", "Vẻ đẹp cổ điển", "Lời sông núi", "Tiếng cười trào phúng trong thơ", "Những câu chuyện hài", "Chân dung cuộc sống", "Tin yêu và ước vọng", "Nhà văn và trang viết", "Hôm nay và ngày mai", "Sách - người bạn đồng hành"],
    9: ["Thế giới kì ảo", "Những cung bậc tâm trạng", "Hồn nước nằm trong tiếng mẹ cha", "Khám phá vẻ đẹp văn chương", "Đối diện với nỗi đau", "Giải mã những bí mật", "Hồn thơ muôn điệu", "Tiếng nói của lương tri", "Đi và suy ngẫm", "Văn học - lịch sử tâm hồn"],
    10: ["Sức hấp dẫn của truyện kể", "Vẻ đẹp của thơ ca", "Nghệ thuật thuyết phục trong văn nghị luận", "Sức sống của sử thi", "Tích trò sân khấu dân gian", "Nguyễn Trãi - “Dành còn để trợ dân này”", "Quyền năng của người kể chuyện", "Thế giới đa dạng của thông tin", "Hành trang cuộc sống"],
    11: ["Câu chuyện và điểm nhìn trong truyện kể", "Cấu tứ và hình ảnh trong thơ trữ tình", "Cấu trúc của văn bản nghị luận", "Tự sự trong truyện thơ dân gian và trong thơ trữ tình", "Nhân vật và xung đột trong bi kịch", "Nguyễn Du - “Những điều trông thấy mà đau đớn lòng”", "Ghi chép và tưởng tượng trong kí", "Cấu trúc của văn bản thông tin", "Lựa chọn và hành động"],
    12: ["Khả năng lớn lao của tiểu thuyết", "Những thế giới thơ", "Lập luận trong văn bản nghị luận", "Yếu tố kì ảo trong truyện kể", "Tiếng cười của hài kịch", "Hồ Chí Minh - “Văn hoá phải soi đường cho quốc dân đi”", "Sự thật trong tác phẩm kí", "Dữ liệu trong văn bản thông tin", "Văn học và cuộc đời"]
  };
  const DS_BAI = {};
  Object.keys(TEN_BAI).forEach(l => DS_BAI[l] = TEN_BAI[l].map((t, i) => "Bài " + (i + 1) + ". " + t));

  const DS_GIAI_DOAN = ["Văn học dân gian", "Văn học trung đại Việt Nam", "Văn học Việt Nam đầu thế kỉ XX đến 1945", "Văn học Việt Nam 1945 đến 1975", "Văn học Việt Nam sau 1975", "Văn học nước ngoài"];

  function nhomTheLoai(tl) {
    const n = CAY_THE_LOAI.find(g => g.con.includes(tl));
    return n ? n.ten : "";
  }
  function laTho(t) {
    return ["Thơ", "Ca dao, tục ngữ"].includes(nhomTheLoai(t.the_loai)) || /^Truyện thơ/.test(t.the_loai || "");
  }

  function docTuBoSung() {
    try { return JSON.parse(localStorage.getItem(KHOA_TU_BO_SUNG) || "[]"); }
    catch (e) { return []; }
  }
  function ghiTuBoSung(ds) {
    localStorage.setItem(KHOA_TU_BO_SUNG, JSON.stringify(ds));
  }

  function demChu(vb) {
    if (!vb) return 0;
    return vb.split(/\s+/).filter(t => /[\p{L}\p{N}]/u.test(t)).length;
  }
  function demDong(vb) {
    if (!vb) return 0;
    return vb.split("\n").filter(d => d.trim()).length;
  }

  function capHocCuaLop(lop) { return lop <= 9 ? "THCS" : "THPT"; }

  function chuanHoa(t, nguonGoc) {
    t.nguon_goc = nguonGoc;
    if (t.van_ban != null || !t.so_chu) { t.so_chu = demChu(t.van_ban); t.so_dong = demDong(t.van_ban); }
    t.phu_hop = t.phu_hop || [];
    t.lop = [...new Set(t.phu_hop.map(p => Number(p.lop)))].sort((a, b) => a - b);
    t.cap_hoc = [...new Set(t.lop.map(capHocCuaLop))];
    t.de_tai = t.de_tai || [];
    t.da_dung = t.da_dung || [];
    t.kiem_dinh = t.kiem_dinh || { ket_qua: "", tieu_chi: {}, viec_can_sua: "" };
    t.trung_sgk = t.trung_sgk || { ket_qua: "Chưa xét", van_ban_sgk: "" };
    return t;
  }

  function taiKho() {
    const ds = [];
    (window.KHO_LO || []).forEach(lo => lo.the.forEach(t => ds.push(chuanHoa(Object.assign({ lo: lo.lo }, t), "Kho"))));
    docTuBoSung().filter(t => !t.nhap).forEach(t => ds.push(chuanHoa(Object.assign({ lo: "Tự bổ sung" }, t), "Tự bổ sung")));
    return ds;
  }

  function dongNguon(n) {
    if (!n) return "";
    const p = [];
    if (n.tac_gia) p.push(n.tac_gia);
    if (n.tac_pham) p.push("“" + n.tac_pham + "”");
    if (n.sach_tap) p.push(n.sach_tap);
    if (n.bao) p.push(n.bao);
    if (n.ngay_dang) p.push(n.ngay_dang);
    if (n.nxb) p.push("NXB " + n.nxb);
    if (n.nam) p.push(n.nam);
    if (n.trang) p.push("tr. " + n.trang);
    if (n.duong_dan) p.push(n.duong_dan);
    return p.join(", ");
  }

  const chuan = x => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, " ").trim();
  function cungTacGia(a, b) {
    a = chuan(a); b = chuan(b);
    return a.length >= 4 && b.length >= 4 && (a.includes(b) || b.includes(a));
  }
  function doiChieuSgk(t) {
    const ten = chuan(t.nhan_de), tp = chuan(t.nguon && t.nguon.tac_pham), tg = t.nguon && t.nguon.tac_gia;
    if (!ten && !tp) return [];
    const kq = [];
    (window.DANH_MUC_SGK || []).forEach(([lop, bai, tenSgk, tgSgk, goc]) => {
      const a = chuan(tenSgk), g = chuan(goc);
      let kieu = "";
      if (ten && ten === a) kieu = "trùng tên văn bản";
      else if (g && (ten === g || tp === g)) kieu = "cùng tác phẩm với đoạn trích trong SGK";
      else if (cungTacGia(tg, tgSgk) && ten && a.length >= 4 && (ten.includes(a) || a.includes(ten))) kieu = "cùng tác giả, nhan đề gần giống";
      if (kieu) kq.push({ lop, bai, ten: tenSgk, tac_gia: tgSgk, goc, kieu });
    });
    return kq;
  }
  function moTaSgk(x) {
    return `Lớp ${x.lop}, Bài ${x.bai}: “${x.ten}”${x.goc ? " (trích “" + x.goc + "”)" : ""}${x.tac_gia ? ", " + x.tac_gia : ""} (${x.kieu})`;
  }

  window.KhoDuLieu = { doiChieuSgk, moTaSgk, DS_BAI, DS_GIAI_DOAN, TIEU_CHI, DS_LOP, DS_DE_TAI, CAY_DE_TAI, CAY_LOP, CAY_THE_LOAI, nhomTheLoai, laTho, taiKho, docTuBoSung, ghiTuBoSung, demChu, demDong, dongNguon, capHocCuaLop };
})();
