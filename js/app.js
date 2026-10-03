(function () {
  "use strict";

  var W = window.WEDDING;
  var Store = window.Store;

  var start = new Date(W.event.start);
  var end = new Date(W.event.end);
  var deadline = new Date(W.event.rsvpDeadline);

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Ảnh thật nếu có src, ngược lại là khối màu giữ chỗ.
  function media(img) {
    if (img.src) {
      return '<img class="media" src="' + esc(img.src) + '" alt="' + esc(img.alt) + '" loading="lazy">';
    }
    return '<div class="ph ph--' + esc(img.tone || "stone") + '" role="img" aria-label="' + esc(img.alt) + '">' +
      "<span>" + esc(img.label || "") + "</span></div>";
  }

  /* ---------- Nội dung tĩnh ---------- */
  function renderContent() {
    var binds = {
      monogram: W.couple.monogram,
      bride: W.couple.bride,
      groom: W.couple.groom,
      tagline: W.couple.tagline,
      hashtag: W.couple.hashtag,
      dateLabel: W.event.dateLabel,
      timeLabel: W.event.timeLabel,
      rsvpDeadlineLabel: W.event.rsvpDeadlineLabel,
      venueName: W.venue.name,
      venueAddress: W.venue.address
    };
    $$("[data-bind]").forEach(function (node) {
      node.textContent = binds[node.getAttribute("data-bind")] || "";
    });

    $("#hero-image").innerHTML = media(W.hero.image);
    $("#venue-image").innerHTML = media(W.venue.image);

    $("#story-list").innerHTML = W.story.map(function (s) {
      return '<article class="story__item reveal">' +
        '<div class="story__media">' + media(s.image) + "</div>" +
        '<div class="story__body">' +
        '<p class="story__year">' + esc(s.year) + "</p>" +
        "<h3>" + esc(s.title) + "</h3>" +
        "<p>" + esc(s.text) + "</p>" +
        "</div></article>";
    }).join("");

    $("#gallery-grid").innerHTML = W.gallery.map(function (g, i) {
      return '<button type="button" class="gallery__item gallery__item--' + esc(g.span || "sq") +
        ' reveal" data-index="' + i + '" aria-label="Xem lớn: ' + esc(g.alt) + '">' + media(g) + "</button>";
    }).join("");

    $("#schedule-list").innerHTML = W.schedule.map(function (s) {
      return '<li class="schedule__item reveal">' +
        '<span class="schedule__time">' + esc(s.time) + "</span>" +
        "<h3>" + esc(s.title) + "</h3>" +
        '<p class="schedule__text">' + esc(s.text) + "</p></li>";
    }).join("");

    $("#dress-title").textContent = W.dressCode.title;
    $("#dress-text").textContent = W.dressCode.text;
    $("#dress-palette").innerHTML = W.dressCode.palette.map(function (c) {
      return '<li><span class="swatch" style="background:' + esc(c.hex) + '"></span>' + esc(c.name) + "</li>";
    }).join("");
    $("#dress-dos").innerHTML = W.dressCode.dos.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    $("#dress-donts").innerHTML = W.dressCode.donts.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");

    $("#map-link").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(W.venue.mapQuery);
    $("#venue-notes").innerHTML = W.venue.notes.map(function (n) {
      return "<div><dt>" + esc(n.label) + "</dt><dd>" + esc(n.text) + "</dd></div>";
    }).join("");

    var qa = W.qa.slice();
    if (W.config.showGift && W.gift) qa.push(W.gift);
    $("#qa-list").innerHTML = qa.map(function (item) {
      return "<details><summary>" + esc(item.q) + "</summary><p>" + esc(item.a) + "</p></details>";
    }).join("");

    $("#contact-list").innerHTML = W.contact.map(function (c) {
      return "<li>" + esc(c.name) + ' · <a href="tel:' + esc(c.phone.replace(/\s/g, "")) + '">' + esc(c.phone) + "</a></li>";
    }).join("");
  }

  /* ---------- Điều hướng ---------- */
  function initNav() {
    var nav = $("#nav");
    var toggle = $("#nav-toggle");
    function close() {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      $(".nav__toggle-label").textContent = "Menu";
    }
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
      $(".nav__toggle-label").textContent = open ? "Đóng" : "Menu";
    });
    $$("#nav-links a").forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    window.addEventListener("scroll", function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    }, { passive: true });
  }

  /* ---------- Hiện dần khi cuộn ---------- */
  function initReveal() {
    var nodes = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ---------- Đếm ngược ---------- */
  function initCountdown() {
    var box = $("#countdown");
    var timer;

    function pad(n) { return n < 10 ? "0" + n : String(n); }

    function tick() {
      var now = new Date();
      if (now >= end) {
        box.className = "hero__thanks";
        box.innerHTML = "<h3>" + esc(W.thanks.title) + "</h3><p>" + esc(W.thanks.text) + "</p>";
        clearInterval(timer);
        return;
      }
      if (now >= start) {
        box.className = "hero__thanks";
        box.innerHTML = "<h3>Hôm nay là ngày ấy</h3><p>Buổi lễ đang diễn ra. Hẹn gặp bạn ở " + esc(W.venue.name) + ".</p>";
        return;
      }
      var s = Math.floor((start - now) / 1000);
      var units = [
        [Math.floor(s / 86400), "Ngày"],
        [Math.floor((s % 86400) / 3600), "Giờ"],
        [Math.floor((s % 3600) / 60), "Phút"],
        [s % 60, "Giây"]
      ];
      box.innerHTML = units.map(function (u) {
        return '<div class="count__unit"><span class="count__num">' + pad(u[0]) +
          '</span><span class="count__label">' + u[1] + "</span></div>";
      }).join("");
    }

    tick();
    timer = setInterval(tick, 1000);
  }

  /* ---------- Lưu vào lịch ---------- */
  function icsStamp(date) {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }

  function icsText(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
  }

  function initCalendar() {
    var location = W.venue.name + ", " + W.venue.address;
    var details = W.couple.tagline;

    var ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//VyAn Wedding//VI",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:vyan-wedding-20261010@wedding.local",
      "DTSTAMP:" + icsStamp(new Date()),
      "DTSTART:" + icsStamp(start),
      "DTEND:" + icsStamp(end),
      "SUMMARY:" + icsText(W.event.title),
      "LOCATION:" + icsText(location),
      "DESCRIPTION:" + icsText(details),
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      "DESCRIPTION:" + icsText(W.event.title),
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    $$("[data-ics]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "ha-vy-thanh-an-10-10-2026.ics";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      });
    });

    var gcal = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(W.event.title) +
      "&dates=" + icsStamp(start) + "/" + icsStamp(end) +
      "&location=" + encodeURIComponent(location) +
      "&details=" + encodeURIComponent(details);
    $$("[data-gcal]").forEach(function (a) { a.href = gcal; });
  }

  /* ---------- Lightbox ---------- */
  function initLightbox() {
    var box = $("#lightbox");
    var stage = $("#lb-stage");
    var caption = $("#lb-caption");
    var index = 0;
    var opener = null;

    function show(i) {
      var total = W.gallery.length;
      index = (i + total) % total;
      var img = W.gallery[index];
      stage.innerHTML = media(img);
      caption.textContent = (index + 1) + " / " + total + " · " + img.alt;
    }
    function open(i, from) {
      opener = from;
      show(i);
      box.hidden = false;
      document.body.style.overflow = "hidden";
      $("#lb-close").focus();
    }
    function close() {
      box.hidden = true;
      document.body.style.overflow = "";
      if (opener) opener.focus();
    }

    $("#gallery-grid").addEventListener("click", function (e) {
      var item = e.target.closest(".gallery__item");
      if (item) open(Number(item.getAttribute("data-index")), item);
    });
    $("#lb-close").addEventListener("click", close);
    $("#lb-prev").addEventListener("click", function () { show(index - 1); });
    $("#lb-next").addEventListener("click", function () { show(index + 1); });
    box.addEventListener("click", function (e) { if (e.target === box || e.target === stage) close(); });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
      if (e.key === "Tab") {
        // giữ focus trong lightbox
        var focusables = $$("button", box);
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- RSVP ---------- */
  function initRsvp() {
    var form = $("#rsvp-form");
    var done = $("#rsvp-done");
    var closed = $("#rsvp-closed");
    var cancel = $("#rsvp-cancel");
    var editBtn = $("#rsvp-edit");

    function isLocked() { return new Date() > deadline; }

    function setError(name, message) {
      var err = $("#err-" + name);
      if (err) err.textContent = message || "";
      var input = form.elements[name];
      if (input && input.setAttribute) {
        if (message) input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
      }
    }

    function syncAttending() {
      var no = form.elements.attending.value === "no";
      $$("[data-if-attending]", form).forEach(function (node) { node.hidden = no; });
    }

    function fill(record) {
      form.reset();
      if (record) {
        form.elements.name.value = record.name || "";
        form.elements.phone.value = record.phone || "";
        form.elements.attending.value = record.attending ? "yes" : "no";
        form.elements.guests.value = String(record.guests || 0);
        form.elements.diet.value = record.diet || "";
        form.elements.side.value = record.side || "";
        form.elements.message.value = record.message || "";
      }
      ["name", "phone", "attending"].forEach(function (n) { setError(n, ""); });
      syncAttending();
    }

    function row(label, value) {
      return value ? "<div><dt>" + label + "</dt><dd>" + esc(value) + "</dd></div>" : "";
    }

    function render() {
      var mine = Store.myRsvp();
      var locked = isLocked();
      var after = new Date() >= end;

      closed.hidden = true;
      form.hidden = true;
      done.hidden = true;

      if (mine) {
        $("#rsvp-done-title").textContent = mine.attending
          ? "Cảm ơn " + mine.name + ", hẹn gặp bạn ngày 10.10!"
          : "Cảm ơn " + mine.name + ", chúng mình sẽ nhớ bạn.";
        $("#rsvp-done-summary").innerHTML =
          row("Tham dự", mine.attending ? "Có" : "Không") +
          (mine.attending ? row("Số khách", (1 + (mine.guests || 0)) + " người (gồm cả bạn)") : "") +
          row("Điện thoại", mine.phone) +
          row("Khách của", mine.side) +
          (mine.attending ? row("Chế độ ăn", mine.diet) : "") +
          row("Lời nhắn", mine.message);
        editBtn.hidden = locked;
        done.hidden = false;
      }

      if (after) {
        closed.textContent = "Buổi lễ đã diễn ra. Cảm ơn tất cả mọi người đã đến chung vui.";
        closed.hidden = false;
      } else if (locked) {
        closed.textContent = "RSVP đã đóng từ ngày " + W.event.rsvpDeadlineLabel +
          ". Nếu cần thay đổi, bạn vui lòng liên hệ trực tiếp với cô dâu chú rể.";
        closed.hidden = false;
      } else if (!mine) {
        fill(null);
        cancel.hidden = true;
        form.hidden = false;
      }
    }

    form.addEventListener("change", function (e) {
      if (e.target.name === "attending") { syncAttending(); setError("attending", ""); }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (isLocked()) { render(); return; }

      var name = form.elements.name.value.trim();
      var phone = form.elements.phone.value.trim();
      var attending = form.elements.attending.value;
      var firstInvalid = null;

      setError("name", "");
      setError("phone", "");
      setError("attending", "");

      if (name.length < 2) {
        setError("name", "Vui lòng nhập họ tên của bạn.");
        firstInvalid = form.elements.name;
      }
      if (phone && !/^\+?[0-9\s.\-]{8,15}$/.test(phone)) {
        setError("phone", "Số điện thoại chưa đúng. Ví dụ: 0901 234 567.");
        firstInvalid = firstInvalid || form.elements.phone;
      }
      if (!attending) {
        setError("attending", "Vui lòng chọn bạn có tham dự hay không.");
        firstInvalid = firstInvalid || $('input[name="attending"]', form);
      }
      if (firstInvalid) { firstInvalid.focus(); return; }

      var yes = attending === "yes";
      Store.saveMyRsvp({
        name: name,
        phone: phone,
        attending: yes,
        guests: yes ? Number(form.elements.guests.value) : 0,
        diet: yes ? form.elements.diet.value.trim() : "",
        side: form.elements.side.value,
        message: form.elements.message.value.trim()
      });
      render();
      done.focus();
    });

    editBtn.addEventListener("click", function () {
      fill(Store.myRsvp());
      done.hidden = true;
      cancel.hidden = false;
      form.hidden = false;
      form.elements.name.focus();
    });
    cancel.addEventListener("click", render);

    render();
  }

  /* ---------- Bài hát ---------- */
  function initSongs() {
    var form = $("#song-form");
    var list = $("#song-list");
    var status = $("#song-status");

    function render() {
      var songs = Store.listSongs();
      if (!songs.length) {
        list.innerHTML = '<li class="empty">Chưa có bài nào. Hãy là người mở màn.</li>';
        return;
      }
      list.innerHTML = songs.slice().reverse().map(function (s) {
        var meta = [s.artist, s.by ? "gửi bởi " + s.by : ""].filter(Boolean).join(" · ");
        return '<li><span class="track__title">' + esc(s.title) + "</span>" +
          '<span class="track__meta">' + esc(meta || "Chưa rõ ca sĩ") + "</span></li>";
      }).join("");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var title = form.elements.title.value.trim();
      var err = $("#err-song");
      status.textContent = "";
      if (!title) {
        err.textContent = "Vui lòng nhập tên bài hát.";
        form.elements.title.setAttribute("aria-invalid", "true");
        form.elements.title.focus();
        return;
      }
      err.textContent = "";
      form.elements.title.removeAttribute("aria-invalid");
      var by = form.elements.by.value.trim();
      Store.addSong({ title: title, artist: form.elements.artist.value.trim(), by: by });
      form.reset();
      form.elements.by.value = by;
      status.textContent = "Đã thêm \"" + title + "\" vào playlist. Cảm ơn bạn!";
      render();
    });

    // điền sẵn tên nếu khách đã RSVP
    var mine = Store.myRsvp();
    if (mine) form.elements.by.value = mine.name;
    render();
  }

  renderContent();
  initNav();
  initCountdown();
  initCalendar();
  initLightbox();
  initRsvp();
  initSongs();
  initReveal();
})();
