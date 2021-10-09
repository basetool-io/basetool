describe("Login Test", () => {
  before(() => {
    cy.seed()
  })

  it("should take user to login page", () => {
    cy.visit("/auth/login");
    cy.get("h2.mt-6.text-center.text-3xl.font-extrabold.text-gray-900").should(
      "have.text",
      "Sign in to your account"
    );
  });

  it("should redirect unauthenticated user to login page", () => {
    cy.visit("/");
    cy.url().should("contain", "/auth/login");
  });
});
