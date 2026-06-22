const privateRoutes = [
  "/",
  "/dashboard",
  "/upload",
  "/base-conhecimento",
  "/chat/chat-1",
];

describe("autenticacao e rotas", () => {
  privateRoutes.forEach((route) => {
    it(`redireciona visitante de ${route} para o login`, () => {
      cy.visitAsGuest(route);

      cy.location("pathname").should("eq", "/login");
      cy.get("[data-cy=login-form]").should("be.visible");
    });
  });

  it("redireciona usuario autenticado para fora das rotas publicas", () => {
    cy.fixture("users").then(({ authUser, backendUser }) => {
      cy.mockBackendUser(backendUser);
      cy.mockChatHistory();

      cy.visitAsUser("/login", authUser);
      cy.location("pathname").should("eq", "/");
      cy.get("[data-cy=new-chat-page]").should("be.visible");

      cy.visitAsUser("/signup", authUser);
      cy.location("pathname").should("eq", "/");
      cy.get("[data-cy=new-chat-page]").should("be.visible");
    });
  });

  it("permite navegar entre login, cadastro e reset de senha", () => {
    cy.visitAsGuest("/login");

    cy.get("[data-cy=signup-link]").click();
    cy.location("pathname").should("eq", "/signup");
    cy.get("[data-cy=signup-form]").should("be.visible");

    cy.get("[data-cy=signup-back]").click();
    cy.location("pathname").should("eq", "/login");

    cy.get("[data-cy=forgot-password-link]").click();
    cy.location("pathname").should("eq", "/reset");
    cy.get("[data-cy=reset-email-form]").should("be.visible");
  });
});
