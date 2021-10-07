describe("Data Sources", () => {
  before(() => {
    Cypress.Cookies.defaults({
      preserve: Cypress.env("COOKIE_NAME"),
    });

    cy.seed();
    cy.login();
  });

  it("adds a new datasource", () => {
    cy.visit("/data-sources/postgresql/new");

    // Set up interceptor for login set up
    cy.intercept("POST", "/api/data-source?").as("create");

    const credUrl = "postgresql://adrian@127.0.0.1/avodemo_development";

    cy.get("[name=name]").type("Demo DB");
    cy.get("[name='credentials.url']").type(credUrl);
    cy.get("#credentials_useSsl-label").click();
    cy.get('button[type="submit"]')
      .should("be.visible")
      .click()
      .then((el) => {
        cy.get(el[0]).click()
      });

    cy.wait("@create");
    cy.get("@create").then((xhr) => {
      expect(xhr.response.statusCode).to.eq(200);
      cy.url().should(
        "eql",
        `${Cypress.config("baseUrl")}/data-sources/${xhr.response.body.data.id}`
      );
    });

    cy.contains('Data source created 🚀')
  });

  it.only("can see a datasource", () => {
    cy.seedDataSource()
    cy.visit("/");

    cy.contains("Avo Demo").click()
    cy.contains("Select a table to get started.")
    cy.contains(/^users$/).click()
    cy.contains("Browse records")
    cy.contains("Filters")
  });
});
