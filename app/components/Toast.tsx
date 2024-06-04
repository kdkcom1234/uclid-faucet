import { MutableRefObject, useEffect, useRef } from "react";

const SuccessToast = ({ show }: { show: boolean }) => {
  const toastRef = useRef() as MutableRefObject<HTMLDivElement>;
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (show) {
      toastRef.current.style.opacity = "1";

      timeoutRef.current = setTimeout(() => {
        toastRef.current.style.opacity = "0";
      }, 2100);
    } else {
      toastRef.current.style.opacity = "0";
    }
  }, [show]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={toastRef}
      className="transition duration-700 opacity-0 flex items-center w-full max-w-xs p-4 space-x-4 rtl:space-x-reverse text-gray-500 bg-white divide-x rtl:divide-x-reverse divide-gray-200 rounded-lg shadow dark:text-gray-400 dark:divide-gray-700 space-x dark:bg-gray-800"
      role="alert"
    >
      <svg
        className="w-5 h-5 text-slate-700 dark:text-slate-500 rotate-45"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 18 20"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="m9 17 8 2L9 1 1 19l8-2Zm0 0V9"
        />
      </svg>
      <div className="ps-4 text-sm font-normal">Request sent successfully.</div>
    </div>
  );
};

export default SuccessToast;
