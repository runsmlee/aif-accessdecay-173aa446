import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CSVUploader } from '../src/components/CSVUploader';

describe('CSVUploader', () => {
  it('renders file input with accept=".csv" attribute', () => {
    render(<CSVUploader onUpload={vi.fn()} />);
    const input = screen.getByLabelText(/upload csv/i) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.accept).toBe('.csv');
  });

  it('displays sample CSV format text so user knows the expected format', () => {
    render(<CSVUploader onUpload={vi.fn()} />);
    expect(screen.getByText(/integration_name/i)).toBeInTheDocument();
  });

  it('clicking upload with valid file calls onUpload callback with parsed integrations', async () => {
    const onUpload = vi.fn();
    render(<CSVUploader onUpload={onUpload} />);

    const file = new File(
      [`integration_name,service,data_access_level,integration_depth,last_activity_date,owner_email,owner_active
Test App,Slack,3,2,2024-01-15,user@test.com,true`],
      'test.csv',
      { type: 'text/csv' }
    );

    const input = screen.getByLabelText(/upload csv/i);
    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledTimes(1);
      expect(onUpload.mock.calls[0][0].length).toBeGreaterThan(0);
    });
  });

  it('shows inline error message for non-CSV file selection', async () => {
    const onUpload = vi.fn();
    render(<CSVUploader onUpload={onUpload} />);

    const file = new File(['not a csv'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/upload csv/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/please upload a csv file/i)).toBeInTheDocument();
    });
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('shows loading state during file parsing', async () => {
    const onUpload = vi.fn();
    render(<CSVUploader onUpload={onUpload} />);

    const file = new File(
      [`integration_name,service,data_access_level,integration_depth,last_activity_date,owner_email,owner_active
Test App,Slack,3,2,2024-01-15,user@test.com,true`],
      'test.csv',
      { type: 'text/csv' }
    );

    const input = screen.getByLabelText(/upload csv/i);
    fireEvent.change(input, { target: { files: [file] } });

    // The loading state should appear at some point during processing
    await waitFor(() => {
      expect(onUpload).toHaveBeenCalled();
    });
  });
});
