export const generateReport = async (transcript, apiKey, languageCode) => {
  if (!apiKey) {
    throw new Error('API Key is missing');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
    You are an AI assistant for a construction site. 
    The user is speaking in language code: ${languageCode}.
    Read the following daily log transcript from a construction worker. 
    Extract the information into exactly three categories: 'progress', 'materials', and 'issues'.
    Return ONLY a valid JSON object with these three keys. No markdown blocks, no other text.
    If a category is not mentioned, put "Not mentioned".
    Always return the final report text ONLY in the language code: ${languageCode}. Do not translate to English unless the language code is en-US.

    Transcript:
    "${transcript}"
  `;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch from Gemini API');
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON
    const parsedData = JSON.parse(resultText);
    return parsedData;

  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};
