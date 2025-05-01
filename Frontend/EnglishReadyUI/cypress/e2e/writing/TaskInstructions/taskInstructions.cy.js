describe('TaskInstructions Component', () => {
  beforeEach(() => {
    const mockGuidelines = {
      introduction: [
        'Paraphrase the question in your own words',
        'Provide a general overview of the data',
        'Do not include specific data in the introduction'
      ],
      analysis: [
        'Identify key trends and patterns',
        'Group similar data together',
        'Support with relevant figures from the graph'
      ],
      conclusion: [
        'Summarize the main trends',
        'Do not introduce new data',
        'End with a general statement about the information'
      ]
    };

    const mockHints = {
      introduction: 'Keep your introduction concise but informative',
      analysis: 'Focus on significant changes and comparisons',
      conclusion: 'A brief conclusion rounds off your report effectively'
    };

    cy.visit('/writing', {
      onBeforeLoad: (win) => {
        win.cypressTestProps = {
          taskInstructions: {
            selectedSection: 'introduction',
            guidelines: mockGuidelines,
            hints: mockHints
          }
        };
      }
    });

    cy.get('div.bg-white.border.rounded-lg.p-4.mb-4').should('be.visible');
  });

  it('displays the task instructions correctly', () => {
    cy.contains('h3', 'Task Instructions').should('be.visible');
    cy.contains('p', 'The graph above shows population growth').should('be.visible');
    cy.contains('Time Allowed: 20 minutes').should('be.visible');
    cy.contains('Minimum Words: 150').should('be.visible');
  });

  it('toggles image size when the expand button is clicked', () => {
    cy.get('img[alt="Task Graph"]').should('be.visible');
    cy.get('button[aria-label="Enlarge image"]').click();
    cy.get('div.fixed.inset-0.bg-black.bg-opacity-75').should('be.visible');
    cy.get('img[alt="Task Graph - Full Size"]').should('be.visible');
    cy.get('button[aria-label="Close fullscreen image"]').click();
    cy.get('div.fixed.inset-0.bg-black.bg-opacity-75').should('not.exist');
  });

  it('handles responsive layout correctly', () => {
    cy.viewport(1024, 768);
    cy.get('div.flex.flex-col.md\\:flex-row').should('exist');

    cy.viewport(375, 667);
    cy.get('div.flex.flex-col.md\\:flex-row').should('exist');
    cy.get('div.flex.flex-col.md\\:flex-row').should('be.visible');
  });
});
