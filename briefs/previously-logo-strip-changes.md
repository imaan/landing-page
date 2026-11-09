# Previously logo strip — change record

## Request and baseline

Replace the Previously client-name paragraph with authentic linked logos that move horizontally while idle, pause on hover/touch, and support manual scrolling. Preserve the page identity, background, contact and hidden subtitle/projects. Baseline: `9695f42` (production source plus brief), clean before work.

## Reference and decisions

- Imaan supplied [Design with Mahsa’s Figma tutorial](https://www.youtube.com/watch?v=RLw7AgyNSDg). The first yt-dlp attempt and Chrome fallback were blocked by YouTube; a user-requested retry succeeded without authentication. Local original and intake manifest are git-excluded under `.local-references/RLw7AgyNSDg/`.
- Original: 344 seconds, 1920×1080, 30 fps; full FFmpeg decode passed. Inspected sampled frames at 0–16s (every 2s), 275–300s (every 5s), 310–334s (every 3s). Demo shows a single row of logos moving left, clipped at the edges. Figma settings show linear motion and an instant reset. Sampled frames do not establish continuous playback quality.
- Imaan chose automatic resumption after a short idle delay, the historic Herbert Smith Freehills mark, and a single tone matching the light/dark theme.
- Implementation target: steady leftward movement; immediate pause on hover, touch, wheel or keyboard focus; resume one second after activity/momentum ends. Imaan subsequently requested removing the visible Pause/Play control. Reduced motion is stationary and manually scrollable.

## Short implementation/check steps

1. Source and inspect authentic assets; record origins and any display normalization.
2. Replace only the Previously paragraph; add a native horizontal scroller, loop handling and movement control using the existing static stack.
3. Verify hover/manual input, resume and position continuity, keyboard, reduced motion, hidden/offscreen pausing, both themes and narrow screens in the actual page. Record limits honestly.
4. Leave a local reviewable result and capture Imaan’s feedback; no publication requested.

## Tradeoff

Native `scrollLeft` enables actual touch/trackpad scrolling and momentum. It needs a small requestAnimationFrame controller for idle movement rather than a compositor-only transform loop. Suspend it while interacting, hidden, offscreen or under reduced motion. Repeated visual items must not add duplicate screen-reader or keyboard entries.

## Validation and feedback

- Implemented in `index.html`, `previously.css`, `previously.js`, with authentic local assets and per-file provenance in `assets/clients/provenance.json`. CSS alpha masks use the approved theme-aware tone. HSF’s viewBox is tightened around its original paths; Provable’s decorative source opacity is removed. No marks are recreated.
- Auto speed: 24 CSS pixels/second. Idle delay: 1 second, refreshed by native scroll events including momentum. A tap on a moving strip pauses without navigating; tapping a paused logo follows its existing link. Horizontal touch/trackpad scrolling stays native and vertical wheel/touch input is not prevented.
- Reduced motion hides loop copies, keeps one manual list and a scrollbar. Keyboard users get one set of links, visible focus and immediate left/right scrolling from the region. Automatic movement resumes subject to hover/focus/visibility; there is no Pause/Play button.
- `node --test tests/previously.test.cjs`: 8 passing controller tests covering loop seam, hover, touch/momentum, one-second idle resumption/reset, keyboard, hidden/offscreen work, reduced motion/live changes and duplicate accessibility. These simulate event scheduling; they are not real-device gesture tests.
- `node --check previously.js`, `git diff --check`, and structural checks passed: intro/projects remain hidden, contact links intact, all stylesheet/script references resolve, existing theme/background/hover files unchanged.
- Initial version inspected on the actual Chrome desktop page in dark and light themes: logos legible, edges clip, horizontal scrolling changes the visible logos, Pause exposes Play, accessibility tree contains only the four original client links. Hidden sections are absent and contact remains visible. No console messages were shown when DevTools opened.
- Browser limitation: native Chrome control began returning `noWindowsAvailable` / `elementHasNoFrame`, and further keyboard/device-emulation actions did not produce reliable state changes. Reconnecting/resetting did not resolve it. Narrow-screen, actual touch momentum, physical keyboard focus traversal, hover enter/leave timing and reduced-motion emulation are **not yet fully verified in the actual browser**. Controller tests pass but do not substitute for those checks. No Safari/iOS testing performed.
- Local preview: `http://127.0.0.1:4191/`. No commit, push or deployment performed. Imaan has not yet reviewed the implementation.
- Release note: the [FCA’s official asset page](https://www.fca.org.uk/contact/logos-photos) requires authorisation for website logo use; confirmation remains for public release. The current work is a local preview.

## Restore

Restore `index.html` from `9695f42` and remove the new `previously.css`, `previously.js`, and `assets/clients/` files. Existing stylesheet/scripts are not intended to change. Keep this record and the reference brief if useful. Also restore the original Connect sentence from that baseline if reverting the full change.

## Review adjustment — 9 November, 19:24 GMT

Imaan requested removing the Pause button and reducing the resume delay. Removed the button, its styles, stopped state and click handler; shortened idle delay from 2000ms to 1000ms. Kept heading spacing, touch/hover/keyboard pauses and reduced motion. Updated the existing timer test to verify no resumption at 999ms, resumption at 1000ms, and timer reset by continued scrolling. All 8 tests, syntax and whitespace checks pass. Browser re-verification remains subject to the previously recorded Chrome control blocker.

## Publication request — 9 November

Imaan authorised pushing live. Final contact edit: keep the Connect heading and both icons; remove only the invitation sentence. GitHub Pages publishes from `static-rebuild` at the repository root. Remote production was still `f804354` when checked. The separate production worktree contains an unrelated `.gitignore` edit, which this change does not include or modify. Existing browser-test limitations above remain; no claim of real-device coverage is added.
