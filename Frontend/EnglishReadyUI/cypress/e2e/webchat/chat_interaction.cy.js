describe('WebChat Component', () => {
    beforeEach(() => {
      cy.visit('/');
    });
  
    it('should load the chat interface', () => {
      cy.get('[class*="flex flex-col bg-gray-100"]').should('be.visible');
    });
  
    it('should allow sending a message', () => {
  cy.contains(/hi|hello|how can i help|welcome/i, { timeout: 10000 }) 
    .should('be.visible');

  cy.get('.bg-gray-100.rounded-full input', { timeout: 10000 })
  .should('be.visible')
  .should('not.be.disabled')
  .type('Hello from test{enter}');

  cy.contains('Hello, this is a test message').should('be.visible');
});

      
      
});