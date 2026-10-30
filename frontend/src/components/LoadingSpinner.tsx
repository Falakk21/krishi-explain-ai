import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Processing Agro-Climatic Intelligence...",
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <div
        className={`${sizeClasses} border-forest/20 border-t-forest rounded-full animate-spin`}
      />
      {message && (
        <p className="text-sm font-medium text-forest-dark animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};
