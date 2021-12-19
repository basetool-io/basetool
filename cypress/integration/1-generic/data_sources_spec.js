describe("Add data sources", () => {
  before(() => {
    Cypress.Cookies.defaults({
      preserve: Cypress.env("COOKIE_NAME"),
    });

    cy.seed();
    cy.login();
  });

  it("adds a new datasource", () => {
    cy.visit("/data-sources/new");

    cy.get("[name='postgresql']").click();
    cy.contains("Next").click();

    // Set up interceptor for login set up
    cy.intercept("POST", "/api/data-source?").as("create");

    cy.get("[name=name]").type("Demo DB");

    // Open "Paste as URL" modal
    cy.contains("Paste from URL").click();
    cy.get("[name='credentialsAsURL']").type(Cypress.env('DATABASE_TEST_CREDENTIALS'));
    cy.contains("Apply").click();

    // "Paste as URL modal" closed
    cy.get("[name='credentialsAsURL']").should("not.exist");

    // Disable SSL
    cy.get("#credentials_useSsl-label").click();

    // Create data source
    cy.get('button[type="submit"]').should("be.visible").click();

    cy.wait("@create");
    cy.get("@create").then((xhr) => {
      expect(xhr.response.statusCode).to.eq(200);
      cy.url().should(
        "eql",
        `${Cypress.config("baseUrl")}/data-sources/${xhr.response.body.data.id}`
      );
    });

    cy.contains("Data source created 🚀");

    cy.contains("Create dashboard")
  });

  it("can see a datasource", () => {
    cy.visit("/");

    cy.contains("Avo Demo").click();
    cy.contains("This data source has");
    cy.contains(/^users$/).click();
    cy.contains("Users");
    cy.contains("Create view from this table");
  });
});
