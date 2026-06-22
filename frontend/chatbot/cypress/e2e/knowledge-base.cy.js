describe("base de conhecimento", () => {
  beforeEach(() => {
    cy.fixture("users").then(({ backendUser }) => {
      cy.mockBackendUser(backendUser);
      cy.mockChatHistory();
    });
  });

  it("mostra estado vazio quando nao ha bases", () => {
    cy.fixture("users").then(({ authUser }) => {
      cy.intercept("GET", "/api/base_conhecimento/listarbase", []).as(
        "listKnowledgeBases"
      );

      cy.visitAsUser("/knowledge", authUser);
      cy.wait("@listKnowledgeBases");

      cy.get("[data-cy=knowledge-empty-state]").should(
        "contain",
        "Nenhuma base de conhecimento cadastrada"
      );
    });
  });

  it("mostra erro quando bases nao carregam", () => {
    cy.fixture("users").then(({ authUser }) => {
      cy.intercept("GET", "/api/base_conhecimento/listarbase", {
        statusCode: 500,
        body: { detail: "Erro de teste" },
      }).as("listKnowledgeBases");

      cy.visitAsUser("/knowledge", authUser);
      cy.wait("@listKnowledgeBases");

      cy.get("[data-cy=knowledge-error]").should(
        "contain",
        "Erro ao carregar as bases de conhecimento."
      );
    });
  });

  it("lista bases e documentos da base selecionada", () => {
    cy.fixture("users").then(({ authUser }) => {
      cy.fixture("documents").then((documents) => {
        cy.intercept("GET", "/api/base_conhecimento/listarbase", documents.bases).as(
          "listKnowledgeBases"
        );
        cy.intercept(
          "GET",
          "/api/base_conhecimento/listardocumentosbase*",
          documents.items
        ).as("listDocuments");

        cy.visitAsUser("/knowledge", authUser);
        cy.wait("@listKnowledgeBases");

        cy.get("[data-cy=knowledge-base-item]")
          .should("have.length", 1)
          .and("contain", "Base principal")
          .click();
        cy.wait("@listDocuments");

        cy.get("[data-cy=knowledge-documents-count]:visible").should("contain", "2 documentos");
        cy.get("[data-cy=knowledge-document]:visible").should("have.length", 2);
        cy.get("[data-cy=knowledge-document]:visible")
          .first()
          .should("contain", "rod-2026.pdf")
          .and("contain", "ROD")
          .and("contain", "CONCLUIDO");
        cy.get("[data-cy=knowledge-document]:visible")
          .last()
          .should("contain", "portaria-123.pdf")
          .and("contain", "PORTARIA")
          .and("contain", "PROCESSANDO");
      });
    });
  });
});
