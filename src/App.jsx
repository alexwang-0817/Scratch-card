import React from 'react';
import { SubmissionForm } from './components/SubmissionForm';
import { Dashboard } from './components/Dashboard';
import { useScratchStats } from './hooks/useScratchStats';
import { motion } from 'framer-motion';
import { Sparkles, Trophy } from 'lucide-react';
import { StatsOverview } from './components/StatsOverview';

function App() {
  const { stats, submitData, loading, error } = useScratchStats();

  return (
    <div className="min-h-screen relative overflow-hidden text-gray-900 font-sans bg-gray-50 pb-20">

      {/* Error Banner */}
      {error && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center py-2 z-50 shadow-lg font-bold">
          ⚠️ {error}
        </div>
      )}

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">

        {/* Header / Hero */}
        <header className="text-center mb-10 relative pt-4">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <div className="inline-flex items-center justify-center p-2 px-4 rounded-full bg-yellow-50 border border-yellow-200 mb-4 shadow-sm">
              <Sparkles className="text-yellow-600 w-4 h-4 mr-2" />
              <span className="text-yellow-800 font-bold tracking-widest text-xs uppercase">{import.meta.env.VITE_CURRENT_YEAR} 新春發財特別企劃</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter text-gray-900">
              刮刮樂實況
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-red-600 relative ml-2">
                統計站
                <Trophy className="absolute -top-4 -right-6 text-yellow-500 w-8 h-8 rotate-12" strokeWidth={2} />
              </span>
            </h1>
          </motion.div>
        </header>

        {/* 1. Main Stats Overview Block (Full Width) */}
        <section className="mb-8">
          <StatsOverview stats={stats} loading={loading} />
        </section>

        {/* 2. Content Grid: Submission (Left) & Breakdown (Right) */}
        <main className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

          {/* Left Column: Submission Form (Sticky) */}
          <section className="md:col-span-4 sticky top-8 z-20">
            <SubmissionForm onSubmit={submitData} loading={loading} />

            <div className="mt-6 p-5 rounded-xl bg-white border border-gray-200 text-center shadow-sm">
              <h3 className="text-gray-800 font-bold mb-2 flex items-center justify-center gap-2">
                <span className="text-xl">💡</span> 為什麼要回報？
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed text-left">
                別讓台彩賺走你的紅包錢！匯集全台玩家真實數據，破解官方「期望值」迷思，找出真正高勝率的隱藏版刮刮樂。
              </p>
            </div>
          </section>

          {/* Right Column: Detailed Breakdown List */}
          <section className="md:col-span-8">
            <Dashboard stats={stats} loading={loading} />
          </section>

        </main>

        <footer className="mt-20 text-center text-gray-400 text-xs py-8 border-t border-gray-200">
          <p>© {import.meta.env.VITE_CURRENT_YEAR} Scratch Card Stats Station.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
