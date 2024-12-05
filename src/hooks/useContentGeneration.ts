import { useState } from 'react';
import { generateContent } from '../api/content';
import { logger } from '../utils/logger';
import { useLogger } from '../utils/logger';

interface ContentConfig {
  keyword: string;
  website: string;
  openaiKey: string;
  jinaKey: string;
}

export const useContentGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const clearLogs = useLogger((state) => state.clearLogs);

  const validateInputs = (config: ContentConfig) => {
    if (!config.keyword.trim()) {
      throw new Error('Please enter a keyword');
    }
    if (!config.website.trim()) {
      throw new Error('Please enter a website URL');
    }
    if (!config.website.match(/^https?:\/\/.+/)) {
      throw new Error('Please enter a valid website URL starting with http:// or https://');
    }
    if (!config.openaiKey.trim()) {
      throw new Error('Please enter your OpenAI API key');
    }
    if (!config.openaiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format');
    }
    if (!config.jinaKey.trim()) {
      throw new Error('Please enter your Jina AI API key');
    }
  };

  const generate = async (config: ContentConfig) => {
    try {
      // Reset states
      setError('');
      setContent('');
      clearLogs(); // Clear logs when starting new generation
      
      // Validate inputs
      validateInputs(config);
      
      // Start generation
      setIsLoading(true);
      logger.info('Starting content generation with provided configuration');
      
      const generatedContent = await generateContent(config);
      
      if (!generatedContent) {
        throw new Error('No content was generated');
      }
      
      setContent(generatedContent);
      logger.success('Content generation completed successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      logger.error(`Content generation failed: ${errorMessage}`);
      setError(errorMessage);
      setContent('');
    } finally {
      setIsLoading(false);
    }
  };

  return { generate, isLoading, error, content };
};