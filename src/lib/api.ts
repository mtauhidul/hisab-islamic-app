/**
 * @fileoverview Islamic Deed Verification API using Fanar API
 *
 * This module integrates with Fanar API (https://api.fanar.qa) to provide
 * authentic Islamic rulings on whether specific deeds are permissible (halal)
 * or not permissible (haram) according to Islamic teachings.
 *
 * The integration uses:
 * - Islamic-RAG model for accurate rulings based on Islamic sources
 * - Preferred sources: Quran, Sunnah, Islam Q&A, IslamWeb, Dorar
 * - Support for both Arabic and English queries
 * - Rate limit: 50 requests/minute
 *
 * @requires VITE_FANAR_API_KEY environment variable
 * @see https://api.fanar.qa/docs for full API documentation
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

interface FanarReference {
  index: number;
  number: number;
  source: string;
  content: string;
}

/**
 * Verify if a deed is considered a sin according to Islamic teachings using Fanar API
 *
 * @param query - The deed/action to verify
 * @param language - Language for the query ('en' or 'ar')
 * @returns Promise with verdict and evidence
 */
export const verifyDeed = async (
  query: string,
  language: string = 'en'
): Promise<DeedVerificationResponse> => {
  const apiKey = import.meta.env.VITE_FANAR_API_KEY;

  // Check if API key is properly configured
  if (!apiKey || apiKey === 'your_fanar_api_key_here') {
    // Use Reminder.dev API as primary option when Fanar is not configured
    try {
      // Using Reminder.dev API for Islamic deed verification (primary)
      const { verifyDeedWithReminderDev } = await import('./reminderDev');
      return await verifyDeedWithReminderDev(query, language);
    } catch {
      // Reminder.dev API failed

      // Return a helpful mock response for development
      // All APIs unavailable - using mock response

      return {
        verdict: 'sin',
        evidence: [
          {
            source: 'API Services Unavailable',
            snippet: `Unable to verify "${query}" at this time. Please check your internet connection and try again later.`,
          },
        ],
        summary: 'Service temporarily unavailable. Please try again later.',
      };
    }
  }

  const apiUrl = 'https://api.fanar.qa/v1/chat/completions';

  // Construct the prompt for Islamic deed verification
  const promptText =
    language === 'ar'
      ? `كعالم إسلامي، يرجى تحليل العمل التالي وتحديد ما إذا كان مسموحاً (حلال) أم غير مسموح (حرام) في الإسلام.

العمل المطلوب تحليله: "${query}"

يرجى تقديم:
1. حكم واضح: "مسموح" أو "غير_مسموح"
2. أدلة من المصادر الإسلامية (القرآن، الحديث، إجماع العلماء)

اكتب إجابتك بصيغة JSON كما يلي:
{
  "verdict": "مسموح" or "غير_مسموح",
  "evidence": [
    {
      "source": "اسم المصدر (مثل: القرآن 2:275، صحيح البخاري 1234، إلخ)",
      "snippet": "النص أو التفسير ذو الصلة"
    }
  ]
}

يرجى أن تكون شاملاً وتقدم مصادر إسلامية أصيلة لحكمك.`
      : `As an Islamic scholar, please analyze the following action and determine if it is permissible (halal) or not permissible (haram) in Islam. 

Action to analyze: "${query}"

Please provide:
1. A clear verdict: "permissible" or "not_permissible"
2. Evidence from Islamic sources (Quran, Hadith, scholarly consensus)

Format your response as a JSON object with the following structure:
{
  "verdict": "permissible" or "not_permissible",
  "evidence": [
    {
      "source": "source name (e.g., Quran 2:275, Sahih Bukhari 1234, etc.)",
      "snippet": "relevant text or explanation"
    }
  ]
}

Please be thorough and provide authentic Islamic sources for your ruling.`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'Islamic-RAG',
        messages: [
          {
            role: 'user',
            content: promptText,
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
        // Use Islamic sources for RAG
        preferred_sources: ['quran', 'sunnah', 'islam_qa', 'islamweb_fatwa', 'dorar'],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error(
          'Invalid Fanar API key. Please check:\n' +
            '1. Your API key is correct in the .env file\n' +
            '2. Your API key has been activated by Fanar\n' +
            '3. You have access to the Islamic-RAG model\n' +
            'Request access at: https://api.fanar.qa/request'
        );
      }

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }

      throw new Error(
        `Fanar API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const references: FanarReference[] = data.choices?.[0]?.message?.references || [];

    if (!content) {
      throw new Error('No response from Fanar API');
    }

    // Try to parse JSON response
    let parsedResponse;
    try {
      // Extract JSON from response if it's wrapped in text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      parsedResponse = JSON.parse(jsonStr);
    } catch {
      // Fallback: analyze the text response
      const isPermissible =
        content.toLowerCase().includes('permissible') &&
        !content.toLowerCase().includes('not permissible') &&
        !content.toLowerCase().includes('haram') &&
        !content.toLowerCase().includes('forbidden');

      parsedResponse = {
        verdict: isPermissible ? 'permissible' : 'not_permissible',
        evidence:
          references.length > 0
            ? references.map((ref: FanarReference) => ({
                source: ref.source || 'Islamic Source',
                snippet: ref.content || content.substring(0, 200) + '...',
              }))
            : [
                {
                  source: 'Islamic Analysis',
                  snippet: content.substring(0, 300) + '...',
                },
              ],
      };
    }

    // Add references from Fanar's RAG system if available
    if (
      references.length > 0 &&
      (!parsedResponse.evidence || parsedResponse.evidence.length === 0)
    ) {
      parsedResponse.evidence = references.map((ref: FanarReference) => ({
        source: ref.source || `Reference ${ref.number || ''}`,
        snippet: ref.content || '',
      }));
    }

    // Format the evidence for better user experience
    const formattedEvidence = formatEvidenceForUser(parsedResponse.evidence || []);
    const summary = summarizeResponse(content);

    return {
      verdict:
        parsedResponse.verdict === 'permissible' || parsedResponse.verdict === 'مسموح'
          ? 'not_sin'
          : 'sin',
      evidence:
        formattedEvidence.length > 0
          ? formattedEvidence
          : [
              {
                source: 'Islamic Analysis',
                snippet: 'Analysis completed based on Islamic teachings',
              },
            ],
      summary,
    };
  } catch (error) {
    console.error('Error verifying deed with Fanar API:', error);
    throw new Error('Failed to verify deed. Please try again.');
  }
};

/**
 * Summarize a long response into key points
 */
function summarizeResponse(text: string): string {
  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, '').trim();

  // Split into sentences
  const sentences = cleanText.split(/[.!?]+/).filter((s) => s.trim().length > 10);

  if (sentences.length === 0) return cleanText.substring(0, 150) + '...';

  // Take the first sentence (usually contains the main verdict)
  let summary = sentences[0].trim();

  // If the first sentence is very short or doesn't contain key verdict words, add the second one
  if (
    (summary.length < 30 ||
      !/\b(permissible|forbidden|haram|halal|allowed|prohibited)\b/i.test(summary)) &&
    sentences.length > 1
  ) {
    summary += '. ' + sentences[1].trim();
  }

  // Ensure it's not too long but complete
  if (summary.length > 200) {
    // Try to cut at a natural break point
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
 * Format evidence to show only the most relevant sources (but keep them complete)
 */
function formatEvidenceForUser(evidence: Evidence[]): Evidence[] {
  // Limit to top 3 most relevant sources but keep them complete
  const limitedEvidence = evidence.slice(0, 3);

  return limitedEvidence.map((ev) => ({
    source: ev.source,
    snippet: ev.snippet, // Keep the full snippet for detailed sources
  }));
}
