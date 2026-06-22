const pdfFile = (fileName) => ({
  contents: Cypress.Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF"),
  fileName,
  mimeType: "application/pdf",
});

describe("upload de documentos", () => {
  it("seleciona PDFs, remove item, altera tipo e envia documento", () => {
    cy.fixture("users").then(({ authUser, backendUser }) => {
      cy.fixture("documents").then((documents) => {
        cy.mockBackendUser(backendUser);
        cy.mockChatHistory();
        cy.intercept("GET", "/api/base_conhecimento/listarbase", documents.bases).as(
          "listKnowledgeBases"
        );
        cy.intercept("POST", "/api/base_conhecimento/upload*", (req) => {
          const url = new URL(req.url);

          expect(url.searchParams.get("base_id")).to.eq(String(documents.bases[0].id));
          expect(url.searchParams.get("user_id")).to.eq(backendUser.id);
          expect(url.searchParams.get("tipo")).to.eq("RESOLUCAO");

          req.reply({
            statusCode: 200,
            body: {
              id: "uploaded-doc-1",
              filename: "regimento.pdf",
              status: "PROCESSANDO",
            },
          });
        }).as("uploadDocument");

        cy.visitAsUser("/upload", authUser);

        cy.get("[data-cy=file-input]").selectFile(
          [pdfFile("regimento.pdf"), pdfFile("remover.pdf")],
          { force: true }
        );
        cy.get("[data-cy=selected-document]").should("have.length", 2);
        cy.get("[data-cy=selected-documents-count]").should("contain", "2 documentos");

        cy.get("[data-cy=document-type-select]").first().select("RESOLUCAO");
        cy.get("[data-cy=remove-document]").last().click();
        cy.get("[data-cy=selected-document]")
          .should("have.length", 1)
          .and("contain", "regimento.pdf");

        cy.get("[data-cy=upload-submit]").click();
        cy.wait("@listKnowledgeBases");
        cy.wait("@uploadDocument");

        cy.get("[data-cy=upload-success]").should(
          "contain",
          "Documentos enviados com sucesso."
        );
        cy.get("[data-cy=upload-empty-state]").should("be.visible");
      });
    });
  });
});
