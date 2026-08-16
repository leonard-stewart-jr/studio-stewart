import { useEffect, useState } from "react";

export default function CollapsibleSubnav({ children, ariaLabel = "Secondary navigation" }) {
  const [open, setOpen] = useState(false);
  const [attention, setAttention] = useState(false);

  useEffect(() => {
    if (open) {
      setAttention(false);
      return undefined;
    }

    const hintTimer = window.setTimeout(() => setAttention(true), 2800);
    const stopTimer = window.setTimeout(() => setAttention(false), 6200);

    return () => {
      window.clearTimeout(hintTimer);
      window.clearTimeout(stopTimer);
    };
  }, [open]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    document.documentElement.style.setProperty("--secondary-nav-offset", open ? "44px" : "0px");

    return () => {
      document.documentElement.style.removeProperty("--secondary-nav-offset");
    };
  }, [open]);

  return (
    <>
      <div className={`collapsible-subnav${open ? " is-open" : ""}`} aria-label={ariaLabel}>
        <div className="collapsible-subnav-panel">
          <div className="collapsible-subnav-content">{children}</div>
          <button
            type="button"
            className={`collapsible-subnav-handle${attention ? " is-attention" : ""}`}
            aria-label={open ? "Close secondary navigation" : "Open secondary navigation"}
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={`collapsible-subnav-spacer${open ? " is-open" : ""}`} aria-hidden="true" />

      <style jsx global>{`
        .collapsible-subnav {
          position: fixed;
          top: 60px;
          left: 0;
          width: 100vw;
          height: 0;
          z-index: 1165;
          pointer-events: none;
        }

        .collapsible-subnav-panel {
          position: relative;
          width: 100%;
          height: 44px;
          background: rgba(255,255,255,.985);
          box-shadow: 0 3px 14px rgba(0,0,0,.10);
          transform: translateY(-44px);
          transition: transform .26s cubic-bezier(.22,.61,.36,1);
          pointer-events: auto;
        }

        .collapsible-subnav.is-open .collapsible-subnav-panel {
          transform: translateY(0);
        }

        .collapsible-subnav-spacer {
          width: 100%;
          height: 0;
          transition: height .26s cubic-bezier(.22,.61,.36,1);
          pointer-events: none;
        }

        .collapsible-subnav-spacer.is-open {
          height: 44px;
        }

        .collapsible-subnav-content {
          position: relative;
          width: 100vw;
          height: 44px;
          margin: 0;
          box-sizing: border-box;
        }

        /* Default: center the tab group itself. */
        .collapsible-subnav-content .isp-section-tabs {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          margin: 0;
        }

        /* For a two item subnav, center the VISIBLE GAP between the labels on
           the viewport center. Equal columns center the buttons, but because
           BUILDING and STORY have different text widths and active font sizes,
           that can still look off-center. These two buttons are instead pinned
           to opposite sides of the exact 50% centerline. */
        .collapsible-subnav-content .isp-section-tabs.tab-count-2 {
          left: 0;
          top: 0;
          transform: none;
          width: 100vw;
          height: 44px;
          min-height: 44px;
          margin: 0;
          padding: 0;
          display: block;
        }

        .collapsible-subnav-content .isp-section-tabs.tab-count-2 .isp-tab-btn {
          position: absolute;
          top: 0;
          width: auto;
          height: 44px;
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          white-space: nowrap;
        }

        .collapsible-subnav-content .isp-section-tabs.tab-count-2 .isp-tab-btn:first-child {
          right: calc(50% + 28px);
        }

        .collapsible-subnav-content .isp-section-tabs.tab-count-2 .isp-tab-btn:last-child {
          left: calc(50% + 28px);
        }

        .collapsible-subnav-handle {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 36px;
          height: 17px;
          padding: 0;
          border: 0;
          border-radius: 0;
          background: rgba(255,255,255,.58);
          box-shadow: 0 2px 7px rgba(0,0,0,.06);
          color: #b8b5ae;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          transition: color .18s ease, box-shadow .18s ease, background .18s ease;
        }

        .collapsible-subnav-handle span {
          display: block;
          width: 7px;
          height: 7px;
          border-right: 1px solid currentColor;
          border-bottom: 1px solid currentColor;
          transform: rotate(45deg) translate(-1px, -1px);
          transform-origin: 50% 50%;
          transition: transform .24s ease;
        }

        .collapsible-subnav.is-open .collapsible-subnav-handle span {
          transform: rotate(225deg) translate(-1px, -1px);
        }

        .collapsible-subnav-handle:hover,
        .collapsible-subnav-handle:focus-visible {
          color: #e5c19f;
          background: rgba(255,255,255,.78);
          box-shadow: 0 3px 9px rgba(0,0,0,.08);
          outline: none;
        }

        .collapsible-subnav-handle.is-attention {
          animation: secondary-nav-hint .9s ease-in-out 3;
        }

        @keyframes secondary-nav-hint {
          0%, 100% {
            color: #b8b5ae;
            box-shadow: 0 2px 7px rgba(0,0,0,.06);
          }
          50% {
            color: #e5c19f;
            box-shadow: 0 3px 10px rgba(229,193,159,.28);
          }
        }

        @media (max-width: 700px) {
          .collapsible-subnav-content .isp-section-tabs.tab-count-2 .isp-tab-btn:first-child {
            right: calc(50% + 22px);
          }

          .collapsible-subnav-content .isp-section-tabs.tab-count-2 .isp-tab-btn:last-child {
            left: calc(50% + 22px);
          }

          .collapsible-subnav-handle {
            width: 34px;
            height: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .collapsible-subnav-panel,
          .collapsible-subnav-spacer,
          .collapsible-subnav-handle span {
            transition: none;
          }

          .collapsible-subnav-handle.is-attention {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
