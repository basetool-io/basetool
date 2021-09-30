Cypress.Commands.add("login", (options) => {
  // Tell cypress to not clear the nextjs auth cookie after each test
  Cypress.Cookies.defaults({
    preserve: Cypress.env("COOKIE_NAME"),
  });

  // Get the auth cookie
  cy.getCookie(Cypress.env("COOKIE_NAME")).then((cookie) => {
    // If there's no cookie set, we must log in
    if (!cookie || !cookie.value) {
      // Get the user
      cy.fixture("user.json").then((defaultUser) => {
        const user = options?.user || defaultUser;
        const { email, password } = user;

        cy.visit("/auth/login");

        // Set up interceptor for login set up
        cy.intercept("POST", "/api/auth/callback/credentials?").as(
          "authenticate"
        );

        // Fill in form
        cy.get("[name=email]").should("be.visible").type(email);
        cy.get("[name=password]").should("be.visible").type(password);
        cy.get('button[type="submit"]').should("be.visible").click();

        // wait for the login response
        cy.wait("@authenticate");
        cy.get("@authenticate").then((xhr) => {
          expect(xhr.response.statusCode).to.eq(200);
        });
      });
    }
  });
});

Cypress.Commands.add("seed", (options = {}) => {
  cy.fixture("user.json").then((defaultUser) => {
    const user = options?.user || defaultUser;

    cy.request({
      url: "/api/test/seed",
      method: "POST",
      body: {
        user,
      },
    }).then(() => cy.log("Seeded database"));
  });
});

Cypress.Commands.add("seedDataSource", (options = {}) => {
  cy.fixture("user.json").then((defaultUser) => {
    const user = options?.user || defaultUser;

    cy.request({
      url: "/api/test/seed",
      method: "POST",
      body: {
        user,
      },
    }).then(() => cy.log("Seeded database"));
  });
});
