import React from 'react';
import { Loader2, FileText } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const GenerateButton = ({ onClick, isLoading }: GenerateButtonProps) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
  >
    {isLoading ? (
      <>
        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
        Generating...
      </>
    ) : (
      <>
        <FileText className="-ml-1 mr-2 h-4 w-4" />
        Generate Content
      </>
    )}
  </button>
);

export default GenerateButton;