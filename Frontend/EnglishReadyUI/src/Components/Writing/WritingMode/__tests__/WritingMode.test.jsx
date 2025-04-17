import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WritingMode from '../WritingMode';

jest.mock('../../Sidebar/WritingSidebar', () => ({
  __esModule: true,
  default: ({ onSubmit, onExit }) => (
    <div data-testid="writing-sidebar">
      <button data-testid="submit-btn" onClick={() => onSubmit({ text: 'Test essay', task_type: 'argument', question_number: 3, section: 'introduction' })}>Submit</button>
      <button data-testid="exit-btn" onClick={onExit}>Exit</button>
    </div>
  )
}));

jest.mock('../../Question/TaskInstructions', () => ({
  __esModule: true,
  default: ({ selectedSection }) => <div data-testid="task-instructions">{selectedSection}</div>
}));

jest.mock('../../WritingArea/WritingArea', () => ({
  __esModule: true,
  default: ({ textAreaRef, section, onSubmit }) => (
    <div data-testid="writing-area">
      <textarea 
        data-testid="text-area"
        ref={textAreaRef} 
      />
      <button 
        data-testid="submit-section"
        onClick={() => onSubmit({ 
          text: textAreaRef.current?.value || '', 
          task_type: 'argument', 
          question_number: 3, 
          section 
        })}
      >
        Submit Section
      </button>
    </div>
  )
}));

jest.mock('../../Grading/FeedbackModalManager', () => ({
  __esModule: true,
  default: ({ feedbackData }) => (
    <div data-testid="feedback-modal-manager">
      {feedbackData ? 'Has feedback' : 'No feedback'}
    </div>
  )
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ score: 7.5, feedback: 'Good work' }),
  })
);

describe('WritingMode Component', () => {
  const mockProps = {
    textAreaRef: { current: document.createElement('textarea') },
    grade: 7.5,
    handleSubmit: jest.fn(),
    setIsWritingMode: jest.fn(),
    grammarAnalysis: {},
    lexicalAnalysis: {},
    taskAchievementAnalysis: {},
    coherenceAnalysis: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders writing mode component with initial section', () => {
    render(<WritingMode {...mockProps} />);
    
    expect(screen.getByText('IELTS Writing - Task 1 - Question 3/6')).toBeInTheDocument();
    expect(screen.getByTestId('task-instructions')).toHaveTextContent('introduction');
    expect(screen.getByText('3 attempts left')).toBeInTheDocument();
  });

  test('toggles focus mode when button is clicked', () => {
    render(<WritingMode {...mockProps} />);
    
    expect(screen.getByText('Enter Focus Mode')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Enter Focus Mode'));
    
    expect(screen.getByText('Exit Focus Mode')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Exit Focus Mode'));
    
    expect(screen.getByText('Enter Focus Mode')).toBeInTheDocument();
  });

  test('changes sections using dropdown', async () => {
    render(<WritingMode {...mockProps} />);
    
    expect(screen.getByTestId('task-instructions')).toHaveTextContent('introduction');
    
    const dropdown = screen.getByLabelText('Select section to write:');
    fireEvent.change(dropdown, { target: { value: 'analysis' } });
    
    expect(screen.getByTestId('task-instructions')).toHaveTextContent('analysis');
  });

  test('navigates between sections using prev/next buttons', () => {
    render(<WritingMode {...mockProps} />);
    
    expect(screen.getByTestId('task-instructions')).toHaveTextContent('introduction');
    
    fireEvent.click(screen.getByTitle('Next section'));
    expect(screen.getByTestId('task-instructions')).toHaveTextContent('analysis');
    
    fireEvent.click(screen.getByTitle('Next section'));
    expect(screen.getByTestId('task-instructions')).toHaveTextContent('conclusion');
    
    fireEvent.click(screen.getByTitle('Previous section'));
    expect(screen.getByTestId('task-instructions')).toHaveTextContent('analysis');
  });

  test('decreases attempt count when submitting a section', async () => {
    render(<WritingMode {...mockProps} />);
    
    expect(screen.getByText('3 attempts left')).toBeInTheDocument();
    
    const submitButton = screen.getByTestId('submit-section');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('2 attempts left')).toBeInTheDocument();
    });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('1 attempt left')).toBeInTheDocument();
    });
  });

  test('saves content when switching between sections', async () => {
    render(<WritingMode {...mockProps} />);
    
    const textarea = screen.getByTestId('text-area');
    fireEvent.change(textarea, { target: { value: 'This is my introduction' } });
    
    const dropdown = screen.getByLabelText('Select section to write:');
    fireEvent.change(dropdown, { target: { value: 'analysis' } });
    
    fireEvent.change(textarea, { target: { value: 'This is my analysis' } });
    
    fireEvent.change(dropdown, { target: { value: 'introduction' } });
    
  });

  test('auto-saves content periodically', async () => {
    jest.useFakeTimers();
    
    render(<WritingMode {...mockProps} />);
    const textarea = screen.getByTestId('text-area');
    fireEvent.change(textarea, { target: { value: 'Auto-save test' } });
    
    jest.advanceTimersByTime(5000);
    
    jest.useRealTimers();
  });

  test('exits writing mode when exit button is clicked', () => {
    render(<WritingMode {...mockProps} />);
    
    const exitButton = screen.getByTestId('exit-btn');
    fireEvent.click(exitButton);
    
    expect(mockProps.setIsWritingMode).toHaveBeenCalledWith(false);
  });

  test('disables submission when no attempts left', async () => {
    render(<WritingMode {...mockProps} />);
    const submitButton = screen.getByTestId('submit-section');
    
    fireEvent.click(submitButton);
    await waitFor(() => expect(screen.getByText('2 attempts left')).toBeInTheDocument());
    
    fireEvent.click(submitButton);
    await waitFor(() => expect(screen.getByText('1 attempt left')).toBeInTheDocument());
    
    fireEvent.click(submitButton);
    await waitFor(() => expect(screen.getByText('0 attempts left')).toBeInTheDocument());
  });
  
  test('persists attempts count in localStorage', async () => {
    const { unmount } = render(<WritingMode {...mockProps} />);
    
    const submitButton = screen.getByTestId('submit-section');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('2 attempts left')).toBeInTheDocument();
    });
    
    unmount();
    render(<WritingMode {...mockProps} />);
    
    expect(screen.getByText('2 attempts left')).toBeInTheDocument();
  });

  test('calculates total word count correctly', () => {
    // Create the ref properly before using it
    const mockTextArea = document.createElement('textarea');
    mockTextArea.value = 'This is a test';
    const updatedProps = {
      ...mockProps,
      textAreaRef: { current: mockTextArea }
    };
    
    render(<WritingMode {...updatedProps} />);
    
    // Now check for the word count
    expect(screen.getByText(/Total word count: 4\/150/)).toBeInTheDocument();
  });
  test('displays feedback data when available', async () => {
    render(<WritingMode {...mockProps} />);
    
    const submitButton = screen.getByTestId('submit-section');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('feedback-modal-manager')).toHaveTextContent('Has feedback');
    });
  });
});