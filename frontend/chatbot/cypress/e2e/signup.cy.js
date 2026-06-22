describe("cadastro", () => {
  it("cria usuario no auth fake e volta para login", () => {
    cy.visitAsGuest("/signup");

    cy.get("[data-cy=signup-name]").type("Novo Usuario");
    cy.get("[data-cy=signup-email]").type("novo.usuario@example.com");
    cy.get("[data-cy=signup-password]").type("senha-segura-123");
    cy.get("[data-cy=signup-confirm-password]").type("senha-segura-123");
    cy.get("[data-cy=signup-submit]").click();

    cy.location("pathname").should("eq", "/login");
    cy.get("[data-cy=login-form]").should("be.visible");
  });
});
