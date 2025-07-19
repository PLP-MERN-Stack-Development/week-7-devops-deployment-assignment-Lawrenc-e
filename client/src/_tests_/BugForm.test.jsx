import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import BugForm from '../components/BugForm';
import { BugProvider } from '../context/BugContext';

// Mock the context
const mockCreateBug = jest.fn();
const mockUpdateBug = jest.fn();
const mockFetchBugById = jest.fn();

jest.mock('../context/BugContext', () => ({
  ...jest.requireActual('../context/BugContext'),
  useBugContext: () => ({
    currentBug: null,
    loading: false,
    createBug: mockCreateBug,
    updateBug: mockUpdateBug,
    fetchBugById: mockFetchBugById
  })
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({})
}));

const renderBugForm = () => {
  return render(
    <BrowserRouter>
      <BugProvider>
        <BugForm />
      </BugProvider>
    </BrowserRouter>
  );
};

describe('BugForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    renderBugForm();
    
    expect(screen.getByLabelText(/bug title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/severity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reported by/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    renderBugForm();
    
    const submitButton = screen.getByRole('button', { name: /create bug/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
      expect(screen.getByText('Reporter name is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for short title', async () => {
    const user = userEvent.setup();
    renderBugForm();
    
    const titleInput = screen.getByLabelText(/bug title/i);
    await user.type(titleInput, 'AB');
    
    const submitButton = screen.getByRole('button', { name: /create bug/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument();
    });
  });

  it('shows validation error for short description', async () => {
    const user = userEvent.setup();
    renderBugForm();
    
    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, 'Short');
    
    const submitButton = screen.getByRole('button', { name: /create bug/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockCreateBug.mockResolvedValue({ _id: '1' });
    
    renderBugForm();
    
    await user.type(screen.getByLabelText(/bug title/i), 'Test Bug Title');
    await user.type(screen.getByLabelText(/description/i), 'This is a detailed description of the bug');
    await user.type(screen.getByLabelText(/reported by/i), 'Test User');
    await user.selectOptions(screen.getByLabelText(/severity/i), 'high');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high');
    
    const submitButton = screen.getByRole('button', { name: /create bug/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateBug).toHaveBeenCalledWith({
        title: 'Test Bug Title',
        description: 'This is a detailed description of the bug',
        reportedBy: 'Test User',
        severity: 'high',
        priority: 'high',
        status: 'open',
        assignedTo: '',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: '',
        tags: []
      });
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/bugs');
  });

  it('processes tags correctly', async () => {
    const user = userEvent.setup();
    mockCreateBug.mockResolvedValue({ _id: '1' });
    
    renderBugForm();
    
    await user.type(screen.getByLabelText(/bug title/i), 'Test Bug Title');
    await user.type(screen.getByLabelText(/description/i), 'This is a detailed description of the bug');
    await user.type(screen.getByLabelText(/reported by/i), 'Test User');
    await user.type(screen.getByLabelText(/tags/i), 'frontend, ui, bug');
    
    const submitButton = screen.getByRole('button', { name: /create bug/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateBug).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['frontend', 'ui', 'bug']
        })
      );
    });
  });

  it('handles form submission error', async () => {
    const user = userEvent.setup();
    mockCreateBug.mockRejectedValue(new Error('Server error'));
    
    renderBugForm();
    
    await user.type(screen.getByLabelText(/bug title/i), 'Test Bug Title');
    await user.type(screen.getByLabelText(/description/i), 'This is a detailed description of the bug');
    await user.type(screen.getByLabelText(/reported by/i), 'Test User');
    
    const submitButton = screen.getByRole('button', { name: /create bug/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateBug).toHaveBeenCalled();
    });
    
    // Form should not navigate on error
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup();
    mockCreateBug.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderBugForm();
    
    await user.type(screen.getByLabelText(/bug title/i), 'Test Bug Title');
    await user.type(screen.getByLabelText(/description/i), 'This is a detailed description of the bug');
    await user.type(screen.getByLabelText(/reported by/i), 'Test User');
    
    const submitButton = screen.getByRole('button', { name: /create bug/i });
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
  });
});