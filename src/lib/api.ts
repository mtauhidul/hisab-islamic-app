interface DeedVerificationRequest {
  query: string;
  language: string;
}

interface Evidence {
  source: string;
  snippet: string;
}

interface DeedVerificationResponse {
  verdict: 'sin' | 'not_sin';
  evidence: Evidence[];
}

/**
 * Verify if a deed is considered a sin according to Islamic teachings
 */
export const verifyDeed = async (
  query: string,
  language: string = 'en'
): Promise<DeedVerificationResponse> => {
  const apiUrl = import.meta.env.VITE_AI_API_URL || '/api/ai/verifyDeed';

  const request: DeedVerificationRequest = {
    query,
    language,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DeedVerificationResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying deed:', error);
    throw new Error('Failed to verify deed. Please try again.');
  }
};
