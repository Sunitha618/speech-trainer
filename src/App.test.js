import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock getUserMedia so we don't actually trigger microphone permissions in tests
beforeAll(() => {
  global.navigator.mediaDevices = {
    getUserMedia: jest.fn(() => Promise.resolve({}))
  };
});

describe('Data Privacy Tests', () => {
  test('renders privacy notice on landing page', () => {
    render(<App />);
    const privacyText = screen.getByText(/your speech data stays private/i);
    expect(privacyText).toBeInTheDocument();
  });

  test('does not request mic access before user consents via play button', () => {
    render(<App />);

    // Ensure mock was not called yet
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();

    // Click a game button (navigation only)
    fireEvent.click(screen.getByText(/Chaos Integration/i));
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();

    // Now click the start listening button – after explicit consent
    fireEvent.click(screen.getByText(/Start Listening/i));
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
  });
});
