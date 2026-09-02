# Slide reference

The seven archetypes are one file each in `../template/slides/`. Copy them; this file covers
what is not visible in the copy — how to vary an archetype, and how the dark shape is built.

## Varying an archetype

**Rows.** Wrap the list in `.slide__body` so it centres in the space under the heading.
Three rows is comfortable, four is the maximum. A row whose detail runs past one
line is a row that wants to be a slide. Drop the `.slide__lede` when the heading already says
it; two lines of framing above three rows leaves the rows crowded against the footer.

**Statement.** The `.slide__eyebrow` is optional and is the only place cyan text appears on a
slide. Use `.slide__note` for the source. Never two statement slides in a row: the second one
reads as a repeat of the first, whatever it says.

**Compare.** The right column is the answer, and the styling says so before a word is read.
So put the proposal on the right, always, even when the chronology runs the other way. The
two lists must be the same length; an uneven pair reads as an argument that ran out.

**Steps.** `.steps--3` and `.steps--5` change the column count and nothing else. `.step--ahead`
is the pale rule and the lighter title: use it for a step not yet reached, a phase outside the
current scope, or an option not taken. A row of four steps that are all cyan is a row with no
information in its rules; if every step is reached, the slide is a rows list.

**Media.** `.media--flip` puts the words on the right. Alternate when a deck has two media
slides near each other. The frame is `--sa-wash`, so an image that does not fill it reads as a
held space; give the image `object-fit: cover` (it already has it) and crop rather than letterbox.
Every image takes a real `alt` — `check-dist.mjs` fails the build without one, and a deck is
read by a screen reader in the room as often as any page.

**Cover and close.** They are a pair: the petal hangs off the right on the cover, the lobe
rises out of the bottom-left on the close, and the words sit opposite the shape in both. Do
not put a shape on any slide between them.

## The dark shape

`.field` (from `tokens.css`) flips every semantic role to its on-navy value. `.slide__shape`
positions and clips. The two silhouettes are drawn on the canvas and baked into the
stylesheet, so a slide names one and adds nothing:

```html
<div class="field slide__shape slide__shape--petal" aria-hidden="true"> … </div>
```

| | `--petal` | `--lobe` |
|---|---|---|
| anchor | `top: 0; left: 1075px` | `bottom: 0; left: 0` |
| box | 845 x 1080 | 640 x 820 |
| runs off | the right edge and the top | the left edge and the bottom |

`clip-path: path()` measures from the element's own border box, which is why the box is
frozen in stage pixels. **A shape must run off at least one edge of the slide.** One that
floats clear of every edge reads as a hole punched in the paper rather than as a field
behind it. If a deck needs a third silhouette, draw it on the canvas and add it to
`shared/slide.css` as a `--modifier`; do not inline a one-off `clip-path` in a slide.

### The live field

Put one `<sa-node-field>` inside the shape and the network paints itself:

```html
<div class="field slide__shape slide__shape--petal" aria-hidden="true">
  <sa-node-field id="<slug>-slide-00-field"></sa-node-field>
</div>
```

It needs `"scripts": ["../shared/node-field.js"]` in `deck.json`. Without the script the
shape is still a correct navy silhouette, just a still one.

`shared/node-field.js` is the site's component with the sharing taken out. There, one field
lives in document coordinates and every dark shape is a window onto it, which is what makes
the network read as continuous down a page. A deck has no document to anchor to: it is a
fixed stage that `<deck-stage>` scales with a transform, and every shape is its own island
on its own slide. So each element seeds and drifts its own network inside its own box, and
the host's `clip-path` means nodes that drift outside the silhouette are simply not painted.
Nothing has to know the outline.

It is denser and a little brighter than the site's field on purpose. A silhouette is a sliver
of a slide and covers roughly a quarter of the box it is drawn in, so the site's spacing puts
a couple of dozen nodes on a cover and reads as specks.

`.node` and `.link` still exist in `shared/slide.css` for a shape that wants a fixed,
hand-placed constellation. Position them inline in stage pixels, measured inside the shape's
box: `--d` is the diameter, `--o` the opacity, `--w` and `--a` the length and angle of the
hairline.


## Orbits

Rings struck from one origin off the edge of the slide, three of them carrying a node that
travels and fades over a turn. Ported from the public homepage's hero. It is the deck's only
motion, and it stops under `prefers-reduced-motion`.

Use it on the cover and the closing slide only. `.orbits--close` moves the origin off the
right edge and dims the set, which is what keeps the arcs off the closing words. On a content
slide the arcs cut through the reading measure and the hairline rows stop reading as hairlines.

Rings 01 through 05 nest outward; paths 01 through 03 carry the nodes and match rings 02, 03
and 04. The cover takes all five rings and all three paths; the close takes 02 to 04 and one
path. Keep `aria-hidden="true"` on the container: it is texture, and a screen reader has
nothing to say about it.

## What the canvas has that a deck does not

The `Slide Template` canvas is authored for Claude Design, so it carries two things that have
no place in a deck folder:

- **`<image-slot>`** is the canvas's drag-and-drop placeholder. In a deck it is a plain
  `<img>` inside `.media__frame`, with the file in the deck's `assets/`.
- **`data-magnet` and `data-clip`** are the public site's magnetic-shape hooks, read by
  `src/motion.js`. Nothing reads them in a deck; leave them out rather than shipping dead
  attributes.

Everything else on the canvas maps one-to-one onto the classes in `shared/slide.css`.
