/**
 * @fileoverview Islamic Deed Verification API using Fanar Chat API
 *
 * This module integrates with Fanar Chat API (https://api.fanar.qa/docs#tag/Chat)
 * to provide authentic Islamic rulings on whether specific deeds are permissible (halal)
 * or not permissible (haram) according to Islamic teachings.
 *
 * The integration uses:
 * - Chat completions endpoint with Islamic-RAG model
 * - Contextual conversation for accurate rulings
 * - Islamic sources: Quran, Sunnah, Islam Q&A, IslamWeb, Dorar
 * - Support for both Arabic and English queries
 * - Rate limit: 50 requests/minute
 *
 * @requires VITE_FANAR_API_KEY environment variable
 * @see https://api.fanar.qa/docs#tag/Chat for full API documentation
 */

interface Evidence {
  source: string;
  snippet: string;
}

interface DeedVerificationResponse {
  verdict: 'sin' | 'not_sin' | 'contradictory';
  evidence: Evidence[];
  summary: string;
  reasoning: string;
  brief_verdict: string;
}

interface FanarReference {
  index: number;
  number: number;
  source: string;
  content: string;
}

interface FanarChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface FanarChatRequest {
  model: string;
  messages: FanarChatMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
  stop?: string[];
}

interface FanarChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      references?: FanarReference[];
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
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

  if (!apiKey || apiKey === 'your_fanar_api_key_here') {
    throw new Error(
      'Fanar API key is required. Please configure VITE_FANAR_API_KEY environment variable.'
    );
  }

  const systemPrompt =
    language === 'ar'
      ? `أنت عالم إسلامي متخصص في الفقه. سيسألك المستخدم عن حكم فعل معين. قدم:
1. حكم مختصر واضح (حرام أو حلال)
2. تفسير موجز (جملة واحدة)
3. الأدلة التفصيلية من القرآن والسنة
أجب بـ "حرام" إذا كان الفعل محرماً، أو "حلال" إذا كان مباحاً.`
      : `You are an Islamic scholar specialized in Islamic jurisprudence. When asked about a deed, provide:
1. A clear brief ruling (sin or not_sin)
2. A concise explanation (one sentence)
3. Detailed evidence from Quran and Sunnah
Answer with "sin" if the deed is haram (forbidden) or "not_sin" if it is halal (permissible).`;

  const userPrompt =
    language === 'ar'
      ? `ما حكم: ${query}؟ أجب بـ "حرام" أو "حلال" مع الأدلة.`
      : `What is the Islamic ruling on: ${query}? Answer with "sin" or "not_sin" and provide evidence.`;

  try {
    const requestBody: FanarChatRequest = {
      model: 'Islamic-RAG',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.1,
    };

    const response = await fetch('https://api.fanar.qa/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fanar API error: ${response.status} - ${errorText}`);
    }

    const data: FanarChatResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from Fanar API');
    }

    const assistantMessage = data.choices[0].message;
    const content = assistantMessage.content.toLowerCase();
    const references = assistantMessage.references || [];

    // Determine verdict based on response
    let verdict: 'sin' | 'not_sin' | 'contradictory' = 'contradictory';

    if (language === 'ar') {
      if (content.includes('حرام') || content.includes('محرم')) {
        verdict = 'sin';
      } else if (
        content.includes('حلال') ||
        content.includes('مباح') ||
        content.includes('مستحب') ||
        content.includes('مندوب')
      ) {
        verdict = 'not_sin';
      }
    } else {
      // Check for forbidden/haram keywords first
      if (
        content.includes('haram') ||
        content.includes('forbidden') ||
        content.includes('prohibited') ||
        content.includes('not permissible')
      ) {
        verdict = 'sin';
      }
      // Check for permissible/encouraged keywords
      else if (
        content.includes('halal') ||
        content.includes('permissible') ||
        content.includes('allowed') ||
        content.includes('encouraged') ||
        content.includes('recommended') ||
        content.includes('virtuous') ||
        content.includes('good deed') ||
        content.includes('charity') ||
        content.includes('donation')
      ) {
        verdict = 'not_sin';
      }
      // Only check for "sin" if it's not in context of "not_sin"
      else if (content.includes('sin') && !content.includes('not_sin')) {
        verdict = 'sin';
      }
    }

    // Convert references to evidence format
    const evidence: Evidence[] = references.map((ref) => ({
      source: ref.source || 'Islamic Sources',
      snippet: ref.content || '',
    }));

    // If no references, extract evidence from the response content
    if (evidence.length === 0) {
      evidence.push({
        source: 'Fanar Islamic AI',
        snippet: assistantMessage.content,
      });
    }

    // Extract brief verdict and reasoning
    const brief_verdict = extractBriefVerdict(assistantMessage.content, verdict, language);
    const reasoning = extractReasoning(assistantMessage.content, language);

    return {
      verdict,
      evidence,
      summary: assistantMessage.content,
      reasoning,
      brief_verdict,
    };
  } catch (error) {
    console.error('Fanar API error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to verify deed with Fanar API'
    );
  }
};

/**
 * Extract a brief verdict statement from the response
 */
function extractBriefVerdict(
  _content: string,
  verdict: 'sin' | 'not_sin' | 'contradictory',
  language: string
): string {
  if (language === 'ar') {
    if (verdict === 'sin') {
      return 'هذا الفعل محرم في الإسلام';
    } else if (verdict === 'not_sin') {
      return 'هذا الفعل مباح في الإسلام';
    } else {
      return 'الحكم غير واضح - يحتاج مراجعة';
    }
  } else {
    if (verdict === 'sin') {
      return 'This action is forbidden (haram) in Islam';
    } else if (verdict === 'not_sin') {
      return 'This action is permissible (halal) in Islam';
    } else {
      return 'The ruling is unclear - requires further review';
    }
  }
}

/**
 * Extract reasoning from the response content
 */
function extractReasoning(content: string, language: string): string {
  // Split into sentences
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10);

  if (sentences.length === 0) {
    return language === 'ar' ? 'بناءً على التعاليم الإسلامية' : 'Based on Islamic teachings';
  }

  // Look for explanatory sentences
  const explanatoryWords =
    language === 'ar'
      ? ['لأن', 'بسبب', 'حيث', 'إذ', 'نظراً', 'وفقاً']
      : ['because', 'since', 'as', 'due to', 'according to', 'based on'];

  const explanatorySentence = sentences.find((sentence) =>
    explanatoryWords.some((word) => sentence.toLowerCase().includes(word.toLowerCase()))
  );

  if (explanatorySentence) {
    return explanatorySentence.trim();
  }

  // Fallback: return first substantial sentence
  const substantialSentence = sentences.find((s) => s.trim().length > 30);
  return (
    substantialSentence?.trim() ||
    (language === 'ar' ? 'بناءً على التعاليم الإسلامية' : 'Based on Islamic teachings')
  );
}
