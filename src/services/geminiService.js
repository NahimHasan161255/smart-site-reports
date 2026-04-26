export const generateReport = async (transcript, apiKey, languageCode) => {
  if (!apiKey) {
    throw new Error('API Key is missing');
  }

  // First, dynamically fetch the available models to avoid "not found" errors
  let modelToUse = 'models/gemini-1.5-flash'; // fallback
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      if (listData.models && listData.models.length > 0) {
        // Find a gemini model that supports generateContent
        const validModel = listData.models.find(m => 
          m.supportedGenerationMethods?.includes("generateContent") && 
          m.name.includes("gemini")
        );
        if (validModel) {
          modelToUse = validModel.name; // This is usually formatted as 'models/gemini-XXX'
        }
      }
    }
  } catch (e) {
    console.warn("Could not list models, using fallback", e);
  }

  // The endpoint uses the dynamically fetched model name
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${modelToUse}:generateContent?key=${apiKey}`;

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

export const translateReportContent = async (reportData, apiKey, targetLanguageCode) => {
  if (!apiKey) throw new Error('API Key is missing');

  let modelToUse = 'models/gemini-1.5-flash';
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      if (listData.models && listData.models.length > 0) {
        const validModel = listData.models.find(m => m.supportedGenerationMethods?.includes("generateContent") && m.name.includes("gemini"));
        if (validModel) modelToUse = validModel.name;
      }
    }
  } catch (e) {
    console.warn("Could not list models, using fallback", e);
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${modelToUse}:generateContent?key=${apiKey}`;

  const prompt = `
    You are a professional translator for construction documents.
    Translate the following JSON report values into the language code: ${targetLanguageCode}.
    Do not change the keys or structure, only translate the values of 'progress', 'materials', and 'issues'.
    Return ONLY a valid JSON object. No markdown, no other text.

    Original Report:
    {
      "progress": "${reportData.progress}",
      "materials": "${reportData.materials}",
      "issues": "${reportData.issues}"
    }
  `;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch from Gemini API');
  }

  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
};
