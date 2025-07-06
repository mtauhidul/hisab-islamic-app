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
  verdict: 'sin' | 'not_sin' | 'contradictory';
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

interface ProxyApiResponse {
  verdict: 'sin' | 'not_sin' | 'contradictory';
  evidence: Evidence[];
  summary: string;
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
  // Always use API for fresh, accurate results - no offline fallback

  // Use proxy API in production to handle CORS, direct API in development
  const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const apiUrl = isDevelopment ? 'https://reminder.dev/api/search' : '/api/deed-checker';

  // If not found in offline knowledge base, try API as fallback
  try {
    let response;

    if (isDevelopment) {
      // Direct API call for development
      const question =
        language === 'ar'
          ? `هل ${query} حلال أم حرام في الإسلام؟ يرجى تقديم أدلة من القرآن والسنة.`
          : `Is ${query} permissible (halal) or forbidden (haram) in Islam? Please provide evidence from Quran and Hadith.`;

      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: question,
        }),
      });
    } else {
      // Use proxy API for production
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          language,
        }),
      });
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: ReminderDevSearchResponse | ProxyApiResponse = await response.json();

    // Handle production proxy response (already processed)
    if (!isDevelopment && 'verdict' in data && 'evidence' in data) {
      return data as ProxyApiResponse;
    }

    // Handle development direct API response
    const reminderData = data as ReminderDevSearchResponse;
    if (!reminderData.answer) {
      throw new Error('No response from API');
    }

    // Analyze the response with smarter verdict determination
    const answer = reminderData.answer.toLowerCase();

    // Start with conservative default
    let verdict: 'sin' | 'not_sin' | 'contradictory' = 'sin';

    // Clear permissibility indicators
    const clearlyPermissible = [
      'is permissible',
      'is halal',
      'is allowed',
      'is encouraged',
      'is recommended',
      'is mustahabb',
      'is mandated',
      'is obligatory',
      'allah encourages',
      'allah commands',
      'highly encouraged',
    ];

    // Clear prohibition indicators
    const clearlyForbidden = [
      'is forbidden',
      'is haram',
      'is prohibited',
      'not allowed',
      'must not',
      'allah forbids',
      'strictly forbidden',
    ];

    // Uncertainty/debate indicators
    const uncertaintyIndicators = [
      'debated',
      'scholars differ',
      'depends on',
      'varies',
      'controversial',
      'some scholars',
      'different opinions',
      'context matters',
      'disputed',
      'disagreement',
      'conditions apply',
    ];

    // Count evidence strength
    const permissibleCount = clearlyPermissible.filter((phrase) => answer.includes(phrase)).length;
    const forbiddenCount = clearlyForbidden.filter((phrase) => answer.includes(phrase)).length;
    const uncertaintyCount = uncertaintyIndicators.filter((phrase) =>
      answer.includes(phrase)
    ).length;

    // Smart verdict determination
    if (uncertaintyCount > 0) {
      verdict = 'contradictory'; // New verdict type for debated matters
    } else if (permissibleCount > forbiddenCount && permissibleCount > 0) {
      // Ensure the response is actually about the query topic
      const queryWords = query.toLowerCase().split(' ');
      const responseMatchesQuery = queryWords.some(
        (word) => word.length > 3 && answer.includes(word)
      );

      if (responseMatchesQuery) {
        verdict = 'not_sin';
      }
    } else if (forbiddenCount > 0) {
      verdict = 'sin';
    }
    // Default remains 'sin' for unclear cases

    // Process references with relevance filtering and format for user display
    const queryKeywords = query
      .toLowerCase()
      .split(' ')
      .filter((word) => word.length > 2);
    const formattedEvidence = formatReminderDevEvidence(
      reminderData.references || [],
      queryKeywords
    );
    const summary = summarizeReminderDevResponse(reminderData.answer, verdict);

    // If no relevant formatted evidence from references, use the answer itself but summarized
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
      verdict: verdict,
      evidence: finalEvidence,
      summary,
    };
  } catch (error) {
    console.error('Error verifying deed with API:', error);

    // Return a general response for unknown deeds
    return {
      verdict: 'sin', // Conservative approach
      evidence: [
        {
          source: 'Islamic Guidance',
          snippet: `For guidance on "${query}", please consult with a qualified Islamic scholar or refer to authentic Islamic sources such as the Quran and Hadith.`,
        },
      ],
      summary: `Unable to provide specific guidance on "${query}". Please consult authentic Islamic sources.`,
    };
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
    } catch {
      // Fanar API failed, falling back to Reminder.dev
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
 * Create very concise summary from API response (1-2 sentences maximum)
 */
function summarizeReminderDevResponse(
  htmlAnswer: string,
  verdict?: 'sin' | 'not_sin' | 'contradictory'
): string {
  // Remove HTML tags and get clean text
  const cleanText = htmlAnswer
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, '')
    .trim();

  // Extract the most direct statement about the ruling
  const sentences = cleanText.split(/[.!?]+/).filter((s) => s.trim().length > 5);
  if (sentences.length === 0) return cleanText.substring(0, 120) + '...';

  // Look for the sentence that contains the core ruling
  let coreSentence = sentences[0].trim();

  // Prioritize sentences with clear verdict terms
  for (const sentence of sentences.slice(0, 4)) {
    const s = sentence.trim().toLowerCase();
    if (
      s.includes('permissible') ||
      s.includes('forbidden') ||
      s.includes('haram') ||
      s.includes('halal') ||
      s.includes('allowed') ||
      s.includes('prohibited')
    ) {
      coreSentence = sentence.trim();
      break;
    }
  }

  let summary = coreSentence;

  // If verdict is uncertain, add clarification
  if (verdict === 'sin' && (summary.includes('debated') || summary.includes('scholars differ'))) {
    summary += ' Due to scholarly disagreement, it is safer to avoid this practice.';
  }

  // Ensure summary is very concise (max 120 characters for mobile UX)
  if (summary.length > 120) {
    summary = summary.substring(0, 117) + '...';
  }

  return summary;
}

/**
 * Format references to show proper citations with relevance filtering
 */
function formatReminderDevEvidence(
  references: Array<{
    text?: string;
    metadata?: {
      source?: string;
      chapter?: string;
      verse?: string;
      surah?: string;
      ayah?: string;
      surah_name?: string;
      volume?: string;
      book?: string;
      book_number?: string;
      hadith_number?: string;
      collection?: string;
      name?: string;
      info?: string;
      reference?: string;
      citation?: string;
      context?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }>,
  queryKeywords: string[] = []
): Evidence[] {
  if (!references || references.length === 0) return [];

  // Filter for relevance to the query first
  const relevantReferences = references.filter((ref) => {
    if (!ref.text || queryKeywords.length === 0) return true;

    const refText = ref.text.toLowerCase();

    // Check if reference is actually about the queried topic
    const isRelevant = queryKeywords.some(
      (keyword) =>
        refText.includes(keyword) ||
        (ref.metadata?.context && ref.metadata.context.toLowerCase().includes(keyword))
    );

    return isRelevant;
  });

  // If no relevant references found, return empty to trigger fallback
  if (relevantReferences.length === 0) return [];

  // Prioritize Quran and Hadith sources, limit to top 2 for better UX
  const prioritySources = relevantReferences
    .filter((ref) => {
      const source = ref.metadata?.source || ref.metadata?.collection || '';
      return (
        source === 'quran' ||
        source === 'bukhari' ||
        source === 'muslim' ||
        source.includes('hadith') ||
        source.includes('quran')
      );
    })
    .slice(0, 2);

  // If no priority sources, take first 2 relevant ones
  const finalReferences =
    prioritySources.length > 0 ? prioritySources : relevantReferences.slice(0, 2);

  return finalReferences.map((ref) => {
    let source = 'Islamic Source';
    let snippet = ref.text || '';

    if (ref.metadata) {
      if (ref.metadata.source === 'quran') {
        const chapter = ref.metadata.chapter || ref.metadata.surah || '';
        const verse = ref.metadata.verse || ref.metadata.ayah || '';
        if (chapter && verse) {
          source = `Quran ${chapter}:${verse}`;
          if (ref.metadata.name || ref.metadata.surah_name) {
            source += ` (Surah ${ref.metadata.name || ref.metadata.surah_name})`;
          }
        } else {
          source = 'Quran';
        }
      } else if (ref.metadata.source === 'bukhari' || ref.metadata.collection === 'bukhari') {
        source = 'Sahih Bukhari';
        if (ref.metadata.book_number && ref.metadata.hadith_number) {
          source += ` Book ${ref.metadata.book_number}, Hadith ${ref.metadata.hadith_number}`;
        } else if (ref.metadata.reference) {
          source += ` ${ref.metadata.reference}`;
        }
      } else if (ref.metadata.source === 'muslim' || ref.metadata.collection === 'muslim') {
        source = 'Sahih Muslim';
        if (ref.metadata.book_number && ref.metadata.hadith_number) {
          source += ` Book ${ref.metadata.book_number}, Hadith ${ref.metadata.hadith_number}`;
        }
      } else if (ref.metadata.source) {
        source = ref.metadata.source.charAt(0).toUpperCase() + ref.metadata.source.slice(1);
        if (ref.metadata.reference || ref.metadata.citation) {
          source += ` ${ref.metadata.reference || ref.metadata.citation}`;
        }
      }
    }

    // Ensure snippet is meaningful and concise
    if (snippet.length > 180) {
      snippet = snippet.substring(0, 177) + '...';
    }

    return {
      source,
      snippet,
    };
  });
}

/**
 * Simple offline knowledge base for common Islamic deeds
 * Used as fallback when APIs are unavailable
 */
// Removed offline knowledge base - using API only for accurate results
// Removed offline knowledge base - using API only for accurate results
