(function () {
  "use strict";

  var W = window.WEDDING;
  var Store = window.Store;
  var UNLOCK_KEY = "vyan_admin_unlocked";

  function $(sel) { return document.querySelector(sel); }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function when(iso) {
    var d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
  }

  var REMOTE = !!W.config.remoteEndpoint;
  var CODE_KEY = "vyan_admin_code";
  var data = { rsvps: [], songs: [], remote: false };

  function savedCode() {
    try { return sessionStorage.getItem(CODE_KEY) || ""; } catch (e) { return ""; }
  }

  function setNote(text) { $("#sync-note").textContent = text; }

  /* ---------- Tải dữ liệu ---------- */
  // Chế độ Google Sheet: mã được kiểm tra ở phía Apps Script (không nằm trong code web).
  // Chế độ cục bộ: dữ liệu lấy từ localStorage của thiết bị này.
  function load(code) {
    if (!REMOTE) {
      data = { rsvps: Store.listRsvps(), songs: Store.listSongs(), remote: false };
      setNote("Dữ liệu lưu trong trình duyệt của thiết bị này. RSVP gửi từ thiết bị khác sẽ không xuất hiện ở đây. Điền remoteEndpoint trong js/content.js để nhận RSVP qua Google Sheet.");
      render();
      return Promise.resolve(true);
    }
    setNote("Đang tải dữ liệu từ Google Sheet...");
    return Store.fetchRemote(code).then(function (res) {
      data = { rsvps: res.rsvps || [], songs: res.songs || [], remote: true };
      var pending = Store.pendingCount();
      setNote("Đồng bộ từ Google Sheet lúc " + new Date().toLocaleTimeString("vi-VN") +
        (pending ? ". Có " + pending + " bản ghi trên thiết bị này chưa gửi được." : "."));
      render();
      return true;
    }).catch(function (err) {
      if (err && err.message === "forbidden") return false;
      data = { rsvps: Store.listRsvps(), songs: Store.listSongs(), remote: false };
      setNote("Không kết nối được Google Sheet. Đang hiển thị dữ liệu lưu trên thiết bị này.");
      render();
      return true;
    });
  }

  /* ---------- Cổng mã truy cập ---------- */
  function showAdmin() {
    $("#gate").hidden = true;
    $("#admin").hidden = false;
  }

  function isUnlocked() {
    try { return sessionStorage.getItem(UNLOCK_KEY) === "1"; } catch (e) { return false; }
  }

  function remember(code) {
    try {
      sessionStorage.setItem(UNLOCK_KEY, "1");
      if (REMOTE) sessionStorage.setItem(CODE_KEY, code);
    } catch (e) { /* bỏ qua */ }
  }

  function reject(input) {
    $("#gate-error").textContent = "Mã truy cập không đúng.";
    input.setAttribute("aria-invalid", "true");
    input.select();
  }

  $("#gate-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = $("#gate-code");
    var code = input.value;
    if (REMOTE) {
      $("#gate-error").textContent = "";
      load(code).then(function (ok) {
        if (ok) { remember(code); showAdmin(); } else { reject(input); }
      });
    } else if (code === W.config.adminCode) {
      remember(code);
      showAdmin();
      load();
    } else {
      reject(input);
    }
  });

  $("#refresh").addEventListener("click", function () { load(savedCode()); });

  /* ---------- Hiển thị ---------- */
  function render() {
    var rsvps = data.rsvps;
    var songs = data.songs;
    var canDelete = !data.remote;
    var yes = rsvps.filter(function (r) { return r.attending; });
    var headcount = yes.reduce(function (sum, r) { return sum + 1 + (Number(r.guests) || 0); }, 0);

    function side(name) {
      return yes.filter(function (r) { return r.side === name; })
        .reduce(function (sum, r) { return sum + 1 + (Number(r.guests) || 0); }, 0);
    }

    var stats = [
      ["Tổng số khách sẽ đến", headcount, "Cô dâu " + side("Cô dâu") + " · Chú rể " + side("Chú rể") + " · Cả hai " + side("Cả hai")],
      ["Phản hồi", rsvps.length, "tổng số lượt RSVP"],
      ["Tham dự", yes.length, "lượt trả lời Có"],
      ["Vắng mặt", rsvps.length - yes.length, "lượt trả lời Không"]
    ];
    $("#stats").innerHTML = stats.map(function (s) {
      return '<div class="stat"><p class="eyebrow">' + s[0] + '</p><span class="stat__num">' + s[1] +
        '</span><span class="stat__sub">' + esc(s[2]) + "</span></div>";
    }).join("");

    if (!rsvps.length) {
      $("#rsvp-table").innerHTML = '<p class="empty-state">Chưa có ai RSVP.</p>';
    } else {
      $("#rsvp-table").innerHTML = '<div class="table-wrap"><table><thead><tr>' +
        "<th>Họ tên</th><th>Điện thoại</th><th>Tham dự</th><th>Số khách</th><th>Khách của</th>" +
        "<th>Chế độ ăn</th><th>Lời nhắn</th><th>Cập nhật</th><th></th></tr></thead><tbody>" +
        rsvps.slice().reverse().map(function (r) {
          return "<tr><td>" + esc(r.name) + '</td><td class="nowrap">' + esc(r.phone) + "</td><td>" +
            (r.attending ? '<span class="tag tag--yes">Có</span>' : '<span class="tag tag--no">Không</span>') +
            "</td><td>" + (r.attending ? 1 + (Number(r.guests) || 0) : 0) + "</td><td>" + esc(r.side) +
            "</td><td>" + esc(r.diet) + "</td><td>" + esc(r.message) + '</td><td class="nowrap">' +
            esc(when(r.updatedAt || r.createdAt)) +
            "</td><td>" + (canDelete ? '<button class="btn-text" type="button" data-del-rsvp="' + esc(r.id) +
            '" aria-label="Xóa RSVP của ' + esc(r.name) + '">Xóa</button>' : "") + "</td></tr>";
        }).join("") + "</tbody></table></div>";
    }

    if (!songs.length) {
      $("#song-table").innerHTML = '<p class="empty-state">Chưa có bài hát nào.</p>';
    } else {
      $("#song-table").innerHTML = '<div class="table-wrap"><table><thead><tr>' +
        "<th>Bài hát</th><th>Ca sĩ</th><th>Người gửi</th><th>Thời gian</th><th></th></tr></thead><tbody>" +
        songs.slice().reverse().map(function (s) {
          return "<tr><td>" + esc(s.title) + "</td><td>" + esc(s.artist) + "</td><td>" + esc(s.by) +
            '</td><td class="nowrap">' + esc(when(s.createdAt)) +
            "</td><td>" + (canDelete ? '<button class="btn-text" type="button" data-del-song="' + esc(s.id) +
            '" aria-label="Xóa bài ' + esc(s.title) + '">Xóa</button>' : "") + "</td></tr>";
        }).join("") + "</tbody></table></div>";
    }
  }

  document.addEventListener("click", function (e) {
    var rsvpId = e.target.getAttribute && e.target.getAttribute("data-del-rsvp");
    var songId = e.target.getAttribute && e.target.getAttribute("data-del-song");
    if (rsvpId && confirm("Xóa RSVP này? Không thể hoàn tác.")) { Store.removeRsvp(rsvpId); load(); }
    if (songId && confirm("Xóa bài hát này? Không thể hoàn tác.")) { Store.removeSong(songId); load(); }
  });

  /* ---------- Xuất CSV ---------- */
  function csvCell(value) {
    var text = String(value == null ? "" : value);
    // chặn Excel hiểu nội dung khách nhập là công thức
    if (/^[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function download(filename, rows) {
    var csv = "﻿" + rows.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n");
    var url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  $("#export-rsvp").addEventListener("click", function () {
    var rows = [["Họ tên", "Điện thoại", "Tham dự", "Số khách (gồm người gửi)", "Khách của", "Chế độ ăn", "Lời nhắn", "Gửi lúc", "Cập nhật lúc"]];
    data.rsvps.forEach(function (r) {
      rows.push([r.name, r.phone, r.attending ? "Có" : "Không", r.attending ? 1 + (Number(r.guests) || 0) : 0,
        r.side, r.diet, r.message, when(r.createdAt), when(r.updatedAt)]);
    });
    download("rsvp-ha-vy-thanh-an.csv", rows);
  });

  $("#export-songs").addEventListener("click", function () {
    var rows = [["Bài hát", "Ca sĩ", "Người gửi", "Thời gian"]];
    data.songs.forEach(function (s) { rows.push([s.title, s.artist, s.by, when(s.createdAt)]); });
    download("bai-hat-ha-vy-thanh-an.csv", rows);
  });

  // tự cập nhật khi trang chính (tab khác) có dữ liệu mới
  window.addEventListener("storage", function () { if (isUnlocked() && !REMOTE) load(); });

  // mở lại trong cùng phiên: không cần nhập lại mã
  if (isUnlocked()) {
    showAdmin();
    load(savedCode()).then(function (ok) {
      if (!ok) {
        try { sessionStorage.removeItem(UNLOCK_KEY); } catch (e) { /* bỏ qua */ }
        $("#admin").hidden = true;
        $("#gate").hidden = false;
      }
    });
  }
})();
