(function () {
  const $ = s => document.querySelector(s);
  const DEMO = !!window.BAN_DEMO;
  function hopPro() {
    let o = document.getElementById("hop-pro");
    if (!o) {
      o = document.createElement("div"); o.id = "hop-pro"; o.className = "phu-lop";
      o.innerHTML = `<div class="hop-pro" role="dialog" aria-modal="true" aria-labelledby="hop-pro-td">
        <button class="nut-dong" data-dong-pro aria-label="Đóng">✕</button>
        <h3 id="hop-pro-td">Tính năng xuất file Word chuẩn thể thức chỉ có ở bản Pro</h3>
        <p>Bản dùng thử cho xem đề, ma trận, bản đặc tả và đáp án ngay trên màn hình. In đề, tải file Word đúng thể thức và sao chép bảng sang Word có trong bản Pro.</p>
        <div class="hang-nut-pro">
          <a class="nut-fb" href="https://m.me/KetNoiTriThucEdTechAI" target="_blank" rel="noopener">💬 Nhắn tin Fanpage nhận Bản Pro</a>
          <a class="nut-zalo" href="https://zalo.me/0328961617" target="_blank" rel="noopener">📱 Nhắn Zalo hỗ trợ: 0328961617</a>
        </div>
      </div>`;
      document.body.appendChild(o);
      o.onclick = e => { if (e.target === o || e.target.closest("[data-dong-pro]")) o.hidden = true; };
      document.addEventListener("keydown", e => { if (e.key === "Escape") o.hidden = true; });
    }
    o.hidden = false;
  }
  if (DEMO) {
    document.body.classList.add("ban-demo");
    const goc = document.getElementById("man-ra-de");
    ["copy", "cut"].forEach(ev => goc.addEventListener(ev, e => { e.preventDefault(); hopPro(); }));
    goc.addEventListener("contextmenu", e => { if (!e.target.closest("input, textarea, select")) e.preventDefault(); });
  }
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const D = window.KhoDuLieu;
  const thongBao = s => window.KhoManHinh.thongBao(s);
  const so = x => Math.round(Number(x || 0) * 100) / 100;
  const viet = x => String(so(x)).replace(".", ",");
  const K_HIEN_TAI = "kho_ngu_lieu_de_hien_tai", K_DA_LUU = "kho_ngu_lieu_de_da_luu", K_DAU = "kho_ngu_lieu_dau_trang_de";
  const CHU_MOT_TRANG = 850;
  const NHOM_THEO_PHAN = { "Đọc hiểu": ["Đọc", "Tiếng Việt"], "Viết": ["Viết"] };
  const LOP_MUC = { "Nhận biết": "nb", "Thông hiểu": "th", "Vận dụng": "vd", "Vận dụng cao": "vdc" };

  const doc = (k, mac) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? mac : v; } catch (e) { return mac; } };
  const ghi = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };

  document.querySelectorAll("#tab-ra-de button").forEach(b => b.onclick = () => {
    document.querySelectorAll("#tab-ra-de button").forEach(x => x.classList.toggle("dang-chon", x === b));
    ["soan", "khung", "yccd"].forEach(t => $("#tab-" + t).hidden = t !== b.dataset.tab);
    if (b.dataset.tab === "soan" && de) {
      napKhung();
      if (!khungCua(de.khung_ma)) { de = deMoi(); cauSang = null; moGan = null; }
      veTatCa();
    }
  });

  const MA_YCCD = {};
  (window.YCCD || []).forEach(b => b.y.forEach(y => MA_YCCD[y.ma] = Object.assign({ bai: b.bai, lop: b.lop }, y)));
  const soBai = b => +((b.match(/\d+/) || [0])[0]);
  const baiCuaLop = lop => (window.YCCD || []).filter(b => b.lop === lop).sort((a, b) => soBai(a.bai) - soBai(b.bai));
  const yCuaBai = (lop, bai) => (baiCuaLop(lop).find(b => b.bai === bai) || { y: [] }).y;

  let dau = Object.assign({ so: "", truong: "", ky: "", tg: "" }, doc(K_DAU, {})), kemBang = false;
  let khungs = [], de = null, cauSang = null, tabPhai = "ma-tran", moGan = null, moNH = null, kho = [];

  const NH = [];
  (window.NGAN_HANG || []).forEach(lo => lo.cau.forEach(q => NH.push(q)));
  const mucCua = c => Object.keys(c.muc || {}).filter(m => Number(c.muc[m]) > 0);
  const laDoanVan = q => /^Đảm bảo hình thức đoạn văn/.test((q.y && q.y[0] && q.y[0].nd) || "");
  function cauNL2() {
    if (!de.the2) return null;
    const vs = de.cau.filter(c => c.phan === "Viết");
    const chon = vs.find(c => c.id === de.nl2_cau);
    if (chon) return chon;
    const bai = vs.filter(c => c.dang !== "doan-van");
    return (bai.length ? bai : vs).slice().sort((a, b) => b.diem - a.diem)[0] || null;
  }
  const theCua = c => { const c2 = cauNL2(); return c2 && c2.id === c.id ? de.the2 : de.the; };
  function laCap() {
    if (!de.the || !de.the2 || de.the.kieu !== "kho" || de.the2.kieu !== "kho") return false;
    const t1 = kho.find(x => x.ma === de.the.ma), t2 = kho.find(x => x.ma === de.the2.ma);
    return !!((t1 && (t1.ghep_cap || []).includes(de.the2.ma)) || (t2 && (t2.ghep_cap || []).includes(de.the.ma)));
  }
  const coTen = (s, t) => !!(t && t.nhan_de) && String(s || "").includes("“" + t.nhan_de + "”");
  const deSoSanhCap = q => coTen(q.noi_dung, de.the) && coTen(q.noi_dung, de.the2);
  function nganHangCho(c) {
    const t = theCua(c);
    if (!t || t.kieu !== "kho") return [];
    if (c.dang === "doan-van") return NH.filter(q => q.the === t.ma && laDoanVan(q));
    const ms = mucCua(c), muc = ms.length > 1 ? "Nhiều mức" : ms[0];
    const cap = c.phan === "Viết" && t === de.the2 && laCap();
    return NH.filter(q => q.phan === c.phan && (q.the === t.ma || (cap && q.the === de.the.ma && deSoSanhCap(q))))
      .sort((a, b) => (cap ? deSoSanhCap(b) - deSoSanhCap(a) : 0) || (b.muc === muc) - (a.muc === muc));
  }
  const coNganHang = () => [de.the, de.the2].some(t => t && t.kieu === "kho" && NH.some(q => q.the === t.ma));
  const dungO = q => de.cau.find(x => x.nguon_nh === q.ma);
  const so3 = x => Math.round(x * 1000) / 1000;
  const diem3 = x => { const d = so3(x); return (Number.isInteger(d) ? d.toFixed(1) : String(d)).replace(".", ","); };
  function chiaDiem(y, diem) {
    const tho = y.map(x => x.ty_le * diem);
    const buoc = tho.every(v => Math.abs(v / 0.25 - Math.round(v / 0.25)) < 1e-9) ? 0.25 : 0.125;
    const r = tho.map(v => Math.round(v / buoc) * buoc);
    r[r.length - 1] += diem - r.reduce((a, b) => a + b, 0);
    return r.map(so3);
  }
  function taoDapAn(q, diem) {
    const d = chiaDiem(q.y, diem);
    const dong = q.y.map((y, i) => (q.phan === "Viết" ? "" : "- ") + `${y.nd} (${diem3(d[i])} điểm)`);
    if (q.luu_y) dong.push("Lưu ý: " + q.luu_y);
    return dong.join("\n");
  }
  function dungCau(c, q) {
    if (c.dang === "doan-van") {
      const doi = s => s.replace(/khoảng 5 đến 7 dòng/g, "khoảng 200 chữ");
      q = Object.assign({}, q, { noi_dung: doi(q.noi_dung), y: q.y.map(y => Object.assign({}, y, { nd: doi(y.nd) })) });
    }
    c.noi_dung = q.noi_dung;
    c.dap_an = taoDapAn(q, c.diem); c.da_sinh = c.dap_an; c.nguon_nh = q.ma;
    c.yccd = [...new Set((c.yccd || []).concat((q.yccd || []).filter(m => MA_YCCD[m])))];
    c.duyet = false;
  }
  const khungCua = ma => khungs.find(k => k.ma === ma);
  function napKhung() { khungs = window.KhoRaDe.tatCa().filter(k => k.cau && k.cau.length); }

  function saoCau(c, i) {
    return { id: "c" + i, phan: c.phan, so: c.so, diem: c.diem, muc: Object.assign({}, c.muc), goi_y: c.goi_y || "", dang: c.dang || "", yccd: [], don_vi: "", noi_dung: "", dap_an: "", duyet: false };
  }
  function deMoi(k) {
    k = k || khungs[0];
    const lop = k.lop[0], b = baiCuaLop(lop)[0];
    return { id: "DE-" + Date.now().toString(36), ten: "", khung_ma: k.ma, lop, bai: b ? b.bai : "", the: null, cau: k.cau.map(saoCau), ngay_sua: "" };
  }
  const coNoiDung = d => !!(d.ten || d.the || d.the2 || d.cau.some(c => c.noi_dung || c.yccd.length || c.duyet || c.dap_an));
  const daLuu = () => { const x = doc(K_DA_LUU, []).find(e => e.id === de.id); return !!x && JSON.stringify(Object.assign({}, x, { ngay_sua: "" })) === JSON.stringify(Object.assign({}, de, { ngay_sua: "" })); };
  function tuLuu() { ghi(K_HIEN_TAI, de); }

  function nguonDu(n) { return !!(n && n.tac_gia && n.tac_pham && (n.bao || n.sach_tap || n.nxb || n.duong_dan || n.trang)); }
  function chupThe(t) {
    const ct = [];
    const ctThe = t.chu_thich || {};
    ["tu_kho", "dien_tich"].forEach(k => (ctThe[k] || []).forEach(i => {
      const tu = i.tu || i.ten, nghia = i.nghia || i.giai_thich;
      if (tu && nghia) ct.push({ tu, nghia });
    }));
    return { kieu: "kho", ma: t.ma, the_loai: t.the_loai || "", nhan_de: t.nhan_de, loi_dan: t.loi_dan || "", van_ban: t.van_ban || "", nguon: D.dongNguon(t.nguon), nguon_du: nguonDu(t.nguon), chu_thich: ct, so_chu: t.so_chu };
  }
  const soChuNL = t => (t ? D.demChu(t.van_ban) : 0);
  const soChuThe = () => soChuNL(de.the) + soChuNL(de.the2);
  const dongSoChu = () => de.the2 ? `NL1 ${soChuNL(de.the)} + NL2 ${soChuNL(de.the2)} = ${soChuThe()} chữ` : `${soChuThe()} chữ`;
  const opTheLoai = () => D.CAY_THE_LOAI.map(g => `<optgroup label="${esc(g.ten)}">${g.con.map(x => `<option>${esc(x)}</option>`).join("")}</optgroup>`).join("");
  const formTay = s => `
          <label>Lời dẫn (nếu có)<textarea id="sd-tay${s}-dan" rows="2"></textarea></label>
          <label>Văn bản<textarea id="sd-tay${s}-vb" rows="5"></textarea></label>
          <label>Thể loại<select id="sd-tay${s}-tl"><option value="">— Chọn thể loại —</option>${opTheLoai()}</select></label>
          <div class="hang-2"><label>Tác giả<input id="sd-tay${s}-tg"></label><label>Tên tác phẩm, văn bản<input id="sd-tay${s}-ten"></label></div>
          <label>Nơi in, đăng (báo hoặc sách, năm, đường dẫn)<textarea id="sd-tay${s}-nguon" rows="2"></textarea></label>
          <div class="hang-nut"><button class="nut-xanh" id="sd-tay${s}-dung">Dùng văn bản này</button></div>`;
  function theTay(s) {
    const g = id => (($("#sd-tay" + s + "-" + id) || {}).value || "").trim();
    const vb = g("vb");
    if (!vb) { thongBao("Chưa có văn bản"); return null; }
    const tg = g("tg"), ten = g("ten"), noi = g("nguon");
    const nguon = [tg, ten && "“" + ten + "”", noi].filter(Boolean).join(", ");
    return { kieu: "tay", ma: "", the_loai: g("tl"), nhan_de: ten, loi_dan: g("dan"), van_ban: vb, nguon, nguon_du: !!(tg && ten && noi), chu_thich: [], so_chu: D.demChu(vb) };
  }

  function trungSgk() {
    if (!de.the || de.the.kieu !== "kho") return null;
    const ds = [de.the, de.the2].filter(t => t && t.kieu === "kho").map(x => kho.find(t => t.ma === x.ma)).filter(Boolean);
    return ds.length ? [].concat(...ds.map(t => D.doiChieuSgk(t).map(D.moTaSgk))) : null;
  }
  function kiemTraDe() {
    const k = khungCua(de.khung_ma), ctx = ctxSinh(), SV = window.SinhVanBan;
    const mt = SV.maTran(ctx), dt = SV.dacTa(ctx);
    const trang = uocTrang();
    const kq = window.KiemTraKhop.kiemTraKhop({
      de, khung: k, yccd: MA_YCCD, dau, mt, dt, trang, chuMotTrang: CHU_MOT_TRANG, demChu: D.demChu,
      htmlWord: SV.html(mt, "word", ctx) + SV.html(dt, "word", ctx) + bangDapAn(), trungSgk: trungSgk()
    });
    return { kq, tong: kq.tong, trang, viec: kq.loi + kq.nhac };
  }
  function veLoiCau(kq) {
    kq = kq || kiemTraDe().kq;
    document.querySelectorAll("#sd-giua [data-loi-cau]").forEach(o => {
      const ds = kq.theo_cau[o.dataset.loiCau] || [];
      o.innerHTML = ds.map(x => `<div class="${x.kieu}">${x.kieu === "loi" ? "✗" : "!"} ${esc(x.t)}</div>`).join("");
    });
  }
  function uocTrang() {
    const chu = soChuThe() + de.cau.reduce((a, c) => a + D.demChu(c.noi_dung), 0) + 120;
    return Math.ceil(chu / CHU_MOT_TRANG * 2) / 2;
  }

  function veTrai() {
    const k = khungCua(de.khung_ma);
    kho = D.taiKho();
    const dsBai = baiCuaLop(de.lop);
    const lops = k.lop;
    const khop = kho.filter(t => (t.phu_hop || []).some(p => p.lop === de.lop && p.bai === de.bai));
    const cungLop = kho.filter(t => t.lop.includes(de.lop) && !khop.includes(t));
    const khac = kho.filter(t => !khop.includes(t) && !cungLop.includes(t));
    const tatCaThe = $("#sd-tatca") ? $("#sd-tatca").checked : false;
    const opCua = chon => t => `<option value="${esc(t.ma)}" ${chon && chon.ma === t.ma ? "selected" : ""}>${esc(t.nhan_de)} · ${esc((t.nguon || {}).tac_gia || "")} · ${esc(t.the_loai || "")} · ${t.so_chu} chữ</option>`;
    const op = opCua(de.the), op2 = opCua(de.the2);
    const nhomThe = (op_, bo) => [["Khớp bài này", khop], ["Cùng lớp, bài khác", cungLop], ["Lớp khác", tatCaThe ? khac : []]]
      .map(([nhan, ds]) => { ds = ds.filter(t => !bo || t.ma !== bo); return ds.length ? `<optgroup label="${nhan}">${ds.map(op_).join("")}</optgroup>` : ""; }).join("");
    const daLuuDs = doc(K_DA_LUU, []);
    const mc = k.moc_chu, n = soChuNL(de.the);
    const t1 = de.the && de.the.kieu === "kho" ? kho.find(x => x.ma === de.the.ma) : null;
    const capGoiY = t1 ? (t1.ghep_cap || []).map(m => kho.find(x => x.ma === m)).filter(x => x && !(de.the2 && de.the2.ma === x.ma)) : [];
    const viets = de.cau.filter(c => c.phan === "Viết"), c2 = cauNL2();
    const khoiNL2 = de.the2 ? `<div class="o-tom-tat"><b>${esc(de.the2.nhan_de || "Văn bản tự nhập")}</b>${de.the2.the_loai ? " · " + esc(de.the2.the_loai) : ""}<br>${esc(de.the2.nguon || "Chưa ghi nguồn")}<br>${soChuNL(de.the2)} chữ${de.the2.nguon_du ? "" : `<br><b style="color:var(--do)">Thiếu nguồn</b>`}${de.the2.the_loai ? "" : `<br><b style="color:var(--do)">Chưa có thể loại</b>`}
          ${viets.length > 1 ? `<label>Gắn vào câu<select id="sd-nl2-cau">${viets.map(c => `<option value="${c.id}" ${c2 && c2.id === c.id ? "selected" : ""}>Viết, câu ${c.so} (${viet(c.diem)} điểm${c.dang === "doan-van" ? ", đoạn văn" : ""})</option>`).join("")}</select></label>` : `<div class="nho">Gắn vào câu Viết ${c2 ? c2.so : ""}.</div>`}
          <div class="hang-nut"><button class="nut-bo" id="sd-bo-the2">Bỏ ngữ liệu 2</button></div></div>
          <div class="nho">Tổng ngữ liệu: ${dongSoChu()}${mc ? ` (mốc ${mc.tu} đến ${mc.den})` : ""}</div>` : `<div class="nho">Không dùng ngữ liệu 2: câu Viết không kèm văn bản riêng.</div>`;
    $("#sd-trai").innerHTML = `
      <div class="trai-dau"><h3>Thiết lập</h3><button class="nut-bo" id="sd-thu" title="Thu gọn hoặc mở cột">${$("#sd-goc").classList.contains("thu-gon") ? "›" : "‹"}</button></div>
      <div class="trai-ruot">
        <label>Khung đề<select id="sd-khung">${khungs.map(x => `<option value="${esc(x.ma)}" ${x.ma === k.ma ? "selected" : ""}>${esc(x.ten)}${x.can_xac_nhan ? "" : ""}</option>`).join("")}</select></label>        <div class="hang-2">
          <label>Lớp<select id="sd-lop">${lops.map(l => `<option ${l === de.lop ? "selected" : ""}>${l}</option>`).join("")}</select></label>
          <label>Bài<select id="sd-bai">${dsBai.map(b => `<option value="${esc(b.bai)}" ${b.bai === de.bai ? "selected" : ""}>${esc(b.bai)}</option>`).join("")}</select></label>
        </div>
        <dl class="thong-tin-khung"><dt>Loại đề</dt><dd>${esc(k.loai)}</dd><dt>Thời gian</dt><dd>${k.thoi_gian} phút</dd><dt>Cấu trúc</dt><dd>${k.phan.map(p => esc(p.ten) + " " + viet(p.diem)).join(", ")}</dd></dl>
        <label>Tên đề<input id="sd-ten" value="${esc(de.ten)}" placeholder="Ví dụ: Đề kiểm tra giữa kì I, đề 1"></label>

        <h4>Thông tin đầu trang đề</h4>
        <label>Sở / Phòng GD&amp;ĐT<input id="sd-h-so" value="${esc(dau.so)}" placeholder="SỞ GD&amp;ĐT ... / PHÒNG GD&amp;ĐT ..."></label>
        <label>Tên trường<input id="sd-h-truong" value="${esc(dau.truong)}" placeholder="TRƯỜNG ..."></label>
        <label>Tên kì kiểm tra<input id="sd-h-ky" value="${esc(dau.ky)}" placeholder="KIỂM TRA GIỮA KÌ I - NĂM HỌC 2026 - 2027"></label>
        <label>Thời gian làm bài<input id="sd-h-tg" value="${esc(dau.tg)}" placeholder="90 phút, không kể thời gian phát đề"></label>
        <div class="nho">Lưu trên máy này, lần sau mở app tự điền sẵn. Để trống cả bốn ô thì đề chỉ có dòng môn và thời gian.</div>

        <h4>Ngữ liệu Đọc hiểu</h4>
        <div class="hang-nut"><button class="nut-vang nut-dan-nhanh" id="sd-dan-nhanh">+ Dán nhanh ngữ liệu riêng</button></div>
        <label>Chọn từ Kho
          <select id="sd-the"><option value="">— Chưa chọn —</option>${nhomThe(op)}</select></label>
        <label class="o-chon"><input type="checkbox" id="sd-tatca" ${tatCaThe ? "checked" : ""}> Hiện cả thẻ của lớp khác</label>
        ${de.the ? `<div class="o-tom-tat"><b>${esc(de.the.nhan_de || "Văn bản tự nhập")}</b>${de.the.the_loai ? " · " + esc(de.the.the_loai) : ""}<br>${esc(de.the.nguon || "Chưa ghi nguồn")}<br>${n} chữ${mc && !de.the2 ? ` <span class="nho">(mốc ${mc.tu} đến ${mc.den})</span>` : ""}${de.the.nguon_du ? "" : `<br><b style="color:var(--do)">Thiếu nguồn</b>`}
          <div class="hang-nut"><button class="nut-bo" id="sd-bo-the">Bỏ ngữ liệu</button></div></div>` : `<div class="nho">Chưa chọn ngữ liệu.</div>`}
        <details id="sd-tay"><summary>Dán văn bản tự nhập</summary>${formTay("")}</details>

        <h4>Ngữ liệu phần Viết (ngữ liệu 2)</h4>
        <div class="nho">Dùng khi câu Viết dựa vào một văn bản khác ngữ liệu Đọc hiểu: đề phân tích một văn bản khác thể loại, đề so sánh hai văn bản.</div>
        ${capGoiY.map(x => `<div class="nho">Thẻ ghép cặp của ngữ liệu Đọc hiểu: <b>${esc(x.nhan_de)}</b> <button class="nut-bo" data-cap="${esc(x.ma)}">Dùng làm ngữ liệu 2</button></div>`).join("")}
        <label>Chọn từ Kho<select id="sd-the2"><option value="">— Không dùng —</option>${nhomThe(op2, de.the && de.the.ma)}</select></label>
        ${khoiNL2}
        <details id="sd-tay2"><summary>Dán văn bản tự nhập</summary>${formTay("2")}</details>

        <h4>Đề đã lưu</h4>
        <div class="hang-nut"><button class="nut-xanh" id="sd-luu">Lưu đề</button><button class="nut-bo" id="sd-moi">Đề mới</button></div>
        <div class="nho">Đề được tự giữ lại trên máy này khi đóng trình duyệt; bấm "Lưu đề" để giữ thành một bản riêng.</div>
        ${daLuuDs.map(e => `<div class="dong-luu"><span title="${esc(e.ten)}">${esc(e.ten || "Đề không tên")} · Lớp ${e.lop}</span><span><button class="nut-bo" data-mo="${esc(e.id)}">Mở</button> <button class="nut-bo nut-xoa" data-xoa="${esc(e.id)}">Xóa</button></span></div>`).join("") || `<div class="nho">Chưa có đề nào được lưu.</div>`}
      </div>`;
  }

  function chipY(ma) {
    const y = MA_YCCD[ma];
    const la = y && !(yCuaBai(de.lop, de.bai).some(z => z.ma === ma));
    return `<span class="chip-y ${la ? "la" : ""}" title="${esc(y ? `${y.bai}: ${y.nd}` : "Không còn trong kho")}">${esc(ma)}</span>`;
  }
  const ctxSinh = () => { const c2 = cauNL2(); return { de, khung: khungCua(de.khung_ma), yccd: MA_YCCD, nl2: c2 ? { cau: c2.id, the: de.the2 } : null }; };
  function veCau(c) {
    const don = Object.keys(c.muc).length === 1;
    const muc = don ? Object.keys(c.muc)[0] : null;
    const k = khungCua(de.khung_ma);
    const ys = yCuaBai(de.lop, de.bai).filter(y => (NHOM_THEO_PHAN[c.phan] || ["Đọc", "Tiếng Việt", "Viết"]).includes(y.nhom));
    const nh = nganHangCho(c);
    return `<div class="cau ${c.id === cauSang ? "sang" : ""} ${c.duyet ? "da-duyet" : ""}" data-cau="${c.id}">
      <div class="cau-dau"><b>Câu ${c.so}</b>
        <span>(<input type="number" class="o-diem" min="0" max="10" step="0.25" value="${c.diem}" aria-label="Điểm câu ${c.so}"> điểm)</span>
        ${don ? `<select class="o-muc" aria-label="Mức độ">${k.muc_do.map(m => `<option ${m === muc ? "selected" : ""}>${m}</option>`).join("")}</select>`
          : Object.entries(c.muc).map(([m, x]) => `<span class="the-muc muc-${LOP_MUC[m]}">${m} ${viet(x)}</span>`).join(" ")}
        <label class="nut-duyet"><input type="checkbox" class="o-duyet" ${c.duyet ? "checked" : ""}> Đã duyệt</label>
      </div>
      <div class="cau-yccd">${c.yccd.map(chipY).join("") || `<span class="chua nho" style="color:var(--chu-phu)">Chưa gắn yêu cầu cần đạt</span>`}
        <button class="nut-bo" data-gan="${c.id}">${moGan === c.id ? "Đóng" : "+ Gắn yêu cầu cần đạt"}</button>
        ${nh.length ? `<button class="nut-bo nut-nh" data-nh="${c.id}">${moNH === c.id ? "Đóng ngân hàng" : "Ngân hàng (" + nh.length + ")"}</button>` : ""}</div>
      ${moNH === c.id ? `<div class="hop-nh">${nh.map(q => {
        const o = dungO(q);
        return `<div class="nh-cau ${o && o.id !== c.id ? "da-dung" : ""}"><div class="nh-dau"><span class="the-muc muc-${LOP_MUC[q.muc] || "vdc"}">${esc(q.muc)}</span>
          <span class="nho">${esc(q.ma)}${q.tv ? " · câu Tiếng Việt" : ""} · ${esc(q.trang_thai_duyet)}${o ? " · đang dùng ở " + esc(o.phan) + " câu " + o.so : ""}</span></div>
          <div class="nh-nd">${esc(q.noi_dung)}</div>${q.ghi_chu ? `<div class="nho">${esc(q.ghi_chu)}</div>` : ""}
          <details><summary>Xem đáp án theo ${viet(c.diem)} điểm</summary><div class="nh-da">${esc(taoDapAn(q, c.diem)).replace(/\n/g, "<br>")}</div></details>
          <button class="nut-xanh" data-dung="${esc(q.ma)}">Dùng câu này</button></div>`;
      }).join("")}</div>` : ""}
      <input class="o-dv" value="${esc(c.don_vi || "")}" placeholder="${esc("Nội dung kiến thức (gợi ý: " + window.SinhVanBan.donViGoiY(c, ctxSinh()) + ")")}" aria-label="Nội dung kiến thức">
      ${moGan === c.id ? `<div class="hop-gan">${ys.length ? ys.map(y => `<label class="dong-y"><input type="checkbox" data-y="${esc(y.ma)}" ${c.yccd.includes(y.ma) ? "checked" : ""}><span><b>${esc(y.ma)}</b> ${esc(y.nd)}</span></label>`).join("")
        : `<div class="nho">Bài này chưa có yêu cầu cần đạt phù hợp với phần ${esc(c.phan)}.</div>`}</div>` : ""}
      <div class="cau-loi" data-loi-cau="${c.id}"></div>
      <textarea class="o-nd" rows="${c.phan === "Viết" ? 4 : 3}" placeholder="${esc(c.goi_y ? "Gợi ý: " + c.goi_y : "Nội dung câu hỏi")}">${esc(c.noi_dung)}</textarea>
    </div>`;
  }
  function veGiua() {
    const k = khungCua(de.khung_ma);
    const so_la = ["I", "II", "III", "IV", "V"];
    const soCT1 = de.the && de.the.chu_thich ? de.the.chu_thich.length : 0, c2 = cauNL2();
    const khoiNgu = (t, nhan, bd) => {
      if (!t) return `<div class="ngu-lieu trong">Chưa chọn ngữ liệu. Chọn từ Kho hoặc dán văn bản ở cột bên trái.</div>`;
      return `<div class="ngu-lieu">${nhan ? `<div class="nho"><b>${esc(nhan)}</b></div>` : ""}<div>Đọc văn bản sau:</div>
        ${t.loi_dan ? `<div class="loi-dan">${esc(t.loi_dan)}</div>` : ""}
        <div class="vb">${esc(t.van_ban)}</div>
        <div class="nguon">${esc(t.nguon ? "(Nguồn: " + t.nguon + ")" : "")}</div>
        ${t.chu_thich && t.chu_thich.length ? `<div class="chu-thich"><b>Chú thích</b><br>${t.chu_thich.map((x, i) => `(${bd + i + 1}) ${esc(x.tu)}: ${esc(x.nghia)}`).join("<br>")}</div>` : ""}</div>`;
    };
    $("#sd-giua").innerHTML = `<div class="hang-hanh-dong">
        <button class="nut-xanh" id="sd-nut-in">In / Lưu PDF</button>
        <button class="nut-bo" id="sd-nut-word">Tải file Word (.doc)</button>
        <label class="o-chon"><input type="checkbox" id="sd-kem" ${kemBang ? "checked" : ""}> Kèm ma trận, bản đặc tả, đáp án</label>
        ${coNganHang() ? `<button class="nut-bo" id="sd-dien-nhanh" title="Điền các câu còn trống bằng câu hỏi mẫu cùng mức">Điền nhanh từ ngân hàng</button>` : ""}
      </div>
      <article class="giay-de">
      <div id="sd-dau-de">${dauDeHtml()}</div>
      <h3 class="${de.ten ? "" : "chua-ten"}">${esc(de.ten || "Đề chưa đặt tên")}</h3>
      ${k.phan.map((p, i) => {
        const cs = de.cau.filter(c => c.phan === p.ten);
        const heDuyet = cs.length && cs.every(c => c.duyet);
        return `<h4><span>${so_la[i]}. ${esc(p.ten.toUpperCase())} (${viet(p.diem)} điểm)</span><button class="nut-bo" data-duyet-phan="${esc(p.ten)}">${heDuyet ? "Bỏ duyệt cả phần" : "Duyệt cả phần"}</button></h4>
          ${p.ten === "Đọc hiểu" ? khoiNgu(de.the, de.the2 ? "Ngữ liệu 1 (Đọc hiểu)" : "", 0) : ""}${cs.map(c => (c2 && c.id === c2.id ? khoiNgu(de.the2, `Ngữ liệu 2 · dùng cho câu Viết ${c.so}`, soCT1) : "") + veCau(c)).join("")}`;
      }).join("")}
      <div class="thuong-hieu">Soạn thảo từ Kho Ngữ liệu Ngữ văn · Kết Nối Tri Thức</div>
    </article>`;
    veLoiCau();
  }

  function vePhai() {
    const k = khungCua(de.khung_ma), kt = kiemTraDe();
    const nhan = [["ma-tran", "Ma trận"], ["dac-ta", "Bản đặc tả"], ["dap-an", "Đáp án"], ["kiem-tra", `Kiểm tra${kt.kq.loi ? " (" + kt.kq.loi + ")" : ""}`]];
    const hang = (c, noi) => `<tr data-cau="${c.id}" class="${c.id === cauSang ? "sang" : ""}">${noi}</tr>`;
    let nd = "";
    if (tabPhai === "ma-tran" || tabPhai === "dac-ta") {
      const kq = tabPhai === "ma-tran" ? window.SinhVanBan.maTran(ctxSinh()) : window.SinhVanBan.dacTa(ctxSinh());
      const cb = tabPhai === "ma-tran" ? kq.canh_bao : kq.chua_gan.length ? ["Chưa gắn yêu cầu cần đạt: " + kq.chua_gan.join(", ") + "."] : [];
      nd = `<div class="hang-nut"><button class="nut-bo" data-rong="1">Xem rộng</button><button class="nut-xanh" data-chep="1">Sao chép bảng (dán sang Word)</button></div>
        ${cb.length ? `<ul class="kt">${cb.map(t => `<li class="nhac">${esc(t)}</li>`).join("")}</ul>` : ""}
        <div class="cuon-ngang">${window.SinhVanBan.html(kq, "app", ctxSinh())}</div>`;
    } else if (tabPhai === "dap-an") {
      nd = `<table><thead><tr><th>Câu</th><th>Điểm</th><th>Đáp án và biểu điểm</th></tr></thead><tbody>
        ${de.cau.map(c => hang(c, `<td>${esc(c.phan)} ${c.so}</td><td class="so">${viet(c.diem)}</td><td><textarea class="o-da" data-c="${c.id}" rows="3" placeholder="Đáp án, chia ý và điểm">${esc(c.dap_an)}</textarea></td>`)).join("")}</tbody></table>`;
    } else {
      const kq = kt.kq, lk = i => i.cau ? `<button data-toi="${i.cau}">đến câu</button>` : "";
      const THU_TU = { loi: 0, nhac: 1, dat: 2 }, DAU = { loi: "✗", nhac: "!", dat: "✓" };
      nd = `<div class="tom-tat-kt"><span class="so-loi"><b>${kq.loi}</b> lỗi phải sửa</span><span class="so-nhac"><b>${kq.nhac}</b> mục nên xem</span><span class="so-dat"><b>${kq.dat}</b> mục đạt</span></div>
        ${!kq.loi && !kq.nhac ? `<div class="dat">Đề, ma trận, bản đặc tả và đáp án đã khớp nhau.</div>` : ""}
        ${Object.entries(kq.nhom).map(([g, ds]) => `<div class="nhom-kt">${g}</div><ul class="kt">${ds.slice().sort((a, b) => THU_TU[a.kieu] - THU_TU[b.kieu])
          .map(i => `<li class="${i.kieu}"><span class="dau-kt">${DAU[i.kieu]}</span> ${esc(i.t)}${i.kieu !== "dat" ? lk(i) : ""}</li>`).join("")}</ul>`).join("")}
        <div class="nhom-kt">Người duyệt tự xác nhận</div><ul class="kt">${kq.xac_nhan.map(t => `<li class="xn"><span class="dau-kt">○</span> ${esc(t)}</li>`).join("")}</ul>
        <p class="nho chua">Máy chỉ đối chiếu số liệu và hình thức; độ đúng của đáp án, mức độ và nguồn do người soạn quyết định.</p>`;
    }
    $("#sd-phai").innerHTML = `<h3>Văn bản đi kèm</h3><div class="tab-phai">${nhan.map(([m, t]) => `<button data-tp="${m}" class="${m === tabPhai ? "dang-chon" : ""}">${t}</button>`).join("")}</div>${nd}`;
    veLoiCau(kt.kq);
  }

  function veTrangThai() {
    const k = khungCua(de.khung_ma), kt = kiemTraDe(), n = soChuThe(), mc = k.moc_chu;
    const viec = kt.viec;
    const lopChu = !de.the ? "" : (mc && (n < mc.tu || n > mc.den) ? "canh" : "tot");
    $("#sd-tt").innerHTML = `
      <span class="tt ${kt.tong === 10 ? "tot" : "loi"}">Tổng điểm <b>${viet(kt.tong)}</b>/10</span>
      <span class="tt ${lopChu}">Ngữ liệu <b>${esc(dongSoChu())}</b> ${mc ? `<small>mốc ${mc.tu} đến ${mc.den}</small>` : ""}</span>
      <span class="tt ${kt.trang > 2 ? "canh" : ""}" title="Tạm tính ${CHU_MOT_TRANG} chữ một trang, chưa dàn trang thật">Trang ước tính <b>${viet(kt.trang)}</b></span>
      <button class="tt nut-viec ${viec ? (kt.kq.loi ? "loi" : "canh") : "tot"}" id="sd-viec">Việc còn lại <b>${viec}</b></button>
      <span class="gian"><button class="nut-xanh" id="sd-tt-word">Tải file Word</button></span>`;
  }

  function veTatCa() { veTrai(); veGiua(); vePhai(); veTrangThai(); datSang(false); }
  function veChay() { tuLuu(); vePhai(); veTrangThai(); datSang(false); }

  function datSang(cuon) {
    document.querySelectorAll("#sd-goc [data-cau]").forEach(e => e.classList.toggle("sang", e.dataset.cau === cauSang));
    if (cuon && cauSang) {
      const dong = document.querySelector(`#sd-phai tr[data-cau="${cauSang}"]`);
      if (dong && dong.offsetParent) dong.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }
  function chonCau(id) { if (cauSang !== id) { cauSang = id; datSang(true); } }
  const cauTheoId = id => de.cau.find(c => c.id === id);

  function xacNhanBoNoiDung(lyDo) { return !coNoiDung(de) || daLuu() || confirm(lyDo); }
  const trai = $("#sd-trai"), giua = $("#sd-giua"), phai = $("#sd-phai");

  trai.addEventListener("click", e => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.id === "sd-thu") { $("#sd-goc").classList.toggle("thu-gon"); t.textContent = $("#sd-goc").classList.contains("thu-gon") ? "›" : "‹"; }
    else if (t.id === "sd-bo-the") { de.the = null; tuLuu(); veTatCa(); }
    else if (t.id === "sd-bo-the2") { de.the2 = null; de.nl2_cau = ""; tuLuu(); veTatCa(); }
    else if (t.id === "sd-dan-nhanh") { moDanNhanh(); }
    else if (t.id === "sd-tay-dung") { const x = theTay(""); if (x) { de.the = x; tuLuu(); veTatCa(); } }
    else if (t.id === "sd-tay2-dung") { const x = theTay("2"); if (x) { de.the2 = x; de.nl2_cau = ""; tuLuu(); veTatCa(); } }
    else if (t.dataset.cap) { datNL2(kho.find(x => x.ma === t.dataset.cap)); }
    else if (t.id === "sd-luu") {
      de.ngay_sua = new Date().toISOString().slice(0, 10);
      const ds = doc(K_DA_LUU, []).filter(x => x.id !== de.id).concat([JSON.parse(JSON.stringify(de))]);
      if (!ghi(K_DA_LUU, ds)) return thongBao("Không lưu được trên trình duyệt này");
      tuLuu(); veTrai(); thongBao("Đã lưu đề");
    }
    else if (t.id === "sd-moi") {
      if (!xacNhanBoNoiDung("Đề đang soạn chưa lưu sẽ mất. Làm đề mới?")) return;
      de = deMoi(khungCua(de.khung_ma)); cauSang = null; moGan = null; tuLuu(); veTatCa();
    }
    else if (t.dataset.mo) {
      if (!xacNhanBoNoiDung("Đề đang soạn chưa lưu sẽ mất. Mở đề đã lưu?")) return;
      const x = doc(K_DA_LUU, []).find(e2 => e2.id === t.dataset.mo);
      if (x && khungCua(x.khung_ma)) { de = x; cauSang = null; moGan = null; tuLuu(); veTatCa(); }
      else thongBao("Không mở được: khung của đề này không còn");
    }
    else if (t.dataset.xoa) {
      if (!confirm("Xóa đề đã lưu này? Đề đã xóa không lấy lại được.")) return;
      ghi(K_DA_LUU, doc(K_DA_LUU, []).filter(x => x.id !== t.dataset.xoa)); veTrai(); thongBao("Đã xóa");
    }
  });
  const O_DAU = { "sd-h-so": "so", "sd-h-truong": "truong", "sd-h-ky": "ky", "sd-h-tg": "tg" };
  trai.addEventListener("input", e => {
    const kd = O_DAU[e.target.id];
    if (kd) { dau[kd] = e.target.value; ghi(K_DAU, dau); const o = $("#sd-dau-de"); if (o) o.innerHTML = dauDeHtml(); }
  });
  trai.addEventListener("input", e => { if (e.target.id === "sd-ten") { de.ten = e.target.value; tuLuu(); const h3 = $("#sd-giua h3"); h3.textContent = de.ten || "Đề chưa đặt tên"; h3.classList.toggle("chua-ten", !de.ten); } });
  trai.addEventListener("change", e => {
    const id = e.target.id;
    if (id === "sd-khung") {
      if (!xacNhanBoNoiDung("Đổi khung sẽ làm lại các câu, nội dung đã gõ sẽ mất. Tiếp tục?")) { veTrai(); return; }
      const k = khungCua(e.target.value);
      de.khung_ma = k.ma; de.cau = k.cau.map(saoCau);
      if (!k.lop.includes(de.lop)) { de.lop = k.lop[0]; de.bai = (baiCuaLop(de.lop)[0] || {}).bai || ""; }
      cauSang = null; moGan = null; tuLuu(); veTatCa();
    } else if (id === "sd-lop") {
      de.lop = +e.target.value; de.bai = (baiCuaLop(de.lop)[0] || {}).bai || ""; moGan = null; tuLuu(); veTatCa();
    } else if (id === "sd-bai") { de.bai = e.target.value; moGan = null; tuLuu(); veTatCa(); }
    else if (id === "sd-the") {
      const t = kho.find(x => x.ma === e.target.value);
      de.the = t ? chupThe(t) : null;
      if (de.the && de.the2 && de.the2.ma === de.the.ma) { de.the2 = null; thongBao("Ngữ liệu 2 trùng ngữ liệu Đọc hiểu nên đã bỏ."); }
      tuLuu(); veTatCa();
    } else if (id === "sd-the2") datNL2(kho.find(x => x.ma === e.target.value));
    else if (id === "sd-nl2-cau") { de.nl2_cau = e.target.value; tuLuu(); veTatCa(); }
    else if (id === "sd-tatca") veTrai();
  });
  function moDanNhanh() {
    const coLuu = !window.BAN_DEMO && window.KhoBoSung && window.KhoBoSung.themNhap;
    const hop = document.createElement("div");
    hop.className = "hop-thoai-nen";
    hop.innerHTML = `<div class="hop-thoai" role="dialog" aria-modal="true" aria-labelledby="dn-tieu-de">
      <div class="hang-tieu-de"><h3 id="dn-tieu-de">Dán nhanh ngữ liệu riêng</h3><button class="nut-dong" data-dong aria-label="Đóng">✕</button></div>
      <label>Tên văn bản<input id="dn-ten"></label>
      <div class="hang-2"><label>Tác giả<input id="dn-tg"></label>
        <label>Lớp gợi ý<select id="dn-lop">${(D.DS_LOP || [6, 7, 8, 9, 10, 11, 12]).map(l => `<option value="${l}" ${+l === +de.lop ? "selected" : ""}>Lớp ${l}</option>`).join("")}</select></label></div>
      <label>Thể loại<select id="dn-tl"><option value="">— Chọn thể loại —</option>${opTheLoai()}</select></label>
      <label>Nội dung văn bản<textarea id="dn-vb" rows="9" placeholder="Dán văn bản vào đây"></textarea></label>
      ${coLuu ? `<label class="o-chon"><input type="checkbox" id="dn-luu"> Lưu đồng thời vào Ngữ liệu của tôi (thẻ nháp ở Hàng chờ)</label>` : ""}
      <div class="hang-nut"><button class="nut-xanh" id="dn-dung">Đưa vào đề</button><button class="nut-bo" data-dong>Hủy</button></div>
    </div>`;
    const dong = () => { document.removeEventListener("keydown", phim); hop.remove(); };
    const phim = e => { if (e.key === "Escape") dong(); };
    document.addEventListener("keydown", phim);
    hop.addEventListener("click", e => {
      if (e.target === hop || e.target.closest("[data-dong]")) return dong();
      if (e.target.id !== "dn-dung") return;
      const g = id => (hop.querySelector("#" + id).value || "").trim();
      const vb = g("dn-vb"), ten = g("dn-ten"), tg = g("dn-tg"), tl = g("dn-tl"), lop = g("dn-lop");
      if (!vb) { thongBao("Chưa dán nội dung văn bản"); hop.querySelector("#dn-vb").focus(); return; }
      if (de.the && !confirm("Đề đang có ngữ liệu Đọc hiểu. Thay bằng văn bản vừa dán?")) return;
      de.the = { kieu: "tay", ma: "", the_loai: tl, nhan_de: ten, loi_dan: "", van_ban: vb, nguon: [tg, ten && "“" + ten + "”"].filter(Boolean).join(", "), nguon_du: false, chu_thich: [], so_chu: D.demChu(vb) };
      let bao = "Đã đưa ngữ liệu vào đề";
      if (coLuu && hop.querySelector("#dn-luu").checked) {
        const ma = window.KhoBoSung.themNhap({ nhan_de: ten, tac_gia: tg, the_loai: tl, lop, van_ban: vb });
        bao = ma ? `${bao}, đã lưu ${ma} vào Ngữ liệu của tôi` : `${bao}; chưa lưu được vào Ngữ liệu của tôi (bộ nhớ trình duyệt đầy)`;
      }
      dong(); tuLuu(); veTatCa(); thongBao(bao);
    });
    document.body.appendChild(hop);
    hop.querySelector("#dn-ten").focus();
  }

  function datNL2(t) {
    if (t && de.the && de.the.ma === t.ma) { thongBao("Ngữ liệu 2 phải khác ngữ liệu Đọc hiểu."); veTrai(); return; }
    de.the2 = t ? chupThe(t) : null; de.nl2_cau = ""; moNH = null; tuLuu(); veTatCa();
  }

  giua.addEventListener("focusin", e => { const c = e.target.closest("[data-cau]"); if (c) chonCau(c.dataset.cau); });
  giua.addEventListener("click", e => {
    const c = e.target.closest("[data-cau]"); if (c) chonCau(c.dataset.cau);
    const t = e.target.closest("button"); if (!t) return;
    if (t.id === "sd-nut-in") { inDe(); return; }
    if (t.id === "sd-nut-word") { taiWord(); return; }
    if (t.id === "sd-dien-nhanh") { dienNhanh(); return; }
    if (t.dataset.nh) { moNH = moNH === t.dataset.nh ? null : t.dataset.nh; moGan = null; veGiua(); datSang(false); return; }
    if (t.dataset.dung) {
      const c = cauTheoId(t.closest("[data-cau]").dataset.cau), q = NH.find(x => x.ma === t.dataset.dung), o = q && dungO(q);
      if (!q) return;
      if (c.noi_dung.trim() && !confirm("Câu này đã có nội dung. Thay bằng câu hỏi mẫu?")) return;
      if (o && o.id !== c.id && !confirm(`Câu hỏi mẫu này đang dùng ở ${o.phan} câu ${o.so}. Vẫn dùng thêm ở đây?`)) return;
      dungCau(c, q); moNH = null; tuLuu(); veGiua(); vePhai(); veTrangThai(); datSang(false);
      thongBao("Đã đưa câu hỏi mẫu vào. Thầy cô đọc lại rồi bấm Đã duyệt.");
      return;
    }
    if (t.dataset.gan) { moGan = moGan === t.dataset.gan ? null : t.dataset.gan; veGiua(); datSang(false); }
    else if (t.dataset.duyetPhan) {
      const cs = de.cau.filter(x => x.phan === t.dataset.duyetPhan), het = cs.every(x => x.duyet);
      cs.forEach(x => x.duyet = !het); tuLuu(); veGiua(); vePhai(); veTrangThai();
    }
  });
  giua.addEventListener("input", e => {
    const el = e.target, cEl = el.closest("[data-cau]"); if (!cEl) return;
    const c = cauTheoId(cEl.dataset.cau);
    if (el.classList.contains("o-nd")) { c.noi_dung = el.value; veChay(); }
    else if (el.classList.contains("o-dv")) { c.don_vi = el.value; veChay(); }
    else if (el.classList.contains("o-diem")) {
      const d = parseFloat(el.value); c.diem = isNaN(d) ? 0 : d;
      const q = c.nguon_nh && c.dap_an === c.da_sinh && NH.find(x => x.ma === c.nguon_nh);
      if (q) { c.dap_an = taoDapAn(q, c.diem); c.da_sinh = c.dap_an; }
      if (Object.keys(c.muc).length === 1) c.muc = { [Object.keys(c.muc)[0]]: c.diem };
      veChay();
    }
  });
  giua.addEventListener("change", e => {
    if (e.target.id === "sd-kem") { kemBang = e.target.checked; return; }
    const el = e.target, cEl = el.closest("[data-cau]"); if (!cEl) return;
    const c = cauTheoId(cEl.dataset.cau);
    if (el.classList.contains("o-muc")) { c.muc = { [el.value]: c.diem }; veChay(); }
    else if (el.classList.contains("o-duyet")) { c.duyet = el.checked; cEl.classList.toggle("da-duyet", c.duyet); veGiua(); datSang(false); vePhai(); veTrangThai(); tuLuu(); }
    else if (el.dataset.y) {
      c.yccd = el.checked ? c.yccd.concat([el.dataset.y]) : c.yccd.filter(m => m !== el.dataset.y);
      tuLuu(); veGiua(); datSang(false); vePhai(); veTrangThai();
    }
  });

  phai.addEventListener("click", e => {
    const t = e.target.closest("button");
    if (t && t.dataset.tp) { tabPhai = t.dataset.tp; vePhai(); datSang(false); return; }
    if (t && t.dataset.rong) { xemRong(); return; }
    if (t && t.dataset.chep) { saoChepBang(); return; }
    if (t && t.dataset.toi) {
      cauSang = t.dataset.toi; datSang(false);
      $("#sd-goc").dataset.hien = "de"; setCot("de");
      const el = document.querySelector(`#sd-giua [data-cau="${cauSang}"]`); if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    const r = e.target.closest("tr[data-cau]");
    if (r) {
      cauSang = r.dataset.cau; datSang(false);
      const el = document.querySelector(`#sd-giua [data-cau="${cauSang}"]`);
      if (el && el.offsetParent) el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  });
  phai.addEventListener("input", e => {
    if (e.target.classList.contains("o-da")) { cauTheoId(e.target.dataset.c).dap_an = e.target.value; tuLuu(); }
  });

  $("#sd-tt").addEventListener("click", e => {
    if (e.target.closest("#sd-tt-word")) { taiWord(); return; }
    if (e.target.closest("#sd-viec")) { tabPhai = "kiem-tra"; vePhai(); setCot("phai"); }
  });

  function dienNhanh() {
    let n = 0;
    de.cau.filter(c => !c.noi_dung.trim()).forEach(c => {
      const ms = mucCua(c), muc = ms.length > 1 ? "Nhiều mức" : ms[0];
      const q = nganHangCho(c).find(x => (c.dang === "doan-van" || x.muc === muc) && !dungO(x));
      if (q) { dungCau(c, q); n++; }
    });
    tuLuu(); veGiua(); vePhai(); veTrangThai(); datSang(false);
    thongBao(n ? `Đã điền ${n} câu từ ngân hàng. Thầy cô đọc lại và duyệt từng câu.` : "Không còn câu trống nào có câu hỏi mẫu cùng mức.");
  }

  const SO_LA = ["I", "II", "III", "IV", "V"];
  const DONG_DEMO = "Bản dùng thử · Kho Ngữ liệu Ngữ văn – Kết Nối Tri Thức (Zalo: 0328.961.617)";
  const diemChu = x => { const d = so(x); return (Number.isInteger(d) ? d.toFixed(1) : String(d)).replace(".", ","); };
  const laTho = t => /thơ|ca dao|lục bát|hai-cư/i.test((t && t.the_loai) || "");
  const doanVan = (vb, tho) => tho
    ? String(vb || "").split(/\n\s*\n/).map(b => b.trim()).filter(Boolean).map(b => `<p class="vb-kho">${esc(b).replace(/\n/g, "<br>")}</p>`).join("")
    : String(vb || "").split(/\n/).map(b => b.trim()).filter(Boolean).map(b => `<p class="vb-doan">${esc(b)}</p>`).join("");
  const dongVan = t => esc(t).replace(/\n/g, "<br>");

  function dauDeHtml() {
    const k = khungCua(de.khung_ma), c = x => (x || "").trim();
    if (!c(dau.so) && !c(dau.truong) && !c(dau.ky) && !c(dau.tg))
      return `<div class="de-dau">MÔN NGỮ VĂN, LỚP ${de.lop}<br>Thời gian làm bài: ${k.thoi_gian} phút</div>`;
    const trai = [c(dau.so) && esc(c(dau.so)), c(dau.truong) && `<b>${esc(c(dau.truong))}</b>`].filter(Boolean).join("<br>");
    const phai = [c(dau.ky) && `<b>${esc(c(dau.ky))}</b>`, `Môn: Ngữ văn, lớp ${de.lop}`, `Thời gian làm bài: ${esc(c(dau.tg) || k.thoi_gian + " phút")}`].join("<br>");
    return `<table class="bang-dau-de"><tr><td class="trai">${trai}</td><td class="phai">${phai}</td></tr></table>`;
  }

  function bangDapAn() {
    if (!de.cau.some(c => c.dap_an && c.dap_an.trim())) return "";
    const td = ' style="border:1px solid #000;padding:4px 7px;vertical-align:top"';
    return `<p class="vb-tieude">ĐÁP ÁN VÀ BIỂU ĐIỂM</p><table style="border-collapse:collapse;width:100%"><tr><td${td}><b>Câu</b></td><td${td}><b>Điểm</b></td><td${td}><b>Đáp án</b></td></tr>
      ${de.cau.map(c => `<tr><td${td}>${esc(c.phan)} ${c.so}</td><td${td}>${diemChu(c.diem)}</td><td${td}>${dongVan(c.dap_an || "")}</td></tr>`).join("")}</table>`;
  }

  function nguLieuHtml(t, bd) {
    let h = `<p><i>Đọc văn bản sau:</i></p>${t.loi_dan ? `<p><i>${dongVan(t.loi_dan)}</i></p>` : ""}${doanVan(t.van_ban, laTho(t))}`;
    if (t.nguon) h += `<p class="vb-nguon">(Nguồn: ${esc(t.nguon)})</p>`;
    if (t.chu_thich && t.chu_thich.length) h += `<p class="vb-chuthich"><b>Chú thích:</b> ${t.chu_thich.map((x, i) => `(${bd + i + 1}) ${esc(x.tu)}: ${esc(x.nghia)}`).join("; ")}.</p>`;
    return h;
  }
  function taoHtmlDe() {
    const k = khungCua(de.khung_ma), t = de.the, c2 = cauNL2();
    const soCT1 = t && t.chu_thich ? t.chu_thich.length : 0;
    let h = dauDeHtml();
    if (de.ten.trim()) h += `<p class="vb-tieude">${esc(de.ten.trim().toUpperCase())}</p>`;
    k.phan.forEach((p, i) => {
      h += `<p class="vb-phan">${SO_LA[i]}. ${esc(p.ten.toUpperCase())} (${diemChu(p.diem)} điểm)</p>`;
      if (p.ten === "Đọc hiểu" && t) h += nguLieuHtml(t, 0);
      de.cau.filter(c => c.phan === p.ten).forEach(c => {
        if (c2 && c.id === c2.id) h += nguLieuHtml(de.the2, soCT1);
        h += `<p class="vb-cau"><b>Câu ${c.so} (${diemChu(c.diem)} điểm).</b> ${dongVan(c.noi_dung)}</p>`;
      });
    });
    h += `<p class="vb-het">HẾT</p>`;
    if (window.BAN_DEMO) h += `<p class="vb-demo">${DONG_DEMO}</p>`;
    if (kemBang) {
      const ctx = ctxSinh(), SV = window.SinhVanBan, nt = '<br clear="all" style="page-break-before:always">';
      h += nt + SV.html(SV.maTran(ctx), "word", ctx, { co_chu: "13pt" }) + nt + SV.html(SV.dacTa(ctx), "word", ctx, { co_chu: "13pt" });
      const da = bangDapAn(); if (da) h += nt + da;
    }
    return h;
  }

  function kiemTruocXuat() {
    const thieu = de.cau.filter(c => !c.noi_dung.trim()).length, viec = [], soLoi = kiemTraDe().kq.loi;
    if (!de.the) viec.push("chưa chọn ngữ liệu");
    if (thieu) viec.push(thieu + " câu chưa có nội dung");
    if (soLoi) viec.push(soLoi + " lỗi ở thẻ Kiểm tra");
    return !viec.length || confirm("Đề còn: " + viec.join("; ") + ". Vẫn tiếp tục?");
  }

  function chuanBiIn() {
    let v = $("#sd-vung-in");
    if (!v) { v = document.createElement("div"); v.id = "sd-vung-in"; v.className = "vung-in"; document.body.appendChild(v); }
    v.innerHTML = taoHtmlDe();
    document.body.classList.add("dang-in-de");
  }
  const donIn = () => document.body.classList.remove("dang-in-de");
  window.addEventListener("afterprint", donIn);
  window.addEventListener("beforeprint", () => {
    const m = $("#man-ra-de"), tab = $("#tab-soan");
    if (DEMO) return;
    if (de && m && !m.hidden && tab && !tab.hidden && !document.body.classList.contains("dang-in-de")) chuanBiIn();
  });
  function inDe() {
    if (DEMO) return hopPro();
    if (!kiemTruocXuat()) return;
    chuanBiIn();
    setTimeout(() => window.print(), 50);
  }

  const CSS_WORD = `@page WordSection1 { size: 21.0cm 29.7cm; margin: 2cm 2cm 2cm 2cm; mso-page-orientation: portrait; }
    div.WordSection1 { page: WordSection1; }
    body { font-family: "Times New Roman", serif; font-size: 13pt; line-height: 135%; }
    p { margin: 0 0 5pt 0; text-align: justify; }
    table.bang-dau-de { width: 100%; border-collapse: collapse; border: none; margin-bottom: 8pt; }
    table.bang-dau-de td { border: none; vertical-align: top; text-align: center; font-size: 13pt; }
    table.bang-dau-de td.trai { width: 42%; }
    .de-dau { text-align: center; }
    .vb-tieude { text-align: center; font-weight: bold; font-size: 14pt; margin: 10pt 0; }
    .vb-phan { font-weight: bold; margin: 12pt 0 5pt 0; text-align: left; }
    .vb-nguon { text-align: right; font-style: italic; }
    .vb-chuthich { font-size: 12pt; }
    .vb-het { text-align: center; font-weight: bold; margin-top: 12pt; }
    .vb-demo { font-size: 8.5pt; font-style: italic; color: #9A9A9A; text-align: right; margin-top: 18pt; }
    .vb-doan, .vb-cau { text-indent: 1.27cm; }
    .vb-kho { margin-left: 1.27cm; text-align: left; }
    table { border-collapse: collapse; }`;
  function taiWord() {
    if (DEMO) return hopPro();
    if (!kiemTruocXuat()) return;
    const d = new Date(), ngay = d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Đề Ngữ văn</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:HideSpellingErrors/><w:HideGrammaticalErrors/><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
<style>${CSS_WORD}</style></head>
<body lang="VI" style="mso-no-proof:yes"><div class="WordSection1">${taoHtmlDe()}</div></body></html>`;
    const url = URL.createObjectURL(new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "De-Ngu-van-" + ngay + ".doc";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    thongBao("Đã tải file Word");
  }

  const bangHienTai = kieu => {
    const kq = tabPhai === "ma-tran" ? window.SinhVanBan.maTran(ctxSinh()) : window.SinhVanBan.dacTa(ctxSinh());
    return window.SinhVanBan.html(kq, kieu, ctxSinh());
  };
  function xemRong() {
    let o = $("#sd-rong");
    if (!o) {
      o = document.createElement("div"); o.id = "sd-rong"; o.className = "phu-lop";
      o.innerHTML = `<div class="phu-lop-ruot"><button class="nut-dong" id="sd-rong-dong" aria-label="Đóng">✕</button><div id="sd-rong-nd" class="cuon-ngang"></div></div>`;
      document.body.appendChild(o);
      o.onclick = e => { if (e.target === o || e.target.id === "sd-rong-dong") o.hidden = true; };
      document.addEventListener("keydown", e => { if (e.key === "Escape") o.hidden = true; });
    }
    $("#sd-rong-nd").innerHTML = bangHienTai("app");
    o.hidden = false;
  }
  function saoChepBang() {
    if (DEMO) return hopPro();
    const h = bangHienTai("word"), tam = document.createElement("div");
    tam.innerHTML = h;
    const thuan = tam.innerText || tam.textContent;
    const xong = () => thongBao("Đã sao chép. Mở Word và dán (Ctrl+V).");
    const du = () => {
      tam.style.cssText = "position:fixed;left:-9999px;top:0"; document.body.appendChild(tam);
      const r = document.createRange(); r.selectNodeContents(tam);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      let ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
      sel.removeAllRanges(); tam.remove();
      ok ? xong() : thongBao("Không sao chép được trên trình duyệt này");
    };
    if (navigator.clipboard && window.ClipboardItem) {
      navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([h], { type: "text/html" }), "text/plain": new Blob([thuan], { type: "text/plain" }) })]).then(xong, du);
    } else du();
  }

  function setCot(c) {
    $("#sd-goc").dataset.hien = c;
    document.querySelectorAll("#tab-cot button").forEach(b => b.classList.toggle("dang-chon", b.dataset.cot === c || (c === "phai" && tabPhai === "kiem-tra" && b.dataset.cot === "kiem-tra")));
  }
  document.querySelectorAll("#tab-cot button").forEach(b => b.onclick = () => {
    if (b.dataset.cot === "kiem-tra") { tabPhai = "kiem-tra"; vePhai(); $("#sd-goc").dataset.hien = "phai"; }
    else $("#sd-goc").dataset.hien = b.dataset.cot;
    document.querySelectorAll("#tab-cot button").forEach(x => x.classList.toggle("dang-chon", x === b));
  });

  napKhung();
  if (!khungs.length) { $("#sd-giua").innerHTML = `<div class="hop">Chưa có khung đề nào dùng được.</div>`; return; }
  const cu = doc(K_HIEN_TAI, null);
  de = cu && khungCua(cu.khung_ma) && Array.isArray(cu.cau) ? cu : deMoi();
  const rong = window.innerWidth;
  if (rong > 1100 && rong <= 1366 && de.the) $("#sd-goc").classList.add("thu-gon");
  veTatCa();

  window.KhoSoanDe = { de: () => de, veTatCa };
})();
