import { PharmacistDataWithActions } from '.';

export const updateIsEditing = (
  setter: React.Dispatch<
    React.SetStateAction<PharmacistDataWithActions[] | null | undefined>
  >,
  index: number,
  boolState: boolean,
) => {
  if (!setter) return;

  setter((prev) => {
    if (!prev) return prev;

    return prev.map((p, idx) => {
      if (idx === index) {
        const newState: PharmacistDataWithActions = {
          ...p,
          isEditing: boolState,
        };
        return newState;
      } else {
        return p;
      }
    });
  });
};

export const updateIsLoading = (
  setter: React.Dispatch<React.SetStateAction<PharmacistDataWithActions[]>>,
  index: number,
  boolState: boolean,
) => {
  if (!setter) return;

  setter((prev) => {
    if (!prev) return prev;

    return prev.map((p, idx) => {
      if (idx === index) {
        const newState: PharmacistDataWithActions = {
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
