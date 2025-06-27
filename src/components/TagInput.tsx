'use client';

import { useState, KeyboardEvent } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({
  value = [],
  onChange,
  placeholder = 'Add a tag and press Enter...',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && inputValue.trim() !== '') {
      event.preventDefault();
      const newTag = inputValue.trim();
      if (!value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
      <div
        className="flex flex-wrap gap-2 rounded-md border border-gray-300 p-2 shadow-sm"
        onClick={() => document.getElementById('tag-input-field')?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-md bg-indigo-100 px-2 py-1 text-sm font-medium text-indigo-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-indigo-500 hover:text-indigo-700"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </span>
        ))}
        <input
          id="tag-input-field"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-w-[150px] flex-grow border-none bg-transparent p-1 focus:outline-none focus:ring-0"
        />
      </div>
    </div>
  );
} 