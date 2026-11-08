# Anusree P — Interior Design Portfolio

Static site: HTML, CSS and JavaScript only. No build step.

## Run it
Open `index.html` in a browser, or serve the folder:

    python3 -m http.server 8000     # then visit http://localhost:8000

GSAP, ScrollTrigger, Lenis and both fonts are bundled locally (`js/vendor`, `assets/fonts`), so it works offline and needs no CDN.

## Contact form
It works immediately by opening the visitor's email app with the message pre-filled (mailto).
To receive messages directly with no email app involved:
1. Create a free endpoint at Formspree or Web3Forms (the address `pazhayadathanusree@gmail.com` is where messages will be delivered).
2. Paste its URL into `FORM_ENDPOINT` at the top of `js/script.js`.

## Content notes
- All text, skills, experience, qualifications and contact details come from the PDF. Typos in the PDF were corrected (e.g. "Muncipal", "styel", a missing word in the kitchen caption).
- No dates, degrees, location, LinkedIn or Instagram appear in the PDF, so none are shown. Add them in `index.html` when available.
- "Design details" in each project viewer describe what is visible in the render. The Design Philosophy copy is built from her About text and project captions. Both should be reviewed and edited by Anusree.
- Project images were cropped from the PDF pages. For sharper results, replace the files in `assets/images/` with the original renders (same file names; update `width`/`height` in `index.html` if the proportions change).
- `cover-sketch.jpg` (the PDF cover) is used only as a faint backdrop in the Philosophy section.

## Structure
    index.html
    css/style.css, css/responsive.css
    js/script.js        UI: nav, filters, project viewer, form
    js/animations.js    GSAP / ScrollTrigger / Lenis choreography
    js/vendor/          gsap, ScrollTrigger, lenis
    assets/images/      project renders, portrait
    assets/fonts/       Cormorant Garamond, DM Sans (self-hosted)
