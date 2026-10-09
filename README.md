# For You ❤️

A little animated love letter. Tap the envelope, the wax seal breaks, the flap folds open and the letter types itself out, finishing with a burst of hearts.

Plain HTML, CSS and JavaScript. No frameworks and no build step.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page structure (envelope, letter, buttons) |
| `style.css` | Colours, envelope, animations, mobile layout |
| `script.js` | The message, song settings, typewriter effect, hearts, background song |

## Edit the message

Open `script.js` and change the text inside `` const message = `...` `` at the top.

- A blank line starts a new paragraph.
- Everything from `Your Love,` onwards is styled as the signature (right-aligned, script font).

## Music

The song starts the moment the envelope is tapped. It plays through an invisible YouTube player, so there is no video or music button on the page.

To change the song or the part that plays, edit `const song` near the top of `script.js`:

```js
const song = {
  youtubeId: "hiEc1hNA5-k", // the part after youtu.be/ or watch?v=
  start: 100,               // seconds (1:40)
  end: 230,                 // seconds (3:50), then it loops back to start
};
```

If YouTube can't load, or the video doesn't allow embedding, the letter still works, just without music.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000.

## Accessibility

If the device has "reduce motion" turned on, the floating hearts, heart burst and typing animation are switched off and the letter appears in full straight away.
