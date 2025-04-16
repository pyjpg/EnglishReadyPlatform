import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskInstructions from '../TaskInstructions'; // Adjust path as needed

const mockGuidelines = {
  writing: ['Use formal language', 'Include an overview'],
};

const mockHints = {
  writing: 'Focus on key trends and comparisons.',
};

describe('TaskInstructions Component', () => {
  test('renders task info (title, description, time, word count)', () => {
    render(<TaskInstructions />);

    expect(screen.getByText(/Task Instructions/i)).toBeInTheDocument();
    expect(
      screen.getByText(/The graph above shows population growth/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Time Allowed: 20 minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/Minimum Words: 150/i)).toBeInTheDocument();
  });

  test('loads section-specific guidelines and hint', () => {
    render(
      <TaskInstructions
        selectedSection="writing"
        guidelines={mockGuidelines}
        hints={mockHints}
      />
    );

    expect(screen.getByText(/Writing Guidelines:/i)).toBeInTheDocument();
    expect(screen.getByText(/Use formal language/i)).toBeInTheDocument();
    expect(screen.getByText(/Include an overview/i)).toBeInTheDocument();
    expect(
        screen.getByText((content, element) =>
          element.textContent === 'Tip: Focus on key trends and comparisons.'
        )
      ).toBeInTheDocument();
  });

  test('toggles image enlargement', () => {
    render(
      <TaskInstructions
        selectedSection="writing"
        guidelines={mockGuidelines}
        hints={mockHints}
      />
    );

    const enlargeBtn = screen.getByLabelText(/Enlarge image/i);
    fireEvent.click(enlargeBtn);

    expect(screen.getByAltText('Task Graph - Full Size')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText(/Close fullscreen image/i);
    fireEvent.click(closeBtn);

    expect(
      screen.queryByAltText('Task Graph - Full Size')
    ).not.toBeInTheDocument();
  });
});
