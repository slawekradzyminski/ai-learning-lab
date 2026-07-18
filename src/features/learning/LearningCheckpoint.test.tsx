import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { LearningCheckpoint } from './LearningCheckpoint';

describe('LearningCheckpoint', () => {
  test('requires a committed answer before revealing feedback and supports retry', () => {
    renderWithProviders(
      <LearningCheckpoint
        id="example"
        question="Which answer?"
        choices={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]}
        correctValue="b"
        explanation="B follows from the calculation."
      />,
    );

    expect(screen.getByTestId('example-check')).toBeDisabled();
    expect(screen.queryByTestId('example-feedback')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('example-choice-a'));
    fireEvent.click(screen.getByTestId('example-check'));
    expect(screen.getByTestId('example-feedback')).toHaveTextContent('Not quite');
    expect(screen.getByTestId('example-feedback')).toHaveTextContent('B follows');

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    fireEvent.click(screen.getByTestId('example-choice-b'));
    fireEvent.click(screen.getByTestId('example-check'));
    expect(screen.getByTestId('example-feedback')).toHaveTextContent('Correct');
  });
});
