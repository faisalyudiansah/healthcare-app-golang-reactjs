import React, { useState, forwardRef, useEffect, useRef } from 'react';
import { TbAbc, TbNumber123, TbMapPin } from 'react-icons/tb';
import { TWColCenterize } from '@/utils/UI/TWStrings';
import { FieldError } from 'react-hook-form';

interface InputBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type: 'text' | 'number' | 'address';
  placeholder: string;
  label: string;
  required?: boolean;
  error?: FieldError;
}

const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(
  (
    { type, placeholder, label, required = false, error, ...inputProps },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    useEffect(() => {
      if (isFocused) {
        document.addEventListener('mousedown', handleClickOutside);
      } else {
        document.removeEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isFocused]);

    const getIcon = () => {
      switch (type) {
        case 'number':
          return <TbNumber123 className="text-slate-400 size-6" />;
        case 'address':
          return <TbMapPin className="text-slate-400 size-6" />;
        case 'text':
        default:
          return <TbAbc className="text-slate-400 size-6" />;
      }
    };

    return (
      <div className="py-3 pt-4 relative">
        <div className="interactive-input-2">
          <input
            type={type}
            className={`w-full subinput ${error ? 'border-red-500' : ''}`}
            placeholder={isFocused ? placeholder : ' '}
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                (
                  ref as React.MutableRefObject<HTMLInputElement | null>
                ).current = node;
              }
            }}
            onFocus={() => {
              setIsFocused(true);
            }}
            {...inputProps}
          />
          <label>
            {label}
            {required && <span className="text-red-600"> *</span>}
          </label>
        </div>
        <div className={`absolute top-[23px] right-[26px] ${TWColCenterize}`}>
          {getIcon()}
        </div>

        {error && (
          <div className="absolute ml-1 mb-1 text-invalid-field">
            {error.message || `${label} is required`}
          </div>
        )}
      </div>
    );
  },
);

export default InputBox;
