Geist web fonts
==============

Official upstream: https://github.com/vercel/geist-font
Retrieved: 2026-11-03
License: SIL Open Font License 1.1; see the included OFL.txt.

These are unchanged upstream WOFF2 binaries, renamed locally for stable asset
URLs. Despite the convenient local "latin" filenames, these are the complete
upstream web fonts, not subsets or rebuilt versions. Both include Swedish
characters (a-ring, a-diaeresis, o-diaeresis and their uppercase equivalents).
The font weight axis is variable from 100 to 900, including 400, 500 and 600.

geist-latin.woff2
  Family: Geist
  Version: 1.800
  Upstream path: fonts/Geist/webfonts/Geist[wght].woff2
  Git blob SHA: 71dab8bedba3bfef5dccd7875ed05cac44c7345d
  Bytes: 69760
  Source: https://github.com/vercel/geist-font/blob/main/fonts/Geist/webfonts/Geist%5Bwght%5D.woff2

geist-mono-latin.woff2
  Family: Geist Mono
  Version: 1.700
  Upstream path: fonts/GeistMono/webfonts/GeistMono[wght].woff2
  Git blob SHA: 0e746fc18223dfcb107a85502a0abe1b1a02d51a
  Bytes: 71596
  Source: https://github.com/vercel/geist-font/blob/main/fonts/GeistMono/webfonts/GeistMono%5Bwght%5D.woff2

OFL.txt
  Upstream path: OFL.txt
  Git blob SHA: 04e95fc550855eb44416b9db1f6722f5cb7342db
  Source: https://github.com/vercel/geist-font/blob/main/OFL.txt

The binary file signatures and Git blob hashes were verified after download.
The font metadata was inspected to verify the variable weight range and the
presence of all six Swedish precomposed characters (U+00C4, U+00C5, U+00D6,
U+00E4, U+00E5, U+00F6).

For CSS, use font-style: normal; font-weight: 100 900; font-display: swap.
These local assets work offline when included in the PWA app-shell cache.
