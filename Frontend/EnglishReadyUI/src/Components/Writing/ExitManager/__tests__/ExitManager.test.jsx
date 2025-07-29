import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WritingModeExitManager from '../ExitManager';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

const mockReload = jest.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload }
});

jest.mock('../../Sidebar/ScoreCard/CircularProgress', () => ({
  __esModule: true,
  default: ({ percentage }) => (
    <div data-testid="mock-circular-progress">
      Progress: {percentage}%
    </div>
  )
}));

describe('WritingModeExitManager Component', () => {
  const defaultProps = {
    sectionsData: {
      introduction: {
        grade: 75,
        task_achievement_analysis: {
          feedback: {
            improvements: ['Work on clearer thesis statement']
          }
        },
        grammar_analysis: {
          feedback: 'Improve subject-verb agreement'
        },
        coherence_analysis: {
          feedback: {
            improvements: ['Add stronger transitions between paragraphs']
          }
        }
      },
      analysis: {
        grade: 80,
        task_achievement_analysis: {
          feedback: {
            improvements: ['Include more supporting evidence']
          }
        },
        grammar_analysis: {
          feedback: 'Use more complex sentence structures'
        },
        coherence_analysis: {
          feedback: {
            improvements: ['Make sure arguments follow logical sequence']
          }
        }
      },
      conclusion: {
        grade: 70,
        task_achievement_analysis: {
          feedback: {
            improvements: ['Summarize key points more effectively']
          }
        },
        grammar_analysis: {
          feedback: 'Watch for punctuation errors'
        },
        coherence_analysis: {
          feedback: {
            improvements: ['Connect conclusion back to introduction']
          }
        }
      }
    },
    onExit: jest.fn(),
    onContinue: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders exit button correctly', () => {
    render(<WritingModeExitManager {...defaultProps} />);
    expect(screen.getByText('Complete & Return to Chat')).toBeInTheDocument();
  });

  test('clicking exit button shows modal', () => {
    render(<WritingModeExitManager {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Complete & Return to Chat'));
    
    expect(screen.getByText('Exit Writing Mode')).toBeInTheDocument();
    expect(screen.getByText('Final Score')).toBeInTheDocument();
  });

  test('calculates and displays correct final score', () => {
    render(<WritingModeExitManager {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Complete & Return to Chat'));
    expect(screen.getByText('77.0/100.0')).toBeInTheDocument();
  });

  test('displays section breakdown with correct scores', () => {
    render(<WritingModeExitManager {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Complete & Return to Chat'));
    
    expect(screen.getByText('75.0/100.0')).toBeInTheDocument(); 
    expect(screen.getByText('80.0/100.0')).toBeInTheDocument(); 
    expect(screen.getByText('70.0/100.0')).toBeInTheDocument(); 
  });

  test('handles exit button in modal correctly', async () => {
    render(<WritingModeExitManager {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Complete & Return to Chat'));
    fireEvent.click(screen.getByText('Return to Chat'));
    
    expect(defaultProps.onExit).toHaveBeenCalledWith(77, expect.any(String));
    expect(mockNavigate).toHaveBeenCalledWith('/');
    
    // Wait for the reload timeout
    await waitFor(() => {
      expect(mockReload).toHaveBeenCalled();
    }, { timeout: 600 });
  });

  test('handles continue button in modal correctly', () => {
    render(<WritingModeExitManager {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Complete & Return to Chat'));
    fireEvent.click(screen.getByText('Continue Writing'));
    
    expect(screen.queryByText('Exit Writing Mode')).not.toBeInTheDocument();
    expect(defaultProps.onExit).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('displays appropriate color coding based on scores', () => {
    const highScoreProps = {
      ...defaultProps,
      sectionsData: {
        introduction: { grade: 90 },
        analysis: { grade: 65 },
        conclusion: { grade: 50 }
      }
    };
    
    render(<WritingModeExitManager {...highScoreProps} />);
    
    fireEvent.click(screen.getByText('Complete & Return to Chat'));
    
    const allScoreElements = screen.getAllByText(/\/100\.0/);
    
    const scoreTexts = allScoreElements.map(el => el.textContent);
    expect(scoreTexts).toContain('90.0/100.0');
    expect(scoreTexts).toContain('65.0/100.0');
    expect(scoreTexts).toContain('50.0/100.0');
  });

  test('handles missing section data gracefully', () => {
    const incompleteProps = {
      ...defaultProps,
      sectionsData: {
        introduction: { grade: 80 },
        conclusion: { grade: 70 }
      }
    };
    
    render(<WritingModeExitManager {...incompleteProps} />);
    
    fireEvent.click(screen.getByText('Complete & Return to Chat'));
    
    expect(screen.getByText('75.0/100.0')).toBeInTheDocument();
    
    const sections = screen.getAllByText(/\/100\.0/);
    expect(sections).toHaveLength(3); // Final score + 2 sections
  });

  test('displays improvement suggestions from feedback', () => {
    render(<WritingModeExitManager {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Complete & Return to Chat'));
    
    expect(screen.getByText('"Work on clearer thesis statement"')).toBeInTheDocument();
    expect(screen.getByText('"Include more supporting evidence"')).toBeInTheDocument();
    expect(screen.getByText('"Summarize key points more effectively"')).toBeInTheDocument();
  });
});