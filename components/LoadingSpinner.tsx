import React from 'react';

export const LoadingSpinner: React.FC = () => {
    return (
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-green-500" role="status">
            <span className="sr-only">Loading...</span>
        </div>
    );
};