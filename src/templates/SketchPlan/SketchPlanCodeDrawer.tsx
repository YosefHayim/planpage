import type { SketchCode } from "../../contracts/sketchScene";

export interface SketchPlanCodeDrawerProps {
  readonly code: SketchCode;
}

const CODE_TABS = [
  { key: "pseudo", label: "Pseudo" },
  { key: "diff", label: "Diff" },
  { key: "docs", label: "Docs" },
] as const;

export const SketchPlanCodeDrawer = ({ code }: SketchPlanCodeDrawerProps) => {
  const shownTabs = CODE_TABS.filter((tab) => code[tab.key] !== undefined);
  return (
    <div class="sketch-code" data-sketch-code="" hidden>
      <div class="sketch-code-tabs" role="tablist">
        {shownTabs.map((tab, tabIndex) => {
          const isSelectedTab = tabIndex === 0;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              class="sketch-code-tab"
              data-sketch-code-tab=""
              data-key={tab.key}
              aria-selected={isSelectedTab ? "true" : "false"}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {shownTabs.map((tab, tabIndex) => {
        const isSelectedTab = tabIndex === 0;
        return (
          <pre
            key={tab.key}
            class="sketch-code-body"
            data-sketch-code-body=""
            data-key={tab.key}
            hidden={!isSelectedTab}
          >
            {code[tab.key]}
          </pre>
        );
      })}
    </div>
  );
};
