
describe('WritingSidebar Component', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('sectionAttempts', JSON.stringify({
        introduction: 3,
        analysis: 3,
        conclusion: 3
      }));
    });
    
    cy.intercept('GET', '**/api/sections*', {
      statusCode: 200,
      body: {}
    }).as('getSectionsData');
    
    cy.visit('/writing');
    
    cy.get('.w-72.border-l.bg-gray-50').should('be.visible');
  });

  it('displays initial state correctly with no feedback data', () => {
    cy.contains('button', 'Submit').scrollIntoView().should('be.visible');
    
    cy.contains('attempts remaining').scrollIntoView().should('be.visible');
    
    cy.contains('Submit your').should('be.visible');
    cy.contains('to receive detailed feedback and scoring').should('be.visible');
  });

  it('decreases attempts when submission button is clicked', () => {
    cy.contains(/attempts remaining/i).scrollIntoView().should('be.visible');
    
    cy.intercept('POST', '**/submit-writing*', {
      statusCode: 200,
      body: { message: 'Submission successful' }
    }).as('submitRequest');
    cy.contains('button', 'Submit').scrollIntoView().click();
    
    cy.wait('@submitRequest');
    
    cy.contains(/2 attempts remaining/i, { timeout: 5000 }).scrollIntoView().should('be.visible');
    
    cy.window().then((win) => {
      const attempts = JSON.parse(win.localStorage.getItem('sectionAttempts'));
      expect(attempts.introduction).to.equal(2);
    });
  });


  it('displays section scores when available', () => {
    const mockSectionsData = {
      introduction: {
        grade: 7.5,
        feedback: { strengths: ['Good overview'] }
      },
      analysis: {
        grade: 6.0,
        feedback: { strengths: ['Clear points'] }
      },
      conclusion: {
        grade: 6.5,
        feedback: { strengths: ['Good summary'] }
      }
    };
    
    cy.intercept('GET', '**/api/sections-data*', {
      statusCode: 200,
      body: mockSectionsData
    }).as('getSectionsData');
    
    cy.visit('/writing');
    
    cy.window().then(win => {
      cy.stub(win, 'fetch')
        .withArgs(Cypress.sinon.match(/sections-data/))
        .resolves({
          ok: true,
          json: () => Promise.resolve(mockSectionsData)
        });
      
      if (win.setTestSectionsData) {
        win.setTestSectionsData(mockSectionsData);
      }
    });
    
    cy.reload();
    
    cy.window().then(win => {
      win.document.dispatchEvent(new CustomEvent('test:set-sections-data', { 
        detail: mockSectionsData 
      }));
    });
    
    cy.contains('Overall Progress').should('exist');
    
    cy.get('.w-72.border-l.bg-gray-50').within(() => {
      cy.get('[class*="font-semibold"]').should('exist');
      cy.get('[class*="text-gray-800"]').should('exist');
    });
  });

  it('renders feedback analysis cards when feedback data is provided', () => {
    const mockFeedbackData = {
      grade: 6.5,
      ielts_score: 6.5,
      grammar_analysis: {
        overall_score: 7.0,
        feedback: { 
          strengths: ['Good grammar usage'], 
          improvements: ['Watch verb tenses'] 
        },
        sentence_analysis: []
      },
      lexical_analysis: {
        overall_score: 6.0,
        detailed_analysis: {
          lexical_diversity: {
            unique_words: 120,
            diversity_ratio: 0.65
          }
        },
        feedback: { 
          strengths: ['Good vocabulary range'], 
          improvements: ['Use more academic terms'] 
        }
      },
      task_achievement_analysis: {
        band_score: 6.5,
        feedback: {
          strengths: ['Addresses all parts of task'],
          improvements: ['Develop ideas more fully']
        }
      },
      coherence_analysis: {
        overall_score: 6.5,
        feedback: {
          strengths: ['Logical progression'],
          improvements: ['Use more cohesive devices']
        }
      }
    };
    cy.intercept('POST', '**/submit-writing*', {
      statusCode: 200,
      body: mockFeedbackData,
      delay: 100 
    }).as('submitWriting');
    
    cy.contains('button', 'Submit').scrollIntoView().click();
    
    cy.wait('@submitWriting');
    
    cy.contains('Vocabulary & Word Choice', { timeout: 10000 }).scrollIntoView().should('be.visible');
    cy.contains('Task Achievement', { timeout: 10000 }).scrollIntoView().should('be.visible');
    cy.contains('Coherence & Cohesion', { timeout: 10000 }).scrollIntoView().should('be.visible');
    
    cy.contains('Unique Words').scrollIntoView().should('be.visible');
    cy.get('.bg-gray-50.p-3.rounded-lg').should('be.visible');
  });

  it('opens feedback modals when "View Details" is clicked', () => {
    const mockFeedbackData = {
      grade: 6.5,
      grammar_analysis: {
        overall_score: 7.0,
        feedback: { 
          strengths: ['Good grammar usage'], 
          improvements: ['Watch verb tenses'] 
        },
        sentence_analysis: []
      },
      lexical_analysis: {
        overall_score: 6.0,
        detailed_analysis: {
          lexical_diversity: {
            unique_words: 120,
            diversity_ratio: 0.65
          }
        },
        feedback: { 
          strengths: ['Good vocabulary range'], 
          improvements: ['Use more academic terms'] 
        }
      }
    };
    
    cy.intercept('POST', '**/submit-writing*', {
      statusCode: 200,
      body: mockFeedbackData,
      delay: 100 
    }).as('submitWriting');
    
    cy.contains('button', 'Submit').scrollIntoView().click();
    cy.wait('@submitWriting');
    
    cy.contains('Vocabulary & Word Choice', { timeout: 10000 }).scrollIntoView().should('be.visible');
    
    cy.contains('View Details').scrollIntoView().click({ force: true });
    
    cy.get('div[class*="modal"], div[class*="dialog"], div[class*="fixed"]')
      .should('be.visible');
    
    cy.get('button:contains("Close"), button:contains("✕"), [aria-label="Close"]')
      .first()
      .click();
    
    cy.contains('Vocabulary & Word Choice').should('be.visible');
  });

});