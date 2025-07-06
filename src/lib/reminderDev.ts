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

interface ProxyApiResponse {
  verdict: 'sin' | 'not_sin';
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
  // Check offline knowledge base first for better performance
  const offlineResult = searchOfflineKnowledge(query);
  if (offlineResult) {
    return {
      ...offlineResult,
      summary: `${offlineResult.summary}`,
    };
  }

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

    // Analyze the response to determine verdict
    const answer = reminderData.answer.toLowerCase();
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
    const formattedEvidence = formatReminderDevEvidence(reminderData.references || []);
    const summary = summarizeReminderDevResponse(reminderData.answer);

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

/**
 * Simple offline knowledge base for common Islamic deeds
 * Used as fallback when APIs are unavailable
 */
const offlineKnowledgeBase: Record<string, DeedVerificationResponse> = {
  // Forbidden acts
  'drinking alcohol': {
    verdict: 'sin',
    evidence: [
      {
        source: 'Quran 5:90',
        snippet:
          "O you who believe! Intoxicants, gambling, stone alters and divining arrows are an abomination of Satan's handiwork. So avoid them so that you may be successful.",
      },
    ],
    summary: 'Consuming alcohol is clearly forbidden in Islam.',
  },
  alcohol: {
    verdict: 'sin',
    evidence: [
      {
        source: 'Quran 5:90',
        snippet:
          "O you who believe! Intoxicants, gambling, stone alters and divining arrows are an abomination of Satan's handiwork. So avoid them so that you may be successful.",
      },
    ],
    summary: 'Consuming alcohol is clearly forbidden in Islam.',
  },
  gambling: {
    verdict: 'sin',
    evidence: [
      {
        source: 'Quran 2:219',
        snippet:
          'They ask you about wine and gambling. Say: "In them is great sin and some benefit for men, but the sin is greater than the benefit."',
      },
    ],
    summary: 'Gambling is prohibited in Islam as it leads to addiction and social harm.',
  },
  'eating pork': {
    verdict: 'sin',
    evidence: [
      {
        source: 'Quran 2:173',
        snippet:
          'He has forbidden you only dead animals, blood, the flesh of swine, and that which has been dedicated to other than Allah.',
      },
    ],
    summary: 'Consuming pork is explicitly forbidden in Islam.',
  },
  pork: {
    verdict: 'sin',
    evidence: [
      {
        source: 'Quran 2:173',
        snippet:
          'He has forbidden you only dead animals, blood, the flesh of swine, and that which has been dedicated to other than Allah.',
      },
    ],
    summary: 'Consuming pork is explicitly forbidden in Islam.',
  },
  stealing: {
    verdict: 'sin',
    evidence: [
      {
        source: 'Quran 5:38',
        snippet:
          'As for the thief, both male and female, cut off their hands. It is the reward of their own deeds, an exemplary punishment from Allah.',
      },
    ],
    summary: 'Theft is a major sin in Islam with severe prescribed punishment.',
  },
  lying: {
    verdict: 'sin',
    evidence: [
      {
        source: 'Hadith - Bukhari',
        snippet:
          'The Prophet (peace be upon him) said: "Truthfulness leads to righteousness, and righteousness leads to Paradise. And lying leads to Al-Fajur (i.e. wickedness, evil-doing), and Al-Fajur leads to the (Hell) Fire."',
      },
    ],
    summary: 'Lying is condemned in Islam and leads one away from righteousness.',
  },
  adultery: {
    verdict: 'sin',
    evidence: [
      {
        source: 'Quran 17:32',
        snippet:
          'And do not approach unlawful sexual intercourse. Indeed, it is ever an immorality and is evil as a way.',
      },
    ],
    summary: 'Adultery is a major sin in Islam and is strictly forbidden.',
  },
  interest: {
    verdict: 'sin',
    evidence: [
      {
        source: 'Quran 2:275',
        snippet:
          'Those who consume interest cannot stand except as one stands who is being beaten by Satan into insanity.',
      },
    ],
    summary: 'Dealing in interest (riba) is forbidden in Islam.',
  },
  riba: {
    verdict: 'sin',
    evidence: [
      {
        source: 'Quran 2:275',
        snippet:
          'Those who consume interest cannot stand except as one stands who is being beaten by Satan into insanity.',
      },
    ],
    summary: 'Riba (interest/usury) is strictly prohibited in Islam.',
  },
  backbiting: {
    verdict: 'sin',
    evidence: [
      {
        source: 'Quran 49:12',
        snippet:
          'And do not spy or backbite each other. Would one of you like to eat the flesh of his brother when dead? You would detest it.',
      },
    ],
    summary: 'Backbiting (speaking ill of someone behind their back) is forbidden in Islam.',
  },

  // Permissible acts
  praying: {
    verdict: 'not_sin',
    evidence: [
      {
        source: 'Quran 2:3',
        snippet:
          'Who believe in the unseen, establish prayer, and spend out of what We have provided for them.',
      },
    ],
    summary: 'Prayer (Salah) is one of the five pillars of Islam and is highly recommended.',
  },
  prayer: {
    verdict: 'not_sin',
    evidence: [
      {
        source: 'Quran 2:3',
        snippet:
          'Who believe in the unseen, establish prayer, and spend out of what We have provided for them.',
      },
    ],
    summary: 'Prayer (Salah) is one of the five pillars of Islam and is highly recommended.',
  },
  'giving charity': {
    verdict: 'not_sin',
    evidence: [
      {
        source: 'Quran 2:261',
        snippet:
          'The example of those who spend their wealth in the way of Allah is like a seed which grows seven spikes; in each spike is a hundred grains.',
      },
    ],
    summary: 'Charity (Zakat and Sadaqah) is encouraged and rewarded greatly in Islam.',
  },
  charity: {
    verdict: 'not_sin',
    evidence: [
      {
        source: 'Quran 2:261',
        snippet:
          'The example of those who spend their wealth in the way of Allah is like a seed which grows seven spikes; in each spike is a hundred grains.',
      },
    ],
    summary: 'Charity (Zakat and Sadaqah) is encouraged and rewarded greatly in Islam.',
  },
  'reading quran': {
    verdict: 'not_sin',
    evidence: [
      {
        source: 'Hadith - Tirmidhi',
        snippet:
          'The Prophet (peace be upon him) said: "Whoever reads a letter from the Book of Allah, he will have a reward, and this reward will be multiplied by ten."',
      },
    ],
    summary: 'Reading the Quran is highly encouraged and rewarded in Islam.',
  },
  'eating halal food': {
    verdict: 'not_sin',
    evidence: [
      {
        source: 'Quran 2:168',
        snippet:
          'O mankind, eat from whatever is on earth that is lawful and good and do not follow the footsteps of Satan.',
      },
    ],
    summary: 'Eating halal (lawful) food is not only permissible but encouraged in Islam.',
  },
  fasting: {
    verdict: 'not_sin',
    evidence: [
      {
        source: 'Quran 2:183',
        snippet:
          'O you who believe! Fasting is prescribed for you as it was prescribed for those before you, that you may become righteous.',
      },
    ],
    summary: 'Fasting is prescribed in Islam and is one of the five pillars.',
  },
  hajj: {
    verdict: 'not_sin',
    evidence: [
      {
        source: 'Quran 3:97',
        snippet:
          'And pilgrimage to the House is a duty unto Allah for mankind, for him who can find a way thither.',
      },
    ],
    summary: 'Hajj (pilgrimage) is one of the five pillars of Islam for those who are able.',
  },
  'helping others': {
    verdict: 'not_sin',
    evidence: [
      {
        source: 'Hadith - Muslim',
        snippet:
          'The Prophet (peace be upon him) said: "Whoever relieves a believer of a burden from burdens of the world, Allah will relieve him of a burden from burdens of the Hereafter."',
      },
    ],
    summary: 'Helping others is highly encouraged and rewarded in Islam.',
  },
  'being kind to parents': {
    verdict: 'not_sin',
    evidence: [
      {
        source: 'Quran 17:23',
        snippet:
          'Your Lord has decreed that you worship none but Him, and be kind to parents. Whether one or both of them reach old age with you, do not say "uff" to them or reprimand them, but speak to them graciously.',
      },
    ],
    summary: 'Being kind and respectful to parents is a religious obligation in Islam.',
  },
  studying: {
    verdict: 'not_sin',
    evidence: [
      {
        source: 'Hadith - Ibn Majah',
        snippet:
          'The Prophet (peace be upon him) said: "Seek knowledge from the cradle to the grave."',
      },
    ],
    summary: 'Seeking knowledge is encouraged in Islam and is considered a form of worship.',
  },
  working: {
    verdict: 'not_sin',
    evidence: [
      {
        source: 'Hadith - Bukhari',
        snippet:
          'The Prophet (peace be upon him) said: "No one eats better food than that which he eats out of the work of his hand."',
      },
    ],
    summary: 'Honest work and earning through lawful means is encouraged in Islam.',
  },
};

/**
 * Search offline knowledge base for deed verification
 */
const searchOfflineKnowledge = (query: string): DeedVerificationResponse | null => {
  const normalizedQuery = query.toLowerCase().trim();

  // Direct match
  if (offlineKnowledgeBase[normalizedQuery]) {
    return offlineKnowledgeBase[normalizedQuery];
  }

  // Partial match
  for (const [key, value] of Object.entries(offlineKnowledgeBase)) {
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
      return value;
    }
  }

  return null;
};
