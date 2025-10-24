// app/api/parse-jd/route.ts
import { NextRequest, NextResponse } from 'next/server';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

// Test with a hardcoded example first - REPLACE your entire POST function temporarily
export async function POST(request: NextRequest) {
  try {
    const { jdText } = await request.json();
    
    console.log('JD Text Length:', jdText?.length);
    console.log('JD Text Preview:', jdText?.substring(0, 300));

    if (!jdText) {
      return NextResponse.json(
        { error: 'Job description text is required' },
        { status: 400 }
      );
    }

    if (!MISTRAL_API_KEY) {
      return NextResponse.json(
        { error: 'Mistral API key not configured' },
        { status: 500 }
      );
    }

    // SIMPLIFIED PROMPT
    const prompt = `You are a job description parser. Extract information from this job description.

Job Description:
${jdText}

Return a JSON object with these fields (extract from the text above):
- title: the job title
- location: the work location
- salary: salary/compensation mentioned
- employmentType: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, or FREELANCE
- department: department name
- description: brief summary
- highlights: array of key benefits
- qualifications: array of requirements
- skills: array of required skills
- education: education requirements
- startDate: when job starts
- openings: number of positions

Return ONLY valid JSON with these exact fields.`;

    console.log('Sending prompt to Mistral...');

    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts structured information from job descriptions. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    console.log('Mistral response:', JSON.stringify(data, null, 2));
    
    const parsedContent = data.choices[0]?.message?.content;
    console.log('Parsed content:', parsedContent);

    const parsedData = JSON.parse(parsedContent);
    
    // Normalize
    const validEmploymentTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'];
    if (!validEmploymentTypes.includes(parsedData.employmentType)) {
      parsedData.employmentType = 'FULL_TIME';
    }

    parsedData.highlights = Array.isArray(parsedData.highlights) ? parsedData.highlights : [];
    parsedData.qualifications = Array.isArray(parsedData.qualifications) ? parsedData.qualifications : [];
    parsedData.skills = Array.isArray(parsedData.skills) ? parsedData.skills : [];
    parsedData.openings = parsedData.openings || 1;

    console.log('Final data being returned:', parsedData);

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to parse', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
