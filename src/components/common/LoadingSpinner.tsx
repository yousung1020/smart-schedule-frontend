interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner = ({ message = '데이터를 불러오는 중...' }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-slate-400 gap-4">
      <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
      {message && <p className="font-medium animate-pulse">{message}</p>}
    </div>
  );
};
