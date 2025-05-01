import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WritingSidebar from '../WritingSidebar';

jest.mock('../../Grading/FeedbackModalManager', () => ({
  __esModule: true,
  default: ({ activeModal, setActiveModal }) => (
    <div data-testid="feedback-modal" onClick={() => setActiveModal(null)}>
      {activeModal || 'none'}
    </div>
  ),
}));

jest.mock('../../ExitManger/ExitManager', () => ({
  __esModule: true,
  default: ({ onExit }) => <button data-testid="exit-button" onClick={onExit}>Exit</button>,
}));

jest.mock('../OverallProgress', () => ({
  __esModule: true,
  default: ({ sectionsData }) => (
    <div data-testid="overall-progress">
      {Object.keys(sectionsData).length} sections
    </div>
  ),
}));

jest.mock('../../../../hooks/useOverallGrade', () => ({
  useOverallGrade: jest.fn().mockReturnValue(6.5),
}));

jest.mock('../ScoreCard/SectionScoreCard', () => ({
  __esModule: true,
  default: ({ selectedSection, sectionScores }) => (
    <div data-testid="section-score-card">
      {selectedSection}: {sectionScores[selectedSection]?.score || 0}
    </div>
  ),
}));

jest.mock('../AnalysisCards/AnalysisCard', () => ({
  __esModule: true,
  default: ({ title, score, criteriaType, onViewDetails }) => (
    <div data-testid={`analysis-card-${criteriaType}`}>
      <div>{title}: {score}</div>
      <button onClick={() => onViewDetails(criteriaType)}>View Details</button>
    </div>
  ),
}));

jest.mock('../AnalysisCards/GrammarCard', () => ({
  __esModule: true,
  default: ({ grammarAnalysis, onToggleSection, isExpanded }) => (
    <div data-testid="grammar-analysis">
      <div>Grammar Score: {grammarAnalysis?.overall_score || 0}</div>
      <button onClick={() => onToggleSection('grammar')}>
        {isExpanded ? 'Hide Analysis' : 'Show Analysis'}
      </button>
      {isExpanded && <div data-testid="sentence-quality">Sentence Quality</div>}
    </div>
  ),
}));

jest.mock('../ScoreCard/SectionSummary', () => ({
  __esModule: true,
  default: ({ selectedSection }) => <div data-testid="section-summary">{selectedSection}</div>,
}));

jest.mock('../ScoreCard/KeyImprovements', () => ({
  __esModule: true,
  default: ({ feedbackData }) => (
    <div data-testid="key-improvements">
      Key Improvements
      {feedbackData?.task_achievement_analysis?.feedback?.improvements?.map((item, i) => (
        <div key={i} data-testid={`improvement-${i}`}>{item}</div>
      ))}
    </div>
  ),
}));

jest.mock('../ScoreCard/CurrentGrade', () => ({
  __esModule: true,
  default: ({ grade, isGraded, setActiveModal }) => (
    <div data-testid="current-grade">
      {isGraded ? `Grade: ${grade}/9.0` : 'Not graded yet'}
      {isGraded && <button onClick={() => setActiveModal('overview')}>View Score Details</button>}
    </div>
  ),
}));

jest.mock('../SubmitButton', () => ({
  __esModule: true,
  default: ({ isSubmitting, attemptsRemaining, onSubmit, selectedSection }) => (
    <button 
      data-testid="submit-button"
      disabled={attemptsRemaining <= 0 || isSubmitting}
      onClick={onSubmit}
    >
      {isSubmitting ? 'Submitting...' : 
       attemptsRemaining <= 0 ? 'No attempts left' : 
       `Submit ${selectedSection} (${attemptsRemaining} attempts remaining)`}
    </button>
  ),
}));

// Setup localStorage mock
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('WritingSidebar', () => {
  // Test fixtures
  const defaultProps = {
    feedbackData: {},
    isSubmitting: false,
    onSubmit: jest.fn().mockResolvedValue({}),
    onExit: jest.fn(),
    essayText: 'Test essay content',
    taskType: 'writing_task_1',
    questionNumber: 1,
    questionDesc: 'The graph shows population growth in different regions.',
    questionRequirements: 'A strong introduction should paraphrase the question.',
    selectedSection: 'introduction',
    sectionsData: {},
  };

  const mockFeedback = {
    grade: 6.5,
    ielts_score: 6.5,
    grammar_analysis: {
      overall_score: 7,
      feedback: 'Good grammar with minor errors',
      sentence_analysis: [{ score: 80 }, { score: 75 }],
    },
    lexical_analysis: {
      overall_score: 6,
      detailed_analysis: { 
        lexical_diversity: { 
          unique_words: 120, 
          diversity_ratio: 0.65 
        }
      },
      feedback: { 
        improvements: ['Use more academic vocabulary'] 
      },
    },
    task_achievement_analysis: {
      band_score: 6,
      feedback: {
        strengths: ['Addresses all parts of the task'],
        improvements: ['Provide more detailed analysis'],
      },
    },
    coherence_analysis: {
      overall_score: 7,
      feedback: {
        strengths: ['Good paragraph structure'],
        improvements: ['Improve transitions between paragraphs'],
      },
    },
  };

  const mockSectionsData = {
    introduction: { grade: 6.0 },
    analysis: { grade: 7.0 },
    conclusion: { grade: 6.5 },
  };

  // Helper function for rendering with specified props
  const renderSidebar = (props = {}) => render(<WritingSidebar {...defaultProps} {...props} />);

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  describe('Basic rendering', () => {
    test('renders initial state correctly', () => {
      renderSidebar();
      expect(screen.getByTestId('current-grade')).toBeInTheDocument();
      expect(screen.getByTestId('section-summary')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    test('renders with section data', () => {
      renderSidebar({ sectionsData: mockSectionsData });
      expect(screen.getByTestId('section-score-card')).toBeInTheDocument();
      expect(screen.getByTestId('overall-progress')).toBeInTheDocument();
    });

    test('shows loading state when submitting', () => {
      renderSidebar({ isSubmitting: true });
      expect(screen.getByTestId('submit-button')).toHaveTextContent(/submitting/i);
    });
  });

  describe('Content rendering based on feedback', () => {
    test('shows ungraded state with no feedback', () => {
      renderSidebar();
      expect(screen.getByTestId('current-grade')).toHaveTextContent(/not graded yet/i);
      expect(screen.queryByTestId('key-improvements')).not.toBeInTheDocument();
    });

    test('displays feedback components when available', () => {
      renderSidebar({ feedbackData: mockFeedback });
      
      expect(screen.getByTestId('key-improvements')).toBeInTheDocument();
      expect(screen.getByTestId('analysis-card-vocabulary')).toBeInTheDocument();
      expect(screen.getByTestId('grammar-analysis')).toBeInTheDocument();
      expect(screen.getByTestId('analysis-card-task')).toBeInTheDocument();
      expect(screen.getByTestId('analysis-card-coherence')).toBeInTheDocument();
    });

    test('displays current grade when feedback is available', () => {
      renderSidebar({ feedbackData: mockFeedback });
      expect(screen.getByTestId('current-grade')).toHaveTextContent(/grade: 6.5\/9.0/i);
    });
  });

  describe('Interaction handling', () => {
    test('opens feedback modal when view details is clicked', async () => {
      renderSidebar({ feedbackData: mockFeedback });
      
      fireEvent.click(screen.getAllByText(/view details/i)[0]);
      await waitFor(() => {
        expect(screen.getByTestId('feedback-modal')).not.toHaveTextContent('none');
      });
    });

    test('toggles grammar section expansion', async () => {
      renderSidebar({ feedbackData: mockFeedback });
      
      fireEvent.click(screen.getByText(/show analysis/i));
      await waitFor(() => {
        expect(screen.getByTestId('sentence-quality')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText(/hide analysis/i));
      await waitFor(() => {
        expect(screen.queryByTestId('sentence-quality')).not.toBeInTheDocument();
      });
    });

    test('handles submit with correct payload', () => {
      renderSidebar();
      fireEvent.click(screen.getByTestId('submit-button'));
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        text: 'Test essay content',
        task_type: 'writing_task_1',
        question_number: 1,
        section: 'introduction',
        question_desc: 'The graph shows population growth in different regions.',
        question_requirements: 'A strong introduction should paraphrase the question.'
      }));
    });

    test('decrements attempts on submit', async () => {
      renderSidebar();
      
    
      mockLocalStorage.setItem('sectionAttempts', JSON.stringify({
        introduction: 3,
        analysis: 3,
        conclusion: 3
      }));
      
      
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('submit-button')).toHaveTextContent(/2 attempts remaining/i);
      });
      
      
      const callsToSetItem = mockLocalStorage.setItem.mock.calls;
      let found = false;
      
      for (let i = 0; i < callsToSetItem.length; i++) {
        const [key, value] = callsToSetItem[i];
        if (key === 'sectionAttempts') {
          const parsed = JSON.parse(value);
          if (parsed.introduction === 2) {
            found = true;
            break;
          }
        }
      }
      
      expect(found).toBe(true);
    });

    test('disables submit when no attempts remain', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify({
        introduction: 0,
        analysis: 3,
        conclusion: 3
      }));
      
      renderSidebar();
      
      expect(screen.getByTestId('submit-button')).toBeDisabled();
      expect(screen.getByTestId('submit-button')).toHaveTextContent(/no attempts left/i);
    });

    test('exit button calls onExit', () => {
      renderSidebar();
      fireEvent.click(screen.getByTestId('exit-button'));
      expect(defaultProps.onExit).toHaveBeenCalled();
    });
  });

  describe('Local storage handling', () => {
    test('loads attempts from localStorage on mount', () => {
      const storedAttempts = {
        introduction: 2,
        analysis: 1,
        conclusion: 3
      };
      
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(storedAttempts));
      renderSidebar();
      
      expect(screen.getByTestId('submit-button')).toHaveTextContent(/2 attempts remaining/i);
    });

    test('updates localStorage when attempts change', () => {
      renderSidebar();
      fireEvent.click(screen.getByTestId('submit-button'));
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'sectionAttempts',
        expect.any(String)
      );
    });
  });
});