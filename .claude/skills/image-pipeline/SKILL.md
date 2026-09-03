---
name: image-pipeline
description: Use this skill whenever you derive, crop, re-encode, resize or replace an image in this repo — the founder portraits in public/media/team/, the Inzichten thumbnails in public/media/insights/, or any new picture set — and whenever you write or edit a <picture>, srcset, sizes or preloadImage declaration. Covers the hand-rolled sips workflow (there is no build-step image pipeline), the AVIF plus JPEG fallback pairing, the crop offsets each existing set was cut at, and the two traps that cost the most time: sips --cropOffset is measured in points, and an odd-dimension AVIF renders as its alt text in Firefox.
---

# Hand-derived images

There is no build-step image pipeline. Every picture on the site was cut and
encoded by hand with `sips`, the only image tool on a stock Mac. This is the
recipe and the two traps.

## The two picture sets

Two blocks carry pictures and both sets were derived once, by hand, with
`sips` — AVIF plus a JPEG fallback, wired up with `<picture>` and `srcset`:
- `public/media/team/` — the founder portraits, a 2:3 crop at 320w, 440w and
  880w (`src/pages/team.mjs`). They open the team page, so the first one is
  also declared as `meta().preloadImage`.
- `public/media/insights/` — the homepage article thumbnails, a 16:9 crop at
  320w, 480w and 760w, all lazy (`src/pages/home.mjs`). The sources are the
  four blog post banners on `main`, under `assets/blog/`; `launch` stops at
  480w because its original is only 542px wide. The article page reuses the
  same set as its opening figure, eagerly and at the reading measure rather than
  full-bleed: 760w is the widest there is and the smallest original is 542px
  across, so a figure running the width of the page would be the one visibly
  soft picture on the site. Nothing in that markup is named "banner": an ad
  blocker's generic lists key on the word in an id or a class, and the figure
  rendered as its alt text until it was renamed. Deriving wider crops is only possible for two of
  the four — aviso is 1600px across and smartspace 3710px, what-works is 996px
  and launch 542px.

`sips --cropOffset` is the top-left of the crop window in *points*, so set the
source to 72dpi first or the offset lands at half the distance, and never pass
`0 0` — it reads as "unset" and centres the crop. Turn the derivation into a
build step when a third block needs it; note that `sips`, the only image tool
on a stock Mac, cannot write WebP, which is why the fallback is JPEG.

**Give every AVIF even pixel dimensions.** `sips` pads an odd dimension to the
next even one and writes a `clap` (clean aperture) box to crop it back.
Chromium and WebKit honour that box; Gecko decodes the image to 0×0, and
because a `<picture>` only falls back on an unsupported `type` and never on a
failed decode, the `<img>` renders its alt text instead of the JPEG that sits
right there in its `srcset`. It cost a long hunt: the file was valid AV1 Main
8-bit 4:2:0, served 200 `image/avif` byte-identical from both the dev server
and Cloudflare, and rendered in every engine but the one the reviewer used.
The 16:9 crops at 320w and 480w are 180 and 270 tall and were always fine; only
the 760w ones were 427 tall, so only they broke, and only where a layout picked
them — which is why the homepage thumbnails looked healthy the whole time. They
are now 760×428, re-encoded from their own JPEG so the crop could not shift
(`sips -z 428 760 <stem>-760.jpg`, then `sips -s format avif -s formatOptions
60`, which lands within a kilobyte of the originals). To check a file:
`xxd` it and look for `clap`, or scan the tree the way that hunt ended up
doing.

The JPEGs beside them are 760x428 too. They were 427 — the true 16:9 height for
760 is 427.5 and the AVIF had to round up to stay even — and a 1px difference is
invisible on screen, because the figure crops to 16:9 with `object-fit: cover`
anyway. It is not invisible in the markup: the `<img>` declares one aspect ratio
and the two sources disagree with each other about it, which means AVIF and JPEG
were not the same crop. `sips -z 428 760 <stem>-760.jpg` over the file itself
settles it; the AVIF was made from that same JPEG, so the crop cannot shift.
