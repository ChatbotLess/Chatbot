describe("base de conhecimento", () => {
  beforeEach(() => {
    cy.fixture("users").then(({ backendUser }) => {
      cy.mockBackendUser(backendUser);
      cy.mockChatHistory();
    });
  });

  it("mostra estado vazio quando nao ha documentos", () => {
    cy.fixture("users").then(({ authUser }) => {
      cy.intercept("GET", "/api/base_conhecimento/listardocumentos", []).as(
        "listDocuments"
      );

      cy.visitAsUser("/base-conhecimento", authUser);
      cy.wait("@listDocuments");

      cy.get("[data-cy=knowledge-empty-state]").should(
        "contain",
        "Nenhum documento persistido foi encontrado."
      );
    });
  });

  it("mostra erro quando documentos nao carregam", () => {
    cy.fixture("users").then(({ authUser }) => {
      cy.intercept("GET", "/api/base_conhecimento/listardocumentos", {
        statusCode: 500,
        body: { detail: "Erro de teste" },
      }).as("listDocuments");

      cy.visitAsUser("/base-conhecimento", authUser);
      cy.wait("@listDocuments");

      cy.get("[data-cy=knowledge-error]").should(
        "contain",
        "Nao foi possivel carregar os documentos."
      );
    });
  });

  it("lista documentos persistidos com tipo, data e status", () => {
    cy.fixture("users").then(({ authUser }) => {
      cy.fixture("documents").then((documents) => {
        cy.intercept(
          "GET",
          "/api/base_conhecimento/listardocumentos",
          documents.items
        ).as("listDocuments");

        cy.visitAsUser("/base-conhecimento", authUser);
        cy.wait("@listDocuments");

        cy.get("[data-cy=knowledge-documents-count]").should("contain", "2 documentos");
        cy.get("[data-cy=knowledge-document]").should("have.length", 2);
        cy.get("[data-cy=knowledge-document]")
          .first()
          .should("contain", "rod-2026.pdf")
          .and("contain", "ROD")
          .and("contain", "13/05/2026")
          .and("contain", "CONCLUIDO");
        cy.get("[data-cy=knowledge-document]")
          .last()
          .should("contain", "portaria-123.pdf")
          .and("contain", "Portaria")
          .and("contain", "PROCESSANDO");
      });
    });
  });
});
