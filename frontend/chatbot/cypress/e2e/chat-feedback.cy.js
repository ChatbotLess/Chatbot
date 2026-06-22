describe("feedback do chat", () => {
  it("registra like e dislike com justificativa", () => {
    cy.fixture("users").then(({ authUser, backendUser }) => {
      cy.fixture("chats").then((chats) => {
        cy.mockBackendUser(backendUser);
        cy.mockChatHistory(chats.history);
        cy.intercept("GET", "/api/chat/listarmensagem*", chats.existingMessages).as(
          "listMessages"
        );
        cy.intercept("GET", "/api/chat/listarfeedback*", chats.feedbacks).as(
          "listFeedbacks"
        );
        cy.intercept("POST", "/api/chat/mensagens/*/feedback", (req) => {
          const messageId = req.url.split("/mensagens/")[1].split("/feedback")[0];

          expect(messageId).to.eq("302");

          req.reply({
            statusCode: 200,
            body: {
              id: "feedback-1",
              mensagem: 302,
              tipo: req.body.tipo,
              mensagem_feedback: req.body.mensagem_feedback,
            },
          });
        }).as("saveFeedback");

        cy.visitAsUser("/chat/chat-1", authUser);
        cy.wait("@listMessages");

        cy.get("[data-cy=message-user]").should(
          "contain",
          "Explique a base de conhecimento."
        );
        cy.get("[data-cy=message-assistant]").should(
          "contain",
          "A base de conhecimento guarda documentos"
        );

        cy.get("[data-cy=feedback-like]").click();
        cy.wait("@saveFeedback").its("request.body").should("deep.equal", {
          tipo: "LIKE",
          mensagem_feedback: "",
        });

        cy.get("[data-cy=feedback-dislike]").click();
        cy.get("[data-cy=feedback-modal]").should("be.visible");
        cy.get("[data-cy=feedback-submit]").click();
        cy.get("[data-cy=feedback-error]").should(
          "contain",
          "Descreva rapidamente o motivo do dislike."
        );

        cy.get("[data-cy=feedback-text]").type("A resposta ficou incompleta.");
        cy.get("[data-cy=feedback-submit]").click();
        cy.wait("@saveFeedback").its("request.body").should("deep.equal", {
          tipo: "DISLIKE",
          mensagem_feedback: "A resposta ficou incompleta.",
        });
        cy.get("[data-cy=feedback-modal]").should("not.exist");
      });
    });
  });
});
