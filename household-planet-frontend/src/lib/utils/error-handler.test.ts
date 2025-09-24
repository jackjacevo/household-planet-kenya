import { handleApiError, retryWithBackoff } from './error-handler';

describe('Error Handler', () => {
  test('handles API errors correctly', () => {
    const error = { response: { status: 404, data: { message: 'Not found' } } };
    const result = handleApiError(error);
    expect(result.message).toBe('Not found');
  });

  test('retries with backoff', async () => {
    let attempts = 0;
    const mockFn = jest.fn(() => {
      attempts++;
      if (attempts < 3) throw new Error('Fail');
      return 'Success';
    });

    const result = await retryWithBackoff(mockFn, 3, 100);
    expect(result).toBe('Success');
    expect(attempts).toBe(3);
  });
});