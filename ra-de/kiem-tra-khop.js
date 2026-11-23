(function (g) {
  const so = x => Math.round(Number(x || 0) * 100) / 100;
  const viet = x => String(so(x)).replace(".", ",");
  const nhan = c => `${c.phan} câu ${c.so}`;

  function diemTrongDapAn(txt) {
    const r = [], re = /(\d+(?:[.,]\d+)?)\s*(?:điểm|đ)(?![\p{L}])/giu;
    let m;
    while ((m = re.exec(txt || ""))) r.push(parseFloat(m[1].replace(",", ".")));
    return r;
  }

  const MO = "“\"«'", DONG = "”\"»'";
  function tenKhongNgoac(txt, ten) {
    if (!txt || !ten || ten.length < 3) return false;
    let i = txt.indexOf(ten);
    while (i >= 0) {
      const truoc = txt[i - 1] || "", sau = txt[i + ten.length] || "";
      if (!MO.includes(truoc) || !DONG.includes(sau)) return true;
      i = txt.indexOf(ten, i + ten.length);
    }
    return false;
  }
  function cacTen(the) {
    if (!the) return [];
    const ds = [];
    if (the.nhan_de) ds.push(the.nhan_de);
    const m = /“([^”]+)”/.exec(the.nguon || "");
    if (m && !ds.includes(m[1])) ds.push(m[1]);
    return ds;
  }

  function kiemTraKhop(ctx) {
    const { de, khung, yccd, dau, mt, dt } = ctx;
    const nhom = { "Số liệu": [], "Nội dung": [], "Hình thức": [] }, xacNhan = [], theoCau = {};
    const them = (g2, kieu, t, cau) => {
      nhom[g2].push({ kieu, t, cau });
      if (cau && kieu !== "dat") (theoCau[cau] = theoCau[cau] || []).push({ kieu, t });
    };

    const tongDe = so(de.cau.reduce((a, c) => a + Number(c.diem || 0), 0));
    them("Số liệu", tongDe === 10 ? "dat" : "loi", tongDe === 10 ? "Tổng điểm của đề bằng 10." : `Tổng điểm của đề là ${viet(tongDe)}, chưa bằng 10.`);

    const lechTong = [mt.tong].filter(x => so(x) !== tongDe);
    them("Số liệu", lechTong.length ? "loi" : "dat", lechTong.length
      ? `Tổng điểm ma trận (${viet(mt.tong)}) khác tổng điểm đề (${viet(tongDe)}).`
      : `Tổng điểm ở đề, ma trận và đáp án bằng nhau (${viet(tongDe)}).`);

    khung.phan.forEach(p => {
      const d = so(de.cau.filter(c => c.phan === p.ten).reduce((a, c) => a + Number(c.diem || 0), 0));
      them("Số liệu", d === so(p.diem) ? "dat" : "loi", d === so(p.diem)
        ? `Phần ${p.ten}: các câu cộng đúng ${viet(p.diem)} điểm.` : `Phần ${p.ten}: các câu cộng được ${viet(d)}, khung ghi ${viet(p.diem)}.`);
    });

    let lechCau = 0;
    de.cau.forEach(c => {
      const cong = so(Object.values(c.muc || {}).reduce((a, x) => a + Number(x || 0), 0));
      if (cong !== so(c.diem)) { lechCau++; them("Số liệu", "loi", `${nhan(c)}: điểm các mức (${viet(cong)}) chưa bằng điểm câu (${viet(c.diem)}).`, c.id); }
    });
    if (!lechCau) them("Số liệu", "dat", "Điểm chia theo mức của từng câu cộng đúng bằng điểm câu.");

    const lechTiLe = [];
    Object.entries(khung.ti_le || {}).forEach(([m, pt]) => { if (Math.abs((mt.ti_le_muc[m] || 0) - pt) > 0.01) lechTiLe.push(`${m} ${viet(mt.ti_le_muc[m] || 0)}% (khung ${pt}%)`); });
    them("Số liệu", lechTiLe.length ? "loi" : "dat", lechTiLe.length ? "Tỉ lệ mức độ lệch khung: " + lechTiLe.join("; ") + "." : "Tỉ lệ các mức độ khớp tỉ lệ của khung.");

    let lechMtDt = mt.tong_cau !== dt.tong_cau ? 1 : 0;
    mt.hang.forEach((h, i) => {
      const a = Object.keys(h.muc).filter(m => Number(h.muc[m]) > 0).sort().join("|");
      const b = Object.keys((dt.hang[i] || {}).so_cau || {}).sort().join("|");
      if (a !== b) { lechMtDt++; them("Số liệu", "loi", `${nhan(de.cau[i])}: mức độ trong ma trận và bản đặc tả không trùng nhau.`, h.id); }
    });
    if (!lechMtDt) them("Số liệu", "dat", `Số câu và mức độ từng câu trong bản đặc tả trùng ma trận (${mt.tong_cau} câu).`);

    let daCo = 0, daKhop = 0;
    de.cau.forEach(c => {
      const txt = (c.dap_an || "").trim();
      if (!txt) return;
      daCo++;
      const ds = diemTrongDapAn(txt), cong = so(ds.reduce((a, x) => a + x, 0));
      if (!ds.length) them("Số liệu", "nhac", `Đáp án ${nhan(c)} chưa ghi điểm từng ý (ví dụ "0,25 điểm").`, c.id);
      else if (cong !== so(c.diem)) them("Số liệu", "loi", `Đáp án ${nhan(c)}: các ý cộng được ${viet(cong)}, câu ${viet(c.diem)} điểm.`, c.id);
      else daKhop++;
    });
    const chuaDa = de.cau.filter(c => !(c.dap_an || "").trim());
    if (chuaDa.length) them("Số liệu", "nhac", "Chưa có đáp án: " + chuaDa.map(c => `${c.phan} ${c.so}`).join(", ") + ".");
    if (daCo && daKhop === daCo) them("Số liệu", "dat", "Điểm các ý trong đáp án cộng đúng điểm từng câu.");

    const t2 = de.the2 || null;
    if (!de.the) them("Nội dung", "loi", "Chưa chọn ngữ liệu cho phần Đọc hiểu.");
    else {
      them("Nội dung", de.the.nguon_du ? "dat" : "loi", de.the.nguon_du ? "Ngữ liệu có nguồn đầy đủ." : "Ngữ liệu chưa đủ nguồn (cần tác giả, tên tác phẩm, và báo, sách, nhà xuất bản hoặc đường dẫn).");
      if (!de.the.the_loai) them("Nội dung", "nhac", "Ngữ liệu Đọc hiểu chưa có thể loại: ma trận và bản đặc tả sẽ thiếu thể loại.");
      const n1 = ctx.demChu(de.the.van_ban), n2 = t2 ? ctx.demChu(t2.van_ban) : 0, n = n1 + n2, mc = khung.moc_chu;
      const ghi = t2 ? `Tổng ngữ liệu ${n1} + ${n2} = ${n} chữ` : `Ngữ liệu ${n} chữ`;
      if (mc) them("Nội dung", n < mc.tu || n > mc.den ? "nhac" : "dat", n < mc.tu || n > mc.den
        ? `${ghi}, ngoài mốc ${mc.tu} đến ${mc.den} chữ của khung.` : `${ghi}, trong mốc của khung.`);
    }
    if (t2) {
      them("Nội dung", t2.nguon_du ? "dat" : "loi", t2.nguon_du ? "Ngữ liệu 2 (phần Viết) có nguồn đầy đủ." : "Ngữ liệu 2 (phần Viết) chưa đủ nguồn (cần tác giả, tên tác phẩm, và nơi in, đăng hoặc đường dẫn).");
      if (!t2.the_loai) them("Nội dung", "nhac", "Ngữ liệu 2 chưa có thể loại: ma trận và bản đặc tả sẽ thiếu thể loại.");
      if (de.the && t2.ma && t2.ma === de.the.ma) them("Nội dung", "loi", "Ngữ liệu 2 trùng ngữ liệu Đọc hiểu.");
    }
    de.cau.filter(c => c.phan === "Viết" && /so sánh/i.test(c.noi_dung || "") && !t2)
      .forEach(c => them("Nội dung", "nhac", `${nhan(c)}: đề so sánh hai văn bản nhưng chưa chọn ngữ liệu 2 để in kèm văn bản thứ hai.`, c.id));
    const dhChuaGan = de.cau.filter(c => c.phan === "Đọc hiểu" && !(c.yccd || []).length);
    dhChuaGan.forEach(c => them("Nội dung", "loi", `${nhan(c)}: chưa gắn yêu cầu cần đạt.`, c.id));
    if (!dhChuaGan.length) them("Nội dung", "dat", "Mỗi câu Đọc hiểu đã gắn ít nhất một yêu cầu cần đạt.");
    de.cau.filter(c => c.phan !== "Đọc hiểu" && !(c.yccd || []).length).forEach(c => them("Nội dung", "nhac", `${nhan(c)}: chưa gắn yêu cầu cần đạt.`, c.id));
    const maMat = [];
    de.cau.forEach(c => (c.yccd || []).forEach(m => { if (!yccd[m]) maMat.push(m); }));
    if (maMat.length) them("Nội dung", "loi", "Mã yêu cầu cần đạt không còn trong kho: " + maMat.join(", ") + ".");
    const chuaND = de.cau.filter(c => !(c.noi_dung || "").trim());
    chuaND.forEach(c => them("Nội dung", "nhac", `${nhan(c)}: chưa có nội dung câu hỏi.`, c.id));
    if (!chuaND.length) them("Nội dung", "dat", "Tất cả các câu đã có nội dung.");
    const chuaDuyet = de.cau.filter(c => !c.duyet);
    them("Nội dung", chuaDuyet.length ? "nhac" : "dat", chuaDuyet.length
      ? `Còn ${chuaDuyet.length} câu chưa duyệt (người soạn xác nhận nội dung và mức độ).` : "Tất cả các câu đã được duyệt.");
    if (ctx.trungSgk && ctx.trungSgk.length) them("Nội dung", "nhac", "Ngữ liệu có thể trùng sách giáo khoa: " + ctx.trungSgk.join("; ") + ".");
    else if (ctx.trungSgk) them("Nội dung", "dat", "Ngữ liệu không trùng văn bản nào trong danh mục SGK lớp 9 đến 12.");

    them("Hình thức", ctx.trang > 2 ? "nhac" : "dat", ctx.trang > 2
      ? `Ước tính ${viet(ctx.trang)} trang, vượt mức 2 trang (tạm tính ${ctx.chuMotTrang} chữ một trang).` : `Ước tính ${viet(ctx.trang)} trang, không quá 2 trang.`);
    const coNen = /background/i.test(ctx.htmlWord || "");
    them("Hình thức", coNen ? "loi" : "dat", coNen ? "Bảng khi xuất có tô nền màu." : "Bảng ma trận, đặc tả, đáp án khi xuất không tô nền màu.");
    const ten = cacTen(de.the).concat(cacTen(de.the2).filter(x => !cacTen(de.the).includes(x)));
    let khongNgoac = 0;
    de.cau.forEach(c => {
      const sai = ten.filter(t => tenKhongNgoac(c.noi_dung, t) || tenKhongNgoac(c.dap_an, t));
      if (sai.length) { khongNgoac++; them("Hình thức", "nhac", `${nhan(c)}: tên “${sai[0]}” chưa đặt trong dấu ngoặc kép.`, c.id); }
    });
    if (ten.length && !khongNgoac) them("Hình thức", "dat", "Tên tác phẩm trong câu hỏi và đáp án đều đặt trong dấu ngoặc kép.");
    let gach = 0;
    de.cau.forEach(c => { if (/[—─═]/.test((c.noi_dung || "") + (c.dap_an || "") )) { gach++; them("Hình thức", "nhac", `${nhan(c)}: có dấu gạch ngang dài, nên thay bằng dấu phẩy hoặc dấu hai chấm.`, c.id); } });
    if (!gach) them("Hình thức", "dat", "Không có dấu gạch ngang dài trong câu hỏi và đáp án.");
    const coTruongTrongCau = de.cau.filter(c => /(sở|phòng)\s+gd|trường\s+(thpt|thcs|tiểu học|th\b)/i.test((c.noi_dung || "") + " " + (c.dap_an || "")));
    coTruongTrongCau.forEach(c => them("Hình thức", "nhac", `${nhan(c)}: có tên sở hoặc trường trong nội dung.`, c.id));

    xacNhan.push("Độ đúng của đáp án và cách chia ý.");
    xacNhan.push("Mức độ từng câu: app gợi ý theo khung, người soạn xác nhận khi bấm \"Đã duyệt\".");
    if (de.the) xacNhan.push("Tính xác thực của nguồn: mở lại đường dẫn hoặc sách để đối chiếu nguyên văn.");
    if (ctx.trungSgk === null && de.the) xacNhan.push("Văn bản tự nhập: app chưa đối chiếu được với danh mục SGK, người soạn tự kiểm tra.");
    const soCT = [de.the, de.the2].reduce((a, t) => a + (t && t.chu_thich ? t.chu_thich.length : 0), 0);
    if (soCT) xacNhan.push(`Đề có ${soCT} chú thích: tờ đề in và file Word đặt chú thích ngay dưới ngữ liệu tương ứng, đánh số nối tiếp (chưa phải chú thích chân trang).`);
    if (dau && ((dau.so || "").trim() || (dau.truong || "").trim())) xacNhan.push("Đầu trang có tên sở, trường: giữ khi dùng trong trường; bỏ trống khi đề dùng chung hoặc đăng công khai.");

    const tat = [].concat(...Object.values(nhom));
    return {
      nhom, xac_nhan: xacNhan, theo_cau: theoCau,
      loi: tat.filter(x => x.kieu === "loi").length,
      nhac: tat.filter(x => x.kieu === "nhac").length,
      dat: tat.filter(x => x.kieu === "dat").length,
      tong: tongDe
    };
  }

  g.KiemTraKhop = { kiemTraKhop, diemTrongDapAn, tenKhongNgoac };
})(typeof window !== "undefined" ? window : module.exports);
