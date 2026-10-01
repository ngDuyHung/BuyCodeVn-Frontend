import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SiteCodeInjector from "./SiteCodeInjector";

describe("SiteCodeInjector", () => {
  it("installs header and footer HTML and removes it on unmount", () => {
    const { unmount } = render(<SiteCodeInjector
      headerHtml={'<meta name="site-code-test" content="enabled"><style data-site-code-test>.site-code-test{color:red}</style>'}
      footerHtml={'<div data-site-footer-test="true">Livechat</div>'}
    />);

    expect(document.head.querySelector('meta[name="site-code-test"]')).toHaveAttribute("content", "enabled");
    expect(document.head.querySelector("style[data-site-code-test]")).toBeInTheDocument();
    expect(document.body.querySelector('[data-site-footer-test="true"]')).toHaveTextContent("Livechat");

    unmount();
    expect(document.head.querySelector('meta[name="site-code-test"]')).not.toBeInTheDocument();
    expect(document.body.querySelector('[data-site-footer-test="true"]')).not.toBeInTheDocument();
  });
});
