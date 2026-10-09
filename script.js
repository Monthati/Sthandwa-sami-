// ✏️ Edit the letter here. Blank lines start a new paragraph.
// Everything from "Your Love," onwards is styled as the signature.
const message = `Ndoda yo mfazi wakhe. The cage of my rib, into yami yaphakathe. Radebe, Bungane, Mthimkhulu, ndlebe zintle zombini. Lerato la pelo yaka.

May God see all your efforts and dedication in the line of work you do. May He see your heart and bless you with what you truly deserve.

It is a journey, not a destination. Qhuba! This is just a stepping stone. Don't let it discourage you or make you feel like you are not doing enough.

You are still young, I can tell from your libido, so calm down, catch a breath, and take everything as it comes. 😂❤️

I want you to know that I am very proud of the progress you have made and the growth you have materialised. It is truly admirable. I cannot wait to see what the next chapter has in store for you. Whatever it is, I just know it will be well deserved.

Thank you for gracing me with your presence in my life. I will always love and support you in everything you do. Most importantly, I will always be your upcoming stand-up comedian. 😂❤️

Your Love,
The Greatest Dark Doll of All Time.
Or rather:
Umfazi wakho.
Whatever works best. ❤️`;

// 🎵 Background song (YouTube). start/end are in seconds; the clip loops between them.
const song = {
  youtubeId: "hiEc1hNA5-k", // Tman Xpress, Mellow & Sleazy - Remember (Lyrics)
  start: 100,               // 1:40
  end: 230,                 // 3:50
};

(() => {
  "use strict";

  const SIGNATURE_START = "Your Love,";
  const CHAR_DELAY = 34;      // ms per character
  const PUNCT_DELAY = 220;    // extra pause after . ! ? ,
  const LINE_PAUSE = 320;     // pause after a signature line
  const PARA_PAUSE = 520;     // pause between paragraphs

  const $ = (id) => document.getElementById(id);
  const stage = $("stage");
  const envelope = $("envelope");
  const letterView = $("letterView");
  const paperScroll = $("paperScroll");
  const letterBody = $("letterBody");
  const skipBtn = $("skipBtn");
  const againBtn = $("againBtn");
  const floatLayer = $("floatingHearts");
  const burstLayer = $("burst");

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduceMotion = motionQuery.matches;

  // ---------- Helpers ----------
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  // Split into user-perceived characters so emojis like ❤️ type as one unit.
  const segmenter =
    typeof Intl !== "undefined" && Intl.Segmenter
      ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
      : null;
  const splitChars = (text) =>
    segmenter ? Array.from(segmenter.segment(text), (s) => s.segment) : Array.from(text);

  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers.length = 0;
  };

  // ---------- Building the letter ----------
  function parseMessage(text) {
    const clean = text.replace(/\r\n/g, "\n").trim();
    const sigAt = clean.indexOf(SIGNATURE_START);
    const body = sigAt >= 0 ? clean.slice(0, sigAt).trim() : clean;
    const signature = sigAt >= 0 ? clean.slice(sigAt).trim() : "";
    return {
      paragraphs: body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
      signatureLines: signature ? signature.split("\n").map((l) => l.trim()) : [],
    };
  }

  // Creates empty elements and returns the list of lines to type into them.
  function buildLetter() {
    letterBody.textContent = "";
    const { paragraphs, signatureLines } = parseMessage(message);
    const units = [];

    const addBlock = (tag, className, lines, endPause, linePause) => {
      const block = document.createElement(tag);
      if (className) block.className = className;
      block.classList.add("pending");
      lines.forEach((line, i) => {
        const span = document.createElement("span");
        span.className = "line";
        block.appendChild(span);
        units.push({
          block,
          el: span,
          text: line,
          pause: i === lines.length - 1 ? endPause : linePause,
        });
      });
      letterBody.appendChild(block);
    };

    paragraphs.forEach((p) => addBlock("p", "", p.split("\n"), PARA_PAUSE, LINE_PAUSE));
    if (signatureLines.length) {
      addBlock("div", "signature", signatureLines, 0, LINE_PAUSE);
    }
    return units;
  }

  // ---------- Typewriter ----------
  let units = [];
  let runId = 0;
  let followScroll = true;

  const caret = document.createElement("span");
  caret.className = "caret";
  caret.setAttribute("aria-hidden", "true");

  const isNearBottom = () =>
    paperScroll.scrollHeight - paperScroll.scrollTop - paperScroll.clientHeight < 80;

  // If the reader scrolls up, stop auto-scrolling until they come back down.
  paperScroll.addEventListener("scroll", () => {
    followScroll = isNearBottom();
  }, { passive: true });

  const keepInView = () => {
    if (followScroll) paperScroll.scrollTop = paperScroll.scrollHeight;
  };

  async function typeLetter() {
    const id = ++runId;
    followScroll = true;

    for (const unit of units) {
      unit.block.classList.remove("pending");
      const textNode = document.createTextNode("");
      unit.el.append(textNode, caret);
      keepInView();

      for (const ch of splitChars(unit.text)) {
        if (id !== runId) return;
        textNode.data += ch;
        keepInView();
        await sleep(/[.!?,:]/.test(ch) ? CHAR_DELAY + PUNCT_DELAY : CHAR_DELAY);
      }
      if (id !== runId) return;
      await sleep(unit.pause);
    }
    if (id === runId) finishLetter();
  }

  function showFullLetter() {
    runId++;
    units.forEach((unit) => {
      unit.block.classList.remove("pending");
      unit.el.textContent = unit.text;
    });
    finishLetter();
  }

  function finishLetter() {
    caret.remove();
    skipBtn.hidden = true;
    againBtn.hidden = false;
    burstHearts();
  }

  // ---------- Envelope sequence ----------
  let state = "closed"; // closed | opening | open

  function openEnvelope() {
    if (state !== "closed") return;
    state = "opening";
    const k = reduceMotion ? 0.05 : 1;

    startMusic();

    envelope.classList.add("breaking");                          // seal cracks
    later(() => envelope.classList.add("open"), 450 * k);         // flap folds back
    later(() => envelope.classList.add("letter-out"), 1250 * k);  // letter slides up
    later(() => {                                                 // letter grows to fill the screen
      stage.classList.add("leaving");
      showLetterView();
    }, 2150 * k);
    later(() => {
      state = "open";
      if (reduceMotion) showFullLetter();
      else typeLetter();
    }, 2950 * k);
  }

  function showLetterView() {
    units = buildLetter();
    paperScroll.scrollTop = 0;
    skipBtn.hidden = false;
    againBtn.hidden = true;
    letterView.classList.add("show");
    letterView.setAttribute("aria-hidden", "false");
    stage.setAttribute("aria-hidden", "true");
    paperScroll.focus({ preventScroll: true });
  }

  function readAgain() {
    runId++;
    clearTimers();
    burstLayer.textContent = "";

    letterView.classList.remove("show");
    letterView.setAttribute("aria-hidden", "true");
    stage.removeAttribute("aria-hidden");

    // Snap the envelope shut without animating, then fade the stage back in.
    envelope.classList.add("no-anim");
    envelope.classList.remove("breaking", "open", "letter-out");
    void envelope.offsetWidth;
    envelope.classList.remove("no-anim");
    stage.classList.remove("leaving");

    later(() => {
      state = "closed";
      envelope.focus({ preventScroll: true });
    }, reduceMotion ? 50 : 650);
  }

  envelope.addEventListener("click", openEnvelope);
  skipBtn.addEventListener("click", showFullLetter);
  againBtn.addEventListener("click", readAgain);

  // ---------- Floating hearts ----------
  const FLOAT_COLORS = ["#ffd1dc", "#ffb3c4", "#ff8fab", "#ffffff", "#f7a1b5"];
  let floatTimer = null;

  function spawnFloatingHeart() {
    if (document.hidden) return;
    const heart = document.createElement("span");
    heart.className = "float-heart";
    heart.textContent = "♥";
    heart.style.setProperty("--x", `${rand(0, 100)}%`);
    heart.style.setProperty("--size", `${rand(12, 30)}px`);
    heart.style.setProperty("--dur", `${rand(7, 13)}s`);
    heart.style.setProperty("--drift", `${rand(-50, 50)}px`);
    heart.style.setProperty("--rot", `${rand(-40, 40)}deg`);
    heart.style.setProperty("--op", rand(0.3, 0.75).toFixed(2));
    heart.style.setProperty("--color", pick(FLOAT_COLORS));
    heart.addEventListener("animationend", () => heart.remove());
    floatLayer.appendChild(heart);
  }

  function startFloating() {
    if (floatTimer || reduceMotion) return;
    for (let i = 0; i < 6; i++) setTimeout(spawnFloatingHeart, i * 350);
    floatTimer = setInterval(spawnFloatingHeart, 750);
  }

  function stopFloating() {
    clearInterval(floatTimer);
    floatTimer = null;
    floatLayer.textContent = "";
  }

  // ---------- Heart burst ----------
  const BURST_SYMBOLS = ["❤️", "💖", "💕", "💗", "💘", "♥", "♥"];
  const BURST_COLORS = ["#ff4d6d", "#ff8fab", "#c9184a", "#ffb3c1"];

  function burstHearts() {
    if (reduceMotion) return;
    const count = window.innerWidth < 600 ? 36 : 56;
    const reach = Math.max(window.innerWidth, window.innerHeight) * 0.6;

    for (let i = 0; i < count; i++) {
      const heart = document.createElement("span");
      heart.className = "burst-heart";
      heart.textContent = pick(BURST_SYMBOLS);
      const angle = rand(0, Math.PI * 2);
      const dist = reach * rand(0.35, 1);
      heart.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      heart.style.setProperty("--dy", `${Math.sin(angle) * dist - 40}px`);
      heart.style.setProperty("--size", `${rand(16, 34)}px`);
      heart.style.setProperty("--s", rand(0.9, 1.6).toFixed(2));
      heart.style.setProperty("--rot", `${rand(-60, 60)}deg`);
      heart.style.setProperty("--dur", `${rand(1.4, 2.4).toFixed(2)}s`);
      heart.style.setProperty("--delay", `${rand(0, 0.25).toFixed(2)}s`);
      heart.style.setProperty("--color", pick(BURST_COLORS));
      heart.addEventListener("animationend", () => heart.remove());
      burstLayer.appendChild(heart);
    }
  }

  // ---------- Music (YouTube) ----------
  // The song plays through an invisible YouTube player and starts when the envelope is tapped.
  let player = null;
  let playerReady = false;
  let wantPlay = false;
  let isPlaying = false;
  let loopTimer = null;

  // Jump back to the start once the clip reaches its end.
  const restartClip = () => {
    player.seekTo(song.start, true);
    player.playVideo();
  };

  function startMusic() {
    wantPlay = true;
    // Called directly inside the tap so phones allow the sound.
    if (playerReady && !isPlaying) player.playVideo();
  }

  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player("ytPlayer", {
      videoId: song.youtubeId,
      width: "200",
      height: "200",
      playerVars: {
        start: song.start,
        end: song.end,
        controls: 0,
        disablekb: 1,
        playsinline: 1,
        rel: 0,
        fs: 0,
        iv_load_policy: 3,
      },
      events: {
        onReady: () => {
          playerReady = true;
          if (wantPlay) player.playVideo();
        },
        onStateChange: (e) => {
          const S = YT.PlayerState;
          isPlaying = e.data === S.PLAYING || e.data === S.BUFFERING;
          if (e.data === S.PLAYING) {
            clearInterval(loopTimer);
            loopTimer = setInterval(() => {
              if (player.getCurrentTime() >= song.end - 0.25) restartClip();
            }, 250);
          } else if (e.data === S.ENDED) {
            restartClip();
          }
        },
        onError: () => {
          // e.g. video removed or embedding disabled: the letter simply carries on without music.
          wantPlay = false;
          clearInterval(loopTimer);
        },
      },
    });
  };

  // If a phone blocked the first attempt, any later tap on the page tries again.
  document.addEventListener("pointerdown", () => {
    if (wantPlay && playerReady && !isPlaying) player.playVideo();
  });

  // ---------- Reduced motion ----------
  const onMotionChange = (e) => {
    reduceMotion = e.matches;
    if (reduceMotion) stopFloating();
    else startFloating();
  };
  if (motionQuery.addEventListener) motionQuery.addEventListener("change", onMotionChange);
  else if (motionQuery.addListener) motionQuery.addListener(onMotionChange);

  startFloating();
})();
