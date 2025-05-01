describe('WritingArea Component', () => {
  beforeEach(() => {
    cy.visit('/writing');
    
    cy.get('textarea').should('exist');
  });

  it('shows textarea for writing', () => {
    cy.get('textarea').should('be.visible');
    cy.get('textarea').should('have.attr', 'placeholder', 'Start writing your introduction here...');
  });

  it('allows text input and updates word and character counts', () => {
    const testText = 'This is a test sentence.';
    cy.get('textarea').clear().type(testText);
    
    cy.get('textarea').should('have.value', testText);
    
    cy.wait(100);
    
    cy.get('.absolute.bottom-2.right-3 span').last().should('contain', `${testText.length} chars`);
    
    cy.get('.absolute.bottom-2.right-3 span').eq(1).should('contain', '5 words');
  });

  it('displays "Saving..." indicator when text changes', () => {
    cy.get('textarea').clear().type('Testing saving indicator');
    
    cy.wait(100);
    
    cy.contains('Saving...').should('exist');
    
    cy.wait(1200);
    cy.contains('Saving...').should('not.exist');
  });

  it('toggles focus mode when textarea is focused and blurred', () => {
    cy.get('textarea').focus();
    
    cy.wait(100);
    
    cy.get('textarea').should('have.class', 'bg-blue-50');
    
    cy.get('textarea').blur();
    
    cy.wait(100);
    
    cy.get('textarea').should('have.class', 'bg-white');
  });

  it.skip('updates progress bar based on word count', () => {
    cy.get('textarea').clear();
    
    const fiftyWordsText = 'word '.repeat(50);
    cy.get('textarea').type(fiftyWordsText);
    
    cy.wait(100);
    
    cy.get('[role="progressbar"]').should('exist');
    cy.get('[role="progressbar"] div div').should('exist');
    
    const moreWords = 'word '.repeat(100);
    cy.get('textarea').type(moreWords);
    
    cy.wait(100);
    
    cy.contains('150 words').should('exist');
  });
 

  it('maintains text when typing multiple sentences', () => {
    cy.get('textarea').clear();
    
    const paragraph = 'This is a paragraph with multiple sentences. It should be maintained in the textarea. Let us see if this works correctly with the WritingArea component.';
    cy.get('textarea').type(paragraph);
    
    cy.get('textarea').should('have.value', paragraph);
  });
});