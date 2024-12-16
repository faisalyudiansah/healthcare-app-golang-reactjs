export const setBoolStateToTrue = (
  setter: React.Dispatch<React.SetStateAction<boolean>>
) => {
  return function () {
    setter(true);
  };
};

export const setBoolStateToFalse = (
  setter: React.Dispatch<React.SetStateAction<boolean>>
) => {
  return function () {
    setter(false);
  };
};
