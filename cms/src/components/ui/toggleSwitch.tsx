import { ConvertActiveStatus } from '@/utils/StringFormatter';

type ToggleSwitchProps = {
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
  disabled?: boolean;
};

export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
}: ToggleSwitchProps) {
  // TODO: jangan lupa apus dirty code nya
  // console.log(disabled);
  return (
    <label className="inline-flex items-center me-5 cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer checked:after:text-red-50"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-transparent outline-none dark:peer-focus:ring-teal-800 peer-checked:after:translate-x-full  rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
      <span
        className={`ms-3 text-sm font-semibold tracking-wider  dark:text-gray-300 ${
          !checked ? 'text-gray-400' : 'text-gray-900'
        }`}
      >
        {ConvertActiveStatus(checked)}
      </span>
    </label>
  );
}
