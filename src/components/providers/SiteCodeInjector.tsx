"use client";

import { useEffect } from "react";

const installHtml = (target: HTMLElement, html: string) => {
  if (!html.trim()) return () => undefined;

  const template = document.createElement("template");
  template.innerHTML = html;

  template.content.querySelectorAll("script").forEach((source) => {
    const script = document.createElement("script");
    Array.from(source.attributes).forEach((attribute) => script.setAttribute(attribute.name, attribute.value));
    if (!source.hasAttribute("async")) script.async = false;
    script.textContent = source.textContent;
    source.replaceWith(script);
  });

  const installedNodes = Array.from(template.content.childNodes);
  target.appendChild(template.content);
  return () => installedNodes.forEach((node) => node.parentNode?.removeChild(node));
};

export default function SiteCodeInjector({ headerHtml, footerHtml }: { headerHtml: string; footerHtml: string }) {
  useEffect(() => {
    const removeHeader = installHtml(document.head, headerHtml);
    const removeFooter = installHtml(document.body, footerHtml);
    return () => { removeHeader(); removeFooter(); };
  }, [footerHtml, headerHtml]);

  return null;
}
