(function () {
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const soBai = b => +((b.bai.match(/\d+/) || [0])[0]);
  const ds = (window.YCCD || []).slice().sort((a, b) => a.lop - b.lop || soBai(a) - soBai(b));
  const selLop = $("#yccd-lop"), selBai = $("#yccd-bai");
  if (!selLop) return;
  const lops = [...new Set(ds.map(b => b.lop))].sort((a, b) => a - b);
  const khoa = l => !!(window.KhoPro && window.KhoPro.lopKhoa(l));
  selLop.innerHTML = lops.map(l => `<option value="${l}">${khoa(l) ? "🔒 " : ""}Lớp ${l}</option>`).join("");
  function veBai() {
    const b = ds.filter(x => String(x.lop) === selLop.value)[+selBai.value || 0];
    if (b && khoa(b.lop)) { $("#yccd-chi-tiet").innerHTML = `<p class="phu">🔒 Lớp ${b.lop} không thuộc gói Pro đang dùng. <button class="nut-phu" data-mo-pro>Xem các gói Pro</button></p>`; $("#yccd-chi-tiet [data-mo-pro]").onclick = () => window.KhoPro.mo(2); return; }
    $("#yccd-chi-tiet").innerHTML = !b ? "<p class='phu'>Chưa có bài nào.</p>" : `
      <p class="phu">Nguồn: ${esc(b.nguon)} · ${esc(b.trang_thai_duyet)}</p>
      <ul class="ds-yccd">${b.y.map(y => `<li><b>${esc(y.ma)}</b> <span class="phu">${esc(y.nhom)}</span><br>${esc(y.nd)}</li>`).join("")}</ul>
      ${b.ghi_chu ? `<p class="ghi-chu-dung">${esc(b.ghi_chu)}</p>` : ""}`;
  }
  function veBaiDS() {
    selBai.innerHTML = ds.filter(x => String(x.lop) === selLop.value).map((b, i) => `<option value="${i}">${esc(b.bai)}</option>`).join("");
    veBai();
  }
  selLop.onchange = veBaiDS; selBai.onchange = veBai;
  veBaiDS();
})();
