const E2E_AUTH_STORAGE_KEY = "chatbot:e2e-user";

const defaultAuthUser = {
  uid: "e2e-auth-user",
  email: "admin@example.com",
  displayName: "Admin E2E",
};

const defaultBackendUser = {
  id: "backend-user-1",
  firebase_uid: defaultAuthUser.uid,
  email: defaultAuthUser.email,
  name: "Admin E2E",
};

Cypress.Commands.add("visitAsGuest", (path = "/login") => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.removeItem(E2E_AUTH_STORAGE_KEY);
    },
  });
});

Cypress.Commands.add("visitAsUser", (path = "/", user = defaultAuthUser) => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem(E2E_AUTH_STORAGE_KEY, JSON.stringify(user));
    },
  });
});

Cypress.Commands.add("mockBackendUser", (backendUser = defaultBackendUser) => {
  cy.intercept("GET", "/api/users/", [backendUser]).as("getUsers");
});

Cypress.Commands.add("mockChatHistory", (chats = []) => {
  cy.intercept("GET", "/api/chat/listarchats*", chats).as("listChats");
});
