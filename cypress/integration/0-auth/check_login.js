describe("Check login", () => {
  before(() => {
    cy.seed()
    cy.login();
  })

  it("should login", () => {
    cy.visit("/");
    cy.url().should("eql", `${Cypress.config('baseUrl')}/`);
  });
});
