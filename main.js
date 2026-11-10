(function () {
	'use strict';
	document.documentElement.classList.remove('no-js');

	var year = document.getElementById('year');
	if (year) year.textContent = new Date().getFullYear();

	// Nav: solid once the hero is behind us.
	var nav = document.querySelector('.nav');
	function syncNav() { nav.classList.toggle('is-scrolled', window.scrollY > 60); }
	window.addEventListener('scroll', syncNav, { passive: true });
	syncNav();

	// Reveal on scroll, staggered within a parent.
	var items = document.querySelectorAll('.reveal');
	if ('IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (e) {
				if (!e.isIntersecting) return;
				var siblings = Array.prototype.filter.call(e.target.parentNode.children, function (c) { return c.classList.contains('reveal'); });
				e.target.style.setProperty('--d', Math.min(siblings.indexOf(e.target), 6) * 90 + 'ms');
				e.target.classList.add('is-in');
				io.unobserve(e.target);
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
		items.forEach(function (el) { io.observe(el); });
	} else {
		items.forEach(function (el) { el.classList.add('is-in'); });
	}

	// Mobile menu: a full-screen sheet; closes on a link, Escape, or resize to desktop.
	var root = document.documentElement;
	var toggle = document.querySelector('.nav-toggle');
	var sheet = document.getElementById('nav-sheet');
	function setMenu(open) {
		if (!toggle || !sheet) return;
		if (open) sheet.hidden = false;
		// let the un-hidden sheet paint once so it can fade in
		requestAnimationFrame(function () { root.classList.toggle('menu-open', open); });
		toggle.setAttribute('aria-expanded', String(open));
		toggle.querySelector('.sr').textContent = open ? 'Close menu' : 'Menu';
		// keep focus inside the sheet while it is open
		Array.prototype.forEach.call(document.querySelectorAll('main, footer, .skip'), function (el) { el.inert = open; });
		if (open) setTimeout(function () { var first = sheet.querySelector('a'); if (first) first.focus({ preventScroll: true }); }, 60);
		if (!open) setTimeout(function () { if (!root.classList.contains('menu-open')) sheet.hidden = true; }, 350);
	}
	if (toggle && sheet) {
		toggle.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
		sheet.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); toggle.focus(); } });
		window.matchMedia('(min-width: 961px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
	}

	// Mark the nav link for the section in view.
	var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]:not(.nav-cta)'));
	if ('IntersectionObserver' in window && links.length) {
		var byId = {};
		links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
		var spy = new IntersectionObserver(function (entries) {
			entries.forEach(function (e) {
				var a = byId[e.target.id];
				if (!a) return;
				if (e.isIntersecting) {
					links.forEach(function (l) { l.removeAttribute('aria-current'); });
					a.setAttribute('aria-current', 'true');
				} else if (a.getAttribute('aria-current')) {
					a.removeAttribute('aria-current');
				}
			});
		}, { rootMargin: '-45% 0px -50% 0px' });
		Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
	}

	// Register interest: a short form in a dialog that hands the message to the
	// visitor's email app. Without JS (or <dialog>) the links stay plain mailto.
	var dialog = document.getElementById('register');
	if (dialog && typeof dialog.showModal === 'function') {
		var TO = 'hello@aenimalabs.com';
		var form = dialog.querySelector('.ri-form');
		var done = dialog.querySelector('.ri-done');
		var nameInput = form.elements.name;
		var nameError = dialog.querySelector('.ri-error');
		var opener = null, message = null;

		var openDialog = function (from) {
			opener = from || null;
			if (root.classList.contains('menu-open')) setMenu(false);
			form.hidden = false; done.hidden = true;
			dialog.showModal();
			setTimeout(function () { nameInput.focus(); }, 30);
		};
		var closeDialog = function () { dialog.close(); };

		document.addEventListener('click', function (e) {
			var a = e.target.closest('[data-register]');
			if (!a) return;
			e.preventDefault();
			openDialog(a);
		});
		dialog.addEventListener('click', function (e) {
			if (e.target === dialog || e.target.closest('[data-close]')) closeDialog();
		});
		dialog.addEventListener('close', function () {
			if (location.hash === '#register') history.replaceState(null, '', location.pathname + location.search);
			if (opener) opener.focus({ preventScroll: true });
		});

		nameInput.addEventListener('input', function () {
			nameInput.removeAttribute('aria-invalid'); nameError.hidden = true;
		});

		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var name = nameInput.value.trim();
			if (!name) {
				nameInput.setAttribute('aria-invalid', 'true'); nameError.hidden = false; nameInput.focus();
				return;
			}
			var as = (form.querySelector('input[name="as"]:checked') || {}).value || '';
			var note = form.elements.note.value.trim();
			var subject = 'Kodama — register interest (' + name + ')';
			var body = 'Hello Kodama team,\n\nI would like to register my interest in Kodama.\n\n' +
				'Name: ' + name + '\nInterested as: ' + as + '\n' +
				(note ? '\n' + note + '\n' : '') +
				'\nSent from kodama.house';
			message = 'To: ' + TO + '\nSubject: ' + subject + '\n\n' + body;
			try { window.dataLayer && window.dataLayer.push({ event: 'register_interest', interest_as: as }); } catch (err) {}
			var mail = document.createElement('a');
			mail.href = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body.replace(/\n/g, '\r\n'));
			document.body.appendChild(mail);
			mail.click();
			mail.remove();
			form.hidden = true; done.hidden = false;
			done.querySelector('h2').focus();
		});

		var copyBtn = dialog.querySelector('[data-copy]');
		copyBtn.addEventListener('click', function () {
			var label = copyBtn.textContent;
			var ok = function () { copyBtn.textContent = 'Copied'; setTimeout(function () { copyBtn.textContent = label; }, 2000); };
			if (navigator.clipboard && message) {
				navigator.clipboard.writeText(message).then(ok, function () { window.prompt('Copy the message:', message); });
			} else if (message) {
				window.prompt('Copy the message:', message);
			}
		});

		// kodama.house/#register opens the form directly (linked from aenimalabs.com).
		if (location.hash === '#register') openDialog(null);
	}

	// Stardust: sparks in an invisible sphere around the canopy.
	// Wind blows gently upward; the pointer is a soft breeze.
	var canvas = document.querySelector('.stardust');
	var tree = document.querySelector('.hero-tree');
	if (!canvas || !tree || !canvas.getContext) return;

	var ctx = canvas.getContext('2d');
	var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var dpr = Math.min(window.devicePixelRatio || 1, 2);
	var W = 0, H = 0, cx = 0, cy = 0, R = 0;
	var motes = [];
	var pointer = { x: -9999, y: -9999 };

	function layout() {
		var rect = canvas.getBoundingClientRect();
		var t = tree.getBoundingClientRect();
		W = rect.width; H = rect.height;
		canvas.width = W * dpr; canvas.height = H * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		// Canopy centre in the cropped tree viewBox is ~(51%, 36%).
		cx = t.left - rect.left + t.width * 0.51;
		cy = t.top - rect.top + t.height * 0.36;
		R = t.width * 0.56;
	}

	function spawn(m, anywhere) {
		var a = Math.random() * Math.PI * 2;
		var r = Math.sqrt(Math.random()) * R;
		m.x = cx + Math.cos(a) * r;
		m.y = anywhere ? cy + Math.sin(a) * r * 0.8 : cy + R * 0.7;
		m.vx = 0; m.vy = 0;
		m.size = 0.8 + Math.random() * 2.2;
		m.phase = Math.random() * Math.PI * 2;
		m.speed = 0.15 + Math.random() * 0.35;
		m.life = 0;
		m.maxLife = 400 + Math.random() * 600;
		m.ice = Math.random() < 0.18;
		return m;
	}

	function init() {
		layout();
		var n = W < 500 ? 46 : 84;
		motes = [];
		for (var i = 0; i < n; i++) {
			var m = spawn({}, true);
			m.life = Math.random() * m.maxLife;
			motes.push(m);
		}
	}

	// Each spark is a soft glow plus a crisp 4-spike star. The glow (the costly
	// part) is painted once into a sprite and stamped; the star stays a vector.
	function glowSprite(core) {
		var S = 64, r = S / 2, c = document.createElement('canvas');
		c.width = c.height = S;
		var g = c.getContext('2d');
		var glow = g.createRadialGradient(r, r, 0, r, r, r);
		glow.addColorStop(0, 'rgba(' + core + ',.55)');
		glow.addColorStop(1, 'rgba(201,162,78,0)');
		g.fillStyle = glow;
		g.fillRect(0, 0, S, S);
		return c;
	}
	var GOLD = { glow: glowSprite('227,206,149'), star: 'rgb(227,206,149)' };
	var ICE = { glow: glowSprite('214,232,240'), star: 'rgb(214,232,240)' };

	function spark(x, y, s, alpha, ice) {
		var tone = ice ? ICE : GOLD, r = s * 5, k = s * 2.6;
		ctx.globalAlpha = alpha;
		ctx.drawImage(tone.glow, x - r, y - r, r * 2, r * 2);
		ctx.fillStyle = tone.star;
		ctx.beginPath();
		ctx.moveTo(x, y - k);
		ctx.quadraticCurveTo(x, y, x + k, y);
		ctx.quadraticCurveTo(x, y, x, y + k);
		ctx.quadraticCurveTo(x, y, x - k, y);
		ctx.quadraticCurveTo(x, y, x, y - k);
		ctx.fill();
	}

	var t0 = performance.now();
	function frame(now) {
		var t = (now - t0) / 1000;
		ctx.clearRect(0, 0, W, H);
		ctx.globalCompositeOperation = 'lighter';
		for (var i = 0; i < motes.length; i++) {
			var m = motes[i];
			m.life += 1;
			// upward drift with a slow swirl around the canopy
			var dx = m.x - cx, dy = m.y - cy;
			var dist = Math.sqrt(dx * dx + dy * dy) || 1;
			m.vx += (-dy / dist) * 0.004 + Math.sin(t * 0.7 + m.phase) * 0.006;
			m.vy += -0.006 * m.speed + Math.cos(t * 0.5 + m.phase) * 0.003;
			// stay inside the sphere
			if (dist > R) { m.vx -= dx / dist * 0.02; m.vy -= dy / dist * 0.02; }
			// pointer breeze
			var px = m.x - pointer.x, py = m.y - pointer.y;
			var pd = px * px + py * py;
			if (pd < 14000) { var f = (1 - pd / 14000) * 0.12; m.vx += px / Math.sqrt(pd + 1) * f; m.vy += py / Math.sqrt(pd + 1) * f; }
			m.vx *= 0.97; m.vy *= 0.97;
			m.x += m.vx; m.y += m.vy;

			var lifeT = m.life / m.maxLife;
			var fade = Math.sin(Math.min(lifeT, 1) * Math.PI);
			var twinkle = 0.6 + 0.4 * Math.sin(t * 3 * m.speed + m.phase);
			spark(m.x, m.y, m.size, fade * twinkle * 0.9, m.ice);
			if (m.life > m.maxLife) spawn(m, true);
		}
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = 'source-over';
		if (!reduced) raf = requestAnimationFrame(frame);
	}

	var raf;
	init();
	// Re-seed on a real size change (rotation, desktop resize); a mobile URL bar
	// showing or hiding only changes the height, so just re-measure then.
	var lastW = W, resizeT;
	window.addEventListener('resize', function () {
		clearTimeout(resizeT);
		resizeT = setTimeout(function () {
			if (Math.abs(canvas.getBoundingClientRect().width - lastW) > 40) { init(); lastW = W; } else { layout(); }
		}, 120);
	});
	canvas.parentNode.parentNode.addEventListener('pointermove', function (e) {
		var r = canvas.getBoundingClientRect();
		pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
	});
	canvas.parentNode.parentNode.addEventListener('pointerleave', function () { pointer.x = pointer.y = -9999; });

	// Pause when the hero is off screen.
	if ('IntersectionObserver' in window && !reduced) {
		new IntersectionObserver(function (e) {
			cancelAnimationFrame(raf);
			if (e[0].isIntersecting) raf = requestAnimationFrame(frame);
		}).observe(canvas);
	} else {
		raf = requestAnimationFrame(frame);
	}
	// The tree's box settles after its rise animation; re-measure once.
	setTimeout(layout, 1700);
})();
