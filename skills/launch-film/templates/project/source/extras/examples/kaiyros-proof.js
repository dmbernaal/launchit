import { h, show, smooth, out, expo, sheen, enter } from "../../util.js";
// The proof, in the real app's material (cards from the shipped launch film): what's next, the script, the post at
// the right moment, the counter-offer. Then what other tools are: grey, flat, cold, falling away on the claim.
// Values are authored examples.
export function createProof(c) {
  const root = document.querySelector("#cards");
  const past = [.20, .22, .19, .24, .23, .27, .25, .29, .31, .30, .34, .37, .36, .40], next = [.48, .58, .70, .84, 1];
  const forecast = h(`<section class="card c-forecast"><header><img src="assets/products/elf.webp" alt=""><div><span class="eyebrow">Lip &amp; cheek set</span><h2>Quiet today.</h2></div><span class="pill spec">Breaking out · ~3 days</span></header>
    <div class="fc-chart"><div class="fc-past">${past.map(v => `<i style="--h:${v}"></i>`).join("")}</div><div class="fc-today"><span>Today</span></div><div class="fc-next">${next.map(v => `<i style="--h:${v}"></i>`).join("")}</div></div>
    <div class="fc-axis"><span>Last 14 days</span><span>Next 5 days</span></div></section>`);
  const lines = [["Hook", "Watch it melt the second it hits your lips."], ["Show", "One swipe for cheeks, one for lips. Daylight."], ["Close", "It's in my Showcase. Link below."]];
  const script = h(`<section class="card c-script"><span class="eyebrow">Script · Lip &amp; cheek set</span>${lines.map(([k]) => `<div class="sc-line"><span>${k}</span><p></p></div>`).join("")}</section>`);
  // Post at the right moment: a week of posting times as a heat map (no outlines; spacing separates the days),
  // Friday 7:30 PM lights up as the best moment, and the post lands in a full-width row beneath it.
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], times = ["9 AM", "12 PM", "3 PM", "6 PM", "7:30 PM", "9 PM"];
  const base = [.16, .3, .24, .5, .64, .42], dayK = [.8, .86, .9, 1, 1.12, .95, .74];
  const heat = (d, r) => Math.min(.9, base[r] * dayK[d] + (((d * 7 + r * 13) % 5) - 2) * .035);
  const BEST = [4, 4];
  const post = h(`<section class="card c-week"><header><span class="eyebrow">Post at the right moment</span><span class="pill spec pw-best">Best time · Fri 7:30 PM</span></header>
    <div class="pw-grid"><span></span>${days.map((d, i) => `<div class="pw-day${i === BEST[0] ? " best" : ""}"><span>${d}</span><b>${12 + i}</b></div>`).join("")}
      ${times.map((tm, r) => `<span class="pw-time${r === BEST[1] ? " best" : ""}">${tm}</span>${days.map((_, d) => `<i class="pw-cell${d === BEST[0] && r === BEST[1] ? " best" : ""}" style="--a:${(.03 + Math.pow(heat(d, r), 1.6) * .5).toFixed(3)}"></i>`).join("")}`).join("")}
      <div class="pw-col"></div></div>
    <div class="pw-post"><img src="assets/products/elf.webp" alt=""><div><b>Lip &amp; cheek demo</b><span class="pc-state">Scheduled · Friday 7:30 PM</span></div><i class="pw-check">✓</i></div></section>`);
  const counter = h(`<section class="card c-counter"><span class="eyebrow">Your counter · Studio North</span>
    <div class="row big"><span class="label">Rate</span><span class="val"><s>$600</s><b class="rate sheen">$600</b></span></div>
    <div class="row"><span class="label">Paid usage</span><span class="val"><s>90 days</s><b class="usage">90 days</b></span></div>
    <div class="row"><span class="label">Videos</span><span class="val"><b>2</b></span></div><footer><span class="btn">Review</span><small>Ready to send</small></footer></section>`);
  const grey = [
    h(`<section class="g-card g-chart"><span class="g-title">Analytics</span><svg viewBox="0 0 420 180"><path d="M0,150 L60,120 L120,132 L180,96 L240,104 L300,70 L360,82 L420,52" fill="none" stroke="#4a4a4f" stroke-width="3"/><path d="M0,178H420" stroke="#2c2c30"/></svg><div class="g-axis"><i></i><i></i><i></i><i></i></div></section>`),
    h(`<section class="g-card g-dash"><span class="g-title">Dashboard</span><div class="g-grid">${Array.from({ length: 6 }, () => `<div><i></i><b></b></div>`).join("")}</div></section>`),
    h(`<section class="g-card g-chat"><span class="g-title">AI assistant</span><p>How can I help you today?</p><div class="g-input"><span>Ask anything…</span><i></i></div></section>`),
  ];
  root.append(forecast, script, post, counter, ...grey);
  const pastBars = [...forecast.querySelectorAll(".fc-past i")], nextBars = [...forecast.querySelectorAll(".fc-next i")], fpill = forecast.querySelector(".pill");
  const scriptLines = [...script.querySelectorAll(".sc-line p")];
  const cells = [...post.querySelectorAll(".pw-cell")], bestCell = post.querySelector(".pw-cell.best"), bestPill = post.querySelector(".pw-best"), col = post.querySelector(".pw-col");
  const chip = post.querySelector(".pw-post"), chipState = post.querySelector(".pc-state");
  const rate = counter.querySelector(".rate"), usage = counter.querySelector(".usage"), strikes = [...counter.querySelectorAll("s")];
  const greyAt = [c.other + .25, c.charts - .45, c.charts + .15];
  // Cards sit on the right; the phone holds the conversation on the left.
  [forecast, script, post, counter].forEach(n => { n.style.left = "820px"; });
  script.style.width = "960px";
  return t => {
    enter(t, forecast, c.next2 - .35, c.script - .12);
    pastBars.forEach((b, i) => b.style.transform = `scaleY(${smooth((t - c.next2 + .2 - i * .02) / .4)})`);
    nextBars.forEach((b, i) => b.style.transform = `scaleY(${smooth((t - c.next2 - .25 - i * .08) / .4)})`);
    show(fpill, smooth((t - c.next2 - .5) / .3));
    enter(t, script, c.script - .15, c.post - .12);
    scriptLines.forEach((p, i) => { const n = Math.floor(Math.max(0, t - (c.script + i * .2)) * 75); p.textContent = lines[i][1].slice(0, n); });
    enter(t, post, c.post - .15, c.brand - .3);
    // The week fills in left to right, then the best moment lights, then the post lands under it.
    cells.forEach((n, i) => { const d = i % 7, r = Math.floor(i / 7); n.style.opacity = String(smooth((t - (c.post - .05 + d * .045 + r * .025)) / .3)); });
    const lit = smooth((t - (c.post + .45)) / .4);
    bestCell.style.setProperty("--lit", String(lit)); col.style.opacity = String(lit); post.style.setProperty("--lit", String(lit));
    show(bestPill, lit); bestPill.style.transform = `translateY(${(1 - lit) * 8}px)`;
    const land = out((t - (c.moment - .35)) / .6);
    show(chip, smooth((t - (c.moment - .4)) / .3));
    chip.style.transform = `translate3d(${(1 - land) * 140}px,${(1 - land) * 40}px,0)`;
    chip.dataset.landed = String(t > c.moment + .35);
    chipState.textContent = t > c.moment + .95 ? "Posted · Friday 7:30 PM" : "Scheduled · Friday 7:30 PM";
    { const a = expo((t - (c.brand + .05)) / .85), leave = smooth((t - (c.other - .35)) / .35);
      show(counter, Math.min(1, a * 3) * (1 - leave));
      counter.style.transform = `translate3d(${(1 - a) * -300}px,${(1 - a) * 120}px,0) scale(${(.4 + .6 * a) * (1 + leave * .04)}) rotateY(${(1 - a) * 8 - 3}deg)`;
      rate.textContent = `$${Math.round(600 + 300 * smooth((t - (c.more + .15)) / .9))}`;
      usage.textContent = `${Math.round(90 - 60 * smooth((t - (c.more + .45)) / .8))} days`;
      strikes.forEach(s => s.style.setProperty("--s", String(smooth((t - c.more - .9) / .4))));
      sheen(rate, t, c.more + .5, 1.3); }
    grey.forEach((n, i) => {
      const a = smooth((t - greyAt[i]) / .25), fall = smooth((t - c.work + .05 - i * .05) / .55);
      show(n, a * (1 - fall));
      n.style.transform = `translate3d(0,${(1 - a) * 12 + fall * 260}px,0) rotate(${fall * (i - 1) * 9}deg) scale(${1 - fall * .08})`;
      n.style.filter = fall > 0 ? `blur(${fall * 8}px)` : "none";
    });
  };
}
