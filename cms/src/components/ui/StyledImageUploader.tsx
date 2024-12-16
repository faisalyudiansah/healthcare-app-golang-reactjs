import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { IoImageOutline } from 'react-icons/io5';
import { FaPencilAlt } from 'react-icons/fa';
import { TWColCenterize } from '@/utils/UI/TWStrings';
import {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
  UseFormTrigger,
  UseFormWatch,
} from 'react-hook-form';
import { FaTrashAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { getFormCreateProduct } from '@/store/createProduct/createProductSlice';

interface ThisProps<T extends FieldValues> {
  title: string;
  additionalTitle?: string;
  forImgField?: 'thumbnailImg' | 'firstImg' | 'secondImg' | 'thirdImg'; // same as in redux
  formSetter: React.Dispatch<React.SetStateAction<T>>;
  additionalImgHook?: {
    getter: boolean;
    setter: React.Dispatch<React.SetStateAction<boolean>>;
  };
  formHook?: {
    trigger: UseFormTrigger<T>;
    register: UseFormRegister<T>;
    label: Path<T>;
    errors: FieldErrors<T>;
    watch: UseFormWatch<T>;
  };
  onTypeOfPng: (isPng: boolean) => void;
  onValidSize: (isValid: boolean) => void;
  completionHandler?: (file: File) => void;
  imageUrl?: string;
}

const toTitle = <T extends FieldValues>(
  field: ThisProps<T>['forImgField'],
): string => {
  switch (field) {
    case 'thumbnailImg':
      return 'Thumbnail';
    case 'firstImg':
      return 'First Image';
    case 'secondImg':
      return 'Second Image';
    case 'thirdImg':
      return 'Third Image';
    default:
      return '';
  }
};

const StyledImageUploader = <T extends FieldValues>({
  forImgField,
  title,
  additionalTitle,
  formSetter,
  formHook,
  additionalImgHook,
  completionHandler,
  onTypeOfPng,
  onValidSize,
  imageUrl,
}: ThisProps<T>): React.ReactElement => {
  const currCreateProductForm = useSelector(getFormCreateProduct);
  const [preview, setPreview] = useState<string | ArrayBuffer | null>();
  const [isPngType, setIsPngType] = useState(true);
  const [isValidSize, setIsValidSize] = useState(true);

  useEffect(() => {
    // PREFILL
    if (forImgField && currCreateProductForm[forImgField]) {
      const file = currCreateProductForm[forImgField];

      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        const binaryStr = reader.result;

        setPreview(binaryStr);

        formSetter((prev) => {
          return {
            ...prev,
            [forImgField]: file,
          };
        });
      };

      reader.readAsDataURL(file);
    }
  }, [currCreateProductForm]);

  const onDropThmb = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((thisFile) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        const binaryStr = reader.result;

        setPreview(binaryStr);
        if (forImgField) {
          formSetter((prev) => {
            return {
              ...prev,
              [forImgField]: thisFile,
            };
          });
        }

        // MARK: PNG & LESS THAN 500kB
        setIsPngType(thisFile.type.includes('png'));
        setIsValidSize(thisFile.size < 500000);

        // additional handler
        completionHandler?.(thisFile);
      };

      // reader.readAsArrayBuffer(file);
      reader.readAsDataURL(thisFile);
      // reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop: onDropThmb });

  useEffect(() => {
    if (preview) {
      formHook?.trigger(formHook?.label);
    }
  }, [preview]);

  useEffect(() => {
    // invoke handler
    onTypeOfPng(isPngType);
    onValidSize(isValidSize);
  }, [isPngType, isValidSize]);

  return (
    // MARK: UPLOAD THUMBNAIL

    <div className={`${TWColCenterize} w-fit`}>
      <div
        {...getRootProps()}
        className="relative w-48 h-48 flex flex-col justify-center items-center border-2 border-slate-400 border-dashed rounded-lg hover:cursor-pointer"
      >
        {additionalImgHook?.getter && !preview && (
          <div
            className="absolute top-[-9%] right-[-8%]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              additionalImgHook?.setter(false);

              if (forImgField) {
                formSetter((prev) => ({
                  ...prev,
                  [forImgField]: null,
                }));
              }
            }}
          >
            <div
              className={`size-9 bg-red-500 ${TWColCenterize} rounded-full text-brand-white hover:bg-red-700`}
            >
              <FaTrashAlt className="size-[18px]" />
            </div>
          </div>
        )}
        {preview || imageUrl ? (
          <div className={`relative size-[90%] ${TWColCenterize}`}>
            <img
              className="w-full h-full object-cover rounded-md"
              src={(preview ? preview : imageUrl) as string}
              alt=""
            />
            <div
              className={`absolute z-30 top-[-16%] right-[-14%] bg-blue-500 hover:bg-blue-800 size-10 ${TWColCenterize} rounded-full text-blue-100`}
            >
              <FaPencilAlt
                size={22}
                onClickCapture={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  setPreview(null);
                }}
              />
            </div>
          </div>
        ) : (
          <>
            <IoImageOutline size={42} className="text-primary  mb-1" />
            <div className="font-semibold text-lg/5 w-[70%]  text-slate-600 text-center">
              {title}
              <div className="text-base font-normal">{additionalTitle}</div>
            </div>

            <div className="text-xs text-[#b6b6b6] w-[85%] text-center mt-3">
              <div>
                <span className="font-bold">Drop</span> your image here
              </div>
              <div>or</div>
              <div>
                <span className="font-bold">Click</span> to browse from files
              </div>
            </div>
            <input
              {...getInputProps()}
              {...formHook?.register(formHook?.label, {
                validate: () => {
                  if (
                    formHook.label === 'secondImg' ||
                    formHook.label === 'thirdImg'
                  ) {
                    return true;
                  }

                  if (!preview) {
                    return false;
                  }

                  return true;
                },
              })}
            />
          </>
        )}
      </div>
      {preview && (
        <div className="mt-2 font-medium">{toTitle(forImgField)}</div>
      )}
    </div>
  );
};

export default StyledImageUploader;
