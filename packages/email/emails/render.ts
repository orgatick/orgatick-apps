import { render, toPlainText } from "@react-email/render";
import { createElement, type ReactElement } from "react";

export interface RenderedEmail {
  html: string;
  /** Plain-text alternative, derived from the rendered HTML. */
  text: string;
}

/** A React Email template component, described structurally so callers need no React types. */
export type EmailTemplate<TProps extends object> = (props: TProps) => ReactElement;

/**
 * Renders a React Email template to HTML plus a plain-text alternative.
 *
 * Consumers on plain Node (the NestJS backend) call this instead of using JSX, so the
 * templates stay the single source of truth for both the React Email preview and the
 * production send path. `<Tailwind>` is resolved here, so callers always receive fully
 * inlined styles.
 */
export async function renderEmail<TProps extends object>(
  template: EmailTemplate<TProps>,
  props: TProps,
): Promise<RenderedEmail> {
  const html = await render(createElement(template, props));

  return { html, text: toPlainText(html) };
}
