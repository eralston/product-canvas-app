import React, { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';

interface EditableLabelProps {
  initialValue: string;
  onSave: (newValue: string) => void;
  characterLimit: number;
  className?: string;
  placeholder?: string;
  displayClassName?: string;
  inputClassName?: string;
  iconSize?: number;
}

const EditableLabel: React.FC<EditableLabelProps> = ({
  initialValue,
  onSave,
  characterLimit,
  className = '',
  placeholder = 'Enter text...',
  displayClassName = '',
  inputClassName = '',
  iconSize = 14
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update currentValue when initialValue changes
  useEffect(() => {
    setCurrentValue(initialValue);
  }, [initialValue]);

  // Focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedValue = currentValue.trim();
    if (trimmedValue !== initialValue) {
      onSave(trimmedValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(initialValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= characterLimit) {
      setCurrentValue(newValue);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <div className={className}>
        <input
          ref={inputRef}
          type="text"
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`bg-white border-2 border-blue-500 rounded px-2 py-1 outline-none font-open-sans ${inputClassName}`}
          maxLength={characterLimit}
        />
        {characterLimit - currentValue.length <= 10 && (
          <div className="text-xs text-gray-500 mt-1">
            {currentValue.length}/{characterLimit}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`group relative inline-flex items-center gap-2 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={`font-open-sans ${displayClassName}`}>
        {currentValue || placeholder}
      </span>
      <button
        onClick={handleEditClick}
        className={`
          flex items-center justify-center p-1 rounded transition-all duration-200
          ${isHovered 
            ? 'opacity-100 bg-gray-100 hover:bg-gray-200' 
            : 'opacity-0 group-hover:opacity-100'
          }
        `}
        title="Edit label"
      >
        <Pencil size={iconSize} className="text-gray-600" />
      </button>
    </div>
  );
};

export default EditableLabel;