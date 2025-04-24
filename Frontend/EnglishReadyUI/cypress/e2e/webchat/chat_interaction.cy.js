describe('WebChat Component', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[class*="flex flex-col bg-gray-100"]', { timeout: 10000 }).should('be.visible');
  });

  it('should load the chat interface correctly', () => {
    cy.get('[class*="flex flex-col bg-gray-100"]').should('be.visible');
    
    cy.get('.flex-1.overflow-y-auto').should('be.visible');
    
    cy.get('.bg-gray-100.rounded-full').should('be.visible');
  });

  it('should have scrollable transcript area', () => {
    cy.get('.flex-1.overflow-y-auto')
      .should('have.css', 'overflow-y', 'auto');
  });

  it('should have proper layout structure', () => {
    cy.get('[class*="flex flex-col bg-gray-100"]').within(() => {
      cy.get('.flex-1.overflow-y-auto').should('be.visible');
      cy.get('.border-t').should('be.visible');
    });
  });

  it('should have a connectivity status indicator', () => {
    cy.get('.py-2.text-sm.text-gray-500.text-center').should('exist');
  });
});