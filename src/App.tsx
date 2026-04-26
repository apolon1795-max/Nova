import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { questions, entrepreneurs } from './data/content';
import { EntrepreneurId } from './types';
import { Instagram, MessageCircle, Link as LinkIcon, Calendar, ArrowLeft } from 'lucide-react';

const faces = Object.values(entrepreneurs).map(e => e.image);

const VKIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-8 sm:h-8">
    <path d="M15.08 2H8.92C3.39 2 2 3.39 2 8.92v6.16C2 20.61 3.39 22 8.92 22h6.16C20.61 22 22 20.61 22 15.08V8.92C22 3.39 20.61 2 15.08 2zm2.08 13.91l-.15.15c-.44.44-1.1.28-1.74-.21-.4-.32-.78-.65-1.11-.97-.24-.24-.48-.48-.68-.68-.22-.22-.38-.22-.64.04l-.87.87c-.38.38-.68.74-1.29.74h-.54c-1.8 0-3.64-1.21-4.75-2.92-1.57-2.42-2.58-5.3-2.61-5.46-.03-.18.06-.34.22-.44.09-.06.2-.09.31-.09h1.61c.42 0 .7.17.92.51.52 1.25 1.57 3.3 2.5 4.38.16.19.34.22.45.19s.2-.18.2-.56V8.16c0-.46.12-.73.44-.88.19-.09.43-.13.72-.13h1.83c.38 0 .54.12.63.35.12.33.09.91.09 1.63v1.89c0 .41.22.5.38.5s.31-.09.48-.26c.86-.92 1.76-2.65 2.15-3.62.11-.27.28-.48.68-.48h1.66c.26 0 .5.09.64.25.14.15.19.35.13.56-.15.54-1.25 2.45-2.14 3.59-.22.28-.27.42-.05.68.86 1.05 1.73 2.05 2.06 2.5.21.32.22.57.06.82-.16.27-.47.4-.87.4z"/>
  </svg>
);

const TGIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-8 sm:h-8">
    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.91 9.02c-.14.65-.53.81-1.07.51l-2.97-2.19-1.43 1.38c-.16.16-.29.29-.6.29l.21-3.03 5.52-4.99c.24-.22-.05-.34-.37-.12l-6.83 4.3-2.94-.92c-.64-.2-.65-.64.13-.95L17.15 6.7c.56-.2.98.13.41 1.46z"/>
  </svg>
);

const WAIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-8 sm:h-8">
    <path d="M12.03 2A9.97 9.97 0 0 0 2 11.97c0 1.7.43 3.36 1.26 4.8L2 22l5.37-1.25a9.96 9.96 0 0 0 4.66 1.15H12A9.97 9.97 0 0 0 22 11.97 9.97 9.97 0 0 0 12.03 2zm0 18.06a8.27 8.27 0 0 1-4.14-1.11l-.3-.18-3.07.72.82-2.97-.2-.31a8.23 8.23 0 0 1-1.38-4.57c0-4.55 3.7-8.26 8.27-8.26 2.2 0 4.28.86 5.84 2.42A8.24 8.24 0 0 1 20.3 12c.01 4.54-3.69 8.26-8.27 8.26zm4.53-6.17c-.25-.13-1.48-.73-1.71-.82-.23-.08-.4-.13-.57.13-.17.25-.65.82-.79 1-.15.17-.3.19-.55.06-.25-.13-1.06-.39-2.02-1.24-.74-.66-1.25-1.48-1.39-1.73-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.57-1.38-.78-1.89-.2-.5-.4-.43-.57-.44-.15-.01-.32-.01-.5-.01-.17 0-.45.06-.69.32-.23.26-.9.88-.9 2.14s.92 2.48 1.05 2.65c.13.17 1.81 2.76 4.38 3.87 1.72.74 2.43.83 3.32.7.97-.14 2.25-.92 2.56-1.81.33-.88.33-1.64.23-1.81-.08-.17-.25-.25-.5-.38z"/>
  </svg>
);

function HeroBackgroundMarquee() {
  const images = [...faces, ...faces, ...faces, ...faces];
  return (
    <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none flex flex-col gap-6 -rotate-[10deg] scale-150 justify-center overflow-hidden">
      <motion.div 
        animate={{ x: [0, -1000] }} 
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        className="flex gap-6"
      >
        {images.map((src, i) => (
          <img key={`t1-${i}`} src={src} className="w-32 h-32 rounded-3xl object-cover grayscale brightness-0 invert" referrerPolicy="no-referrer" alt="" />
        ))}
      </motion.div>
      <motion.div 
        animate={{ x: [-1000, 0] }} 
        transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
        className="flex gap-6"
      >
        {images.map((src, i) => (
          <img key={`b2-${i}`} src={src} className="w-32 h-32 rounded-3xl object-cover grayscale brightness-0 invert" referrerPolicy="no-referrer" alt="" />
        ))}
      </motion.div>
    </div>
  );
}

function HeroRoulette() {
  const [index, setIndex] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const preloadImages = async () => {
      const promises = faces.map((src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          if (img.complete) {
            resolve(true);
          } else {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true);
          }
        });
      });
      await Promise.all(promises);
      if (isMounted) setImagesLoaded(true);
    };

    preloadImages();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!imagesLoaded) return;

    let speed = 40;
    let timer: ReturnType<typeof setTimeout>;
    let count = 0;
    
    const tick = () => {
      count++;
      setIndex(prev => (prev + 1) % faces.length);
      
      if (count < 25) {
        timer = setTimeout(tick, speed);
      } else if (count < 40) {
        speed += 20;
        timer = setTimeout(tick, speed);
      } else if (count < 50) {
        speed += 60;
        timer = setTimeout(tick, speed);
      } else if (count < 55) {
        speed += 150;
        timer = setTimeout(tick, speed);
      } else {
        setStopped(true);
      }
    };
    
    timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [imagesLoaded]);

  return (
    <div className="absolute top-6 right-6 sm:top-10 sm:right-10 w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] lg:w-[100px] lg:h-[100px] border-[3px] sm:border-[4px] border-nova-yellow overflow-hidden rounded-full flex items-center justify-center bg-white shadow-xl z-20">
      <AnimatePresence mode="popLayout">
        {!imagesLoaded ? (
          <motion.div
            key="loading"
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-nova-blue text-3xl sm:text-4xl lg:text-5xl font-bold bg-nova-yellow w-full h-full flex items-center justify-center"
          >
            ?
          </motion.div>
        ) : !stopped ? (
          <motion.img 
            key={index}
            src={faces[index]}
            className="w-full h-full object-cover"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.1, ease: "linear" }}
            referrerPolicy="no-referrer"
            alt="roulette-face"
          />
        ) : (
          <motion.div
            key="stopped"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 15 }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="text-nova-blue text-3xl sm:text-4xl lg:text-5xl font-bold bg-nova-yellow w-full h-full flex items-center justify-center"
          >
            ?
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
        <HeroBackgroundMarquee />
        <HeroRoulette />
        
        <h1 className="text-[28px] sm:text-[40px] lg:text-[52px] leading-[1.1] sm:leading-[1.15] mb-4 sm:mb-6 font-[800] break-words pr-12 sm:pr-0 z-10 relative">
          Узнай, на какого предпринимателя похож твой ребенок
        </h1>
        <p className="text-[16px] sm:text-[18px] lg:text-[20px] opacity-90 mb-8 sm:mb-12 max-w-[400px] font-[300] z-10 relative">
          Пройдите бесплатный тест из 10 вопросов и узнайте сильные стороны будущего лидера 🚀
        </p>
        
        <button 
          onClick={onStart}
          className="inline-block bg-nova-yellow text-nova-ink px-8 py-4 sm:px-10 sm:py-5 lg:px-12 lg:py-6 rounded-[100px] text-[16px] sm:text-xl lg:text-[24px] font-[800] uppercase shadow-[0_10px_20px_rgba(255,215,0,0.3)] hover:scale-[1.02] active:scale-95 transition-transform self-start z-10 relative"
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
          <a href="https://vk.com/novatoriya18" target="_blank" rel="noreferrer" className="h-[50px] sm:h-[60px] bg-[#F0F4F8] rounded-[16px] flex items-center justify-center text-[#0077FF] hover:bg-[#0077FF] hover:text-white transition-colors" title="ВКонтакте">
            <VKIcon />
          </a>
          <a href="https://t.me/novatoriya" target="_blank" rel="noreferrer" className="h-[50px] sm:h-[60px] bg-[#F0F4F8] rounded-[16px] flex items-center justify-center text-[#229ED9] hover:bg-[#229ED9] hover:text-white transition-colors" title="Telegram">
            <TGIcon />
          </a>
          <a href="https://wa.me/79199104488" target="_blank" rel="noreferrer" className="h-[50px] sm:h-[60px] bg-[#F0F4F8] rounded-[16px] flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors" title="WhatsApp">
            <WAIcon />
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
            <div className="w-6 h-6 rounded-full border-2 border-nova-blue/20 group-hover:border-white flex-shrink-0 ml-4 hidden md:block transition-colors"></div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function Result({ scores, onRestart }: { key?: React.Key, scores: Record<string, number>, onRestart: () => void }) {
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

      <div className="bg-[#F9FAFB] p-6 sm:p-8 lg:p-10 rounded-[20px] text-left mb-10 shadow-sm border border-nova-blue/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[4px] sm:w-[6px] h-full bg-nova-cyan"></div>
        <p className="text-[16px] sm:text-[18px] lg:text-[22px] font-[500] text-nova-ink leading-[1.5] sm:leading-[1.6]">
          {person.description}
        </p>
      </div>

      {/* Карточки навыков */}
      <div className="mb-10 text-left">
        <h3 className="text-[20px] lg:text-[24px] font-[800] mb-5 text-nova-ink flex items-center gap-3">
          ⚡ Его суперспособности:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {person.skills.map((skill, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-white border-2 border-nova-blue/10 rounded-[16px] p-5 flex flex-col items-center justify-center text-center gap-3 hover:border-nova-blue/30 transition-colors shadow-sm"
            >
              <div className="text-[32px]">{skill.icon}</div>
              <div className="font-[700] text-[15px] lg:text-[16px] text-nova-ink">{skill.name}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Конкретизация будущего */}
      <div className="bg-nova-blue text-white rounded-[24px] p-6 sm:p-8 lg:p-10 text-left mb-12 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-nova-cyan/20 blur-[50px] rounded-full"></div>
        <h3 className="text-[20px] lg:text-[24px] font-[800] mb-4 relative z-10 flex items-center gap-3">
          <span className="text-[28px]">🔮</span> В будущем он сможет:
        </h3>
        <p className="text-[16px] lg:text-[18px] opacity-90 leading-[1.6] relative z-10 font-[400]">
          {person.futurePrediction}
        </p>
      </div>

      {/* Секретный бонус / Promo code */}
      <div className="bg-nova-yellow/20 border-2 border-nova-yellow border-dashed rounded-[24px] p-6 sm:p-8 lg:p-10 mb-12 relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-nova-yellow text-nova-ink px-4 py-1 rounded-full text-[12px] font-[800] uppercase tracking-[1px] shadow-sm whitespace-nowrap">
          Секретный подарок
        </div>
        <div className="text-[16px] lg:text-[18px] font-[600] text-nova-ink mb-4 mt-2">
          Ваш welcome-бонус на первое занятие в бизнес-школе:
        </div>
        <div className="text-[28px] sm:text-[36px] lg:text-[40px] font-[900] text-nova-blue tracking-[2px] bg-white inline-block px-6 sm:px-8 py-3 rounded-[16px] shadow-sm select-all">
          НОВА-СТАРТ
        </div>
        <div className="text-[14px] opacity-70 mt-5 leading-[1.4] max-w-[400px] mx-auto">
          Назовите этот код нашему менеджеру при записи и получите специальный бонус от «Новатории»! 🎁
        </div>
      </div>

      {/* Поделиться */}
      <div className="mb-12">
        <div className="text-[14px] font-[700] uppercase tracking-[1px] text-[#888] mb-5">
          Поделиться результатом
        </div>
        <div className="flex justify-center gap-4">
          <a 
            href={`https://vk.com/share.php?url=https://новатория18.рф&title=Мой%20ребенок%20%E2%80%94%20будущий%20${encodeURIComponent(person.name)}!`} 
            target="_blank" rel="noreferrer"
            className="w-[50px] h-[50px] bg-[#0077FF] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
          >
            <VKIcon />
          </a>
          <a 
            href={`https://t.me/share/url?url=https://новатория18.рф&text=Узнал%20в%20Новатории,%20что%20мой%20ребенок%20%E2%80%94%20будущий%20${encodeURIComponent(person.name)}!`} 
            target="_blank" rel="noreferrer"
            className="w-[50px] h-[50px] bg-[#229ED9] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
          >
            <TGIcon />
          </a>
          <button 
            onClick={() => {
              navigator.clipboard.writeText('https://новатория18.рф');
              alert('Ссылка скопирована!');
            }}
            className="w-[50px] h-[50px] border-2 border-nova-blue/10 text-nova-blue font-bold rounded-full flex items-center justify-center hover:bg-nova-blue hover:text-white transition-colors shadow-sm"
            title="Скопировать ссылку"
          >
             <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
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
      <header className="px-5 sm:px-8 lg:px-[60px] py-[20px] sm:py-[30px] bg-white border-b border-nova-blue/10 flex justify-between items-center z-50 sticky top-0">
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
