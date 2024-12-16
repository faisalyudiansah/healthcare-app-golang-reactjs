import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import useAxiosInfiniteScroll from '@/hooks/useAxiosInfiniteScroll';
import { isPrevParams } from '@/utils/StringFormatter';

interface DropdownProps<T> {
  placeholder: string;
  apiEndpoint: string;
  displayField: keyof T;
  valueField: keyof T;
  onSelect: (item: T) => void;
  label?: string;
  limit?: number;
  required?: boolean;
  defaultValue?: string; // Autofill feature: Default value for the input field
}

function InputBoxSearch<T extends object>({
  placeholder,
  apiEndpoint,
  displayField,
  valueField,
  onSelect,
  label,
  limit = 25,
  required,
  defaultValue = '', // Default value prop
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(defaultValue); // Initialize with defaultValue
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { fetchData, data, loading, hasMore, error } =
    useAxiosInfiniteScroll<T>(
      `${apiEndpoint}${isPrevParams(apiEndpoint)}name=${debouncedSearchTerm}`,
      limit,
    );

  // Autofill effect: Set the search term to the defaultValue when it changes
  useEffect(() => {
    setSearchTerm(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (isOpen) {
      fetchData(1, debouncedSearchTerm);
      setPage(1);
    }
  }, [debouncedSearchTerm, isOpen]);

  useEffect(() => {
    if (page === 1) {
      setAllData(data);
    } else {
      setAllData((prevData) => [...prevData, ...data]);
    }
  }, [data]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 1 && hasMore && !loading) {
        setPage((prevPage) => {
          const nextPage = prevPage + 1;
          fetchData(nextPage, debouncedSearchTerm);
          return nextPage;
        });
      }
    }
  };

  const handleSelect = (item: T) => {
    setSelectedItem(item);
    setSearchTerm(String(item[displayField]));
    onSelect(item);
    setIsOpen(false);
  };

  const handleInputClick = () => {
    setIsOpen(true);
    if (!data.length) {
      fetchData(1, debouncedSearchTerm);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div ref={dropdownRef} className="relative w-full py-3 pt-4">
      <div className="interactive-input-2">
        <input
          type="text"
          className="w-full subinput"
          placeholder={isFocused ? placeholder : ' '}
          value={searchTerm}
          onChange={handleSearchChange}
          onClick={handleInputClick}
          onFocus={() => {
            setIsFocused(true);
          }}
        />
        {label && (
          <label className="pl-1 text-base">
            {label}
            {required && <span className="text-red-600"> * </span>}
          </label>
        )}
        {isOpen && (
          <div className="absolute z-10 w-full mt-12 bg-white border border-gray-300 rounded-md shadow-lg">
            <ul
              ref={listRef}
              className="max-h-60 overflow-y-auto z-10"
              onScroll={handleScroll}
            >
              {allData.length > 0 ? (
                allData.map((item, index) => (
                  <li
                    key={`${String(item[valueField])}-${index}`}
                    className="p-2 hover:bg-gray-100 cursor-pointer z-10"
                    onClick={() => handleSelect(item)}
                  >
                    {String(item[displayField]) || 'No Data'}
                  </li>
                ))
              ) : (
                <li className="p-2 text-center text-gray-500">
                  {loading ? 'Loading...' : 'No results found'}
                </li>
              )}
              {loading && allData.length > 0 && (
                <li className="p-2 text-center">Loading more...</li>
              )}
              {error && (
                <li className="p-2 text-center text-red-500">{error}</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default InputBoxSearch;
