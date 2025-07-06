/**
 * Vercel Serverless Function to proxy Reminder.dev API requests
 * This handles CORS issues by making server-side requests
 */

/**
 * Cross-verify Quran references using Al-Quran Cloud API
 * @param {string} query - The deed query
 * @param {Array} primaryEvidence - Evidence from primary source
 * @returns {Promise<Array>} - Enhanced evidence with verification
 */
async function crossVerifyQuranReferences(query, primaryEvidence) {
  try {
    // Search Al-Quran Cloud for relevant verses
    const searchResponse = await fetch(
      `https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/en`
    );

    if (!searchResponse.ok) {
      throw new Error(`Al-Quran API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();

    if (searchData.data && searchData.data.matches && searchData.data.matches.length > 0) {
      // Get the most relevant verse
      const relevantVerse = searchData.data.matches[0];

      // Get full verse details
      const verseResponse = await fetch(
        `https://api.alquran.cloud/v1/surah/${relevantVerse.surah.number}/${relevantVerse.numberInSurah}`
      );

      if (verseResponse.ok) {
        const verseData = await verseResponse.json();

        // Add cross-verification evidence
        const crossVerificationEvidence = {
          source: `Quran ${relevantVerse.surah.number}:${relevantVerse.numberInSurah} (${relevantVerse.surah.englishName})`,
          snippet: verseData.data.text,
          verified: true,
          crossVerification: true,
        };

        // Merge with primary evidence, avoiding duplicates
        const existingQuranSources = primaryEvidence.filter((e) => e.source.includes('Quran'));
        const isDuplicate = existingQuranSources.some((e) =>
          e.source.includes(`${relevantVerse.surah.number}:${relevantVerse.numberInSurah}`)
        );

        if (!isDuplicate) {
          return [...primaryEvidence, crossVerificationEvidence];
        }
      }
    }

    return primaryEvidence;
  } catch (error) {
    console.error('Cross-verification failed:', error);
    return primaryEvidence;
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, language = 'en' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Construct the question for Islamic deed verification
    const question =
      language === 'ar'
        ? `هل ${query} حلال أم حرام في الإسلام؟ يرجى تقديم أدلة من القرآن والسنة.`
        : `Is ${query} permissible (halal) or forbidden (haram) in Islam? Please provide evidence from Quran and Hadith.`;

    // Make request to Reminder.dev API
    const response = await fetch('https://reminder.dev/api/search', {
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

    const data = await response.json();

    if (!data.answer) {
      throw new Error('No response from Reminder.dev API');
    }

    // Analyze the response with extremely careful verdict determination
    const answer = data.answer.toLowerCase();
    const cleanAnswer = data.answer
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, '')
      .trim();

    // Default to most conservative approach
    let verdict = 'sin';

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

    // Process references with relevance filtering and proper citation formatting
    const queryKeywords = query
      .toLowerCase()
      .split(' ')
      .filter((word) => word.length > 2);

    const formattedEvidence = (data.references || [])
      .filter((ref) => {
        // Filter for relevance to the query
        if (!ref.text) return false;
        const refText = ref.text.toLowerCase();

        // Check if reference is actually about the queried topic
        const isRelevant = queryKeywords.some(
          (keyword) =>
            refText.includes(keyword) ||
            (ref.metadata?.context && ref.metadata.context.toLowerCase().includes(keyword))
        );

        return isRelevant;
      })
      .slice(0, 2) // Limit to top 2 most relevant
      .map((ref) => {
        let source = 'Islamic Source';
        let snippet = ref.text || 'Reference text';

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

        return { source, snippet };
      });

    // If no relevant references found, provide guidance instead of irrelevant ones
    const finalEvidence =
      formattedEvidence.length > 0
        ? formattedEvidence
        : [
            {
              source: 'Islamic Guidance',
              snippet: `The ruling on "${query}" requires careful consideration of Islamic sources. Please consult with a qualified Islamic scholar for specific guidance.`,
            },
          ];

    // Cross-verify with Al-Quran Cloud API for additional Quran references
    const crossVerifiedEvidence = await crossVerifyQuranReferences(query, finalEvidence);

    // Create very concise summary (1-2 sentences maximum)
    let summary = cleanAnswer;

    // Extract the most direct statement about the ruling
    const sentences = cleanAnswer.split(/[.!?]+/).filter((s) => s.trim().length > 5);
    if (sentences.length > 0) {
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

      summary = coreSentence;

      // If verdict is uncertain, add clarification
      if (
        verdict === 'sin' &&
        (summary.includes('debated') || summary.includes('scholars differ'))
      ) {
        summary += ' Due to scholarly disagreement, it is safer to avoid this practice.';
      }
    }

    // Ensure summary is very concise (max 120 characters for mobile UX)
    if (summary.length > 120) {
      summary = summary.substring(0, 117) + '...';
    }

    const result = {
      verdict: verdict,
      evidence: crossVerifiedEvidence,
      summary,
      crossVerified: crossVerifiedEvidence.length > finalEvidence.length, // Flag if additional sources found
    };

    // Set CORS headers to allow frontend requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in deed checker proxy:', error);

    // Return a conservative response for unknown deeds
    const fallbackResponse = {
      verdict: 'sin', // Conservative approach
      evidence: [
        {
          source: 'Islamic Guidance',
          snippet: `For guidance on "${req.body?.query || 'this matter'}", please consult with a qualified Islamic scholar or refer to authentic Islamic sources such as the Quran and Hadith.`,
        },
      ],
      summary: `Unable to provide specific guidance. Please consult authentic Islamic sources.`,
      crossVerified: false,
    };

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(200).json(fallbackResponse);
  }
}

// Handle CORS preflight requests
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
