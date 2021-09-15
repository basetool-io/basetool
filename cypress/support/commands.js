// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("login", (options) => {
  cy.fixture('user.json').then((defaultUser) => {
    const user = options?.user || defaultUser
    const {email, password} = user

    cy.visit("/auth/login");

    cy.get("[name=email]").should("be.visible").type(email);
    cy.get("[name=password]").should("be.visible").type(password);
    cy.get('button[type="submit"]').should("be.visible").click();
  });
});

Cypress.Commands.add("seed", (options = {}) => {
  cy.fixture('user.json').then((defaultUser) => {
    const user = options?.user || defaultUser

    cy.request({
      url: '/api/test/seed',
      method: 'POST',
      body: {
        user
      },
    })
  })
});
