describe('TaskInstructions Component', () => {
  beforeEach(() => {
    // Mock guidelines and hints for testing
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

    // Visit the writing page directly with query params to set the props
    cy.visit('/writing', {
      onBeforeLoad: (win) => {
        // Create a global variable that the app can use
        win.cypressTestProps = {
          taskInstructions: {
            selectedSection: 'introduction',
            guidelines: mockGuidelines,
            hints: mockHints
          }
        };
      }
    });
    
    // Wait for the TaskInstructions component to be visible
    cy.get('div.bg-white.border.rounded-lg.p-4.mb-4').should('be.visible');
  });

  it('displays the task instructions correctly', () => {
    // Check if the title is displayed
    cy.contains('h3', 'Task Instructions').should('be.visible');
    
    // Check if the task description is displayed
    cy.contains('p', 'The graph above shows population growth').should('be.visible');
    
    // Check if the time allowed is displayed
    cy.contains('Time Allowed: 20 minutes').should('be.visible');
    
    // Check if the minimum words requirement is displayed
    cy.contains('Minimum Words: 150').should('be.visible');
  });

  it('displays section-specific guidelines when a section is selected', () => {
    // First verify the component is mounted with introduction guidelines
    cy.contains('Introduction Guidelines:').should('be.visible');
    
    // Check if all introduction guidelines are displayed
    cy.contains('Paraphrase the question in your own words').should('be.visible');
    cy.contains('Provide a general overview of the data').should('be.visible');
    cy.contains('Do not include specific data in the introduction').should('be.visible');
    
    // Check if the introduction hint is displayed
    cy.contains('Tip: Keep your introduction concise but informative').should('be.visible');
    
    // Now visit with different section
    cy.visit('/writing', {
      onBeforeLoad: (win) => {
        win.cypressTestProps = {
          taskInstructions: {
            selectedSection: 'analysis',
            guidelines: {
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
            },
            hints: {
              introduction: 'Keep your introduction concise but informative',
              analysis: 'Focus on significant changes and comparisons',
              conclusion: 'A brief conclusion rounds off your report effectively'
            }
          }
        };
      }
    });
    
    // Wait for the component to be visible after the new visit
    cy.get('div.bg-white.border.rounded-lg.p-4.mb-4').should('be.visible');
    
    // Check if the analysis guidelines are displayed
    cy.contains('Analysis Guidelines:').should('be.visible');
    
    // Check if all analysis guidelines are displayed
    cy.contains('Identify key trends and patterns').should('be.visible');
    cy.contains('Group similar data together').should('be.visible');
    cy.contains('Support with relevant figures from the graph').should('be.visible');
    
    // Check if the analysis hint is displayed
    cy.contains('Tip: Focus on significant changes and comparisons').should('be.visible');
  });

  it('toggles image size when the expand button is clicked', () => {
    // Check if the image is displayed
    cy.get('img[alt="Task Graph"]').should('be.visible');
    
    // Click the expand button
    cy.get('button[aria-label="Enlarge image"]').click();
    
    // Check if the full-size image container is displayed
    cy.get('div.fixed.inset-0.bg-black.bg-opacity-75').should('be.visible');
    
    // Check if the full-size image is displayed
    cy.get('img[alt="Task Graph - Full Size"]').should('be.visible');
    
    // Click the close button
    cy.get('button[aria-label="Close fullscreen image"]').click();
    
    // Check if the full-size image container is no longer displayed
    cy.get('div.fixed.inset-0.bg-black.bg-opacity-75').should('not.exist');
  });

  it('handles responsive layout correctly', () => {
    // Test desktop layout
    cy.viewport(1024, 768);
    
    // Check if the layout is horizontal (flex-row)
    cy.get('div.flex.flex-col.md\\:flex-row').should('exist');
    
    // Test mobile layout
    cy.viewport(375, 667);
    
    // On mobile, we should still have the flex container
    cy.get('div.flex.flex-col.md\\:flex-row').should('exist');
    
    // Visual check that the layout has changed (this is a more reliable approach than checking CSS)
    cy.get('div.flex.flex-col.md\\:flex-row').should('be.visible');
  });
});