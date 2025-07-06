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

    // Analyze the response with extremely careful verdict determination
    const answer = reminderData.answer.toLowerCase();

    // Default to most conservative approach
    let verdict: 'sin' | 'not_sin' = 'sin';

    // Only very clear and unambiguous permissibility indicators
    const explicitlyPermissible = [
      'is explicitly permissible',
      'is clearly halal',
      'is definitely allowed',
      'allah has made it halal',
      'is lawful and good',
      'is mustahabb',
    ];

    // Any indication of prohibition or doubt
    const anyDoubt = [
      'forbidden',
      'haram',
      'prohibited',
      'not allowed',
      'not permissible',
      'should avoid',
      'better to avoid',
      'discouraged',
      'makruh',
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
      'some say',
      'others believe',
      'however',
      'but',
      'although',
      'except',
      'unless',
      'conditions',
      'circumstances',
    ];

    // Check for any doubt or ambiguity
    const hasAnyDoubt = anyDoubt.some((phrase) => answer.includes(phrase));
    const hasExplicitPermission = explicitlyPermissible.some((phrase) => answer.includes(phrase));

    // Only allow 'not_sin' if explicitly clear and no doubt at all
    if (hasExplicitPermission && !hasAnyDoubt) {
      // Additional check: ensure the query topic matches the response
      const queryWords = query.toLowerCase().split(' ');
      const responseMatchesQuery = queryWords.some(
        (word) => word.length > 3 && answer.includes(word)
      );

      if (responseMatchesQuery) {
        verdict = 'not_sin';
      }
    }
    // All other cases default to 'sin' for maximum safety

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
function summarizeReminderDevResponse(htmlAnswer: string, verdict?: 'sin' | 'not_sin'): string {
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

  // Debated/complex matters - defaults to conservative position
  singing: {
    verdict: 'sin',
    evidence: [
      {
        source: 'Islamic Scholarly Consensus',
        snippet:
          'Singing is a debated topic among Islamic scholars. While some permit it under certain conditions, others discourage it due to potential spiritual harms.',
      },
    ],
    summary:
      'Singing is debated among scholars. It is safer to avoid it and focus on dhikr and Quran recitation.',
  },
  music: {
    verdict: 'sin',
    evidence: [
      {
        source: 'Islamic Scholarly Consensus',
        snippet:
          'Musical instruments are generally discouraged in Islamic teaching. The daf (frame drum) is permitted for special occasions like weddings.',
      },
    ],
    summary:
      'Most musical instruments are discouraged in Islam except the daf for specific occasions.',
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
