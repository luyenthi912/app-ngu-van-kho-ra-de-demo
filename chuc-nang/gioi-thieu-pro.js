(function () {
  const ZALO = "https://zalo.me/0328961617", FANPAGE = "https://www.facebook.com/KetNoiTriThucEdTechAI/";
  const GOI = [
    { ten: "Pro THCS", cap: "Lớp 6 – 9", may: "2 thiết bị", y: "Toàn bộ ngữ liệu, ngân hàng câu hỏi, yêu cầu cần đạt và khung đề THCS." },
    { ten: "Pro THPT", cap: "Lớp 10 – 12", may: "2 thiết bị", y: "Toàn bộ ngữ liệu, ngân hàng câu hỏi, yêu cầu cần đạt và khung đề THPT." },
    { ten: "Pro Toàn cấp", cap: "Lớp 6 – 12", may: "2 thiết bị", y: "Mở khóa 100% kho từ lớp 6 đến lớp 12.", noi: true },
    { ten: "Pro Tổ chuyên môn", cap: "Lớp 6 – 12", may: "5 hoặc 10 thiết bị", y: "Toàn bộ quyền lợi Pro Toàn cấp, dùng chung cho cả tổ." }
  ];
  const CHUNG = ["In đề, lưu PDF, tải file Word đúng thể thức", "Sao chép ma trận, bản đặc tả sang Word", "Ngữ liệu của tôi: tự nhập, lưu riêng, sao lưu ra file", "Thời hạn sử dụng: Trọn đời"];

  const kieu = document.createElement("style");
  kieu.textContent = `
    .gt-nen { position: fixed; inset: 0; background: rgba(20,25,22,.5); z-index: 30; overflow: auto; padding: 24px 12px; display: flex; align-items: flex-start; justify-content: center; }
    .gt-nen[hidden] { display: none; }
    .gt-hop { position: relative; background: #fff; border-radius: 14px; width: 100%; max-width: 760px; padding: 22px 22px 18px; box-sizing: border-box; }
    .gt-hop h3 { margin: 0 34px 4px 0; color: var(--xanh); font-size: 20px; }
    .gt-hop .gt-dan { margin: 0 0 14px; color: var(--chu-phu); }
    .gt-dong { position: absolute; top: 10px; right: 12px; border: 0; background: transparent; font-size: 22px; color: var(--chu-phu); cursor: pointer; }
    .gt-luoi { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .gt-goi { border: 1px solid var(--vien); border-radius: 10px; padding: 12px 14px; position: relative; }
    .gt-goi.noi { border: 2px solid var(--vang); background: #FFFBF3; }
    .gt-goi b { display: block; color: var(--xanh); font-size: 16px; }
    .gt-goi .gt-nhan { display: inline-block; font-size: 12.5px; background: var(--xanh-nhat); color: var(--xanh); border-radius: 4px; padding: 1px 7px; margin: 4px 4px 6px 0; }
    .gt-goi p { margin: 0; font-size: 14px; }
    .gt-the-noi { position: absolute; top: -10px; right: 10px; background: var(--vang); color: #fff; font-size: 11.5px; font-weight: 700; border-radius: 10px; padding: 2px 8px; }
    .gt-chung { margin: 14px 0 0; padding: 10px 14px; background: var(--nen); border-radius: 10px; font-size: 14px; }
    .gt-chung ul { margin: 4px 0 0; padding-left: 20px; }
    .gt-nut { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
    .gt-nut a { flex: 1 1 220px; text-align: center; text-decoration: none; color: #fff; font-weight: 600; border-radius: 8px; padding: 11px 14px; }
    .gt-zalo { background: #0068FF; } .gt-fb { background: #1877F2; }
    @media (max-width: 620px) { .gt-luoi { grid-template-columns: 1fr; } .gt-hop { padding: 18px 14px 14px; } .gt-nen { padding: 12px 8px; } }`;
  document.head.appendChild(kieu);

  function mo(_, loiNhan) {
    let o = document.getElementById("gt-pro");
    if (!o) {
      o = document.createElement("div"); o.id = "gt-pro"; o.className = "gt-nen";
      o.innerHTML = `<div class="gt-hop" role="dialog" aria-modal="true" aria-labelledby="gt-td">
        <button class="gt-dong" data-dong aria-label="Đóng">✕</button>
        <h3 id="gt-td">Kho Ngữ liệu Pro</h3>
        <p class="gt-dan" data-dan></p>
        <div class="gt-luoi">${GOI.map(g => `<div class="gt-goi ${g.noi ? "noi" : ""}">${g.noi ? `<span class="gt-the-noi">Đầy đủ nhất</span>` : ""}
          <b>${g.ten}</b><span class="gt-nhan">${g.cap}</span><span class="gt-nhan">${g.may}</span><p>${g.y}</p></div>`).join("")}</div>
        <div class="gt-chung"><b>Gói nào cũng có:</b><ul>${CHUNG.map(x => `<li>${x}</li>`).join("")}</ul></div>
        <div class="gt-nut"><a class="gt-zalo" href="${ZALO}" target="_blank" rel="noopener">📱 Đăng ký qua Zalo: 0328.961.617</a><a class="gt-fb" href="${FANPAGE}" target="_blank" rel="noopener">💬 Nhắn Fanpage Kết Nối Tri Thức</a></div>
      </div>`;
      document.body.appendChild(o);
      o.addEventListener("click", e => { if (e.target === o || e.target.closest("[data-dong]")) o.hidden = true; });
      document.addEventListener("keydown", e => { if (e.key === "Escape") o.hidden = true; });
    }
    o.querySelector("[data-dan]").textContent = loiNhan || "Tính năng này có trong bản Pro. Thầy/Cô chọn gói phù hợp với cấp học mình dạy rồi liên hệ để nhận mã kích hoạt.";
    o.hidden = false;
  }

  window.KhoPro = { mo, lopKhoa: () => false, khungKhoa: () => false };
})();
