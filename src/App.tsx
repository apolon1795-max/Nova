import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { questions, entrepreneurs } from './data/content';
import { EntrepreneurId } from './types';
import { Instagram, MessageCircle, Link as LinkIcon, Calendar, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

function Home({ onStart }: { key?: React.Key, onStart: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] grid-rows-auto lg:grid-rows-2 gap-6 w-full max-w-6xl mx-auto"
    >
      {/* Hero Card */}
      <div className="col-span-1 lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3 bg-nova-blue text-white rounded-[24px] p-6 sm:p-10 lg:p-14 flex flex-col justify-center relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <div className="absolute top-6 right-6 sm:top-10 sm:right-10 w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] lg:w-[100px] lg:h-[100px] border-[3px] sm:border-[4px] border-nova-yellow text-nova-yellow rounded-full flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl rotate-[15deg] font-[700] opacity-90">?</div>
        
        <h1 className="text-[28px] sm:text-[40px] lg:text-[52px] leading-[1.1] sm:leading-[1.15] mb-4 sm:mb-6 font-[800] break-words pr-12 sm:pr-0">
          Узнай, на какого предпринимателя похож твой ребенок
        </h1>
        <p className="text-[16px] sm:text-[18px] lg:text-[20px] opacity-90 mb-8 sm:mb-12 max-w-[400px] font-[300]">
          Пройдите бесплатный тест из 10 вопросов и узнайте сильные стороны будущего лидера 🚀
        </p>
        
        <button 
          onClick={onStart}
          className="inline-block bg-nova-yellow text-nova-ink px-8 py-4 sm:px-10 sm:py-5 lg:px-12 lg:py-6 rounded-[100px] text-[16px] sm:text-xl lg:text-[24px] font-[800] uppercase shadow-[0_10px_20px_rgba(255,215,0,0.3)] hover:scale-[1.02] active:scale-95 transition-transform self-start"
        >
          Пройти тест
        </button>
      </div>

      {/* Events Card */}
      <div className="col-span-1 lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2 bg-white rounded-[24px] p-6 sm:p-8 lg:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex flex-col justify-center">
        <div className="text-[12px] uppercase font-[700] text-nova-blue tracking-[2px] mb-4 sm:mb-6">Ближайшие события</div>
        <a 
          href="https://новатория18.рф" 
          target="_blank" 
          rel="noreferrer noopener"
          className="flex items-center gap-[15px] p-[15px] rounded-[16px] bg-[#F9FAFB] hover:bg-nova-gray transition-colors group"
        >
          <div className="bg-nova-blue text-white p-3 rounded-[10px] min-w-[50px] text-center flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
             <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="font-[700] text-nova-ink mb-1 text-[16px] lg:text-[18px]">Занятия в школе</div>
            <div className="text-[14px] text-[#666]">Узнать расписание на сайте</div>
          </div>
        </a>
      </div>

      {/* Social Card */}
      <div className="col-span-1 lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3 bg-white rounded-[24px] p-6 sm:p-8 lg:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex flex-col justify-between relative overflow-hidden">
        <div className="text-[12px] uppercase font-[700] text-nova-blue tracking-[2px] mb-3 z-10">Наши соцсети</div>
        <div className="text-[18px] sm:text-[20px] lg:text-[24px] font-[700] mb-5 text-nova-ink max-w-[250px] leading-[1.2] z-10">
          Будьте в курсе жизни Новатории
        </div>
        <div className="grid grid-cols-3 gap-[10px] sm:gap-[15px] z-10">
          <a href="https://vk.com/novatoriya18" target="_blank" rel="noreferrer" className="h-[50px] sm:h-[60px] bg-[#F0F4F8] rounded-[16px] flex items-center justify-center font-[700] text-nova-blue hover:bg-[#0077FF] hover:text-white transition-colors" title="ВКонтакте">
            VK
          </a>
          <a href="https://t.me/novatoriya" target="_blank" rel="noreferrer" className="h-[50px] sm:h-[60px] bg-[#F0F4F8] rounded-[16px] flex items-center justify-center font-[700] text-nova-blue hover:bg-[#229ED9] hover:text-white transition-colors" title="Telegram">
            TG
          </a>
          <a href="https://wa.me/79199104488" target="_blank" rel="noreferrer" className="h-[50px] sm:h-[60px] bg-[#F0F4F8] rounded-[16px] flex items-center justify-center font-[700] text-nova-blue hover:bg-[#25D366] hover:text-white transition-colors" title="WhatsApp">
            WA
          </a>
        </div>
        <div 
          className="absolute -bottom-5 -right-5 w-[200px] h-[200px] opacity-[0.03] rounded-full z-0"
          style={{ background: 'repeating-linear-gradient(45deg, var(--color-nova-blue), var(--color-nova-blue) 10px, transparent 10px, transparent 20px)' }}
        ></div>
      </div>
    </motion.div>
  );
}

function Test({ onComplete }: { key?: React.Key, onComplete: (scores: Record<string, number>) => void }) {
  const [answersList, setAnswersList] = useState<Partial<Record<string, number>>[]>([]);
  const currentQ = answersList.length;
  
  const question = questions[currentQ];

  const handleAnswer = (points: Partial<Record<string, number>>) => {
    const newAnswers = [...answersList, points];
    if (newAnswers.length === questions.length) {
      // Calculate final scores
      const totalScores: Record<string, number> = {};
      newAnswers.forEach(pts => {
        Object.entries(pts).forEach(([id, val]) => {
          totalScores[id] = (totalScores[id] || 0) + (val as number);
        });
      });
      onComplete(totalScores);
    } else {
      setAnswersList(newAnswers);
    }
  };

  const handleBack = () => {
    if (answersList.length > 0) {
      setAnswersList(answersList.slice(0, -1));
    }
  };

  if (!question) return null;

  return (
    <motion.div
      key={currentQ}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto bg-white rounded-[24px] p-6 sm:p-8 lg:p-12 shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative"
    >
      <div className="flex justify-between items-center mb-6 h-8">
        {currentQ > 0 ? (
          <button 
            onClick={handleBack}
            className="flex items-center text-[#888] hover:text-nova-blue font-[700] uppercase tracking-[1px] text-[12px] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Назад
          </button>
        ) : <div />}
        <div className="text-[12px] uppercase font-[700] text-[#888]">
          {Math.round(((currentQ) / questions.length) * 100)}%
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-[12px] uppercase font-[700] text-nova-blue tracking-[2px]">
          Вопрос {currentQ + 1} из {questions.length}
        </div>
      </div>

      <div className="w-full bg-[#F0F4F8] h-[8px] rounded-full overflow-hidden mb-10">
        <motion.div 
          className="h-full bg-nova-yellow rounded-full"
          initial={{ width: `${(currentQ / questions.length) * 100}%` }}
          animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <h3 className="text-[20px] sm:text-[24px] lg:text-[30px] font-[800] text-nova-ink mb-6 sm:mb-10 leading-[1.3]">
        {question.text}
      </h3>

      <div className="grid gap-[15px]">
        {question.answers.map((answer, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(answer.points)}
            className="w-full text-left p-[16px] sm:p-[20px] rounded-[16px] bg-[#F9FAFB] hover:bg-nova-pink hover:text-white transition-all text-[15px] sm:text-[18px] lg:text-[20px] font-[600] text-nova-ink flex items-center justify-between group active:scale-[0.98]"
          >
            <span>{answer.text}</span>
            <div className="w-6 h-6 rounded-full border-2 border-black/10 group-hover:border-white flex-shrink-0 ml-4 hidden md:block transition-colors"></div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function Result({ scores, onRestart }: { key?: React.Key, scores: Record<string, number>, onRestart: () => void }) {
  useEffect(() => {
    // Show confetti on mount
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#01142F', '#DFFF5F', '#F772BA', '#37BEEE']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#01142F', '#DFFF5F', '#F772BA', '#37BEEE']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const topId = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b) as EntrepreneurId;
  const person = entrepreneurs[topId] || entrepreneurs['gates'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto bg-white rounded-[24px] p-6 sm:p-8 lg:p-14 shadow-[0_10px_30px_rgba(0,0,0,0.08)] text-center relative overflow-hidden"
    >
      <div className="text-[12px] uppercase font-[700] text-nova-blue tracking-[2px] mb-6">
        🎉 Результат теста
      </div>

      <h2 className="text-[28px] sm:text-[32px] lg:text-[48px] font-[800] text-nova-ink mb-4 leading-[1.1]">
        Ваш ребенок — будущий <br/>
        <span className="text-nova-blue text-[32px] sm:text-[40px] lg:text-[64px] block mt-2">{person.name}!</span>
      </h2>

      <div className="my-10 relative inline-block">
        <motion.div 
          initial={{ scale: 0.8, rotate: -5 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", bounce: 0.5 }}
          className="w-[200px] h-[200px] lg:w-[280px] lg:h-[280px] mx-auto rounded-[24px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.15)] border-[6px] border-white z-10 relative bg-[#F0F4F8]"
        >
          <img 
            src={person.image} 
            alt={person.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <div className="absolute -inset-4 bg-nova-yellow/40 rounded-[32px] -z-10 rotate-3"></div>
      </div>

      <div className="bg-[#F9FAFB] p-6 sm:p-8 lg:p-10 rounded-[20px] text-left mb-8 sm:mb-12 shadow-sm border border-black/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[4px] sm:w-[6px] h-full bg-nova-cyan"></div>
        <p className="text-[16px] sm:text-[18px] lg:text-[22px] font-[500] text-nova-ink leading-[1.5] sm:leading-[1.6]">
          {person.description}
        </p>
      </div>

      <div className="flex flex-col gap-[20px] max-w-sm mx-auto items-center">
        <a 
          href="https://новатория18.рф"
          target="_blank"
          rel="noreferrer noopener"
          className="w-full text-center bg-nova-yellow text-nova-ink px-6 sm:px-10 py-[16px] sm:py-[20px] rounded-[100px] text-[18px] sm:text-[20px] lg:text-[24px] font-[800] uppercase shadow-[0_10px_20px_rgba(255,215,0,0.3)] hover:scale-[1.02] active:scale-95 transition-transform"
        >
          Записать на занятие
        </a>
        <button 
          onClick={onRestart}
          className="text-[#888] font-[700] uppercase tracking-[1px] text-[14px] hover:text-nova-ink transition-colors mt-2"
        >
          Пройти еще раз 🔁
        </button>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<'home' | 'test' | 'result'>('home');
  const [scores, setScores] = useState<Record<string, number>>({});

  return (
    <div className="min-h-screen font-sans text-nova-ink bg-nova-gray flex flex-col selection:bg-nova-yellow selection:text-nova-ink overflow-x-hidden">
      <header className="px-5 sm:px-8 lg:px-[60px] py-[20px] sm:py-[30px] bg-white border-b border-black/5 flex justify-between items-center z-50 sticky top-0">
        <div 
          className="font-[900] text-[22px] sm:text-[28px] lg:text-[32px] tracking-[-1px] uppercase text-nova-blue cursor-pointer select-none flex-shrink-0" 
          onClick={() => setScreen('home')}
        >
          НОВА<span className="text-nova-yellow">ТОРИЯ</span>
        </div>
        
        {screen !== 'home' ? (
          <button 
            onClick={() => setScreen('home')}
            className="text-[12px] lg:text-[14px] font-[700] uppercase tracking-[1px] text-nova-blue hover:text-nova-ink transition-colors"
          >
            На главную
          </button>
        ) : (
          <div className="hidden sm:block text-[12px] sm:text-[14px] font-[700] uppercase tracking-[1px] text-[#888] text-right ml-4">
            Бизнес-школа для детей 7-11 лет
          </div>
        )}
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 py-6 sm:py-10 lg:p-[40px] flex flex-col justify-center items-center h-full">
        <AnimatePresence mode="wait">
          {screen === 'home' && <Home key="home" onStart={() => setScreen('test')} />}
          {screen === 'test' && (
            <Test 
              key="test" 
              onComplete={(s) => {
                setScores(s);
                setScreen('result');
              }} 
            />
          )}
          {screen === 'result' && (
            <Result 
              key="result" 
              scores={scores} 
              onRestart={() => {
                setScores({});
                setScreen('test');
              }} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
