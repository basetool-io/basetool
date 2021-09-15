// login_spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test
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
    cy.visit("/data-sources");
    cy.url().should("contain", "/auth/login");
  });

  it("should login", () => {
    cy.login();

    cy.url().should("include", "/data-sources");
    cy.visit("/data-sources/new");
  });

  it.only("adds a new datasource", () => {
    cy.login();
    cy.visit("/data-sources/new");

    const credUrl = 'postgresql://adrian@127.0.0.1/avodemo_development'

    cy.get("[name=name]").type('Demo DB')
    cy.get("[name='credentials.url']").type(credUrl)
    cy.get("[name=type]").uncheck()
    cy.get('button[type="submit"]').click();
  });

  // beforeEach(() => {
  //   // reset and seed the database prior to every test
  //   cy.exec('yarn prisma migrate dev && yarn prisma db seed --preview-feature ')

  //   // seed a user in the DB that we can control from our tests
  //   // assuming it generates a random password for us
  //   cy.request('POST', '/test/seed/user', { username: 'jane.lane' })
  //     .its('body')
  //     .as('currentUser')
  // })

  // it('sets auth cookie when logging in via form submission', function () {
  //   // destructuring assignment of the this.currentUser object
  //   const { username, password } = this.currentUser

  //   cy.visit('/login')

  //   cy.get('input[name=username]').type(username)

  //   // {enter} causes the form to submit
  //   cy.get('input[name=password]').type(`${password}{enter}`)

  //   // we should be redirected to /dashboard
  //   cy.url().should('include', '/dashboard')

  //   // our auth cookie should be present
  //   cy.getCookie('your-session-cookie').should('exist')

  //   // UI should reflect this user being logged in
  //   cy.get('h1').should('contain', 'jane.lane')
  // })
});
