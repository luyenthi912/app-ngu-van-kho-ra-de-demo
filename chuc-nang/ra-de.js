// Phần Ra đề, việc 2: xem khung đề mẫu, nhân bản thành khung riêng, sửa và tự kiểm tra điểm, tỉ lệ mức độ.
(function () {
  if (window.BAN_DEMO) return;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const thongBao = s => window.KhoManHinh.thongBao(s);
  const KHOA = "kho_ngu_lieu_khung_rieng";
  const so = x => Math.round(Number(x || 0) * 100) / 100;
  const viet = x => String(so(x)).replace(".", ",");

  function docRieng() { try { return JSON.parse(localStorage.getItem(KHOA) || "[]"); } catch (e) { return []; } }
  function ghiRieng(ds) { localStorage.setItem(KHOA, JSON.stringify(ds)); }
  function tatCa() { return (window.KHUNG_MAU || []).map(k => Object.assign({ rieng: false }, k)).concat(docRieng().map(k => Object.assign(k, { rieng: true }))); }

  let dangChon = (window.KHUNG_MAU || [])[0] ? window.KHUNG_MAU[0].ma : null;

  // ---------- Tính và kiểm tra ----------
  function kiemTra(k) {
    const loi = [], ghi = [];
    const tong = so(k.cau.reduce((a, c) => a + Number(c.diem || 0), 0));
    const tongPhan = so(k.phan.reduce((a, p) => a + Number(p.diem || 0), 0));
    const theoMuc = {};
    k.muc_do.forEach(m => theoMuc[m] = 0);
    k.cau.forEach(c => {
      const cong = so(Object.values(c.muc || {}).reduce((a, x) => a + Number(x || 0), 0));
      if (cong !== so(c.diem)) loi.push(`${c.phan} câu ${c.so}: điểm các mức (${viet(cong)}) chưa bằng điểm câu (${viet(c.diem)}).`);
      Object.entries(c.muc || {}).forEach(([m, x]) => theoMuc[m] = so((theoMuc[m] || 0) + Number(x || 0)));
    });
    if (!k.cau.length) ghi.push("Khung chưa có câu nào.");
    else {
      if (tong !== 10) loi.push(`Tổng điểm là ${viet(tong)}, chưa bằng 10.`);
      if (k.phan.length && tongPhan !== tong) loi.push(`Tổng điểm các phần (${viet(tongPhan)}) khác tổng điểm các câu (${viet(tong)}).`);
      k.phan.forEach(p => {
        const d = so(k.cau.filter(c => c.phan === p.ten).reduce((a, c) => a + Number(c.diem || 0), 0));
        if (d !== so(p.diem)) loi.push(`Phần ${p.ten}: các câu cộng được ${viet(d)}, khung ghi ${viet(p.diem)}.`);
      });
      Object.entries(k.ti_le || {}).forEach(([m, pt]) => {
        const thuc = tong ? so(theoMuc[m] / tong * 100) : 0;
        if (Math.abs(thuc - pt) > 0.01) loi.push(`Mức ${m}: thực tế ${viet(thuc)}%, khung đặt ${pt}%.`);
      });
    }
    return { loi, ghi, tong, theoMuc };
  }

  // ---------- Vẽ ----------
  function ve() {
    const ds = tatCa();
    if (!ds.find(k => k.ma === dangChon)) dangChon = ds[0] && ds[0].ma;
    $("#ds-khung").innerHTML = ds.map(k => `<li><button class="dong-khung ${k.ma === dangChon ? "dang-chon" : ""}" data-khung="${esc(k.ma)}">
      <b>${esc(k.ten)}</b><span class="phu">${k.thoi_gian} phút · ${k.cau.length} câu${k.rieng ? " · khung riêng" : ""}${k.nhap ? " · nháp" : ""}${k.can_xac_nhan ? " · chờ xác nhận" : ""}</span></button></li>`).join("");
    document.querySelectorAll("[data-khung]").forEach(b => b.onclick = () => { dangChon = b.dataset.khung; ve(); });
    const k = ds.find(x => x.ma === dangChon);
    $("#chi-tiet-khung").innerHTML = k ? veKhung(k) : "";
    if (k) ganSuKien(k);
  }

  function veKhung(k) {
    const sua = k.rieng;
    const kt = kiemTra(k);
    const o = (gt, ten, kieu, rong) => sua ? `<input class="o-nho" data-truong="${ten}" type="${kieu || "text"}" value="${esc(gt)}" ${rong ? `style="width:${rong}"` : ""}>` : esc(gt);
    const hangCau = k.cau.map((c, i) => `<tr data-i="${i}">
      <td>${sua ? `<select data-c="phan">${k.phan.map(p => `<option ${p.ten === c.phan ? "selected" : ""}>${esc(p.ten)}</option>`).join("")}</select>` : esc(c.phan)}</td>
      <td>${sua ? `<input class="o-nho" data-c="so" type="number" min="1" value="${c.so}" style="width:4em">` : c.so}</td>
      <td>${sua ? `<input class="o-nho" data-c="diem" type="number" step="0.25" min="0" value="${c.diem}" style="width:5em">` : viet(c.diem)}</td>
      ${k.muc_do.map(m => `<td>${sua ? `<input class="o-nho" data-muc="${esc(m)}" type="number" step="0.25" min="0" value="${(c.muc || {})[m] || ""}" style="width:4.5em">` : ((c.muc || {})[m] ? viet(c.muc[m]) : "")}</td>`).join("")}
      <td>${sua ? `<input class="o-nho" data-c="goi_y" value="${esc(c.goi_y || "")}">` : esc(c.goi_y || "")}</td>
      ${sua ? `<td><button class="nut-bo" data-bo-cau="${i}" title="Bỏ câu">✕</button></td>` : ""}
    </tr>`).join("");
    const tongMuc = k.muc_do.map(m => `<td><b>${viet(kt.theoMuc[m] || 0)}</b>${kt.tong ? `<br><span class="phu">${viet(so((kt.theoMuc[m] || 0) / kt.tong * 100))}%${k.ti_le && k.ti_le[m] != null ? ` / ${k.ti_le[m]}%` : ""}</span>` : ""}</td>`).join("");

    return `
      <div class="hang-tieu-de">
        <h2>${sua ? `<input class="o-ten" data-truong="ten" value="${esc(k.ten)}">` : esc(k.ten)}</h2>
        <div class="hang-nut">
          <button class="nut-chinh" id="nhan-ban">Nhân bản thành khung riêng</button>
          ${sua ? `<button class="nut-phu" id="luu-khung">Lưu khung</button><button class="nut-phu nut-xoa" id="xoa-khung">Xóa khung</button>` : ""}
        </div>
      </div>
      ${k.nhap ? `<p class="o-bao-trung">Khung nháp: chưa có nguồn đối chiếu. Cô bấm "Nhân bản thành khung riêng" rồi điền số câu, điểm, mức độ theo khung của trường.</p>` : ""}
      ${k.can_xac_nhan ? `<p class="o-bao-trung">Khung này lập theo cấu trúc đề minh họa của Bộ, cô đối chiếu lại với đề minh họa mới nhất trước khi dùng.</p>` : ""}
      <dl class="thong-tin-khung">
        <dt>Loại đề</dt><dd>${esc(k.loai)}</dd>
        <dt>Lớp</dt><dd>${esc((k.lop || []).join(", "))}</dd>
        <dt>Thời gian</dt><dd>${o(k.thoi_gian, "thoi_gian", "number", "5em")} phút</dd>
        <dt>Các phần</dt><dd>${k.phan.map((p, i) => sua ? `${esc(p.ten)} <input class="o-nho" data-phan="${i}" type="number" step="0.25" value="${p.diem}" style="width:5em"> điểm` : `${esc(p.ten)} ${viet(p.diem)} điểm`).join("; ") || "Chưa có"}</dd>
        <dt>Tỉ lệ mức độ</dt><dd>${Object.keys(k.ti_le || {}).length ? k.muc_do.map(m => sua ? `${esc(m)} <input class="o-nho" data-tile="${esc(m)}" type="number" value="${k.ti_le[m] ?? ""}" style="width:4em">%` : `${esc(m)} ${k.ti_le[m] ?? 0}%`).join("; ") : "Không đặt tỉ lệ"}</dd>
        <dt>Mốc tổng ngữ liệu</dt><dd>${k.moc_chu.tu ? `khoảng ${k.moc_chu.tu} đến ` : "không quá "}${k.moc_chu.den} chữ; khi vượt: ${esc(k.moc_chu.khi_vuot)}</dd>
        <dt>Nguồn khung</dt><dd>${esc(k.nguon || "")}</dd>
      </dl>
      <div class="cuon-ngang"><table class="bang-khung">
        <thead><tr><th>Phần</th><th>Câu</th><th>Điểm</th>${k.muc_do.map(m => `<th>${esc(m)}</th>`).join("")}<th>Gợi ý nội dung hỏi</th>${sua ? "<th></th>" : ""}</tr></thead>
        <tbody>${hangCau || `<tr><td colspan="${4 + k.muc_do.length}" class="trong">Chưa có câu nào.</td></tr>`}</tbody>
        <tfoot><tr><td colspan="2"><b>Tổng</b></td><td><b>${viet(kt.tong)}</b></td>${tongMuc}<td></td>${sua ? "<td></td>" : ""}</tr></tfoot>
      </table></div>
      ${sua ? `<button class="nut-phu" id="them-cau">+ Thêm câu</button>` : ""}
      <div class="ket-qua-kiem-tra ${kt.loi.length ? "co-loi" : "dat"}">
        <b>Kiểm tra khung:</b> ${kt.loi.length ? `<ul>${kt.loi.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : (kt.ghi.length ? esc(kt.ghi.join(" ")) : "Khớp: tổng điểm 10, điểm từng phần và tỉ lệ mức độ đúng khung.")}
      </div>`;
  }

  // ---------- Sửa khung riêng ----------
  function ganSuKien(k) {
    $("#nhan-ban").onclick = () => {
      const ds = docRieng();
      const ban = JSON.parse(JSON.stringify(k));
      delete ban.rieng; delete ban.nhap; delete ban.can_xac_nhan;
      ban.ma = "RIENG-" + Date.now().toString(36).toUpperCase();
      ban.ten = k.ten.replace(/ \(khung nháp\)$/, "") + " (khung riêng)";
      ban.nguon = "Nhân bản từ khung “" + k.ten + "”";
      if (!ban.phan.length) ban.phan = [{ ten: "Đọc hiểu", diem: 6 }, { ten: "Viết", diem: 4 }];
      ds.push(ban); ghiRieng(ds); dangChon = ban.ma; ve();
      thongBao("Đã tạo khung riêng, cô sửa rồi bấm Lưu khung");
    };
    if (!k.rieng) return;
    const docVao = () => {
      const g = $("#chi-tiet-khung");
      const ten = g.querySelector('[data-truong="ten"]'); if (ten) k.ten = ten.value.trim() || k.ten;
      const tg = g.querySelector('[data-truong="thoi_gian"]'); if (tg) k.thoi_gian = Number(tg.value) || k.thoi_gian;
      g.querySelectorAll("[data-phan]").forEach(i => k.phan[+i.dataset.phan].diem = Number(i.value) || 0);
      g.querySelectorAll("[data-tile]").forEach(i => k.ti_le[i.dataset.tile] = Number(i.value) || 0);
      g.querySelectorAll("tbody tr[data-i]").forEach(tr => {
        const c = k.cau[+tr.dataset.i];
        c.phan = tr.querySelector('[data-c="phan"]').value;
        c.so = Number(tr.querySelector('[data-c="so"]').value) || c.so;
        c.diem = Number(tr.querySelector('[data-c="diem"]').value) || 0;
        c.goi_y = tr.querySelector('[data-c="goi_y"]').value;
        c.muc = {};
        tr.querySelectorAll("[data-muc]").forEach(i => { if (Number(i.value)) c.muc[i.dataset.muc] = Number(i.value); });
      });
    };
    const luu = (bao) => {
      docVao();
      const ds = docRieng().map(x => x.ma === k.ma ? Object.assign({}, k, { rieng: undefined }) : x);
      ghiRieng(ds);
      if (bao) thongBao("Đã lưu khung");
    };
    $("#chi-tiet-khung").onchange = () => { luu(false); ve(); };
    $("#luu-khung").onclick = () => { luu(true); ve(); };
    $("#them-cau").onclick = () => {
      docVao();
      const cuoi = k.cau[k.cau.length - 1];
      k.cau.push({ phan: (k.phan[0] || {}).ten || "Đọc hiểu", so: cuoi ? cuoi.so + 1 : 1, diem: 1, muc: {}, goi_y: "" });
      ghiRieng(docRieng().map(x => x.ma === k.ma ? k : x)); ve();
    };
    document.querySelectorAll("[data-bo-cau]").forEach(b => b.onclick = () => {
      docVao(); k.cau.splice(+b.dataset.boCau, 1);
      ghiRieng(docRieng().map(x => x.ma === k.ma ? k : x)); ve();
    });
    $("#xoa-khung").onclick = () => {
      if (!confirm("Xóa khung riêng “" + k.ten + "”? Khung đã xóa không lấy lại được.")) return;
      ghiRieng(docRieng().filter(x => x.ma !== k.ma)); dangChon = null; ve(); thongBao("Đã xóa khung");
    };
  }

  window.KhoRaDe = { ve };
  ve();
})();
