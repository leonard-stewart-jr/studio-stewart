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

  return (
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
          <span aria-hidden="true">⌄</span>
        </button>
      </div>

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

        .collapsible-subnav-content {
          width: min(1600px, 95vw);
          height: 44px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .collapsible-subnav-handle {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 42px;
          height: 19px;
          padding: 0;
          border: 0;
          border-radius: 0 0 10px 10px;
          background: rgba(255,255,255,.96);
          box-shadow: 0 4px 10px rgba(0,0,0,.10);
          color: #b8b5ae;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: color .18s ease, box-shadow .18s ease, background .18s ease;
        }

        .collapsible-subnav-handle span {
          display: block;
          font-size: 18px;
          line-height: 1;
          transform: translateY(-3px) rotate(0deg);
          transform-origin: 50% 50%;
          transition: transform .24s ease;
        }

        .collapsible-subnav.is-open .collapsible-subnav-handle span {
          transform: translateY(2px) rotate(180deg);
        }

        .collapsible-subnav-handle:hover,
        .collapsible-subnav-handle:focus-visible {
          color: #e5c19f;
          background: #fff;
          box-shadow: 0 5px 14px rgba(0,0,0,.14);
          outline: none;
        }

        .collapsible-subnav-handle.is-attention {
          animation: secondary-nav-hint .9s ease-in-out 3;
        }

        @keyframes secondary-nav-hint {
          0%, 100% {
            color: #b8b5ae;
            box-shadow: 0 4px 10px rgba(0,0,0,.10);
          }
          50% {
            color: #e5c19f;
            box-shadow: 0 5px 15px rgba(229,193,159,.46);
          }
        }

        @media (max-width: 700px) {
          .collapsible-subnav-content {
            width: calc(100% - 24px);
          }

          .collapsible-subnav-handle {
            width: 38px;
            height: 18px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .collapsible-subnav-panel,
          .collapsible-subnav-handle span {
            transition: none;
          }

          .collapsible-subnav-handle.is-attention {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
