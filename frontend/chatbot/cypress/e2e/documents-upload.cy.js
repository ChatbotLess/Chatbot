const pdfFile = (fileName) => ({
  contents: Cypress.Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF"),
  fileName,
  mimeType: "application/pdf",
});

describe("upload de documentos", () => {
  it("seleciona base, tipo e PDF; remove e envia documento", () => {
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
          expect(url.searchParams.get("user_id")).to.eq(null);
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
        cy.wait("@listKnowledgeBases");

        cy.get("[data-cy=base-select]").select(String(documents.bases[0].id));
        cy.get("[data-cy=document-type-select]").select("RESOLUCAO");
        cy.get("[data-cy=file-input]").selectFile(pdfFile("remover.pdf"), {
          force: true,
        });

        cy.get("[data-cy=selected-document]").should("contain", "remover.pdf");
        cy.get("[data-cy=selected-documents-count]").should("contain", "1 documento");

        cy.get("[data-cy=remove-document]").click();
        cy.get("[data-cy=upload-empty-state]").should("be.visible");

        cy.get("[data-cy=file-input]").selectFile(pdfFile("regimento.pdf"), {
          force: true,
        });
        cy.get("[data-cy=selected-document]").should("contain", "regimento.pdf");

        cy.get("[data-cy=upload-submit]").click();
        cy.wait("@uploadDocument");

        cy.get("[data-cy=upload-success]").should(
          "contain",
          "Documento enviado com sucesso!"
        );
        cy.get("[data-cy=upload-empty-state]").should("be.visible");
      });
    });
  });
});
