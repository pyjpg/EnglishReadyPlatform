import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import CustomWebChat from '../CustomWebChat';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

jest.mock('botframework-webchat', () => ({
  Components: {
    Composer: ({ children }) => <div data-testid="composer">{children}</div>,
    AccessKeySinkSurface: ({ children }) => <div data-testid="access-key-sink">{children}</div>,
    BasicToaster: () => <div data-testid="toaster">Toast Messages</div>,
    BasicTranscript: () => <div data-testid="transcript">Chat Transcript</div>,
    BasicConnectivityStatus: () => <div data-testid="connectivity-status">Connected</div>,
    BasicSendBox: () => <div data-testid="send-box">Message Input</div>
  }
}));

describe('CustomWebChat', () => {
  const mockNavigate = jest.fn();
  const mockDirectLine = { connectionStatus: 'Connected' };
  
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  test('renders the chat interface correctly', () => {
    render(<CustomWebChat directLine={mockDirectLine} />);
    
    expect(screen.getByTestId('composer')).toBeInTheDocument();
    expect(screen.getByTestId('access-key-sink')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
    expect(screen.getByTestId('transcript')).toBeInTheDocument();
    expect(screen.getByTestId('connectivity-status')).toBeInTheDocument();
    expect(screen.getByTestId('send-box')).toBeInTheDocument();
  });

  test('creates MutationObserver to watch for new messages', () => {
    const mockObserve = jest.fn();
    const mockDisconnect = jest.fn();
    
    global.MutationObserver = jest.fn().mockImplementation(() => ({
      observe: mockObserve,
      disconnect: mockDisconnect
    }));

    render(<CustomWebChat directLine={mockDirectLine} />);
    
    expect(global.MutationObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalled();
  });

  test('cleans up observer on unmount', () => {
    const mockObserve = jest.fn();
    const mockDisconnect = jest.fn();
    
    global.MutationObserver = jest.fn().mockImplementation(() => ({
      observe: mockObserve,
      disconnect: mockDisconnect
    }));

    const { unmount } = render(<CustomWebChat directLine={mockDirectLine} />);
    unmount();
    
    expect(mockDisconnect).toHaveBeenCalled();
  });

  test('navigates to writing page when bot message contains "please write your"', async () => {
    let observerCallback;
    global.MutationObserver = jest.fn().mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: jest.fn(),
        disconnect: jest.fn()
      };
    });

    render(<CustomWebChat directLine={mockDirectLine} />);
    
    const article = document.createElement('article');
    article.textContent = 'Bot said: Please write your';
    
    observerCallback([{
      addedNodes: [article],
      type: 'childList'
    }]);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/writing', {
        state: {
          questionNumber: 3,
          taskType: 'argument',
          initialPrompt: 'please write your'
        }
      });
    });
  });

  test('does not navigate on regular bot messages', async () => {
    let observerCallback;
    global.MutationObserver = jest.fn().mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: jest.fn(),
        disconnect: jest.fn()
      };
    });

    render(<CustomWebChat directLine={mockDirectLine} />);
    
    const article = document.createElement('article');
    article.textContent = 'Bot said: Hello, how can I help you today?';
    
    observerCallback([{
      addedNodes: [article],
      type: 'childList'
    }]);

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('ignores mutations that do not add an article element', async () => {
    let observerCallback;
    global.MutationObserver = jest.fn().mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: jest.fn(),
        disconnect: jest.fn()
      };
    });

    render(<CustomWebChat directLine={mockDirectLine} />);
    
    const div = document.createElement('div');
    div.textContent = 'Some other content';
    
    observerCallback([{
      addedNodes: [div],
      type: 'childList'
    }]);

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});