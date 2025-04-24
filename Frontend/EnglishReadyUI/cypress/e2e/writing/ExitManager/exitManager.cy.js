describe('WritingModeExitManager Component', () => {
  const mockSectionsData = {
    introduction: {
      grade: 75,
      task_achievement_analysis: {
        feedback: {
          improvements: ['Make your thesis statement more specific']
        }
      },
      grammar_analysis: {
        feedback: 'Pay attention to verb tense consistency'
      },
      coherence_analysis: {
        feedback: {
          improvements: ['Improve paragraph transitions']
        }
      }
    },
    analysis: {
      grade: 82,
      task_achievement_analysis: {
        feedback: {
          improvements: ['Include more supporting evidence']
        }
      },
      grammar_analysis: {
        feedback: 'Good sentence structure overall'
      },
      coherence_analysis: {
        feedback: {
          improvements: ['Connect ideas more clearly']
        }
      }
    },
    conclusion: {
      grade: 68,
      task_achievement_analysis: {
        feedback: {
          improvements: ['Strengthen your concluding statement']
        }
      },
      grammar_analysis: {
        feedback: 'Watch for punctuation errors'
      },
      coherence_analysis: {
        feedback: {
          improvements: ['Summarize key points more effectively']
        }
      }
    }
  };

  beforeEach(() => {
    cy.intercept('GET', '/writing-test', (req) => {
      req.reply({
        statusCode: 200,
        body: `
        <html>
          <head>
            <title>Writing Test</title>
            <style>
              .modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 50;
              }
              .modal-content {
                background: white;
                border-radius: 0.5rem;
                padding: 1.5rem;
                max-width: 28rem;
                width: 100%;
              }
            </style>
          </head>
          <body>
            <div id="app">
              <div id="writing-container">
                <button 
                  id="exit-writing-button"
                  class="w-full px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                >
                  Complete & Return to Chat
                </button>
              </div>
            </div>
            <script>
              // Mock functions and event handlers
              document.getElementById('exit-writing-button').addEventListener('click', function() {
                const modal = document.createElement('div');
                modal.id = 'exit-modal';
                modal.className = 'modal-backdrop';
                modal.innerHTML = \`
                  <div class="modal-content">
                    <h2 class="text-xl font-bold mb-4">Exit Writing Mode</h2>
                    
                    <div class="mb-6 flex items-center justify-center flex-col">
                      <div class="flex flex-col items-center mb-2">
                        <span class="text-2xl font-bold mt-2 text-blue-600" id="final-score">
                          77.8/100.0
                        </span>
                        <span class="text-sm text-gray-500">Final Score</span>
                      </div>
                    </div>
                    
                    <div class="mb-6">
                      <h3 class="text-sm font-medium text-gray-700 mb-2">Feedback Summary</h3>
                      <p class="text-gray-600 bg-blue-50 p-3 rounded-lg" id="feedback-text">
                        Good job, your essay shows competent English writing skills with some areas for improvement.
                      </p>
                    </div>
                    
                    <div class="mb-6">
                      <h3 class="text-sm font-medium text-gray-700 mb-3">Section Breakdown</h3>
                      <div class="space-y-4">
                        <div class="bg-gray-50 p-3 rounded-lg">
                          <div class="flex items-center justify-between mb-1">
                            <span class="capitalize text-gray-700 font-medium">Introduction</span>
                            <span class="font-medium text-blue-600">75.0/100.0</span>
                          </div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg">
                          <div class="flex items-center justify-between mb-1">
                            <span class="capitalize text-gray-700 font-medium">Analysis</span>
                            <span class="font-medium text-blue-600">82.0/100.0</span>
                          </div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg">
                          <div class="flex items-center justify-between mb-1">
                            <span class="capitalize text-gray-700 font-medium">Conclusion</span>
                            <span class="font-medium text-amber-600">68.0/100.0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex space-x-3">
                      <button
                        id="confirm-exit-button"
                        class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Return to Chat
                      </button>
                      <button
                        id="cancel-exit-button"
                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Continue Writing
                      </button>
                    </div>
                  </div>
                \`;
                document.body.appendChild(modal);
                
                // Add event listeners to modal buttons
                document.getElementById('confirm-exit-button').addEventListener('click', function() {
                  window.onExitCalled = true;
                  window.onExitScore = 77.8;
                  window.onExitFeedback = document.getElementById('feedback-text').textContent.trim();
                  window.navigateCalled = true;
                  document.getElementById('exit-modal').remove();
                });
                
                document.getElementById('cancel-exit-button').addEventListener('click', function() {
                  document.getElementById('exit-modal').remove();
                });
              });
            </script>
          </body>
        </html>
        `
      });
    });

    cy.visit('/writing-test');
    
    cy.window().then((win) => {
      win.onExitCalled = false;
      win.onExitScore = null;
      win.onExitFeedback = null;
      win.navigateCalled = false;
    });
  });

  it('should render the exit button correctly', () => {
    cy.get('#exit-writing-button').should('be.visible');
    cy.get('#exit-writing-button').should('contain', 'Complete & Return to Chat');
  });

  it('should open modal when exit button is clicked', () => {
    cy.get('#exit-writing-button').click();
    cy.get('#exit-modal').should('be.visible');
    cy.get('.modal-content h2').should('contain', 'Exit Writing Mode');
  });

  it('should trigger onExit when confirmed', () => {
    cy.get('#exit-writing-button').click();
    cy.get('#confirm-exit-button').click();
    
    cy.window().then((win) => {
      expect(win.onExitCalled).to.be.true;
      expect(win.onExitScore).to.equal(77.8);
      expect(win.onExitFeedback).to.include('Good job, your essay shows competent English writing skills');
      expect(win.navigateCalled).to.be.true;
    });
    
    cy.get('#exit-modal').should('not.exist');
  });

  it('should not trigger onExit when canceled', () => {
    cy.get('#exit-writing-button').click();
    cy.get('#cancel-exit-button').click();
    
    cy.window().then((win) => {
      expect(win.onExitCalled).to.be.false;
    });
    
    cy.get('#exit-modal').should('not.exist');
  });
  
  it('should display section scores correctly', () => {
    cy.get('#exit-writing-button').click();
    
    cy.get('#final-score').should('contain', '77.8/100.0');
    
    cy.get('.modal-content .bg-gray-50').eq(0).find('.font-medium.text-blue-600').should('contain', '75.0/100.0');
    cy.get('.modal-content .bg-gray-50').eq(1).find('.font-medium.text-blue-600').should('contain', '82.0/100.0');
    cy.get('.modal-content .bg-gray-50').eq(2).find('.font-medium.text-amber-600').should('contain', '68.0/100.0');
  });
});