(function (g) {
  const so = x => Math.round(Number(x || 0) * 100) / 100;
  const viet = x => String(so(x)).replace(".", ",");
  const hoaDau = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MUC_CLASS = { "Nhận biết": "nb", "Thông hiểu": "th", "Vận dụng": "vd", "Vận dụng cao": "vdc" };
  const nhieuMuc = c => Object.keys(c.muc || {}).filter(m => Number(c.muc[m]) > 0).length > 1;
  const cacMuc = c => Object.keys(c.muc || {}).filter(m => Number(c.muc[m]) > 0);

  function donViGoiY(c, ctx) {
    const y = (c.yccd || []).map(m => ctx.yccd[m]).filter(Boolean);
    if (c.phan === "Viết") {
      const t2 = ctx.nl2 && ctx.nl2.cau === c.id ? ctx.nl2.the : null;
      const kem = t2 ? ` (ngữ liệu 2: ${t2.the_loai ? t2.the_loai.toLowerCase() : "chưa ghi thể loại"})` : "";
      const v = y.find(x => x.nhom === "Viết");
      if (!v) return "Viết văn bản" + kem;
      return hoaDau(v.nd.replace(/^(Bước đầu )?(biết )?viết được\s+(một\s+)?/i, "").replace(/[.;]\s*$/, "")) + kem;
    }
    if (y.length && y.every(x => x.nhom === "Tiếng Việt")) return "Tiếng Việt trong văn bản đọc hiểu";
    const tl = ctx.de.the && ctx.de.the.the_loai ? " " + ctx.de.the.the_loai.toLowerCase() : "";
    return "Đọc hiểu văn bản" + tl;
  }
  const donVi = (c, ctx) => (c.don_vi && c.don_vi.trim()) || donViGoiY(c, ctx);

  function maTran(ctx) {
    const { de, khung } = ctx;
    const muc = khung.muc_do;
    const hang = de.cau.map((c, i) => ({
      id: c.id, tt: i + 1, ky_nang: c.phan, don_vi: donVi(c, ctx), tu_dong: !(c.don_vi && c.don_vi.trim()),
      muc: Object.assign({}, c.muc), diem: so(c.diem), nhieu_muc: nhieuMuc(c)
    }));
    const tongMuc = {};
    muc.forEach(m => tongMuc[m] = so(hang.reduce((a, h) => a + Number(h.muc[m] || 0), 0)));
    const tong = so(hang.reduce((a, h) => a + h.diem, 0));
    const tiLe = {};
    muc.forEach(m => tiLe[m] = tong ? so(tongMuc[m] / tong * 100) : 0);
    const canhBao = [];
    if (tong !== 10) canhBao.push(`Tổng điểm là ${viet(tong)}, chưa bằng 10.`);
    muc.forEach(m => {
      const kh = (khung.ti_le || {})[m];
      if (kh != null && Math.abs(tiLe[m] - kh) > 0.01) canhBao.push(`Mức ${m}: thực tế ${viet(tiLe[m])}%, khung đặt ${kh}%.`);
    });
    return { loai: "ma-tran", muc_do: muc, hang, tong_muc: tongMuc, ti_le_muc: tiLe, ti_le_khung: khung.ti_le || {}, tong, tong_cau: hang.length, canh_bao: canhBao };
  }

  function dacTa(ctx) {
    const { de, khung } = ctx;
    const muc = khung.muc_do;
    const hang = de.cau.map((c, i) => {
      const y = (c.yccd || []).map(m => Object.assign({ ma: m }, ctx.yccd[m] || {})).filter(x => x.nd);
      const ms = cacMuc(c), nhieu = ms.length > 1;
      const soCau = {};
      muc.forEach(m => { if (ms.includes(m)) soCau[m] = nhieu ? "1*" : "1"; });
      return {
        id: c.id, tt: i + 1, ky_nang: c.phan, don_vi: donVi(c, ctx), tu_dong: !(c.don_vi && c.don_vi.trim()),
        nhan_muc: nhieu ? "Các mức: " + ms.join(", ") : ms[0] || "", y, chua_gan: !y.length, so_cau: soCau, nhieu_muc: nhieu
      };
    });
    const nhieu = hang.filter(h => h.nhieu_muc).length;
    const chuaGan = hang.filter(h => h.chua_gan).map(h => `${h.ky_nang} ${de.cau[h.tt - 1].so}`);
    return { loai: "dac-ta", muc_do: muc, hang, tong_cau: hang.length, so_cau_nhieu_muc: nhieu, chua_gan: chuaGan };
  }

  function nhomKyNang(hang) {
    const r = [];
    hang.forEach((h, i) => { if (i && hang[i - 1].ky_nang === h.ky_nang) r[r.length - 1].n++; else r.push({ ky_nang: h.ky_nang, bat_dau: i, n: 1 }); });
    return r;
  }
  const dauNhom = hang => { const m = {}; nhomKyNang(hang).forEach(n => m[n.bat_dau] = n); return m; };

  function html(kq, kieu, ctx, opt) {
    const w = kieu === "word";
    const TD = w ? ' style="border:1px solid #000;padding:4px 7px;vertical-align:top;font-family:\'Times New Roman\',serif;font-size:14pt"' : "";
    const TDC = w ? ' style="border:1px solid #000;padding:4px 7px;vertical-align:top;text-align:center;font-family:\'Times New Roman\',serif;font-size:14pt"' : ' class="so"';
    const TH = w ? ' style="border:1px solid #000;padding:4px 7px;font-weight:bold;text-align:center;font-family:\'Times New Roman\',serif;font-size:14pt"' : "";
    const TBL = w ? ' style="border-collapse:collapse;width:100%;font-family:\'Times New Roman\',serif"' : ' class="bang-van-ban"';
    const tr = (h, noi) => w ? `<tr>${noi}</tr>` : `<tr data-cau="${esc(h.id)}">${noi}</tr>`;
    const dn = dauNhom(kq.hang);
    const tieuDe = ctx && w ? `<p style="text-align:center;font-family:'Times New Roman',serif;font-size:14pt"><b>${kq.loai === "ma-tran" ? "MA TRẬN" : "BẢN ĐẶC TẢ"} ĐỀ KIỂM TRA MÔN NGỮ VĂN, LỚP ${ctx.de.lop}</b><br>Thời gian làm bài: ${ctx.khung.thoi_gian} phút</p>` : "";
    const nhanMuc = m => w ? m : `<span class="the-muc muc-${MUC_CLASS[m]}">${esc(m)}</span>`;
    let t;
    if (kq.loai === "ma-tran") {
      t = `<table${TBL}><thead><tr><th${TH}>TT</th><th${TH}>Kĩ năng</th><th${TH}>Nội dung kiến thức</th>${kq.muc_do.map(m => `<th${TH}>${esc(m)}</th>`).join("")}<th${TH}>Tổng điểm</th></tr></thead><tbody>
        ${kq.hang.map((h, i) => tr(h, `<td${TDC}>${h.tt}</td>${dn[i] ? `<td${TD} rowspan="${dn[i].n}">${esc(h.ky_nang)}</td>` : ""}<td${TD}>${esc(h.don_vi)}${!w && h.tu_dong ? ' <span class="goi-y">(gợi ý)</span>' : ""}</td>${kq.muc_do.map(m => `<td${TDC}>${h.muc[m] ? viet(h.muc[m]) + (h.nhieu_muc ? "*" : "") : ""}</td>`).join("")}<td${TDC}>${viet(h.diem)}</td>`)).join("")}</tbody>
        <tfoot><tr><td${TD} colspan="3"><b>Tổng điểm</b></td>${kq.muc_do.map(m => `<td${TDC}><b>${viet(kq.tong_muc[m])}</b></td>`).join("")}<td${TDC}><b>${viet(kq.tong)}</b></td></tr>
        <tr><td${TD} colspan="3"><b>Tỉ lệ %</b></td>${kq.muc_do.map(m => `<td${TDC}><b>${viet(kq.ti_le_muc[m])}%</b></td>`).join("")}<td${TDC}><b>100%</b></td></tr>
        <tr><td${TD} colspan="3"><b>Tỉ lệ theo khung</b></td>${kq.muc_do.map(m => `<td${TDC}>${kq.ti_le_khung[m] != null ? kq.ti_le_khung[m] + "%" : ""}</td>`).join("")}<td${TDC}></td></tr></tfoot></table>
        <p${w ? ' style="font-family:\'Times New Roman\',serif;font-size:14pt"' : ' class="ghi-chu-bang"'}>Tổng số câu: ${kq.tong_cau}. Dấu * là câu có các ý ở nhiều mức độ, điểm được chia theo từng mức.</p>`;
    } else {
      t = `<table${TBL}><thead><tr><th${TH}>TT</th><th${TH}>Kĩ năng</th><th${TH}>Nội dung kiến thức</th><th${TH}>Mức độ đánh giá</th>${kq.muc_do.map(m => `<th${TH}>${esc(m)}</th>`).join("")}</tr></thead><tbody>
        ${kq.hang.map((h, i) => tr(h, `<td${TDC}>${h.tt}</td>${dn[i] ? `<td${TD} rowspan="${dn[i].n}">${esc(h.ky_nang)}</td>` : ""}<td${TD}>${esc(h.don_vi)}${!w && h.tu_dong ? ' <span class="goi-y">(gợi ý)</span>' : ""}</td>
          <td${w ? TD : ' class="mo-ta"'}><div>${w ? `<b>${esc(h.nhan_muc)}</b>` : nhanMuc(h.nhan_muc.replace(/^Các mức: /, "")) + (h.nhieu_muc ? ' <span class="goi-y">nhiều mức</span>' : "")}</div>
          ${h.y.map(y => `<div>- ${esc(y.nd)}${!w ? ` <span class="ma-y">${esc(y.ma)}</span>` : ""}</div>`).join("") || (w ? "" : '<div class="chua-gan">Chưa gắn yêu cầu cần đạt</div>')}</td>
          ${kq.muc_do.map(m => `<td${TDC}>${h.so_cau[m] || ""}</td>`).join("")}`)).join("")}</tbody></table>
        <p${w ? ' style="font-family:\'Times New Roman\',serif;font-size:14pt"' : ' class="ghi-chu-bang"'}>Tổng số câu: ${kq.tong_cau}${kq.so_cau_nhieu_muc ? `, trong đó ${kq.so_cau_nhieu_muc} câu có các ý ở nhiều mức độ (đánh dấu *)` : ""}.</p>`;
    }
    const ra = tieuDe + t;
    return w && opt && opt.co_chu ? ra.replace(/14pt/g, opt.co_chu) : ra;
  }

  g.SinhVanBan = { maTran, dacTa, html, donViGoiY, nhomKyNang };
})(typeof window !== "undefined" ? window : module.exports);
