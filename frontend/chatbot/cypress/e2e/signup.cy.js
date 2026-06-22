describe("cadastro", () => {
  it("cria usuario no auth fake, registra no backend e volta para login", () => {
    cy.intercept("POST", "/api/users/User/", (req) => {
      expect(req.body).to.deep.equal({
        firebase_uid: "e2e-created-user",
        email: "novo.usuario@example.com",
        password: "senha-segura-123",
        name: "Novo Usuario",
      });

      req.reply({
        statusCode: 200,
        body: {
          id: "backend-user-created",
          firebase_uid: "e2e-created-user",
          email: "novo.usuario@example.com",
          name: "Novo Usuario",
        },
      });
    }).as("createBackendUser");

    cy.visitAsGuest("/signup");

    cy.get("[data-cy=signup-name]").type("Novo Usuario");
    cy.get("[data-cy=signup-email]").type("novo.usuario@example.com");
    cy.get("[data-cy=signup-password]").type("senha-segura-123");
    cy.get("[data-cy=signup-confirm-password]").type("senha-segura-123");
    cy.get("[data-cy=signup-submit]").click();

    cy.wait("@createBackendUser");
    cy.location("pathname").should("eq", "/login");
    cy.get("[data-cy=login-form]").should("be.visible");
  });
});
