import React from "react";

/**
 * Generic SectionTabs
 * Props:
 * - items: array of { key, label } (required)
 * - active: string key of active item (controlled)
 * - onChange: function(key) called when a tab is activated
 * - variant: "top" | "sub" (controls wrapper/button classes)
 * - tabRefMap: optional { [key]: React.ref } to attach refs (used to anchor dropdowns)
 * - ariaLabel: optional string for the wrapper (tablist)
 */
export default function SectionTabs({
  items = [],
  active,
  onChange = () => {},
  variant = "top",
  tabRefMap = null,
  ariaLabel = undefined,
}) {
  const isTop = variant === "top";

  const wrapperClass = isTop ? "isp-section-tabs" : "isp-subnav-row";
  const btnClassBase = isTop ? "isp-tab-btn" : "isp-subnav-btn";

  function handleKeyDown(e, key) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(key);
    }
  }

  return (
    <div className={wrapperClass} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive = active === item.key;
        const className = `${btnClassBase}${isActive ? " active" : ""}`;
        const ref = tabRefMap && tabRefMap[item.key] ? tabRefMap[item.key] : undefined;
        return (
          <button
            key={item.key}
            ref={ref}
            className={className}
            onClick={() => onChange(item.key)}
            onKeyDown={(e) => handleKeyDown(e, item.key)}
            aria-current={isActive ? "page" : undefined}
            role="tab"
            tabIndex={0}
            // keep semantic label on the button itself in case ariaLabel omitted
            title={item.label}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
