const login = (options) => {
  // Get the user
  cy.fixture("user.json").then((defaultUser) => {
    const user = options?.user || defaultUser;
    const { email, password } = user;
    cy.wrap(signIn('credentials', { redirect: false, email, password }))
  });
};

Cypress.Commands.add("login", (options) => {
  // Tell cypress to not clear the nextjs auth cookie after each test
  Cypress.Cookies.defaults({
    preserve: Cypress.env("COOKIE_NAME"),
  });

  // Get the auth cookie
  cy.getCookie(Cypress.env("COOKIE_NAME")).then((cookie) => {
    // If there's no cookie set, we must log in
    if (cookie && cookie.value) {
      cy.request({
        url: "/api/auth/session",
        method: "GET",
      }).then((response) => {
        if (!response.body.user.email) {
          login(options);
        }
      });
    } else {
      login(options);
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
