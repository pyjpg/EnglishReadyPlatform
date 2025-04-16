import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WritingSidebar from '../WritingSidebar';

// Mock all components at once
jest.mock('../../Grading/CompactScoreIndicator', () => ({
  __esModule: true,
  default: ({ label, score }) => (
    <div data-testid={`score-indicator-${label.toLowerCase()}`}>{label}: {score}</div>
  ),
}));

jest.mock('../CircularProgress', () => ({
  __esModule: true,
  default: ({ percentage }) => <div data-testid="circular-progress">{percentage}</div>,
}));

jest.mock('../../Grading/KeyImprovementItem', () => ({
  __esModule: true,
  default: ({ text, priority }) => <div data-testid={`improvement-${priority}`}>{text}</div>,
}));

jest.mock('../../Grading/FeedbackModalManager', () => ({
  __esModule: true,
  default: ({ activeModal }) => <div data-testid="feedback-modal">{activeModal || 'none'}</div>,
}));

jest.mock('../../ExitManager', () => ({
  __esModule: true,
  default: ({ onExit }) => <button data-testid="exit-button" onClick={onExit}>Exit</button>,
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
      detailed_analysis: { lexical_diversity: { unique_words: 120, diversity_ratio: 0.65 } },
      feedback: { improvements: ['Use more academic vocabulary'] },
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

  // Helper function for rendering with specified props
  const renderSidebar = (props = {}) => render(<WritingSidebar {...defaultProps} {...props} />);

  // Helper to mock attempts
  const mockAttempts = (attempts) => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(attempts));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  describe('Basic rendering', () => {
    test('renders core elements', () => {
      renderSidebar();
      expect(screen.getByText(/Current Grade|Overall Progress/i)).toBeInTheDocument();
      expect(screen.getByText(/Introduction/i)).toBeInTheDocument();
    });

    test('shows loading state when submitting', () => {
      renderSidebar({ isSubmitting: true });
      expect(screen.getByText(/Submitting.../i)).toBeInTheDocument();
    });
  });

  describe('Sections and attempts', () => {
    test('displays section scores', () => {
      const sectionsData = {
        introduction: { grade: 7 },
        analysis: { grade: 6 },
        conclusion: { grade: 8 },
      };
      
      renderSidebar({ sectionsData });
      
      ['Introduction', 'Analysis', 'Conclusion'].forEach(section => {
        expect(screen.getByText(new RegExp(section, 'i'))).toBeInTheDocument();
      });
    });

    test('shows correct attempts remaining', () => {
      mockAttempts({ introduction: 2, analysis: 1, conclusion: 0 });
      renderSidebar();
      expect(screen.getByText(/2 attempts remaining/i)).toBeInTheDocument();
    });

    test('disables submit when no attempts remain', () => {
      mockAttempts({ introduction: 0, analysis: 3, conclusion: 3 });
      renderSidebar();
      const submitButton = screen.getByText(/No attempts left|Submit Essay/i);
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Interactions', () => {
    test('submit button calls onSubmit with correct payload', () => {
      renderSidebar();
      fireEvent.click(screen.getByText(/Submit Essay/i));
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        text: 'Test essay content',
        task_type: 'writing_task_1',
        question_number: 1,
        section: 'introduction',
      }));
    });

    test('decrements attempts on submit', () => {
      mockAttempts({ introduction: 3, analysis: 3, conclusion: 3 });
      renderSidebar();
      
      fireEvent.click(screen.getByText(/Submit Essay/i));
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'sectionAttempts',
        expect.stringContaining('"introduction":2')
      );
    });

    test('exit button calls onExit', () => {
      renderSidebar();
      fireEvent.click(screen.getByTestId('exit-button'));
      expect(defaultProps.onExit).toHaveBeenCalled();
    });
  });

  describe('Feedback display', () => {
    test('shows ungraded state with no feedback', () => {
      renderSidebar();
      expect(screen.getByText(/Submit your introduction to receive detailed feedback/i)).toBeInTheDocument();
    });

    test('displays feedback components when available', () => {
      renderSidebar({ feedbackData: mockFeedback });
      
      expect(screen.getByText(/Key Improvements/i)).toBeInTheDocument();
      expect(screen.getByText(/Grammar & Sentence Structure/i)).toBeInTheDocument();
      expect(screen.getByText(/7\.0\/9\.0/i)).toBeInTheDocument();
      expect(screen.getByTestId('improvement-high')).toBeInTheDocument();
    });

    test('opens feedback modal', async () => {
      renderSidebar({ feedbackData: mockFeedback });
      
      fireEvent.click(screen.getAllByText(/View Details/i)[0]);
      await waitFor(() => {
        expect(screen.getByTestId('feedback-modal')).not.toHaveTextContent('none');
      });
    });

    test('toggles grammar section expansion', async () => {
      renderSidebar({ feedbackData: mockFeedback });
      
      fireEvent.click(screen.getByText(/Show Analysis/i));
      await waitFor(() => {
        expect(screen.getByText(/Sentence Quality/i)).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText(/Hide Analysis/i));
      await waitFor(() => {
        expect(screen.queryByText(/Sentence Quality/i)).not.toBeInTheDocument();
      });
    });
  });
});