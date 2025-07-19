import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BugCard from '../components/BugCard';

const mockBug = {
  _id: '1',
  title: 'Test Bug',
  description: 'This is a test bug description',
  status: 'open',
  severity: 'high',
  priority: 'medium',
  reportedBy: 'Test User',
  createdAt: '2023-01-01T00:00:00.000Z',
  tags: ['frontend', 'ui']
};

const renderBugCard = (bug = mockBug, onDelete = jest.fn()) => {
  return render(
    <BrowserRouter>
      <BugCard bug={bug} onDelete={onDelete} />
    </BrowserRouter>
  );
};

describe('BugCard', () => {
  it('renders bug information correctly', () => {
    renderBugCard();
    
    expect(screen.getByText('Test Bug')).toBeInTheDocument();
    expect(screen.getByText('This is a test bug description')).toBeInTheDocument();
    expect(screen.getByText('open')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('medium priority')).toBeInTheDocument();
    expect(screen.getByText('Reported by Test User')).toBeInTheDocument();
  });

  it('displays tags when present', () => {
    renderBugCard();
    
    expect(screen.getByText('frontend')).toBeInTheDocument();
    expect(screen.getByText('ui')).toBeInTheDocument();
  });

  it('does not display tags when not present', () => {
    const bugWithoutTags = { ...mockBug, tags: [] };
    renderBugCard(bugWithoutTags);
    
    expect(screen.queryByText('frontend')).not.toBeInTheDocument();
  });

  it('displays assigned to when present', () => {
    const bugWithAssignee = { ...mockBug, assignedTo: 'Developer' };
    renderBugCard(bugWithAssignee);
    
    expect(screen.getByText('Assigned to Developer')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    const mockOnDelete = jest.fn();
    renderBugCard(mockBug, mockOnDelete);
    
    const deleteButton = screen.getByTitle('Delete Bug');
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('applies correct badge classes for different statuses', () => {
    const { rerender } = renderBugCard();
    
    expect(screen.getByText('open')).toHaveClass('badge-open');
    
    const resolvedBug = { ...mockBug, status: 'resolved' };
    rerender(
      <BrowserRouter>
        <BugCard bug={resolvedBug} onDelete={jest.fn()} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('resolved')).toHaveClass('badge-resolved');
  });

  it('applies correct badge classes for different severities', () => {
    const { rerender } = renderBugCard();
    
    expect(screen.getByText('high')).toHaveClass('badge-high');
    
    const criticalBug = { ...mockBug, severity: 'critical' };
    rerender(
      <BrowserRouter>
        <BugCard bug={criticalBug} onDelete={jest.fn()} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('critical')).toHaveClass('badge-critical');
  });

  it('formats date correctly', () => {
    renderBugCard();
    
    expect(screen.getByText('Jan 1, 2023')).toBeInTheDocument();
  });

  it('has correct links for view and edit', () => {
    renderBugCard();
    
    const viewLink = screen.getByTitle('View Details');
    const editLink = screen.getByTitle('Edit Bug');
    
    expect(viewLink).toHaveAttribute('href', '/bugs/1');
    expect(editLink).toHaveAttribute('href', '/bugs/1/edit');
  });
});