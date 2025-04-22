// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add('setWritingAreaSubmitting', (isSubmitting) => {
  cy.window().then((win) => {
    // This is a simplified example - in a real app you might use
    // a global function or event to modify component state for testing
    win.testHelpers = win.testHelpers || {};
    win.testHelpers.setWritingAreaSubmitting = (value) => {
      // Find the React component instance and update its state
      // This is pseudo-code and would need to be implemented based on your app structure
      const component = win.document.querySelector('[data-testid="writing-area"]').__reactInternalInstance;
      if (component) {
        component.setIsSubmitting(value);
      }
    };
    
    win.testHelpers.setWritingAreaSubmitting(isSubmitting);
  });
});

// Custom command to wait for the saving indicator to disappear
Cypress.Commands.add('waitForSaving', () => {
  cy.get('span').contains('Saving...').should('be.visible');
  cy.get('span').contains('Saving...').should('not.exist', { timeout: 2000 });
});