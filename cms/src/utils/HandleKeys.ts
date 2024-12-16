// HANDLE KEYS

export const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const spaceKey = e.code === 'Space';
  if (spaceKey) {
    e.preventDefault();
  }
};

export const handleKeyDownInvalidNumber = (
  e: React.KeyboardEvent<HTMLInputElement>,
) => {
  const invalidKeys = [
    'Period',
    'KeyE',
    'Minus',
    'Equal',
    'ArrowDown',
    'ArrowUp',
    'ControlLeft',
    'ControlRight',
    'KeyV',
  ].includes(e.code);
  if (invalidKeys) {
    e.preventDefault();
  }
};

export const handleKeyDownForPrice = (
  e: React.KeyboardEvent<HTMLInputElement>,
) => {
  const isNumber = /[0-9]/.test(e.key);
  const isBackspaceKeyOrDeleteKey =
    e.code === 'Backspace' || e.code === 'Delete';
  const isRightLeftArrowKey = e.code === 'ArrowRight' || e.code === 'ArrowLeft';

  if (!isNumber && !isBackspaceKeyOrDeleteKey && !isRightLeftArrowKey) {
    e.preventDefault();
  }
};
