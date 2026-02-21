# TriPy — Trivandrum Python Community

Static site for the Trivandrum Python Community, built with [Eleventy (11ty)](https://www.11ty.dev/).

## Local Development

```bash
npm install
npm start        # serve with hot-reload at localhost:8080
npm run build    # production build to _site/
```

## Adding Events

Create a markdown file in `src/events/`:

```
src/events/YYYY-MM-DD-slug-name.md
```

Frontmatter:

```yaml
---
title: "Event Title"
date: 2026-04-12
time: "6:00 PM - 7:45 PM"
venue: "Venue Name"
type: meetup          # meetup | workshop | project-night
attendees: null       # set after event
talks:
  - title: "Talk Title"
    speaker: "Speaker Name"
registration_url: "#"
tags: ["Python", "FastAPI"]
---
Description of the event goes here.
```

Events are **automatically** sorted into upcoming/past based on the date. No manual `upcoming: true/false` needed.

## Data Files

| File | Purpose |
|------|---------|
| `src/_data/site.json` | Site name, tagline, links, stats, meetup format |
| `src/_data/faq.json` | FAQ entries |
| `src/_data/gallery.json` | Gallery images |

## Deployment

Pushes to `main` auto-deploy to GitHub Pages via Actions.
