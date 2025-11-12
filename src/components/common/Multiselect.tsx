// Multiselect - Dropdown with checkbox multiselect

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface MultiselectOption {
  value: string;
  label: string;
}

interface MultiselectProps {
  label: string;
  options: MultiselectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function Multiselect({ label, options, selected, onChange, placeholder = 'Select...' }: MultiselectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const getDisplayText = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) {
      const option = options.find(o => o.value === selected[0]);
      return option?.label || selected[0];
    }
    return `${selected.length} selected`;
  };

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
      >
        <span className={selected.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
          {getDisplayText()}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map(option => (
            <label
              key={option.value}
              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggleOption(option.value)}
                className="w-4 h-4 text-[#3FB95A] border-gray-300 rounded focus:ring-[#3FB95A]"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
          
          {options.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">No options available</div>
          )}
        </div>
      )}

      {/* Selected count badge */}
      {selected.length > 0 && (
        <div className="absolute -top-1 -right-1 bg-[#3FB95A] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {selected.length}
        </div>
      )}
    </div>
  );
}
