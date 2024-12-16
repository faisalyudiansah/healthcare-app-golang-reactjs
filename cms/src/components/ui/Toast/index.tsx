import React from 'react';
import style from './Toast.module.scss';
import { useSelector } from 'react-redux';
import { FaCheckCircle } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import clsx from 'clsx';
import { RootState } from '@/store';

const Toast: React.FC = () => {
  const toastState = useSelector((state: RootState) => state.toast);
  const message = toastState.message;

  const warningFromTop = {
    [style.toast_warning_style]: true,
  };

  const successFromRight = {
    [style.toast_success_style]: true,
  };

  let styles = {
    [style.toast_initial]: true,
    [style.toast_active]: toastState.shouldShow,
  };
  switch (toastState.type) {
    case 'success':
      styles = {
        ...styles,
        ...successFromRight,
      };
      break;
    case 'warning':
      styles = {
        ...warningFromTop,
        ...styles,
      };
      break;
    default:
      styles = { ...styles };
  }

  return (
    <span className={clsx(styles)}>
      {toastState.type === 'success' ? (
        <FaCheckCircle className="size-[11%] min-w-[20px] text-white" />
      ) : (
        <MdCancel className="size-[11%] min-w-[20px] text-white" />
      )}

      <span className="inline-block w-full  line-clamp-2 break-words h-full ">
        {message}
      </span>
    </span>
  );
};

export default Toast;
