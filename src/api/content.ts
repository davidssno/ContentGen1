import OpenAI from 'openai';
import { logger } from '../utils/logger';

interface ContentGeneratorConfig {
  keyword: string;
  website: string;
  openaiKey: string;
  jinaKey: string;
}

async function fetchWebsiteContent(url: string, jinaKey: string) {
  logger.info(`Fetching content from website: ${url}`);
  
  try {
    const response = await fetch('https://r.jina.ai/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jinaKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-With-Links-Summary': 'true',
        'X-With-Images-Summary': 'true'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        `Failed to fetch website content: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    if (!data.data?.content) {
      throw new Error('No content found on the specified website');
    }
    
    logger.success('Successfully fetched website content', { 
      contentLength: data.data.content.length,
      hasLinks: !!data.data.links,
      hasImages: !!data.data.images
    });
    
    return data;
  } catch (error) {
    logger.error('Error fetching website content', { error });
    throw error instanceof Error ? error : new Error('Failed to fetch website content');
  }
}

async function searchRelatedContent(keyword: string, jinaKey: string) {
  logger.info(`Searching for related content with keyword: ${keyword}`);
  
  try {
    const response = await fetch('https://s.jina.ai/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jinaKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-With-Links-Summary': 'true',
        'X-With-Images-Summary': 'true'
      },
      body: JSON.stringify({ 
        q: keyword,
        options: 'Markdown'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        `Failed to search related content: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    if (!data.data?.length) {
      throw new Error('No related content found for the given keyword');
    }
    
    logger.success('Successfully fetched related content', { 
      resultsCount: data.data.length
    });
    
    return data;
  } catch (error) {
    logger.error('Error searching related content', { error });
    throw error instanceof Error ? error : new Error('Failed to search related content');
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

function formatImageMarkdown(images: Record<string, string>): string {
  return Object.entries(images)
    .map(([alt, url]) => `![${alt}](${url})`)
    .join('\n');
}

async function generateContentOutline(openai: OpenAI, keyword: string, websiteContent: string, images: Record<string, string>) {
  logger.info('Generating content outline');
  
  const imageList = formatImageMarkdown(images);
  const outlinePrompt = `
    Create a detailed outline for an article about "${keyword}" based on this content:
    ${truncateText(websiteContent, 2000)}
    
    Available images:
    ${imageList}
    
    Format the outline with main sections and subsections using markdown headers.
    Include relevant images from the list above in appropriate sections.
  `.trim();

  const outlineCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { 
        role: "system", 
        content: "Create a structured outline for an article with clear sections and subsections. Include relevant images where they enhance the content."
      },
      { role: "user", content: outlinePrompt }
    ],
    temperature: 0.7,
    max_tokens: 500
  });

  return outlineCompletion.choices[0].message.content || '';
}

async function generateSectionContent(
  openai: OpenAI, 
  section: string, 
  context: string, 
  images: Record<string, string>,
  links: Record<string, string>
) {
  logger.info(`Generating content for section: ${section}`);

  const imageList = formatImageMarkdown(images);
  const sectionPrompt = `
    Write content for this section of the article:
    ${section}
    
    Use this context:
    ${truncateText(context, 1500)}
    
    Available images:
    ${imageList}
    
    Available links: ${Object.keys(links).join(', ')}
    
    Requirements:
    - Use markdown formatting
    - Include relevant images from the list above where they enhance the content
    - Add appropriate links from the available list
    - Keep the content focused and engaging
  `.trim();

  const sectionCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { 
        role: "system", 
        content: "Write engaging article content using markdown formatting. Include relevant images and links to enhance the content."
      },
      { role: "user", content: sectionPrompt }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });

  return sectionCompletion.choices[0].message.content || '';
}

async function generateContent({ keyword, website, openaiKey, jinaKey }: ContentGeneratorConfig) {
  logger.info('Starting content generation process');
  
  try {
    // 1. Fetch website content
    const websiteData = await fetchWebsiteContent(website, jinaKey);
    const { content: websiteContent, images = {}, links = {} } = websiteData.data;
    
    // 2. Search for related content
    const searchData = await searchRelatedContent(keyword, jinaKey);
    const relatedContent = searchData.data
      .map((item: any) => item.content)
      .join('\n\n');

    // 3. Initialize OpenAI
    const openai = new OpenAI({ 
      apiKey: openaiKey,
      dangerouslyAllowBrowser: true
    });

    // 4. Generate outline with image suggestions
    const outline = await generateContentOutline(openai, keyword, websiteContent, images);
    
    // 5. Split outline into sections
    const sections = outline.split(/^##\s+/m).filter(Boolean);
    
    // 6. Generate content for each section
    const sectionContents = await Promise.all(
      sections.map(section => 
        generateSectionContent(openai, section, relatedContent, images, links)
      )
    );

    // 7. Combine all sections
    const fullContent = sectionContents.join('\n\n');
    
    logger.success('Successfully generated content', { 
      contentLength: fullContent.length,
      wordCount: fullContent.split(/\s+/).length,
      imageCount: Object.keys(images).length
    });

    return fullContent;
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred during content generation';
    logger.error('Error in content generation process', { error: errorMessage });
    throw new Error(errorMessage);
  }
}

export { generateContent };