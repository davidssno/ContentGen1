import React, { useState } from 'react';
import { Search, Key, Globe } from 'lucide-react';
import Header from './components/Header';
import InputField from './components/InputField';
import Editor from './components/Editor';
import GenerateButton from './components/GenerateButton';
import LogViewer from './components/LogViewer';
import { useContentGeneration } from './hooks/useContentGeneration';

const App = () => {
  const [keyword, setKeyword] = useState('');
  const [website, setWebsite] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [jinaKey, setJinaKey] = useState('');
  
  const { generate, isLoading, error, content } = useContentGeneration();

  const handleGenerate = () => {
    generate({ keyword, website, openaiKey, jinaKey });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 gap-6 mb-8">
            <InputField
              label="Keyword"
              icon={Search}
              value={keyword}
              onChange={setKeyword}
              placeholder="Enter your main keyword"
            />

            <InputField
              label="Website URL"
              icon={Globe}
              value={website}
              onChange={setWebsite}
              type="url"
              placeholder="https://example.com"
            />

            <InputField
              label="OpenAI API Key"
              icon={Key}
              value={openaiKey}
              onChange={setOpenaiKey}
              type="password"
              placeholder="sk-..."
            />

            <InputField
              label="Jina AI API Key"
              icon={Key}
              value={jinaKey}
              onChange={setJinaKey}
              type="password"
              placeholder="jina_..."
            />

            <GenerateButton onClick={handleGenerate} isLoading={isLoading} />

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
          </div>

          <Editor content={content} />
          <LogViewer />
        </div>
      </main>
    </div>
  );
};

export default App;