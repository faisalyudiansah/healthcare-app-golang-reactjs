import React from 'react';

const FilterByText: React.FC<{
  title: string;
  withName: 'name' | 'generic-name' | 'description';
  setStateHandler: React.Dispatch<
    React.SetStateAction<{
      name: string;
      'generic-name': string;
      description: string;
    }>
  >;
  placeholder: string;
}> = ({ title, withName, setStateHandler, placeholder }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStateHandler((prev) => ({
      ...prev,
      [withName]: e.target.value,
    }));
  };

  const forId = 'filter-products-' + withName;
  return (
    <label htmlFor={forId} className="w-full font-medium text-sm ">
      {title}
      <input
        type="text"
        className="mt-1 bg-transparent pl-3 placeholder-slate-300 border-2 border-[#d1d1d1]  rounded-lg h-10 w-full font-normal outline-slate-400"
        onChange={handleChange}
        placeholder={placeholder}
        id={forId}
      />
    </label>
  );
};

export default FilterByText;
