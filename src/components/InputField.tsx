import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputFieldProps {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

const InputField = ({ label, icon: Icon, value, onChange, type = 'text', placeholder }: InputFieldProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      <Icon className="inline-block w-4 h-4 mr-2" />
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
      placeholder={placeholder}
    />
  </div>
);

export default InputField;