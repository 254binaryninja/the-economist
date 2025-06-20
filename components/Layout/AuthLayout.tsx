'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { quotes } from '@/constants/quotes';
import { TrendingUp, BarChart3, PieChart, LineChart } from 'lucide-react';
import ThemeToggle from '@/components/providers/ThemeToggle';

interface Quote {
  author: string;
  text: string;
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  const quotesArray: Quote[] = useMemo(() => {
    return Object.entries(quotes).map(([author, text]) => ({
      author,
      text,
    }));
  }, []);

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const quoteCycle = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotesArray.length);
        setIsVisible(true);
      }, 500);
    }, 5000);

    return () => clearInterval(quoteCycle);
  }, [quotesArray.length]);

  const currentQuote = quotesArray[currentQuoteIndex];

  const createFloatingVariant = (delay: number) => ({
    animate: {
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut', // use a valid string for ease
        delay,
      },
    },
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-accent">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Auth Form */}
      <motion.div
        className="flex-1 flex items-center justify-center p-4 lg:p-8 order-2 lg:order-1"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>      {/* Quotes & Icons Section */}
      <motion.div
        className="flex-1 relative overflow-hidden bg-gradient-to-br from-claude-emerald-claude via-claude-blue-claude to-claude-deep dark:from-claude-emerald-claude dark:via-claude-blue-claude dark:to-claude-deep order-1 lg:order-2 min-h-[40vh] lg:min-h-screen"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>

        {/* Floating Icons */}
        <motion.div 
          className="absolute top-20 left-20 text-white dark:text-white" 
          variants={createFloatingVariant(0)} 
          animate="animate"
        >
          <TrendingUp size={32} />
        </motion.div>
        
        <motion.div 
          className="absolute top-40 right-16 text-white dark:text-white"
          variants={createFloatingVariant(1)} 
          animate="animate"
        >
          <BarChart3 size={28} />
        </motion.div>
        <motion.div 
          className="absolute bottom-32 left-16 text-white dark:text-white" 
          variants={createFloatingVariant(2)} 
          animate="animate"
        >
          <PieChart size={24} />
        </motion.div>

        <motion.div 
          className="absolute bottom-20 right-20 text-white dark:text-white" 
          variants={createFloatingVariant(3)} 
          animate="animate"
        >
          <LineChart size={30} />
        </motion.div>

        {/* Main Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 lg:p-12">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 dark:bg-white/10"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <TrendingUp className="w-8 h-8 text-white dark:text-white" />
            </motion.div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white dark:text-white mb-2">The Economist AI</h1>
            <p className="text-white/90 dark:text-white/90 text-lg">Expert Economic Analysis & Insights</p>
          </motion.div>

          {/* Animated Quote */}
          <motion.div 
            className="max-w-lg text-center" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <AnimatePresence mode="wait">
              {isVisible && (
                <motion.div
                  key={currentQuoteIndex}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="space-y-6"
                >
                  <motion.blockquote
                    className="text-xl lg:text-2xl text-white dark:text-white font-medium leading-relaxed"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    "{currentQuote.text}"
                  </motion.blockquote>
                  
                  <motion.div
                    className="flex items-center justify-center space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="w-8 h-px bg-white/50" />
                    <cite className="text-white/90 dark:text-white/90 text-sm lg:text-base font-medium not-italic">
                      {currentQuote.author}
                    </cite>
                    <div className="w-8 h-px bg-white/50" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quote Navigation Dots */}
            <motion.div 
              className="flex justify-center space-x-2 mt-8" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.6 }}
            >
              {quotesArray.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentQuoteIndex ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
                  }`}
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => {
                      setCurrentQuoteIndex(index);
                      setIsVisible(true);
                    }, 250);
                  }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Bottom Feature Icons */}
          <motion.div
            className="mt-12 grid grid-cols-3 gap-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {[
              { Icon: BarChart3, label: 'Analysis' },
              { Icon: TrendingUp, label: 'Insights' },
              { Icon: PieChart, label: 'Research' },
            ].map(({ Icon, label }) => (
              <motion.div 
                key={label} 
                className="space-y-2" 
                whileHover={{ scale: 1.05 }} 
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mx-auto">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white/90 text-sm font-medium">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}