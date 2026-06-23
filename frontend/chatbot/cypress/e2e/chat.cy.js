describe("chat", () => {
  it("abre nova conversa, envia mensagem em streaming e renderiza resposta", () => {
    cy.fixture("users").then(({ authUser, backendUser }) => {
      cy.fixture("chats").then((chats) => {
        cy.mockBackendUser(backendUser);
        cy.mockChatHistory(chats.history);

        cy.intercept("GET", "/api/chat/listarmensagem*", chats.newMessages).as(
          "listMessages"
        );
        cy.intercept("GET", "/api/chat/listarfeedback*", chats.feedbacks).as(
          "listFeedbacks"
        );
        cy.intercept("POST", "/api/rag/message*", (req) => {
          const url = new URL(req.url);

          expect(url.searchParams.get("userid")).to.eq(null);
          expect(url.searchParams.get("message")).to.eq("Como funciona?");
          expect(req.headers.authorization).to.eq("Bearer e2e-token");

          req.reply({
            statusCode: 200,
            headers: {
              "Access-Control-Expose-Headers": "X-Chat-Id",
              "Content-Type": "text/plain",
              "X-Chat-Id": chats.newChatId,
            },
            body: "Resposta gerada pelo teste.",
          });
        }).as("sendMessage");

        cy.visitAsUser("/", authUser);

        cy.get("[data-cy=sidebar]").should("be.visible");
        cy.get("[data-cy=chat-history-item]").should("contain", "Conversa antiga");
        cy.get("[data-cy=prompt-input]").should("not.be.disabled").type("Como funciona?");
        cy.get("[data-cy=prompt-submit]").click();

        cy.wait("@sendMessage");
        cy.location("pathname").should("eq", `/chat/${chats.newChatId}`);
        cy.wait("@listMessages");

        cy.get("[data-cy=message-user]").should("contain", "Como funciona?");
        cy.get("[data-cy=message-assistant]").should(
          "contain",
          "Resposta gerada pelo teste."
        );
        cy.get("[data-cy=message-sources-toggle]").should("contain", "Fontes");
        cy.get("[data-cy=message-sources-list]").should("not.exist");
        cy.get("[data-cy=message-sources-toggle]").click();
        cy.get("[data-cy=message-sources-list]").should(
          "contain",
          "manual-institucional.pdf"
        );
      });
    });
  });
});
