/// <reference types="cypress" />

import type { MountOptions, MountReturn } from "cypress/react18";
import type { ReactNode } from "react";

declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
      mount(
        jsx: ReactNode,
        options?: MountOptions,
        rerenderKey?: string
      ): Chainable<MountReturn>;
    }
  }
}
