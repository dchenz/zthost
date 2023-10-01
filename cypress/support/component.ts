/// <reference types="cypress" />

import { mount } from "cypress/react18";

Cypress.Commands.add("mount", (...args) => {
  mount(...args);
});
