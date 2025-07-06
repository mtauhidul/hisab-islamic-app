/**
 * Vercel Serverless Function to proxy Reminder.dev API requests
 * This handles CORS issues by making server-side requests
 */

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
    const formattedEvidence = (data.references || [])
      .slice(0, 3) // Limit to top 3 references
      .map((ref) => ({
        source: ref.metadata?.source || 'Islamic Source',
        snippet: ref.text || ref.metadata?.info || 'Reference text',
      }));

    // Extract clean summary from HTML answer
    const summary = data.answer
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, '') // Remove HTML entities
      .trim();

    const result = {
      verdict: isPermissible ? 'not_sin' : 'sin',
      evidence:
        formattedEvidence.length > 0
          ? formattedEvidence
          : [
              {
                source: 'Islamic Analysis',
                snippet: summary,
              },
            ],
      summary,
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
