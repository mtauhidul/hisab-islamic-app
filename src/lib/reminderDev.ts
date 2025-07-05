/**
 * @fileoverview Alternative Islamic Deed Verification using Reminder.dev API
 *
 * This module provides an alternative implementation using the Reminder.dev API
 * as a fallback or primary option for Islamic deed verification.
 *
 * Reminder.dev provides:
 * - LLM-powered Islamic Q&A
 * - References to Quran and Hadith
 * - Free API access (no authentication required)
 * - JSON responses with citations
 *
 * @see https://reminder.dev/api for API documentation
 */

interface Evidence {
  source: string;
  snippet: string;
}

interface DeedVerificationResponse {
  verdict: 'sin' | 'not_sin';
  evidence: Evidence[];
  summary?: string;
}

interface ReminderDevSearchResponse {
  q: string;
  answer: string;
  references: Array<{
    source?: string;
    text?: string;
    citation?: string;
    [key: string]: unknown;
  }>;
}

/**
 * Verify if a deed is considered a sin using Reminder.dev API
 *
 * @param query - The deed/action to verify
 * @param language - Language for the query ('en' or 'ar')
 * @returns Promise with verdict and evidence
 */
export const verifyDeedWithReminderDev = async (
  query: string,
  language: string = 'en'
): Promise<DeedVerificationResponse> => {
  const apiUrl = 'https://reminder.dev/api/search';

  // Construct the question for Islamic deed verification
  const question =
    language === 'ar'
      ? `هل ${query} حلال أم حرام في الإسلام؟ يرجى تقديم أدلة من القرآن والسنة.`
      : `Is ${query} permissible (halal) or forbidden (haram) in Islam? Please provide evidence from Quran and Hadith.`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: question,
      }),
    });

    if (!response.ok) {
      throw new Error(`Reminder.dev API error: ${response.status}`);
    }

    const data: ReminderDevSearchResponse = await response.json();

    if (!data.answer) {
      throw new Error('No response from Reminder.dev API');
    }

    // Analyze the response to determine verdict
    const answer = data.answer.toLowerCase();
    const isPermissible =
      (answer.includes('permissible') ||
        answer.includes('halal') ||
        answer.includes('allowed') ||
        answer.includes('حلال')) &&
      !(
        answer.includes('not permissible') ||
        answer.includes('haram') ||
        answer.includes('forbidden') ||
        answer.includes('حرام')
      );

    // Process references and format for user display
    const formattedEvidence = formatReminderDevEvidence(data.references || []);
    const summary = summarizeReminderDevResponse(data.answer);

    // If no formatted evidence from references, use the answer itself but summarized
    const finalEvidence =
      formattedEvidence.length > 0
        ? formattedEvidence
        : [
            {
              source: 'Islamic Analysis',
              snippet: summary,
            },
          ];

    return {
      verdict: isPermissible ? 'not_sin' : 'sin',
      evidence: finalEvidence,
      summary,
    };
  } catch (error) {
    console.error('Error verifying deed with Reminder.dev API:', error);
    throw new Error('Failed to verify deed. Please try again.');
  }
};

/**
 * Hybrid verification function that tries multiple APIs
 * Falls back from Fanar API to Reminder.dev API
 */
export const verifyDeedHybrid = async (
  query: string,
  language: string = 'en'
): Promise<DeedVerificationResponse> => {
  const fanarApiKey = import.meta.env.VITE_FANAR_API_KEY;

  // If Fanar API is properly configured, use it first
  if (fanarApiKey && fanarApiKey !== 'your_fanar_api_key_here') {
    try {
      // Import the main verifyDeed function
      const { verifyDeed } = await import('./api');
      return await verifyDeed(query, language);
    } catch (error) {
      console.warn('Fanar API failed, falling back to Reminder.dev:', error);
      // Fall back to Reminder.dev
      return await verifyDeedWithReminderDev(query, language);
    }
  }

  // Use Reminder.dev as primary if Fanar is not configured
  try {
    return await verifyDeedWithReminderDev(query, language);
  } catch (error) {
    console.error('All APIs failed:', error);

    // Final fallback to mock response
    return {
      verdict: 'sin',
      evidence: [
        {
          source: 'API Services Unavailable',
          snippet: `Unable to verify "${query}" at this time. Both Fanar API and Reminder.dev API are unavailable. Please check your internet connection and try again later.`,
        },
      ],
    };
  }
};

/**
 * Summarize API response for better user experience
 */
function summarizeReminderDevResponse(htmlAnswer: string): string {
  // Remove HTML tags and get clean text
  const cleanText = htmlAnswer.replace(/<[^>]*>/g, '').trim();

  // Look for the key verdict in the first few sentences
  const sentences = cleanText.split(/[.!?]+/).filter((s) => s.trim().length > 15);

  if (sentences.length === 0) return cleanText.substring(0, 150) + '...';

  // Take the first sentence (usually contains the main ruling)
  let summary = sentences[0].trim();

  // If the first sentence is very short or doesn't clearly state the ruling, add context
  if (
    (summary.length < 40 ||
      !/\b(permissible|forbidden|haram|halal|allowed|prohibited|yes|no)\b/i.test(summary)) &&
    sentences.length > 1
  ) {
    summary += '. ' + sentences[1].trim();
  }

  // Ensure summary is complete but not too long
  if (summary.length > 200) {
    // Cut at word boundary but ensure completeness
    const words = summary.split(' ');
    let truncated = '';
    for (const word of words) {
      if ((truncated + word).length > 180) break;
      truncated += (truncated ? ' ' : '') + word;
    }
    summary = truncated + '.';
  }

  return summary;
}

/**
 * Format references to show most relevant Quran and Hadith sources (complete)
 */
function formatReminderDevEvidence(
  references: Array<{
    text?: string;
    metadata?: {
      source?: string;
      chapter?: string;
      verse?: string;
      volume?: string;
      book?: string;
      name?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }>
): Evidence[] {
  if (!references || references.length === 0) return [];

  // Prioritize Quran and Hadith sources, limit to top 3
  const prioritySources = references
    .filter((ref) => ref.metadata?.source === 'quran' || ref.metadata?.source === 'bukhari')
    .slice(0, 3);

  return prioritySources.map((ref) => {
    let source = '';

    if (ref.metadata?.source === 'quran') {
      source = `Quran ${ref.metadata.chapter}:${ref.metadata.verse}`;
      if (ref.metadata.name) {
        source += ` (${ref.metadata.name})`;
      }
    } else if (ref.metadata?.source === 'bukhari') {
      source = 'Sahih Bukhari';
      if (ref.metadata.volume && ref.metadata.book) {
        source += ` - ${ref.metadata.volume}, ${ref.metadata.book}`;
      }
    }

    return {
      source: source || 'Islamic Source',
      snippet: ref.text || '', // Keep complete text for sources section
    };
  });
}
