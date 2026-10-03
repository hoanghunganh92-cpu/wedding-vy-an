/*
 * Lớp lưu trữ. Mọi thao tác đọc/ghi dữ liệu khách nhập đều đi qua đây.
 * Mặc định lưu vào localStorage của trình duyệt (chỉ trên thiết bị này).
 * Nếu WEDDING.config.remoteEndpoint có giá trị (URL Google Apps Script),
 * mỗi RSVP/bài hát còn được gửi về Google Sheet, có hàng đợi thử lại.
 * Xem SETUP_GOOGLE_SHEET.md.
 */
window.Store = (function () {
  var KEYS = {
    rsvps: "vyan_rsvps",
    songs: "vyan_songs",
    myRsvp: "vyan_my_rsvp_id",
    outbox: "vyan_outbox"
  };
  var memory = {};

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return key in memory ? memory[key] : fallback;
    }
  }

  function write(key, value) {
    memory[key] = value;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* chế độ riêng tư hoặc hết dung lượng: giữ tạm trong bộ nhớ */
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function endpoint() {
    return (window.WEDDING && window.WEDDING.config.remoteEndpoint) || "";
  }

  // Gửi text/plain để là "simple request", không cần preflight CORS (Apps Script không hỗ trợ OPTIONS).
  function post(payload) {
    return fetch(endpoint(), {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    }).then(function (res) { return res.json(); });
  }

  // Hàng đợi gửi: bản ghi chưa gửi được (mất mạng...) được giữ lại và thử lại lần mở sau.
  // Phía Sheet ghi theo id nên gửi lại nhiều lần không tạo dòng trùng.
  var flushing = false;

  function flush() {
    if (!endpoint() || !window.fetch || flushing) return;
    var queue = read(KEYS.outbox, []);
    if (!queue.length) return;
    flushing = true;
    var item = queue[0];
    post({ action: "save", type: item.type, record: item.record })
      .then(function (res) {
        if (!res || !res.ok) throw new Error("rejected");
        var current = read(KEYS.outbox, []).filter(function (q) {
          return !(q.type === item.type && q.record.id === item.record.id && q.record.updatedAt === item.record.updatedAt);
        });
        write(KEYS.outbox, current);
        flushing = false;
        flush();
      })
      .catch(function () { flushing = false; });
  }

  function pushRemote(type, record) {
    if (!endpoint()) return;
    // bản ghi mới nhất của cùng một id thay thế bản cũ trong hàng đợi
    var queue = read(KEYS.outbox, []).filter(function (q) {
      return !(q.type === type && q.record.id === record.id);
    });
    queue.push({ type: type, record: record });
    write(KEYS.outbox, queue);
    flush();
  }

  function pendingCount() {
    return read(KEYS.outbox, []).length;
  }

  // Dùng cho trang quản lý: đọc toàn bộ dữ liệu từ Google Sheet.
  function fetchRemote(code) {
    if (!endpoint()) return Promise.reject(new Error("no-endpoint"));
    return post({ action: "list", code: code }).then(function (res) {
      if (!res || !res.ok) throw new Error((res && res.error) || "failed");
      return res;
    });
  }

  function listRsvps() {
    return read(KEYS.rsvps, []);
  }

  function myRsvp() {
    var id = read(KEYS.myRsvp, null);
    if (!id) return null;
    return listRsvps().filter(function (r) { return r.id === id; })[0] || null;
  }

  // Tạo mới, hoặc cập nhật câu trả lời đã gửi từ thiết bị này.
  function saveMyRsvp(data) {
    var all = listRsvps();
    var mine = myRsvp();
    var now = new Date().toISOString();
    var record;
    if (mine) {
      record = Object.assign({}, mine, data, { updatedAt: now });
      all = all.map(function (r) { return r.id === mine.id ? record : r; });
    } else {
      record = Object.assign({ id: uid(), createdAt: now, updatedAt: now }, data);
      all.push(record);
    }
    write(KEYS.rsvps, all);
    write(KEYS.myRsvp, record.id);
    pushRemote("rsvp", record);
    return record;
  }

  function removeRsvp(id) {
    write(KEYS.rsvps, listRsvps().filter(function (r) { return r.id !== id; }));
  }

  function listSongs() {
    return read(KEYS.songs, []);
  }

  function addSong(data) {
    var record = Object.assign({ id: uid(), createdAt: new Date().toISOString() }, data);
    var all = listSongs();
    all.push(record);
    write(KEYS.songs, all);
    pushRemote("song", record);
    return record;
  }

  function removeSong(id) {
    write(KEYS.songs, listSongs().filter(function (s) { return s.id !== id; }));
  }

  flush();
  window.addEventListener("online", flush);

  return {
    flush: flush,
    pendingCount: pendingCount,
    fetchRemote: fetchRemote,
    listRsvps: listRsvps,
    myRsvp: myRsvp,
    saveMyRsvp: saveMyRsvp,
    removeRsvp: removeRsvp,
    listSongs: listSongs,
    addSong: addSong,
    removeSong: removeSong
  };
})();
