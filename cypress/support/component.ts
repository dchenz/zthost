/// <reference types="cypress" />

import { mount } from "cypress/react18";

Cypress.Commands.add("mount", (...args) => {
  mount(...args);
});

Cypress.Commands.add("getGridViewItem", (name) => {
  return cy.contains('div[role="group"]', name);
});

Cypress.Commands.add("getListViewItem", (name) => {
  return cy.contains("tr", name);
});

Cypress.Commands.add("getPathLink", (name) => {
  return cy.get('[id="path-viewer"]').contains(name);
});
