import { useSelector } from 'react-redux';
import { getCreatingProductProgresses } from '@/store/createProduct/createProductSlice';
import Step1Form from './Step1Form';
import { ReactNode } from 'react';
import Step2Form from './Step2Form';
import Step3Form from './Step3Form';
import Step4Form from './Step4Form';
import Step5Form from './Step5Form';
import { ProgressStatus } from '@/store/createProduct/createProductsTypes';

const getStatusStylings = (status: ProgressStatus): [string, string] => {
  switch (status) {
    case 'inprogress':
      return ['bg-transparent border-[6px] border-primary', ' text-[#FFA52F]'];
    case 'completed':
      return ['bg-primary', 'text-[#1DB058]'];
    case 'none':
      return ['bg-brand-gray', ''];
    default:
      return ['', ''];
  }
};

const getProgressStatus = (status: ProgressStatus) => {
  switch (status) {
    case 'inprogress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'none':
      return '';
  }
};

const AddProduct = () => {
  const progresses = useSelector(getCreatingProductProgresses);

  let currentStep: number = 0;
  let currentFormSection: ReactNode;
  progresses.forEach((p) => {
    if (p.status === 'inprogress') {
      currentStep = p.step;
      return;
    }
  });

  switch (currentStep) {
    case 1:
      currentFormSection = <Step1Form />;
      break;
    case 2:
      currentFormSection = <Step2Form />;
      break;
    case 3:
      currentFormSection = <Step3Form />;
      break;
    case 4:
      currentFormSection = <Step4Form />;
      break;
    default:
      currentFormSection = <Step5Form />;
  }

  return (
    <div className="container px-6 pt-6 min-h-[100vh]  pb-32">
      <div className="font-semibold text-2xl mb-7">Register New Product</div>

      <div className="bg-white w-full w-min-[1000px] h-full pt-6 pl-20 pr-20 rounded-2xl flex justify-start items-start gap-20">
        {/* MARK: PROGRESS JOURNEY */}
        <div className=" pt-11 pb-12 h-min-[611px] w-min-[400px] w-[400px] ">
          {progresses.map((_, idx) => {
            return (
              <div
                className={`ml-[49px] ${''}`}
                key={String(progresses[idx].step)}
              >
                {progresses[idx].step !== 1 && (
                  <div
                    className={`h-12 w-[2px] ${
                      progresses[idx - 1]?.status === 'completed'
                        ? 'bg-primary'
                        : 'bg-slate-200'
                    } ml-[19.5px] my-[8px]`}
                  >
                    {/** VERTBAR */}
                  </div>
                )}
                <div
                  className={`flex justify-start items-center gap-[30px] ${
                    progresses[idx].status === 'none' ? 'my-[12px]' : ''
                  }`}
                >
                  <div
                    className={`size-[40px] ${
                      getStatusStylings(progresses[idx].status)[0]
                    } rounded-full `}
                  >
                    {/* CIRCLE */}
                  </div>

                  {/* step details */}
                  <div>
                    <div className="text-sm text-slate-500">
                      Step {progresses[idx].step}
                    </div>
                    <div className="my-[-2px]">{progresses[idx].name}</div>
                    <div
                      className={
                        'text-sm font-medium ' +
                        getStatusStylings(progresses[idx].status)[1]
                      }
                    >
                      {getProgressStatus(progresses[idx].status)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SWITCH-CASE FORMS */}
        <div className=" w-full flex flex-col justify-start items-start">
          {currentFormSection}
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
