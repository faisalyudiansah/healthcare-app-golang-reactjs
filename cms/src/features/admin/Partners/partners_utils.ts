import { PartnersDataWithActions } from '.';

export const updateIsLoading = (
  setter: React.Dispatch<React.SetStateAction<PartnersDataWithActions[]>>,
  index: number,
  boolState: boolean,
) => {
  setter((prev) => {
    return prev.map((p, idx) => {
      if (idx === index) {
        const newState: PartnersDataWithActions = {
          ...p,
          isLoading: boolState,
        };
        return newState;
      } else {
        return p;
      }
    });
  });
};
