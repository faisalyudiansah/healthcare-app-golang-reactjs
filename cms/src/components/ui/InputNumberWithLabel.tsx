import React, { ForwardedRef } from "react";
import { FormFour } from "../../models/CreateProductForms";
import {
  FieldErrors,
  Path,
  UseFormRegister,
  UseFormTrigger,
  UseFormWatch,
} from "react-hook-form";

// MARK: HANDLE KEYS
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // https://stackoverflow.com/questions/2353550/how-to-capture-a-backspace-on-the-onkeydown-event
  const isNumber = /[0-9]/.test(e.key);
  const isBackspaceKeyOrDeleteKey =
    e.code === "Backspace" || e.code === "Delete" || e.code === "Tab";
  const isRightLeftArrowKey = e.code === "ArrowRight" || e.code === "ArrowLeft";

  if (!isNumber && !isBackspaceKeyOrDeleteKey && !isRightLeftArrowKey) {
    e.preventDefault();
  }
};

interface ThisProps {
  forName: string;
  placeholder: string;
  formFourCallback: React.Dispatch<React.SetStateAction<FormFour>>;
  formHook: {
    trigger: UseFormTrigger<FormFour>;
    register: UseFormRegister<FormFour>;
    label: Path<FormFour>;
    errors: FieldErrors<FormFour>;
    watch: UseFormWatch<FormFour>;
  };
}

const InputNumberWithLabel = React.forwardRef(
  (
    { forName, placeholder, formFourCallback, formHook }: ThisProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const { register, label } = formHook;

    const id = "inputNum" + forName;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      formFourCallback((prev) => {
        return {
          ...prev,
          [e.target.name]: e.target.value,
        };
      });
    };

    return (
      <label htmlFor={id}>
        <div className="sub-form-heading mb-2">
          {forName.charAt(0).toUpperCase().concat(forName.substring(1))}
        </div>
        <input
          {...register(label, {
            validate: () => {
              const thisRef = ref as React.RefObject<HTMLInputElement>;
              if (thisRef.current) {
                if (!thisRef.current.value) {
                  return false;
                }
              }

              return true;
            },
          })}
          className="form-input-text"
          type="number"
          id={id}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          name={forName}
          onChange={handleChange}
          ref={ref}
        />
      </label>
    );
  }
);

export default InputNumberWithLabel;
