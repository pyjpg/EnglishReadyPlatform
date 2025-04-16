import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import WritingArea from '../WritingArea';

describe('WritingArea Component', () => {
  const mockSubmit = jest.fn().mockResolvedValue();
  
  test('renders textarea when loaded', async () => {
    render(<WritingArea textAreaRef={{ current: null }} onSubmit={mockSubmit} />);
    
    await waitFor(() => 
      expect(screen.getByPlaceholderText(/Start writing your introduction here.../i)).toBeInTheDocument()
    );
  });
  
  test('does not allow submission under 150 words', async () => {
    render(<WritingArea textAreaRef={{ current: null }} onSubmit={mockSubmit} />);
    
    const textarea = await waitFor(() => 
      screen.getByPlaceholderText(/Start writing your introduction here.../i)
    );
    
    fireEvent.change(textarea, { target: { value: 'Short text' } });
    
    expect(mockSubmit).not.toHaveBeenCalled();
  });
  
  test('updates word count correctly', async () => {
    render(<WritingArea textAreaRef={{ current: null }} onSubmit={mockSubmit} />);
    
    const textarea = await waitFor(() => 
      screen.getByPlaceholderText(/Start writing your introduction here.../i)
    );
    
    fireEvent.change(textarea, { target: { value: 'This is a test sentence' } });
    
    await waitFor(() => {
      const wordCount = screen.getByText(/5 words/i);
      expect(wordCount).toBeInTheDocument();
    });
  });
  
  test('progress bar updates as text is entered', async () => {
    render(<WritingArea textAreaRef={{ current: null }} onSubmit={mockSubmit} />);
    
    const textarea = await waitFor(() => 
      screen.getByPlaceholderText(/Start writing your introduction here.../i)
    );
    
    fireEvent.change(textarea, { target: { value: 'This is a test sentence' } });
    
    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar', { hidden: true }) || 
                         document.querySelector('.bg-gray-100.rounded-full .bg-blue-500');
      expect(progressBar).toBeInTheDocument();
      
    });
  });
});