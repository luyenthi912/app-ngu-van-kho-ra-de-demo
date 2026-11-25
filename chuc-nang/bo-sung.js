(function () {
  const D = window.KhoDuLieu;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ngoacKep = s => "“" + s + "”";
  const homNay = () => new Date().toISOString().slice(0, 10);
  const thongBao = s => window.KhoManHinh.thongBao(s);

  if (window.BAN_DEMO) {
    document.querySelectorAll("[data-man=bo-sung], #nut-nhap-moi").forEach(b => {
      b.textContent = "🔒 " + b.textContent.replace(/^\+ /, "");
      b.onclick = () => window.KhoPro ? window.KhoPro.mo() : thongBao("Có trong bản đầy đủ");
    });
    const moManDemo = ten => {
      document.querySelectorAll("main[id^=man-]").forEach(m => m.hidden = m.id !== "man-" + ten);
      document.querySelectorAll("[data-man]").forEach(b => b.classList.toggle("dang-chon", b.dataset.man === ten));
      window.scrollTo(0, 0);
    };
    document.querySelectorAll("[data-man=kho], [data-man=ra-de]").forEach(b => b.onclick = () => moManDemo(b.dataset.man));
    window.KhoBoSung = { moMan: moManDemo, moForm() {} };
    return;
  }

  let dangSua = null;
  let anhTam = [];

  function moMan(ten) {
    document.querySelectorAll("main[id^=man-]").forEach(m => m.hidden = m.id !== "man-" + ten);
    document.querySelectorAll("[data-man]").forEach(b => b.classList.toggle("dang-chon", b.dataset.man === ten));
    if (ten === "bo-sung") veHangCho();
    window.scrollTo(0, 0);
  }
  document.querySelectorAll("[data-man]").forEach(b => b.onclick = () => moMan(b.dataset.man));
  $("#nut-nhap-moi").onclick = () => { moMan("bo-sung"); moForm(null); };

  function thieuGi(t) {
    const thieu = [];
    if (!t.nhan_de) thieu.push("nhan đề");
    if (!t.van_ban) thieu.push("văn bản");
    if (!t.nguon || !t.nguon.tac_gia) thieu.push("tác giả");
    if (!t.the_loai) thieu.push("thể loại");
    if (!(t.phu_hop || []).some(p => p.lop && p.bai)) thieu.push("lớp và bài");
    return thieu;
  }

  function veHangCho() {
    const ds = D.docTuBoSung();
    const dong = t => {
      const thieu = thieuGi(t);
      return `<li class="dong-bs">
        <div><b>${esc(ngoacKep(t.nhan_de || "Chưa có nhan đề"))}</b> <span class="phu">${esc(t.ma)} · ${esc((t.nguon && t.nguon.tac_gia) || "chưa ghi tác giả")} · sửa ngày ${esc(t.ngay_sua || "")}</span>
        ${t.nhap && thieu.length ? `<div class="canh-bao">Còn thiếu: ${thieu.join(", ")}</div>` : ""}</div>
        <div class="hang-nut"><button class="nut-phu" data-sua="${esc(t.ma)}">Sửa</button><button class="nut-phu nut-xoa" data-xoa="${esc(t.ma)}">Xóa</button></div>
      </li>`;
    };
    const nhap = ds.filter(t => t.nhap), daLuu = ds.filter(t => !t.nhap);
    $("#hang-cho").innerHTML = nhap.map(dong).join("") || `<li class="trong">Không có Ngữ liệu nào đang chờ.</li>`;
    $("#da-bo-sung").innerHTML = daLuu.map(dong).join("") || `<li class="trong">Thầy/Cô chưa tự thêm Ngữ liệu nào vào kho.</li>`;
    $("#dem-hang-cho").textContent = nhap.length;
    $("#dem-da-bo-sung").textContent = daLuu.length;
    document.querySelectorAll("[data-sua]").forEach(b => b.onclick = () => moForm(b.dataset.sua));
    document.querySelectorAll("[data-xoa]").forEach(b => b.onclick = () => {
      const t = ds.find(x => x.ma === b.dataset.xoa);
      if (!confirm(`Xóa Ngữ liệu ${ngoacKep(t.nhan_de || t.ma)}? Ngữ liệu đã xóa không lấy lại được, trừ khi cô đã xuất file sao lưu.`)) return;
      D.ghiTuBoSung(ds.filter(x => x.ma !== t.ma));
      veHangCho(); window.KhoManHinh.taiLai();
      thongBao("Đã xóa Ngữ liệu");
    });
  }


  function oChon(ten, ds, gt, rong) {
    return `<select name="${ten}">${rong != null ? `<option value="">${rong}</option>` : ""}${ds.map(v => `<option ${v === gt ? "selected" : ""}>${esc(v)}</option>`).join("")}</select>`;
  }
  function chonTheLoai(gt) {
    const trongCay = D.CAY_THE_LOAI.some(n => n.con.includes(gt));
    return `<select name="the_loai"><option value="">Chọn thể loại</option>${D.CAY_THE_LOAI.map(n => `<optgroup label="${esc(n.ten)}">${n.con.map(v => `<option ${v === gt ? "selected" : ""}>${esc(v)}</option>`).join("")}</optgroup>`).join("")}${gt && !trongCay ? `<option selected>${esc(gt)}</option>` : ""}</select>`;
  }
  function dongLop(p) {
    p = p || { lop: "", bai: "", tieu_diem: [] };
    const bai = p.lop ? (D.DS_BAI[p.lop] || []) : [];
    return `<div class="dong-lap dong-lop">
      <select data-f="lop"><option value="">Lớp</option>${D.DS_LOP.map(l => `<option value="${l}" ${String(l) === String(p.lop) ? "selected" : ""}>Lớp ${l}</option>`).join("")}</select>
      <select data-f="bai"><option value="">${p.lop ? "Chọn bài" : "Chọn lớp trước"}</option>${bai.map(b => `<option ${b === p.bai ? "selected" : ""}>${esc(b)}</option>`).join("")}${p.bai && !bai.includes(p.bai) ? `<option selected>${esc(p.bai)}</option>` : ""}</select>
      <input data-f="tieu_diem" placeholder="Tiêu điểm khai thác, cách nhau bằng dấu phẩy" value="${esc((p.tieu_diem || []).join(", "))}">
      <button type="button" class="nut-bo" title="Bỏ dòng">✕</button></div>`;
  }
  function dongTu(x) {
    x = x || { tu: "", nghia: "" };
    return `<div class="dong-lap"><input data-f="tu" placeholder="Từ, điển tích" value="${esc(x.tu)}"><input data-f="nghia" placeholder="Giải nghĩa" value="${esc(x.nghia)}"><button type="button" class="nut-bo" title="Bỏ dòng">✕</button></div>`;
  }
  function dongGhiChu(g) {
    g = g || { loai: "Hoàn cảnh sáng tác", noi_dung: "", nguon: "" };
    return `<div class="dong-lap dong-ghi-chu">${oChon("", ["Hoàn cảnh sáng tác", "Nhận định phê bình", "Ghi chú khác"], g.loai).replace('name=""', 'data-f="loai"')}
      <textarea data-f="noi_dung" rows="2" placeholder="Nội dung">${esc(g.noi_dung)}</textarea>
      <input data-f="nguon" placeholder="Nguồn của ý này" value="${esc(g.nguon)}"><button type="button" class="nut-bo" title="Bỏ dòng">✕</button></div>`;
  }

  function moForm(ma) {
    const ds = D.docTuBoSung();
    const t = ma ? ds.find(x => x.ma === ma) : null;
    dangSua = t ? t.ma : null;
    const n = (t && t.nguon) || {};
    const sgk = (t && t.trung_sgk) || { ket_qua: "Chưa xét", van_ban_sgk: "" };
    const ct = (t && t.chu_thich) || {};
    anhTam = ((t && t.bang_chung && t.bang_chung.anh) || []).slice();
    const deTai = new Set((t && t.de_tai) || []);
    const v = k => esc(t ? t[k] || "" : "");
    const nv = k => esc(n[k] || "");

    $("#khung-form").innerHTML = `
    <form id="form-the" autocomplete="off">
      <h2>${t ? "Sửa Ngữ liệu " + esc(t.ma) : "Nhập ngữ liệu mới"}</h2>
      <p class="phu">Ô có dấu * là bắt buộc khi lưu vào kho. Chưa đủ thì bấm "Lưu nháp", Ngữ liệu nằm ở hàng chờ và chưa hiện khi tìm ngữ liệu.</p>

      <fieldset><legend>1. Văn bản</legend>
        <label>Nhan đề * <input name="nhan_de" value="${v("nhan_de")}" placeholder="Gõ không cần ngoặc kép, app tự thêm khi hiển thị"></label>
        <div class="o-bao-trung" data-bao-trung hidden></div>
        <label>Lời dẫn <textarea name="loi_dan" rows="2" placeholder="Tóm tắt phần trước đoạn trích, nếu có">${v("loi_dan")}</textarea></label>
        <label>Văn bản * <textarea name="van_ban" rows="12" placeholder="Dán nguyên văn từ bản gốc. Thơ giữ nguyên xuống dòng, khổ thơ cách một dòng trống.">${v("van_ban")}</textarea></label>
        <p class="phu" id="dem-van-ban"></p>
        <div class="hang-o"><span>Dạng:</span>
          <label class="o-tron"><input type="radio" name="dang" value="Trọn vẹn" ${!t || t.dang !== "Trích" ? "checked" : ""}> Trọn vẹn</label>
          <label class="o-tron"><input type="radio" name="dang" value="Trích" ${t && t.dang === "Trích" ? "checked" : ""}> Trích</label></div>
      </fieldset>

      <fieldset><legend>2. Nguồn</legend>
        <p class="phu">Ghi đúng như bản gốc. Ô nào chưa có thì để trống.</p>
        <div class="luoi-2">
          <label>Tác giả * <input name="tac_gia" value="${nv("tac_gia")}"></label>
          <label>Tên tác phẩm (nếu văn bản là đoạn trích) <input name="tac_pham" value="${nv("tac_pham")}"></label>
          <label>Tên sách hoặc tập <input name="sach_tap" value="${nv("sach_tap")}"></label>
          <label>Nhà xuất bản <input name="nxb" value="${nv("nxb")}"></label>
          <label>Năm xuất bản <input name="nam" value="${nv("nam")}"></label>
          <label>Số trang <input name="trang" value="${nv("trang")}"></label>
          <label>Tên báo <input name="bao" value="${nv("bao")}"></label>
          <label>Ngày đăng <input name="ngay_dang" value="${nv("ngay_dang")}" placeholder="vd 20/11/2026"></label>
        </div>
        <label>Đường dẫn nguồn mạng <input name="duong_dan" value="${nv("duong_dan")}" placeholder="https://..."></label>
        <div class="o-bao-trung" data-bao-trung hidden></div>
        <p class="canh-bao" id="nhac-nguon"></p>
      </fieldset>

      <fieldset><legend>3. Bằng chứng</legend>
        <label>Ảnh trang sách gốc <input type="file" id="chon-anh" accept="image/*" multiple></label>
        <p class="phu">Ảnh được thu nhỏ trước khi lưu. Mỗi Ngữ liệu nên có 1 đến 3 ảnh.</p>
        <div id="xem-anh" class="xem-anh"></div>
      </fieldset>

      <fieldset><legend>4. Phân loại</legend>
        <div class="luoi-2">
          <label>Thể loại * ${chonTheLoai(t ? t.the_loai : "")}</label>
          <label>Giai đoạn văn học ${oChon("giai_doan", D.DS_GIAI_DOAN, t ? t.giai_doan : "", "Chưa chọn")}</label>
          <label>Độ khó <select name="do_kho"><option value="">Chưa chọn</option>${[1, 2, 3].map(b => `<option value="${b}" ${t && t.do_kho === b ? "selected" : ""}>Bậc ${b}</option>`).join("")}</select></label>
          <label>Chủ đề <input name="chu_de" value="${v("chu_de")}" placeholder="Cảm hứng, thông điệp chính"></label>
        </div>
        <p class="nhan-o">Đề tài</p>
        <div class="o-de-tai">${D.CAY_DE_TAI.map(g => `<div><p class="ten-nhom">${esc(g.ten)}</p>${g.con.map(d => `<label class="o-tron"><input type="checkbox" name="de_tai" value="${esc(d)}" ${deTai.has(d) ? "checked" : ""}> ${esc(d)}</label>`).join("")}</div>`).join("")}</div>
        <label>Đề tài khác, chưa có trong danh sách <input name="de_tai_khac" value="${esc([...deTai].filter(d => !D.DS_DE_TAI.includes(d)).join(", "))}" placeholder="Cách nhau bằng dấu phẩy"></label>
        <p class="nhan-o">Lớp phù hợp * <span class="phu">(mỗi lớp kèm bài và tiêu điểm khai thác ở lớp đó)</span></p>
        <div id="ds-lop">${((t && t.phu_hop && t.phu_hop.length) ? t.phu_hop : [null]).map(dongLop).join("")}</div>
        <button type="button" class="nut-phu" id="them-lop">+ Thêm lớp</button>
        <label>Ghép cặp so sánh với Ngữ liệu <select name="ghep_cap" multiple size="4">${window.KhoManHinh.dsThe().filter(x => x.ma !== dangSua).map(x => `<option value="${esc(x.ma)}" ${(t && (t.ghep_cap || []).includes(x.ma)) ? "selected" : ""}>${esc(x.ma)} · ${esc(ngoacKep(x.nhan_de))}</option>`).join("")}</select></label>
        <p class="phu">Giữ phím Ctrl để chọn nhiều Ngữ liệu.</p>
      </fieldset>

      <fieldset><legend>5. Chú thích</legend>
        <p class="nhan-o">Từ khó</p><div id="ds-tu-kho">${(ct.tu_kho || []).map(dongTu).join("")}</div>
        <button type="button" class="nut-phu" data-them="ds-tu-kho">+ Thêm từ khó</button>
        <p class="nhan-o">Điển tích</p><div id="ds-dien-tich">${(ct.dien_tich || []).map(dongTu).join("")}</div>
        <button type="button" class="nut-phu" data-them="ds-dien-tich">+ Thêm điển tích</button>
        <label>Thông tin tác giả, tác phẩm (đưa xuống chân trang) <textarea name="tac_gia_tac_pham" rows="3">${esc(ct.tac_gia_tac_pham || "")}</textarea></label>
      </fieldset>

      <fieldset><legend>6. Ghi chú chuyên môn</legend>
        <p class="phu">Mỗi ý một dòng, kèm nguồn riêng.</p>
        <div id="ds-ghi-chu">${((t && t.ghi_chu_chuyen_mon) || []).map(dongGhiChu).join("")}</div>
        <button type="button" class="nut-phu" id="them-ghi-chu">+ Thêm ghi chú</button>
      </fieldset>

      <fieldset><legend>7. Đối chiếu sách giáo khoa</legend>
        <div class="luoi-2">
          <label>Trùng sách giáo khoa ${oChon("sgk_ket_qua", ["Chưa xét", "Không trùng", "Có trùng"], sgk.ket_qua)}</label>
          <label>Văn bản SGK bị trùng (nếu có) <input name="van_ban_sgk" value="${esc(sgk.van_ban_sgk || "")}"></label>
        </div>
      </fieldset>

      <div class="hang-nut thanh-luu">
        <button type="button" class="nut-chinh" id="luu-kho">Lưu vào kho</button>
        <button type="button" class="nut-phu" id="luu-nhap">Lưu nháp</button>
        <button type="button" class="nut-phu" id="huy-form">Hủy</button>
      </div>
    </form>`;

    const f = $("#form-the");
    const gan = () => f.querySelectorAll(".nut-bo").forEach(b => b.onclick = () => b.parentElement.remove());
    f.addEventListener("change", e => {
      if (e.target.dataset.f === "lop") {
        const dong = e.target.closest(".dong-lop");
        dong.outerHTML = dongLop({ lop: e.target.value, bai: "", tieu_diem: dong.querySelector("[data-f=tieu_diem]").value.split(",").map(x => x.trim()).filter(Boolean) });
        gan();
      }
    });
    $("#them-lop").onclick = () => { $("#ds-lop").insertAdjacentHTML("beforeend", dongLop()); gan(); };
    $("#them-ghi-chu").onclick = () => { $("#ds-ghi-chu").insertAdjacentHTML("beforeend", dongGhiChu()); gan(); };
    f.querySelectorAll("[data-them]").forEach(b => b.onclick = () => { $("#" + b.dataset.them).insertAdjacentHTML("beforeend", dongTu()); gan(); });
    gan();
    f.addEventListener("input", capNhatNhac);
    f.addEventListener("change", capNhatNhac);
    $("#chon-anh").onchange = e => themAnh([...e.target.files]);
    $("#luu-kho").onclick = () => luu(false);
    $("#luu-nhap").onclick = () => luu(true);
    $("#huy-form").onclick = () => { $("#khung-form").innerHTML = ""; dangSua = null; };
    veAnh(); capNhatNhac();
    $("#khung-form").scrollIntoView({ behavior: "smooth" });
  }

  function thuNho(file) {
    return new Promise((ok, loi) => {
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          const tile = Math.min(1, 1400 / Math.max(img.width, img.height));
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * tile); c.height = Math.round(img.height * tile);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          ok(c.toDataURL("image/jpeg", 0.72));
        };
        img.onerror = loi; img.src = r.result;
      };
      r.onerror = loi; r.readAsDataURL(file);
    });
  }
  async function themAnh(files) {
    for (const f of files) { try { anhTam.push(await thuNho(f)); } catch (e) { thongBao("Không đọc được ảnh " + f.name); } }
    veAnh();
  }
  function veAnh() {
    $("#xem-anh").innerHTML = anhTam.map((a, i) => `<div><img src="${a}" alt="Ảnh trang gốc ${i + 1}"><button type="button" class="nut-phu" data-bo-anh="${i}">Bỏ ảnh</button></div>`).join("");
    document.querySelectorAll("[data-bo-anh]").forEach(b => b.onclick = () => { anhTam.splice(+b.dataset.boAnh, 1); veAnh(); });
  }

  function docForm() {
    const f = $("#form-the");
    const g = k => (f.elements[k] ? f.elements[k].value : "").trim();
    const tachPhay = s => s.split(",").map(x => x.trim()).filter(Boolean);
    const lapLai = (id, keys) => [...document.querySelectorAll("#" + id + " .dong-lap")].map(d => {
      const o = {}; keys.forEach(k => o[k] = d.querySelector(`[data-f=${k}]`).value.trim()); return o;
    });
    return {
      nhan_de: g("nhan_de").replace(/^[“"]|[”"]$/g, ""),
      loi_dan: g("loi_dan"),
      van_ban: f.elements.van_ban.value.replace(/\s+$/, ""),
      dang: f.querySelector("[name=dang]:checked").value,
      nguon: { tac_gia: g("tac_gia"), tac_pham: g("tac_pham"), sach_tap: g("sach_tap"), bao: g("bao"), nxb: g("nxb"), nam: g("nam"), trang: g("trang"), ngay_dang: g("ngay_dang"), duong_dan: g("duong_dan") },
      bang_chung: { anh: anhTam.slice(), duong_dan: g("duong_dan") },
      the_loai: g("the_loai"),
      de_tai: [...new Set([...[...f.querySelectorAll("[name=de_tai]:checked")].map(x => x.value), ...tachPhay(g("de_tai_khac"))])],
      chu_de: g("chu_de"),
      giai_doan: g("giai_doan"),
      phu_hop: lapLai("ds-lop", ["lop", "bai", "tieu_diem"]).filter(p => p.lop).map(p => ({ lop: +p.lop, bai: p.bai, tieu_diem: tachPhay(p.tieu_diem) })),
      do_kho: g("do_kho") ? +g("do_kho") : null,
      ghep_cap: [...f.elements.ghep_cap.selectedOptions].map(o => o.value),
      chu_thich: {
        tu_kho: lapLai("ds-tu-kho", ["tu", "nghia"]).filter(x => x.tu),
        dien_tich: lapLai("ds-dien-tich", ["tu", "nghia"]).filter(x => x.tu),
        tac_gia_tac_pham: g("tac_gia_tac_pham")
      },
      ghi_chu_chuyen_mon: lapLai("ds-ghi-chu", ["loai", "noi_dung", "nguon"]).filter(x => x.noi_dung),
      trung_sgk: { ket_qua: g("sgk_ket_qua") || "Chưa xét", van_ban_sgk: g("van_ban_sgk") }
    };
  }

  const boDau = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, " ").trim();

  function capNhatNhac() {
    if (!$("#form-the")) return;
    const t = docForm();
    const tho = D.laTho(t);
    const chu = D.demChu(t.van_ban), dong = D.demDong(t.van_ban);
    $("#dem-van-ban").textContent = `${chu} chữ` + (tho ? ` · ${dong} dòng` : "") + " (không tính nhan đề, lời dẫn, chú thích)";
    const nhac = [];
    if (tho && dong > 30) nhac.push("Thơ quá 30 dòng: nên trích.");
    const n = t.nguon;
    if (!n.tac_gia) nhac.push("Thiếu tác giả.");
    if (n.bao || n.duong_dan) {
      if (!n.ngay_dang) nhac.push("Nguồn báo: thiếu ngày đăng.");
      if (!n.duong_dan) nhac.push("Nguồn báo: thiếu đường dẫn.");
    } else {
      ["nxb:nhà xuất bản", "nam:năm", "trang:số trang"].forEach(x => { const [k, ten] = x.split(":"); if (!n[k]) nhac.push("Thiếu " + ten + "."); });
    }
    if (t.ghi_chu_chuyen_mon.some(g => !g.nguon)) nhac.push("Có ghi chú chuyên môn chưa ghi nguồn.");
    $("#nhac-nguon").textContent = nhac.join(" ");

    const dau = boDau(t.van_ban).slice(0, 80);
    const trung = window.KhoManHinh.dsThe(true).filter(x => x.ma !== dangSua && (
      (t.nhan_de && boDau(x.nhan_de) === boDau(t.nhan_de) && boDau(x.nguon && x.nguon.tac_gia) === boDau(n.tac_gia)) ||
      (dau.length >= 40 && boDau(x.van_ban).includes(dau))));
    const sgk = D.doiChieuSgk(t);
    const bao = [];
    if (sgk.length) bao.push("<b>Có thể trùng sách giáo khoa:</b> " + sgk.map(x => esc(D.moTaSgk(x))).join("; ") + `. Cô xem lại rồi chọn ở ô "Trùng sách giáo khoa" (mục 7).`);
    if (trung.length) bao.push("<b>Có thể trùng Ngữ liệu đã có trong kho:</b> " + trung.map(x => esc(x.ma + " " + ngoacKep(x.nhan_de))).join("; "));
    document.querySelectorAll("[data-bao-trung]").forEach(o => { o.innerHTML = bao.join("<br>"); o.hidden = !bao.length; });
  }

  function maMoi(ds) {
    const so = ds.map(t => parseInt((t.ma || "").replace("TBS-", ""), 10)).filter(x => !isNaN(x));
    return "TBS-" + String((so.length ? Math.max(...so) : 0) + 1).padStart(4, "0");
  }
  function luu(nhap) {
    const moi = docForm();
    const thieu = thieuGi(moi);
    if (!nhap && thieu.length) {
      alert("Chưa lưu vào kho được, còn thiếu: " + thieu.join(", ") + ".\nCô bổ sung hoặc bấm \"Lưu nháp\" để đưa Ngữ liệu vào hàng chờ.");
      return;
    }
    const ds = D.docTuBoSung();
    const cu = dangSua ? ds.find(x => x.ma === dangSua) : null;
    const the = Object.assign({}, cu || {}, moi, {
      ma: cu ? cu.ma : maMoi(ds),
      nhap: nhap,
      trang_thai_duyet: nhap ? "Chờ duyệt" : "Đã duyệt",
      ngay_tao: cu ? cu.ngay_tao : homNay(),
      ngay_sua: homNay(),
      da_dung: cu ? cu.da_dung || [] : []
    });
    const sau = cu ? ds.map(x => x.ma === cu.ma ? the : x) : ds.concat([the]);
    try { D.ghiTuBoSung(sau); }
    catch (e) { alert("Bộ nhớ trình duyệt đã đầy, chưa lưu được. Cô bớt ảnh trang gốc hoặc xuất file sao lưu rồi xóa bớt Ngữ liệu cũ."); return; }
    $("#khung-form").innerHTML = ""; dangSua = null;
    veHangCho(); window.KhoManHinh.taiLai();
    thongBao(nhap ? `Đã lưu nháp ${the.ma} vào hàng chờ` : `Đã lưu ${the.ma} vào kho`);
  }

  $("#xuat-file").onclick = () => {
    const ds = D.docTuBoSung();
    if (!ds.length) { thongBao("Chưa có Ngữ liệu nào để xuất"); return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ loai: "kho-ngu-lieu-tu-bo-sung", ngay: homNay(), the: ds }, null, 1)], { type: "application/json" }));
    a.download = "Kho tu bo sung " + homNay() + ".json";
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $("#nhap-file").onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      let goi;
      try { goi = JSON.parse(r.result); } catch (err) { alert("File không đúng định dạng sao lưu của app."); return; }
      if (!goi || goi.loai !== "kho-ngu-lieu-tu-bo-sung" || !Array.isArray(goi.the)) { alert("File không đúng định dạng sao lưu của app."); return; }
      const ds = D.docTuBoSung();
      const trungMa = goi.the.filter(t => ds.some(x => x.ma === t.ma)).length;
      if (!confirm(`File có ${goi.the.length} Ngữ liệu` + (trungMa ? `, trong đó ${trungMa} Ngữ liệu trùng mã sẽ được thay bằng bản trong file` : "") + ". Nhập vào?")) return;
      const theoMa = new Map(ds.map(t => [t.ma, t]));
      goi.the.forEach(t => theoMa.set(t.ma, t));
      try { D.ghiTuBoSung([...theoMa.values()]); } catch (err) { alert("Bộ nhớ trình duyệt đã đầy, chưa nhập được."); return; }
      veHangCho(); window.KhoManHinh.taiLai();
      thongBao("Đã nhập " + goi.the.length + " Ngữ liệu");
    };
    r.readAsText(file);
    e.target.value = "";
  };
  function themNhap(x) {
    const ds = D.docTuBoSung();
    const the = {
      ma: maMoi(ds), nhan_de: x.nhan_de || "", van_ban: x.van_ban || "", the_loai: x.the_loai || "",
      nguon: { tac_gia: x.tac_gia || "", tac_pham: x.nhan_de || "" },
      phu_hop: x.lop ? [{ lop: Number(x.lop), bai: "", tieu_diem: [] }] : [],
      nhap: true, trang_thai_duyet: "Chờ duyệt", ngay_tao: homNay(), ngay_sua: homNay(), da_dung: []
    };
    try { D.ghiTuBoSung(ds.concat([the])); } catch (e) { return null; }
    return the.ma;
  }

  window.KhoBoSung = { moForm, moMan, themNhap };
})();
