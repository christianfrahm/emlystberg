/**
 * Standalone okkergokker footer — copy this single file to reuse elsewhere.
 * Dependencies: React only. Font loaded via embedded @font-face (Courier Prime).
 */

import type { CSSProperties } from "react";

const FOOTER_ART = `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣠⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣀⣀⣀⣠⠔⠊⠑⠒⣷⠆⢸⢳⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢀⠔⠋⠁⠀⠀⠉⠁⠒⠤⣄⠋⠀⠈⢧⡇⠀⠀⣰⣶⢆⠀
⠀⠀⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢉⣐⠒⠼⠿⠔⣊⣿⣿⢸⠀
⠀⠀⡇⠀⠀⠀⠀⢀⣤⡒⠋⣩⢉⠙⠛⢿⣿⡶⣾⣿⣿⣿⡌⠀
⠀⠀⠹⡄⠀⠀⢀⣾⣾⠁⢘⣭⣷⣶⠃⣿⣾⣷⣿⣿⣟⠝⠀⠀
⠀⠀⠀⠈⠢⣀⣸⢳⠛⡄⠀⠀⠀⠁⠀⣧⡀⢸⡽⠗⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠈⠳⡄⠁⢠⠀⠀⠋⢱⢿⣷⡿⠁⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⡿⠀⢀⠐⠀⢭⣭⣽⣩⡇⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣴⡇⠑⢬⣀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢀⠎⠹⡕⠠⢀⣈⠻⢿⣿⣿⣷⣄⠀⠀⠀⠀⠀⠀
⠀⣀⠤⠒⠒⡇⠀⠀⠈⠢⣔⣭⣙⣛⣿⣽⣇⡏⣣⣀⠀⠀⠀⠀
⠉⠀⠀⠀⠀⠘⡄⠀⠀⣠⠴⡟⠍⡻⠟⣿⠘⣷⣇⢧⡉⠉⠉⠁
⠀⠀⠀⠀⠀⠀⣇⣠⠾⠃⠀⠓⠤⢔⣄⢣⠃⡇⣿⠚⠉⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⠉⢧⠁⡇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠃⠀⠛⠀⠀⠀⠀⠀⠀`;

const FOOTER_STYLES = `
@font-face {
  font-family: "Okkergokker Footer Courier";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("https://cdn.jsdelivr.net/fontsource/fonts/courier-prime@latest/latin-400-normal.woff2") format("woff2");
}

@font-face {
  font-family: "Okkergokker Footer Courier";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url("https://cdn.jsdelivr.net/fontsource/fonts/courier-prime@latest/latin-700-normal.woff2") format("woff2");
}

.okkergokker-footer {
  --okkergokker-footer-bg: #ffdf58;
  --okkergokker-footer-text: rgba(122, 116, 108, 0.5);
  --okkergokker-footer-art: #000000;
  --okkergokker-footer-link: rgba(122, 116, 108, 0.5);
  --okkergokker-footer-font: "Okkergokker Footer Courier", "Courier Prime", Courier, monospace;

  box-sizing: border-box;
  margin: 0;
  padding: 0.5rem 1rem max(0.5rem, env(safe-area-inset-bottom, 0px));
  background: var(--okkergokker-footer-bg);
  color: var(--okkergokker-footer-text);
  font-family: var(--okkergokker-footer-font);
  font-size: 0.875rem;
  line-height: 1.25rem;
  text-align: center;
}

.okkergokker-footer *,
.okkergokker-footer *::before,
.okkergokker-footer *::after {
  box-sizing: border-box;
}

.okkergokker-footer__art-wrap {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  height: 8.5rem;
  max-width: 100%;
  margin: 0 auto;
  overflow: hidden;
  color: var(--okkergokker-footer-art);
}

.okkergokker-footer__art {
  margin: 0;
  padding: 0;
  border: 0;
  font-family: var(--okkergokker-footer-font);
  font-size: 1rem;
  line-height: 1;
  white-space: pre;
  transform: translateY(-0.5rem) scale(0.48, 0.57);
  transform-origin: top center;
}

.okkergokker-footer__line {
  margin: 0.5rem 0 0;
}

.okkergokker-footer__link {
  display: inline-block;
  padding: 0.25rem 0;
  color: var(--okkergokker-footer-link);
  text-decoration: none;
}

.okkergokker-footer__link:hover {
  text-decoration: underline;
  text-underline-offset: 2px;
}

@media (min-width: 640px) {
  .okkergokker-footer {
    padding: 0.5rem 1.5rem 1.5rem;
  }

  .okkergokker-footer__art-wrap {
    height: 12rem;
  }

  .okkergokker-footer__art {
    transform: translateY(-0.75rem) scale(0.66, 0.75);
  }

  .okkergokker-footer__link {
    padding: 0;
  }
}
`;

export type OkkergokkerFooterProps = {
  creditsPrefix?: string;
  creditsHref?: string;
  creditsLinkText?: string;
  backgroundColor?: string;
  textColor?: string;
  artColor?: string;
  linkColor?: string;
  footerStyle?: CSSProperties;
};

export function OkkergokkerFooter({
  creditsPrefix = "This website rides with ",
  creditsHref = "https://okkergokker.dk",
  creditsLinkText = "okkergokker.dk",
  backgroundColor,
  textColor,
  artColor,
  linkColor,
  footerStyle,
}: OkkergokkerFooterProps) {
  const style = {
    ...(backgroundColor ? { "--okkergokker-footer-bg": backgroundColor } : {}),
    ...(textColor ? { "--okkergokker-footer-text": textColor } : {}),
    ...(artColor ? { "--okkergokker-footer-art": artColor } : {}),
    ...(linkColor ? { "--okkergokker-footer-link": linkColor } : {}),
    ...footerStyle,
  } as CSSProperties;

  return (
    <>
      <style>{FOOTER_STYLES}</style>
      <footer className="okkergokker-footer" style={style}>
        <div className="okkergokker-footer__art-wrap" aria-hidden="true">
          <pre className="okkergokker-footer__art">{FOOTER_ART}</pre>
        </div>
        <p className="okkergokker-footer__line">
          {creditsPrefix}
          <a
            className="okkergokker-footer__link"
            href={creditsHref}
            target="_blank"
            rel="noreferrer"
          >
            {creditsLinkText}
          </a>
        </p>
      </footer>
    </>
  );
}
