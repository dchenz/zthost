/// <reference types="cypress" />

import type { MountOptions, MountReturn } from "cypress/react18";
import type { ReactNode } from "react";

declare global {
  namespace Cypress {
    interface Chainable {
      getGridViewItem(name: string): Chainable<JQuery<HTMLElement>>;
      getListViewItem(name: string): Chainable<JQuery<HTMLTableRowElement>>;
      getPathLink(name: string): Chainable<JQuery<HTMLElement>>;
      login(): Chainable<void>;
      mount(
        jsx: ReactNode,
        options?: MountOptions,
        rerenderKey?: string
      ): Chainable<MountReturn>;
    }
  }
}
