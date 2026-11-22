// Màn hình Kho: ba lối vào, bộ lọc dùng chung có đếm số thẻ, danh sách kết quả, mở thẻ.
(function () {
  const D = window.KhoDuLieu;
  let KHO = D.taiKho();

  const trangThai = {
    loiVao: "bai",                       // bai | de_tai | tim
    bai: { cap: "", lop: "", bai: "" },
    deTai: "",
    tuKhoa: "",
    loc: {}                              // nhóm lọc -> Set giá trị đã chọn
  };

  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ngoacKep = s => "“" + s + "”";

  const NHOM_LOC = [
    { khoa: "lop", ten: "Cấp học và lớp", cay: D.CAY_LOP, lay: t => t.lop.map(l => "Lớp " + l) },
    { khoa: "the_loai", ten: "Thể loại", cay: D.CAY_THE_LOAI, lay: t => t.the_loai ? [t.the_loai] : [] },
    { khoa: "de_tai", ten: "Đề tài", cay: D.CAY_DE_TAI, lay: t => t.de_tai }
  ];

  // ---------- Lối vào ----------
  function khopLoiVao(t) {
    const s = trangThai;
    if (s.loiVao === "bai") {
      const b = s.bai;
      if (b.cap && !t.cap_hoc.includes(b.cap)) return false;
      if (b.lop && !t.phu_hop.some(p => String(p.lop) === b.lop && (!b.bai || p.bai === b.bai))) return false;
      return true;
    }
    if (s.loiVao === "de_tai") return !s.deTai || t.de_tai.includes(s.deTai);
    if (s.loiVao === "tim") {
      const q = boDau(s.tuKhoa.trim());
      if (!q) return true;
      const n = t.nguon || {};
      const chu = [t.nhan_de, n.tac_gia, n.tac_pham, n.sach_tap, n.bao, t.chu_de, t.de_tai.join(" "), t.the_loai, t.van_ban].join(" ");
      return q.split(/\s+/).every(w => boDau(chu).includes(w));
    }
    return true;
  }
  function boDau(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
  }

  function khopLoc(t, boQuaNhom) {
    return NHOM_LOC.every(g => {
      if (g.khoa === boQuaNhom) return true;
      const chon = trangThai.loc[g.khoa];
      if (!chon || !chon.size) return true;
      return g.lay(t).some(v => chon.has(v));
    });
  }

  // ---------- Vẽ lối vào ----------
  function veLoiVao() {
    document.querySelectorAll(".loi-vao button").forEach(b => b.classList.toggle("dang-chon", b.dataset.loi === trangThai.loiVao));
    const o = $("#o-loi-vao");
    const s = trangThai;
    if (s.loiVao === "bai") {
      const lopCo = [...new Set([...D.DS_LOP, ...KHO.flatMap(t => t.lop)])].filter(l => !s.bai.cap || D.capHocCuaLop(l) === s.bai.cap).sort((a, b) => a - b);
      const baiCo = s.bai.lop ? [...new Set([...(D.DS_BAI[s.bai.lop] || []), ...KHO.flatMap(t => t.phu_hop.filter(p => String(p.lop) === s.bai.lop).map(p => p.bai))])] : [];
      o.innerHTML = `
        <label>Cấp học <select id="chon-cap"><option value="">Tất cả</option>${["THCS", "THPT"].map(c => `<option ${c === s.bai.cap ? "selected" : ""}>${c}</option>`).join("")}</select></label>
        <label>Lớp <select id="chon-lop"><option value="">Tất cả</option>${lopCo.map(l => `<option value="${l}" ${String(l) === s.bai.lop ? "selected" : ""}>Lớp ${l}</option>`).join("")}</select></label>
        <label>Bài <select id="chon-bai" ${s.bai.lop ? "" : "disabled"}><option value="">${s.bai.lop ? "Tất cả bài" : "Chọn lớp trước"}</option>${baiCo.map(b => `<option ${b === s.bai.bai ? "selected" : ""}>${esc(b)}</option>`).join("")}</select></label>`;
      $("#chon-cap").onchange = e => { s.bai = { cap: e.target.value, lop: "", bai: "" }; veTatCa(); };
      $("#chon-lop").onchange = e => { s.bai.lop = e.target.value; s.bai.bai = ""; veTatCa(); };
      $("#chon-bai").onchange = e => { s.bai.bai = e.target.value; veTatCa(); };
    } else if (s.loiVao === "de_tai") {
      const dem = {};
      KHO.forEach(t => t.de_tai.forEach(d => dem[d] = (dem[d] || 0) + 1));
      const chip = d => `<button class="chip ${d === s.deTai ? "dang-chon" : ""} ${dem[d] ? "" : "mo"}" data-de-tai="${esc(d)}">${esc(d)} (${dem[d] || 0})</button>`;
      const la = Object.keys(dem).filter(d => !D.DS_DE_TAI.includes(d));
      const cay = la.length ? [...D.CAY_DE_TAI, { ten: "Khác", con: la }] : D.CAY_DE_TAI;
      o.innerHTML = `<div class="de-tai-nhom">${cay.map(n => `<div><p class="ten-nhom">${esc(n.ten)}</p><div class="chip-hang">${n.con.map(chip).join("")}</div></div>`).join("")}</div>`;
      o.querySelectorAll("[data-de-tai]").forEach(b => b.onclick = () => { s.deTai = s.deTai === b.dataset.deTai ? "" : b.dataset.deTai; veTatCa(); });
    } else {
      o.innerHTML = `<input id="o-tim" type="search" placeholder="Gõ tên tác giả, tên tác phẩm hoặc một ý cần tìm" value="${esc(s.tuKhoa)}">`;
      const inp = $("#o-tim");
      inp.oninput = () => { s.tuKhoa = inp.value; veLocVaKetQua(); };
      inp.focus();
    }
  }

  // ---------- Vẽ bộ lọc ----------
  function oChon(khoa, v, n, chon) {
    return `<label class="${n ? "" : "mo"}"><input type="checkbox" data-nhom="${khoa}" value="${esc(v)}" ${chon.has(v) ? "checked" : ""}> ${esc(v)} <span class="so">(${n})</span></label>`;
  }
  function veBoLoc(coso) {
    const html = NHOM_LOC.map(g => {
      const chon = trangThai.loc[g.khoa] || new Set();
      const ds = coso.filter(t => khopLoc(t, g.khoa));
      const dem = {};
      ds.forEach(t => g.lay(t).forEach(v => dem[v] = (dem[v] || 0) + 1));
      if (g.cay) {
        // Giá trị lạ (không có trong cây) gom vào nhóm "Khác".
        const trongCay = new Set(g.cay.flatMap(n => n.con));
        const la = [...new Set(KHO.flatMap(g.lay))].filter(v => !trongCay.has(v));
        const cay = la.length ? [...g.cay, { ten: "Khác", con: la }] : g.cay;
        return `<fieldset data-nhom-loc="${g.khoa}"><legend>${g.ten}</legend>${cay.map(n => {
          const nN = ds.filter(t => g.lay(t).some(v => n.con.includes(v))).length;
          const soChon = n.con.filter(v => chon.has(v)).length;
          const motLa = n.con.length === 1 && n.con[0] === n.ten;
          if (motLa) return oChon(g.khoa, n.ten, nN, chon);
          return `<div class="nhanh">
            <label class="cha ${nN ? "" : "mo"}"><input type="checkbox" data-cha="${g.khoa}" data-con="${esc(JSON.stringify(n.con))}" ${soChon && soChon === n.con.length ? "checked" : ""} ${soChon && soChon < n.con.length ? "data-mot-phan" : ""}> ${esc(n.ten)} <span class="so">(${nN})</span></label>
            <div class="con">${n.con.map(v => oChon(g.khoa, v, dem[v] || 0, chon)).join("")}</div>
          </div>`;
        }).join("")}</fieldset>`;
      }
      const vals = [...new Set([...(g.luonCo || []), ...KHO.flatMap(g.lay), ...chon])].sort((a, b) => a.localeCompare(b, "vi"));
      return `<fieldset data-nhom-loc="${g.khoa}"><legend>${g.ten}</legend>${vals.map(v => oChon(g.khoa, v, dem[v] || 0, chon)).join("")}</fieldset>`;
    }).join("");
    const o = $("#bo-loc-noi-dung");
    o.innerHTML = html;
    o.querySelectorAll("[data-mot-phan]").forEach(cb => cb.indeterminate = true);
    o.querySelectorAll("input[data-nhom]").forEach(cb => cb.onchange = () => {
      const k = cb.dataset.nhom;
      trangThai.loc[k] = trangThai.loc[k] || new Set();
      cb.checked ? trangThai.loc[k].add(cb.value) : trangThai.loc[k].delete(cb.value);
      veLocVaKetQua();
    });
    o.querySelectorAll("input[data-cha]").forEach(cb => cb.onchange = () => {
      const k = cb.dataset.cha;
      trangThai.loc[k] = trangThai.loc[k] || new Set();
      JSON.parse(cb.dataset.con).forEach(v => cb.checked ? trangThai.loc[k].add(v) : trangThai.loc[k].delete(v));
      veLocVaKetQua();
    });
    const soDangLoc = Object.values(trangThai.loc).reduce((a, s) => a + s.size, 0);
    $("#xoa-loc").hidden = !soDangLoc;
    $("#dem-loc").textContent = soDangLoc ? ` (${soDangLoc} đang chọn)` : "";
  }

  // ---------- Vẽ kết quả ----------
  function veKetQua(ds) {
    ds = ds.slice().sort((a, b) => {
      const d = (a.da_dung.length ? 1 : 0) - (b.da_dung.length ? 1 : 0);   // chưa dùng lên trước
      if (d) return d;
      if (trangThai.loiVao === "de_tai") return (a.lop[0] || 0) - (b.lop[0] || 0);
      return a.ma.localeCompare(b.ma);
    });
    $("#dem-ket-qua").textContent = `${ds.length} thẻ`;
    $("#ket-qua").innerHTML = ds.map(t => `
      <li><button class="dong-the" data-ma="${esc(t.ma)}">
        <span class="ten">${esc(ngoacKep(t.nhan_de))}</span>
        <span class="tac-gia">${esc((t.nguon && t.nguon.tac_gia) || "Chưa ghi tác giả")}</span>
        <span class="nhan">${esc(t.the_loai || "")}</span>
        <span class="nhan">${D.laTho(t) ? t.so_dong + " dòng" : t.so_chu + " chữ"}</span>
        <span class="nhan">${t.lop.length ? "Lớp " + t.lop.join(", ") : "Chưa gắn lớp"}</span>
        ${t.trung_sgk.ket_qua === "Có trùng" || (t.trung_sgk.ket_qua === "Chưa xét" && D.doiChieuSgk(t).length) ? `<span class="dau trung">Có thể trùng SGK</span>` : ""}
        <span class="dau ${t.da_dung.length ? "da" : "chua"}">${t.da_dung.length ? "Đã dùng" : "Chưa dùng"}</span>
      </button></li>`).join("") || `<li class="trong">Không có thẻ nào khớp. Thử bỏ bớt bộ lọc.</li>`;
    $("#ket-qua").querySelectorAll(".dong-the").forEach(b => b.onclick = () => moThe(b.dataset.ma));
  }

  function veLocVaKetQua() {
    const coso = KHO.filter(khopLoiVao);
    veBoLoc(coso);
    veKetQua(coso.filter(t => khopLoc(t)));
  }
  function veTatCa() { veLoiVao(); veLocVaKetQua(); }

  // ---------- Mở thẻ ----------
  function moThe(ma) {
    const t = KHO.find(x => x.ma === ma);
    if (!t) return;
    const n = t.nguon || {};
    const dn = D.dongNguon(n);
    const thieuNguon = !n.tac_gia || !(n.duong_dan || n.sach_tap || n.bao);
    const muc = (tieuDe, noiDung) => noiDung ? `<section><h3>${tieuDe}</h3>${noiDung}</section>` : "";
    const ct = t.chu_thich || {};
    const kd = t.kiem_dinh;

    $("#the-noi-dung").innerHTML = `
      <p class="ma-the">${esc(t.ma)} · Lô ${esc(t.lo)} · ${esc(t.trang_thai_duyet || "")}</p>
      <h2>${esc(ngoacKep(t.nhan_de))}</h2>
      <p class="tac-gia-lon">${esc(n.tac_gia || "Chưa ghi tác giả")}</p>
      <div class="hang-nut">
        <button id="nut-sao-chep" class="nut-chinh">Sao chép</button>
        <button id="nut-ra-de" class="nut-khoa" title="Sắp có">🔒 Ra đề với ngữ liệu này</button>
        ${t.nguon_goc === "Tự bổ sung" ? `<button id="nut-sua-the" class="nut-phu">Sửa thẻ</button>` : ""}
      </div>
      ${muc("Văn bản", `
        <p class="phu">${esc(t.dang || "")} · ${t.so_chu} chữ${D.laTho(t) ? " · " + t.so_dong + " dòng" : ""}</p>
        ${t.loi_dan ? `<p class="loi-dan">${esc(t.loi_dan)}</p>` : ""}
        <div class="van-ban ${D.laTho(t) ? "tho" : ""}">${esc(t.van_ban)}</div>`)}
      ${muc("Nguồn", `<p>${esc(dn) || "<em>Chưa có nguồn</em>"}</p>${thieuNguon ? `<p class="canh-bao">Nguồn chưa đủ: cần tác giả và nơi in (sách, báo) hoặc đường dẫn.</p>` : ""}`)}
      ${muc("Bằng chứng", (t.bang_chung && (t.bang_chung.duong_dan || (t.bang_chung.anh || []).length))
        ? `${t.bang_chung.duong_dan ? `<p><a href="${esc(t.bang_chung.duong_dan)}" target="_blank" rel="noopener">${esc(t.bang_chung.duong_dan)}</a></p>` : ""}${(t.bang_chung.anh || []).map(a => `<p>Ảnh: ${esc(a)}</p>`).join("")}`
        : `<p class="canh-bao">Chưa có ảnh trang gốc hay đường dẫn nguồn.</p>`)}
      ${muc("Phân loại", `<dl>
        <dt>Thể loại</dt><dd>${esc(t.the_loai || "")}</dd>
        <dt>Đề tài</dt><dd>${esc(t.de_tai.join(", "))}</dd>
        ${t.chu_de ? `<dt>Chủ đề</dt><dd>${esc(t.chu_de)}</dd>` : ""}
        ${t.giai_doan ? `<dt>Giai đoạn</dt><dd>${esc(t.giai_doan)}</dd>` : ""}
        <dt>Cấp học</dt><dd>${esc(t.cap_hoc.join(", "))}</dd>
        <dt>Độ khó</dt><dd>${t.do_kho ? "Bậc " + t.do_kho : ""}</dd>
      </dl>
      <table class="bang-lop"><thead><tr><th>Lớp</th><th>Bài</th><th>Tiêu điểm khai thác</th></tr></thead><tbody>
        ${t.phu_hop.map(p => `<tr><td>${p.lop}</td><td>${esc(p.bai)}</td><td>${esc((p.tieu_diem || []).join(", "))}</td></tr>`).join("")}
      </tbody></table>
      ${(t.ghep_cap || []).length ? `<p>Ghép cặp so sánh với: ${t.ghep_cap.map(m => { const c = KHO.find(x => x.ma === m); return `<button class="lien-ket" data-ma="${esc(m)}">${esc(c ? ngoacKep(c.nhan_de) : m)}</button>`; }).join(", ")}</p>` : ""}`)}
      ${muc("Chú thích", [
        (ct.tu_kho || []).length ? `<p><b>Từ khó</b></p><ul>${ct.tu_kho.map(x => `<li>${esc(x.tu)}: ${esc(x.nghia)}</li>`).join("")}</ul>` : "",
        (ct.dien_tich || []).length ? `<p><b>Điển tích</b></p><ul>${ct.dien_tich.map(x => `<li>${esc(x.tu)}: ${esc(x.nghia)}</li>`).join("")}</ul>` : "",
        ct.tac_gia_tac_pham ? `<p><b>Tác giả, tác phẩm</b></p><p>${esc(ct.tac_gia_tac_pham)}</p>` : ""
      ].join(""))}
      ${muc("Ghi chú chuyên môn", (t.ghi_chu_chuyen_mon || []).length ? `<ul>${t.ghi_chu_chuyen_mon.map(g => `<li><b>${esc(g.loai)}:</b> ${esc(g.noi_dung)}${g.nguon ? ` <span class="phu">(Nguồn: ${esc(g.nguon)})</span>` : ` <span class="canh-bao">Chưa có nguồn</span>`}</li>`).join("")}</ul>` : "")}
      ${muc("Trạng thái", `<dl>
        <dt>Kiểm định</dt><dd>${esc(kd.ket_qua || "Chưa kiểm định")}</dd>
        ${kd.viec_can_sua ? `<dt>Việc cần sửa</dt><dd>${esc(kd.viec_can_sua)}</dd>` : ""}
        <dt>Trùng SGK</dt><dd>${esc(t.trung_sgk.ket_qua)}${t.trung_sgk.van_ban_sgk ? ": " + esc(t.trung_sgk.van_ban_sgk) : ""}
          ${t.trung_sgk.ket_qua === "Chưa xét" && D.doiChieuSgk(t).length ? `<div class="canh-bao">App phát hiện có thể trùng: ${D.doiChieuSgk(t).map(x => esc(D.moTaSgk(x))).join("; ")}</div>` : ""}</dd>
        <dt>Đã dùng ở đề</dt><dd>${t.da_dung.length ? t.da_dung.map(d => esc(d.de) + " (" + esc(d.ngay) + ")").join("; ") : "Chưa dùng"}</dd>
      </dl>
      ${Object.keys(kd.tieu_chi || {}).length ? `<table class="bang-lop"><thead><tr><th>Tiêu chí</th><th>Kết quả</th></tr></thead><tbody>${D.TIEU_CHI.map(c => `<tr><td>${c.so}. ${c.ten}</td><td>${esc(kd.tieu_chi[c.so] || "Chưa xét")}</td></tr>`).join("")}</tbody></table>` : ""}`)}
    `;
    $("#nut-sao-chep").onclick = () => saoChep(t);
    $("#nut-ra-de").onclick = () => thongBao("Sắp có");
    if ($("#nut-sua-the")) $("#nut-sua-the").onclick = () => { $("#man-the").hidden = true; window.KhoBoSung.moMan("bo-sung"); window.KhoBoSung.moForm(t.ma); };
    $("#the-noi-dung").querySelectorAll(".lien-ket").forEach(b => b.onclick = () => moThe(b.dataset.ma));
    $("#man-the").hidden = false;
    $("#man-the").scrollTop = 0;
  }

  function vanBanSaoChep(t) {
    const p = [ngoacKep(t.nhan_de)];
    if (t.loi_dan) p.push(t.loi_dan);
    p.push(t.van_ban);
    const dn = D.dongNguon(t.nguon);
    if (dn) p.push("(" + dn + ")");
    const ct = t.chu_thich || {};
    const dsCt = [...(ct.tu_kho || []), ...(ct.dien_tich || [])].map(x => "- " + x.tu + ": " + x.nghia);
    if (ct.tac_gia_tac_pham) dsCt.push("- " + ct.tac_gia_tac_pham);
    if (dsCt.length) p.push("Chú thích:\n" + dsCt.join("\n"));
    return p.join("\n\n");
  }

  function saoChep(t) {
    const s = vanBanSaoChep(t);
    const xong = () => thongBao("Đã sao chép ngữ liệu, nguồn và chú thích");
    const duPhong = () => {
      const ta = document.createElement("textarea");
      ta.value = s; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); xong(); } catch (e) { thongBao("Máy chưa cho sao chép, cô bôi đen văn bản rồi bấm Ctrl+C"); }
      ta.remove();
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(s).then(xong, duPhong);
    else duPhong();
  }

  let henGio;
  function thongBao(s) {
    const o = $("#thong-bao");
    o.textContent = s; o.hidden = false;
    clearTimeout(henGio); henGio = setTimeout(() => o.hidden = true, 2200);
  }

  // ---------- Gắn sự kiện ----------
  document.querySelectorAll(".loi-vao button").forEach(b => b.onclick = () => { trangThai.loiVao = b.dataset.loi; veTatCa(); });
  $("#xoa-loc").onclick = () => { trangThai.loc = {}; veLocVaKetQua(); };
  $("#dong-the").onclick = () => $("#man-the").hidden = true;
  $("#man-the").onclick = e => { if (e.target.id === "man-the") $("#man-the").hidden = true; };
  document.addEventListener("keydown", e => { if (e.key === "Escape") $("#man-the").hidden = true; });
  document.querySelectorAll("[data-sap-co]").forEach(b => b.onclick = () => thongBao("Sắp có"));

  window.KhoManHinh = {
    taiLai() { KHO = D.taiKho(); veTatCa(); },
    dsThe(kemNhap) { return kemNhap ? KHO.concat(D.docTuBoSung().filter(t => t.nhap)) : KHO; },
    thongBao, moThe
  };
  // Điện thoại: bộ lọc thu gọn sẵn để danh sách thẻ hiện ngay, bấm "Bộ lọc" mới mở ra.
  if (window.matchMedia("(max-width: 760px)").matches) $(".bo-loc details").open = false;
  veTatCa();
})();
