"use client";

import { motion } from "framer-motion"
import Link from "next/link";
import React from "react";

interface ErrorStateProps {
    error: Error | string;
    fullScreen?: boolean;
    onRetry?: () => void;
    retryText?: string;
    showBackButton?: boolean;
}

const ErrorState = ({
                        error,
                        fullScreen = false,
                        onRetry,
                        retryText = "Try Again",
                        showBackButton = true
                    }: ErrorStateProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${fullScreen ? 'w-full h-screen' : 'w-full h-full'} bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4`}
    >
        <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-red-600 mb-4"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        </motion.div>
        <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
            Error
        </h1>
        {process.env.NODE_ENV !== "production" && (
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                {error instanceof Error ? error.message : error}
            </p>
        )}
        <div className="flex gap-4">
            {onRetry && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRetry}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                    {retryText}
                </motion.button>
            )}
            {showBackButton && (
                <Link href="/workspace/new">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
                    >
                        Return to Dashboard
                    </motion.button>
                </Link>
            )}
        </div>
    </motion.div>
);

export default ErrorState;
