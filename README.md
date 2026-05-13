# PHONE WASTE — TE-01

A Teenage Engineering–inspired industrial design site that calculates how much of your life you've spent staring at a phone.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Structure

```
phone-waste/
├── app/
│   ├── globals.css        # Global styles, CSS variables, fonts
│   ├── layout.tsx         # Root layout + metadata
│   └── page.tsx           # Entry point
├── components/
│   ├── PhoneWaste.tsx      # Main 3-slide component
│   └── PhoneWaste.module.css
├── package.json
├── next.config.js
└── tsconfig.json
```

## Slides

1. **Slide 1** — "When did you buy your first smartphone?" (year input)
2. **Slide 2** — "What is your daily screen time?" (hours/day input)
3. **Slide 3** — Results: years wasted, total hours, % of waking life, verdict

## Design

- Industrial / brutalist aesthetic inspired by Teenage Engineering
- IBM Plex Mono + Space Mono typography
- `#080808` background, `#f0a500` amber accent
- Slide transitions with fade + translate
- Animated life consumption bar
- Corner registration marks, monospace system headers
