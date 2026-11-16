/* ===================================================================
   刘心语 Violet Liu · 作品集交互
   -------------------------------------------------------------------
   替换成自己的成片：修改下面 WORKS 里每项的 webm / mp4 / poster，
   以及 index.html 中 <video> 的两个默认 <source> 与 poster。
   素材放在 assets/ 目录，路径保持相对路径。
   双源说明：WebM(VP9) 为主源、体积更小；MP4(H.264) 为兜底，
   老版本 Safari 不支持 WebM 时浏览器会自动回退到 MP4。
   完整正片（大文件）请勿放进网站，放到飞书云盘，通过页面入口跳转。
   =================================================================== */

const PAN_URL = 'https://pan.baidu.com/s/12vghuM_S1L7BwVZSJCaRzw?pwd=hybv';
const FEISHU_URL = 'https://ecnilyw8pk2d.feishu.cn/drive/folder/MRJ0f18bflj34ldE61oci5Pcnkb?from=from_copylink';

const WORKS = [
  {
    id: '01',
    title: '《Play Dead》',
    meta: '2026 · 剧情短片 · 4 min',
    role: '制片 / 导演助理',
    award: '法国 La CineFabrique 大学考试入围作品',
    duration: '04:00',
    webm: 'assets/reel-01.webm',
    mp4: 'assets/reel-01.mp4',
    poster: 'assets/poster-01.jpg'
  },
  {
    id: '02',
    title: '《幻夜》',
    meta: '2026 · 科幻 / 剧情 · 18 min',
    role: '制片',
    award: '绿幕影棚调整为实景拍摄，统筹场地、设备与现场协调',
    duration: '18:00',
    webm: 'assets/reel-02.webm',
    mp4: 'assets/reel-02.mp4',
    poster: 'assets/poster-02.jpg'
  },
  {
    id: '03',
    title: '《来击掌吧》',
    meta: '2025 · 喜剧 / 剧情 · 23 min',
    role: '执行制片',
    award: '未来电影计划全国 20 强',
    duration: '23:00',
    webm: 'assets/reel-03.webm',
    mp4: 'assets/reel-03.mp4',
    poster: 'assets/poster-03.jpg'
  },
  {
    id: '04',
    title: '《AI 牡丹亭》',
    meta: '2025 · AIGC / 剧情 · 17 min',
    role: '后期',
    award: '北京大学第四届东亚古籍数字人文国际论坛优秀典藏活化奖',
    duration: '17:00',
    webm: 'assets/reel-04.webm',
    mp4: 'assets/reel-04.mp4',
    poster: 'assets/poster-04.jpg'
  },
  {
    id: '05',
    title: '《GOAL! 蒲公英少年》',
    meta: '2024 · 纪录片 · 20 min',
    role: '编导',
    award: '入围北京国际电影节·大学生电影节原创单元',
    duration: '20:00',
    webm: 'assets/reel-05.webm',
    mp4: 'assets/reel-05.mp4',
    poster: 'assets/poster-05.jpg'
  }
];

const $ = (id) => document.getElementById(id);
const pad = (n) => String(Math.floor(n)).padStart(2, '0');
const fmtTime = (s) => {
  if (!isFinite(s) || s < 0) s = 0;
  return `${pad(s / 60)}:${pad(s % 60)}`;
};
const fmtTC = (s) => {
  if (!isFinite(s) || s < 0) s = 0;
  return `TC ${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)}:${pad((s % 1) * 25)}`;
};

/* ---------- 渲染作品网格 ---------- */
function renderWorks() {
  const grid = $('worksGrid');
  const playSvg = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5.5v13l10-6.5-10-6.5z" fill="currentColor"/></svg>';
  const arrowSvg = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  grid.innerHTML = WORKS.map((w, i) => `
    <button class="work-card reveal${i === 0 ? ' is-active' : ''}" type="button" data-index="${i}" aria-label="播放 ${w.title}">
      <div class="work-media">
        <img src="${w.poster}" alt="${w.title} 封面" loading="lazy">
        <span class="work-num">${w.id} / WORK</span>
        <span class="work-play">${playSvg}</span>
        <span class="work-dur">${w.duration}</span>
      </div>
      <div class="work-body">
        <h3>${w.title}</h3>
        <p class="work-meta">${w.meta}</p>
        <p class="work-role">${w.role}</p>
        <p class="work-award">${w.award}</p>
      </div>
    </button>
  `).join('') + `
    <a class="work-card link-card reveal" href="${PAN_URL}" target="_blank" rel="noopener noreferrer">
      <span class="link-label">06 / FULL PORTFOLIO</span>
      <h3>完整作品集<br>与简历</h3>
      <p>含五部成片、项目资料与个人简历。<br>百度网盘提取码 hybv</p>
      <span class="link-arrow">前往查看 ${arrowSvg}</span>
    </a>
  `;

  grid.querySelectorAll('.work-card[data-index]').forEach((card) => {
    card.addEventListener('click', () => selectWork(Number(card.dataset.index), true));
  });
}

/* ---------- 自定义播放器 ---------- */
const video = $('video');
const frame = $('playerFrame');
const progress = $('progress');
const progressFill = $('progressFill');
const progressThumb = $('progressThumb');
const rates = [1, 1.25, 1.5, 2, 0.75];
let rateIdx = 0;
let current = 0;

function setPlayingUI(isPlaying) {
  frame.classList.toggle('playing', isPlaying);
  $('playBtn').setAttribute('aria-label', isPlaying ? '暂停' : '播放');
  $('bigPlay').setAttribute('aria-label', isPlaying ? '暂停视频' : '播放视频');
}

function togglePlay() {
  if (video.paused || video.ended) {
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
  } else {
    video.pause();
  }
}

function updateProgress() {
  const pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
  progressFill.style.width = `${pct}%`;
  progressThumb.style.left = `${pct}%`;
  progress.setAttribute('aria-valuenow', Math.round(pct));
  $('curTime').textContent = fmtTime(video.currentTime);
  $('playerTc').textContent = fmtTC(video.currentTime);
}

function selectWork(index, autoPlay) {
  const w = WORKS[index];
  if (!w) return;
  current = index;

  video.pause();
  video.poster = w.poster;
  const webmSrc = $('srcWebm');
  const mp4Src = $('srcMp4');
  if (webmSrc && mp4Src) {
    webmSrc.src = w.webm;
    mp4Src.src = w.mp4;
    video.load();
  } else {
    video.src = w.mp4;
    video.load();
  }
  setPlayingUI(false);
  progressFill.style.width = '0%';
  progressThumb.style.left = '0%';
  $('curTime').textContent = '00:00';

  $('capIndex').textContent = w.id;
  $('capTitle').textContent = w.title;
  $('capMeta').textContent = `${w.meta} · ${w.role}`;
  $('capAward').textContent = w.award;

  document.querySelectorAll('.work-card[data-index]').forEach((c) => {
    c.classList.toggle('is-active', Number(c.dataset.index) === index);
  });

  if (autoPlay) {
    $('player').scrollIntoView({ behavior: 'smooth', block: 'start' });
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
  }
}

function initPlayer() {
  $('bigPlay').addEventListener('click', togglePlay);
  $('playBtn').addEventListener('click', togglePlay);
  video.addEventListener('click', togglePlay);
  video.addEventListener('play', () => setPlayingUI(true));
  video.addEventListener('pause', () => setPlayingUI(false));
  video.addEventListener('ended', () => setPlayingUI(false));
  video.addEventListener('timeupdate', updateProgress);
  video.addEventListener('loadedmetadata', () => {
    $('durTime').textContent = fmtTime(video.duration);
    updateProgress();
  });

  // 进度条：点击 + 拖动
  const seek = (clientX) => {
    if (!video.duration) return;
    const r = progress.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    video.currentTime = ratio * video.duration;
    updateProgress();
  };
  let dragging = false;
  progress.addEventListener('pointerdown', (e) => {
    dragging = true;
    progress.setPointerCapture(e.pointerId);
    seek(e.clientX);
  });
  progress.addEventListener('pointermove', (e) => { if (dragging) seek(e.clientX); });
  progress.addEventListener('pointerup', () => { dragging = false; });
  progress.addEventListener('pointercancel', () => { dragging = false; });
  progress.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { video.currentTime = Math.max(0, video.currentTime - 5); e.preventDefault(); }
  });

  // 音量
  const volume = $('volume');
  volume.addEventListener('input', () => {
    video.volume = Number(volume.value);
    video.muted = video.volume === 0;
    frame.classList.toggle('muted', video.muted);
  });
  $('muteBtn').addEventListener('click', () => {
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) { video.volume = 1; volume.value = 1; }
    frame.classList.toggle('muted', video.muted);
  });

  // 倍速
  $('rateBtn').addEventListener('click', () => {
    rateIdx = (rateIdx + 1) % rates.length;
    video.playbackRate = rates[rateIdx];
    $('rateBtn').textContent = `${rates[rateIdx].toFixed(rates[rateIdx] % 1 ? 2 : 1)}×`;
  });

  // 全屏
  $('fsBtn').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (frame.requestFullscreen) frame.requestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  });

  // 键盘
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.code === 'Space' && document.activeElement === document.body) {
      e.preventDefault(); togglePlay();
    }
    if (e.key === 'ArrowRight' && document.activeElement === document.body) video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
    if (e.key === 'ArrowLeft' && document.activeElement === document.body) video.currentTime = Math.max(0, video.currentTime - 5);
  });
}

/* ---------- 页面级交互 ---------- */
function initPage() {
  const header = $('siteHeader');
  const bar = $('scrollProgress');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 移动端菜单
  const toggle = $('navToggle');
  const nav = $('nav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  // 滚动显现
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: .08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el, i) => { el.style.transitionDelay = `${Math.min(i % 3, 2) * 70}ms`; io.observe(el); });
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  // 导航高亮
  const sections = ['player', 'works', 'about', 'contact'];
  if ('IntersectionObserver' in window) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        nav.querySelectorAll('a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${en.target.id}`));
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach((id) => { const el = $(id); if (el) io2.observe(el); });
  }
}

renderWorks();
initPlayer();
initPage();
