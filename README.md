This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Feature flags

| Variable | Default | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_FEATURE_NARRATOR` | off | `1` or `true` turns on the video narrator (the clip frame, its Narrator switch and Replay in the controls and on the start card, the `R` shortcut, the autoplay hold and music ducking). Read at build time (`src/features/power-on/content/flags.ts`), so set it in the Vercel project's environment variables and redeploy. |

To preview the narrator on a build where it's off, open the site with `?narrator=1`: it stays on for that tab (sessionStorage, so it survives a language switch). `?narrator=0` clears it.

The clips in `public/narration/` ship with every build, so `/narration/intro-open.mp4` is publicly reachable even with the flag off.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
