# Previously: interactive logo marquee

User-requested isolated website worktree, 9 November 2026. Continue with Imaan in this thread. Base: production `static-rebuild`, commit `f804354` in `imaan/landing-page`.

## Exact request

“Could we actually spin up a work tree to turn the 'previously' section into a set of scrolling logos which stop when you tap or hover on them and you can scroll yourself if you'd like. So it's a touch scrollable list that auto-scrolls horizontally (disappearing at the edges) if nobody touches it and allows you to pause/move it when you do touch it.”

## Established scope

Replace the existing Previously client-name paragraph with real client logos. Existing names/links are Spotify, Provable, Herbert Smith Freehills (currently links to hsfkramer.com), and the Financial Conduct Authority. The user has not asked to add brands or change the historic client claims. Retain the Previously framing, contact section and current page identity/background/themes. Intro subtitle and project section are temporarily hidden at the user's request: keep them hidden.

Desired interaction: automatic horizontal movement while idle, content disappearing at the edges, immediate pause for hover/touch, user-controlled horizontal scrolling. Maintain the user's position during transitions between automatic and manual control; avoid jumping, fighting touch momentum or intercepting vertical page scrolling. Do not confuse an animated transform-only row with a genuinely scrollable list.

## Consequential gaps to resolve

The existing page supplies the visual context, but no actual animation reference or logo assets were found in the production source. User's standing rule: do not generate visual animation/imagery from text alone. Ask for an example clip/site reference, or seek explicit approval for a specific inspected reference, before dependent animation production. Source authentic logo assets; don't invent/recreate brand marks. Establish the appropriate historic HSF/current HSF Kramer treatment rather than silently substituting one. Keep asset provenance.

Ask one focused question at a time, reusing the clear request above. After the reference dependency, the interaction gap is resume behaviour: after touch/manual scrolling, remain paused until deliberately resumed, or resume after inactivity? Explain the tradeoff and let Imaan decide. Don't present a long questionnaire or demand pixel/CSS values. Other visual choices such as monochrome versus original colours can be grounded in the reference and existing dark/light site.

## Implementation approach and checks

Use the existing static HTML/CSS/JS stack. No framework migration is needed for this feature. Inspect `index.html`, `home.css`, `background.css`, and scripts before choosing implementation. Break down the one feature into short implementation/check steps in its change record before coding. Use canonical claude-mem work_state for tasks.

Relevant skills: `/Users/iminaii/.codex/skills/animate/SKILL.md` and `/Users/iminaii/.codex/skills/animation-accessibility/SKILL.md`. Read only necessary implementation references. Make reduced-motion mode a stationary, manually scrollable list. Keyboard users need accessible logos/links, clear focus and usable control over movement; duplicate items used for looping must not create redundant announcements/tab stops. Pause offscreen/hidden-page work. A usable explicit stop/resume option should be considered alongside the requested pointer/touch behaviour; do not silently treat hover-only pause as sufficient for everyone.

Verify actual desktop hover enter/leave, touch/manual scrolling, agreed resume behaviour, keyboard focus/control, reduced motion, dark/light legibility, narrow screens and edge clipping. Confirm contact access and hidden sections remain correct. Test the actual component, not only a demo harness. Record browser/device limits honestly.

Keep a factual change record: original request, baseline, selected interaction/reference, tradeoff, implementation, checks, user feedback and how to restore the original. Make a local reviewable result in this worktree. This setup request doesn't itself request pushing this new design live; follow subsequent user direction without adding redundant approval gates.

## Working constraints and context

Google Chrome only for browser computer use; never Arc. Prefer connected plugins where suitable. Imaan wants constructive design coaching, retains authorship of consequential choices, and wants one bounded change at a time. Ask only missing meaningful questions and wait before dependent implementation. Use supplied/approved visual references; the prior personal-site animation-prototype exception was session-specific and does not carry over automatically.

Relevant prior website decisions and original comparison records: `/Users/iminaii/code/active/dreamer/dreamer/knowledge/retained/personal-site-2026-11-09/README.md`. Existing full-row project hover is intentionally irrelevant while projects are hidden. No need to reopen the old research directions. Main chat has completed setup; this new conversation owns the logo-strip continuation.
