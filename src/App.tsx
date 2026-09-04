import { FormEvent, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boxes,
  Brain,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Code2,
  Compass,
  Download,
  Eye,
  Flag,
  FlaskConical,
  HandCoins,
  Heart,
  Lightbulb,
  ListChecks,
  MessageCircle,
  Palette,
  Phone,
  Radio,
  RefreshCcw,
  Rocket,
  Search,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { entrepreneurs, questions } from './data/content';
import {
  buildLeadSubmission,
  buildParentShareText,
  createLeadId,
  downloadParentShareCard,
  getLeadErrorMessage,
  getPrivacyUrl,
  isPhoneValid,
  submitLead,
} from './lib/leadCapture';
import { ENTREPRENEUR_IDS, type Entrepreneur, type EntrepreneurId, type SkillIcon } from './types';

const answerLetters = ['А', 'Б', 'В', 'Г', 'Д'];
const heroPeople = Object.values(entrepreneurs).slice(0, 5);
const getInitials = (name: string) => name.split(' ').map((part) => part[0]).join('').slice(0, 2);

const skillIcons: Record<SkillIcon, LucideIcon> = {
  analytics: BarChart3,
  strategy: Brain,
  focus: Target,
  creative: Palette,
  detail: Search,
  vision: Eye,
  rocket: Rocket,
  courage: Shield,
  experiment: FlaskConical,
  freedom: Compass,
  ideas: Lightbulb,
  speed: Zap,
  team: Users,
  openness: MessageCircle,
  empathy: Heart,
  practical: ShoppingBag,
  growth: TrendingUp,
  resource: HandCoins,
  goal: Flag,
  system: Boxes,
  plan: ListChecks,
  digital: Smartphone,
  trends: Radio,
  code: Code2,
};

type Screen = 'home' | 'test' | 'result';

function Home({ onStart }: { onStart: () => void }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="home-layout"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.985 }}
      transition={{ duration: 0.28 }}
    >
      <div className="hero-card">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={16} aria-hidden="true" /> Тест для детей и подростков</div>
          <h1>Узнай, на какого предпринимателя ты похож</h1>
          <p className="hero-subtitle">Пройди бесплатный тест из 10 вопросов и узнай свои сильные стороны</p>

          <div className="hero-facts" aria-label="О тесте">
            <span>10 вопросов</span>
            <span>3–5 минут</span>
            <span>Бесплатно</span>
          </div>

          <button type="button" className="primary-button primary-button--hero" onClick={onStart}>
            Начать тест <ArrowRight size={22} aria-hidden="true" />
          </button>
          <p className="hero-note">Игровой тест не оценивает способности и не определяет профессию — он помогает заметить то, что у тебя уже хорошо получается.</p>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-orbit hero-orbit--one" />
          <div className="hero-orbit hero-orbit--two" />
          <div className="hero-question">?</div>
          <div className="hero-people-orbit">
            {heroPeople.map((person, index) => (
              <div
                key={person.id}
                className="hero-person-slot"
                style={{
                  '--orbit-angle': `${index * 72}deg`,
                  '--counter-angle': `${index * -72}deg`,
                } as CSSProperties}
              >
                <div className={`hero-person hero-person--${index + 1}`} data-initials={getInitials(person.name)}>
                  <img
                    src={person.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={(event) => { event.currentTarget.style.display = 'none'; }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="hero-sticker hero-sticker--top">идея</div>
          <div className="hero-sticker hero-sticker--bottom">действие</div>
        </div>
      </div>

      <div className="home-benefits" aria-label="Что будет в результате">
        <article>
          <span className="benefit-number">01</span>
          <div>
            <h2>Увидишь свои сильные стороны</h2>
            <p>Три качества, на которые уже можно опираться.</p>
          </div>
        </article>
        <article>
          <span className="benefit-number">02</span>
          <div>
            <h2>Получишь идею для эксперимента</h2>
            <p>Небольшое задание, чтобы проверить себя в деле.</p>
          </div>
        </article>
      </div>
    </motion.section>
  );
}

function Test({ onComplete }: { onComplete: (scores: Record<string, number>) => void }) {
  const [answersList, setAnswersList] = useState<Partial<Record<string, number>>[]>([]);
  const [locked, setLocked] = useState(false);
  const reduceMotion = useReducedMotion();
  const currentIndex = answersList.length;
  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswer = (points: Partial<Record<string, number>>) => {
    if (locked) return;
    setLocked(true);
    const newAnswers = [...answersList, points];
    if (newAnswers.length === questions.length) {
      const totalScores: Record<string, number> = Object.fromEntries(
        ENTREPRENEUR_IDS.map((id) => [id, 0]),
      );
      for (const answer of newAnswers) {
        for (const [id, value] of Object.entries(answer)) {
          totalScores[id] = (totalScores[id] || 0) + (value || 0);
        }
      }
      onComplete(totalScores);
      return;
    }
    setAnswersList(newAnswers);
    setLocked(false);
  };

  const handleBack = () => {
    if (!locked && answersList.length > 0) setAnswersList(answersList.slice(0, -1));
  };

  if (!question) return null;

  return (
    <motion.section
      key={currentIndex}
      className="quiz-card"
      initial={reduceMotion ? false : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
      transition={{ duration: 0.24 }}
      aria-labelledby="question-title"
    >
      <div className="quiz-topline">
        <button type="button" className="text-button" onClick={handleBack} disabled={currentIndex === 0}>
          <ArrowLeft size={19} aria-hidden="true" /> Назад
        </button>
        <span>Вопрос {currentIndex + 1} из {questions.length}</span>
      </div>

      <div className="progress-track" role="progressbar" aria-label="Прогресс теста" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
        <motion.div className="progress-value" animate={{ width: `${progress}%` }} transition={{ duration: reduceMotion ? 0 : 0.3 }} />
      </div>

      <p className="quiz-kicker">Выбери вариант, который больше похож на тебя</p>
      <h1 id="question-title">{question.text}</h1>

      <div className="answers-grid">
        {question.answers.map((answer, index) => (
          <button
            key={answer.text}
            type="button"
            className="answer-button"
            onClick={() => handleAnswer(answer.points)}
            disabled={locked}
          >
            <span className="answer-letter" aria-hidden="true">{answerLetters[index]}</span>
            <span>{answer.text}</span>
            <ArrowRight className="answer-arrow" size={20} aria-hidden="true" />
          </button>
        ))}
      </div>
    </motion.section>
  );
}

function ParentShareForm({ person, scores }: { person: Entrepreneur; scores: Record<string, number> }) {
  const [phone, setPhone] = useState('');
  const [parentPermissionConfirmed, setParentPermissionConfirmed] = useState(false);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shareError, setShareError] = useState('');
  const formStartedAt = useRef(new Date().toISOString());
  const leadId = useRef(createLeadId());
  const canSubmit = isPhoneValid(phone) && parentPermissionConfirmed && status !== 'sending';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!canSubmit) {
      setError('Проверь номер и подтверди, что взрослый разрешил его указать.');
      return;
    }

    setStatus('sending');
    try {
      const payload = buildLeadSubmission(person, scores, phone, {
        parentPermissionConfirmed,
        formStartedAt: formStartedAt.current,
        website,
        leadId: leadId.current,
      });
      await submitLead(payload);
      setStatus('success');
    } catch (submissionError) {
      setError(getLeadErrorMessage(submissionError));
      setStatus('idle');
    }
  };

  const copyResult = async () => {
    setShareError('');
    try {
      const text = buildParentShareText(person);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const copiedWithFallback = document.execCommand('copy');
        textarea.remove();
        if (!copiedWithFallback) throw new Error('Копирование недоступно');
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3_000);
    } catch {
      setShareError('Не получилось скопировать автоматически. Сделай скрин основной карточки выше.');
    }
  };

  const downloadCard = async () => {
    setShareError('');
    setDownloading(true);
    try {
      await downloadParentShareCard(person);
    } catch {
      setShareError('Не получилось скачать карточку. Её можно просто заскринить.');
    } finally {
      setDownloading(false);
    }
  };

  if (status === 'success') {
    return (
      <section className="share-card share-card--success" aria-labelledby="share-success-title">
        <div className="share-success-icon"><CheckCircle2 size={32} aria-hidden="true" /></div>
        <p className="section-kicker">Результат сохранён</p>
        <h2 id="share-success-title">Покажи свой результат маме или папе</h2>
        <p>Сделай скрин основной карточки «Твой результат» выше или отправь полный текст с описанием и сильными сторонами.</p>

        <div className="share-actions">
          <button type="button" className="primary-button" onClick={copyResult}>
            {copied ? <Check size={20} aria-hidden="true" /> : <ClipboardCopy size={20} aria-hidden="true" />}
            {copied ? 'Результат скопирован' : 'Скопировать результат'}
          </button>
          <button type="button" className="secondary-button" onClick={downloadCard} disabled={downloading}>
            <Download size={20} aria-hidden="true" />
            {downloading ? 'Готовим изображение…' : 'Скачать результат'}
          </button>
        </div>
        {shareError ? <div className="form-error" role="alert">{shareError}</div> : null}
        <p className="share-footnote">В копируемом тексте и скачанном изображении сохраняется полное описание твоего результата.</p>
      </section>
    );
  }

  return (
    <section className="share-card" aria-labelledby="share-title">
      <div className="share-card__intro">
        <p className="section-kicker">Последний шаг</p>
        <h2 id="share-title">Поделись результатами теста с родителями</h2>
        <p>Введи телефон мамы или папы. Мы сохраним твой результат, а ты сможешь скопировать его или скачать как изображение.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="parent-phone">Телефон мамы или папы</label>
          <div className="phone-field">
            <span aria-hidden="true"><Phone size={20} /></span>
            <input
              id="parent-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={24}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+7 999 000-00-00"
              aria-describedby="phone-help"
              aria-invalid={Boolean(error) && !isPhoneValid(phone)}
              required
            />
          </div>
          <p id="phone-help" className="field-help">Новатория получит контакт вместе с результатом теста.</p>
        </div>

        <div className="honeypot" aria-hidden="true">
          <label htmlFor="company-website">Сайт компании</label>
          <input id="company-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
        </div>

        <label className="consent-row" htmlFor="parent-permission">
          <span className="checkbox-shell">
            <input
              id="parent-permission"
              type="checkbox"
              checked={parentPermissionConfirmed}
              onChange={(event) => setParentPermissionConfirmed(event.target.checked)}
            />
            <span aria-hidden="true"><Check size={14} /></span>
          </span>
          <span>
            Мама или папа разрешили мне указать этот номер, чтобы получить результат теста и информацию о пробном занятии.{' '}
            <a href={getPrivacyUrl()} target="_blank" rel="noreferrer noopener">Политика обработки данных</a>
          </span>
        </label>

        {error ? <div className="form-error" role="alert">{error}</div> : null}

        <button type="submit" className="primary-button share-submit" disabled={!canSubmit}>
          <ShieldCheck size={21} aria-hidden="true" />
          {status === 'sending' ? 'Сохраняем результат…' : 'Сохранить и поделиться'}
        </button>
        <p className="security-note"><ShieldCheck size={16} aria-hidden="true" /> Контакт используется только для связи по результату теста и пробному занятию.</p>
      </form>
    </section>
  );
}

function Result({ scores, onRestart }: { scores: Record<string, number>; onRestart: () => void }) {
  const reduceMotion = useReducedMotion();
  const person = useMemo(() => {
    const topId = (Object.entries(scores).sort((left, right) => right[1] - left[1])[0]?.[0] || 'gates') as EntrepreneurId;
    return entrepreneurs[topId] || entrepreneurs.gates;
  }, [scores]);

  return (
    <motion.section
      className="result-layout"
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="result-hero">
        <div className="result-photo-wrap">
          <div className="result-photo-backdrop" />
          <div className="result-photo-fallback" aria-hidden="true">
            <span>{getInitials(person.name)}</span>
            <small>{person.name}</small>
          </div>
          <motion.img
            src={person.image}
            alt={`Портрет: ${person.name}`}
            referrerPolicy="no-referrer"
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
            initial={reduceMotion ? false : { scale: 0.9, rotate: -3 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          />
        </div>
        <div className="result-copy">
          <p className="section-kicker"><Sparkles size={16} aria-hidden="true" /> Твой результат</p>
          <h1>Больше всего ты похож на <span>{person.nameAccusative}</span></h1>
          <div className="archetype-pill">{person.archetype}</div>
          <p className="result-description">{person.description}</p>
          <p className="result-disclaimer">Это игровая подсказка, а не оценка личности: у тебя могут сочетаться качества сразу нескольких предпринимателей.</p>
        </div>
      </div>

      <section className="strengths-section" aria-labelledby="strengths-title">
        <div className="section-heading">
          <p className="section-kicker">На что можно опираться</p>
          <h2 id="strengths-title">Твои сильные стороны</h2>
        </div>
        <div className="strengths-grid">
          {person.skills.map((skill, index) => {
            const Icon = skillIcons[skill.icon];
            return (
              <motion.article
                key={skill.name}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.08 * index }}
              >
                <span><Icon size={25} aria-hidden="true" /></span>
                <h3>{skill.name}</h3>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="growth-card" aria-labelledby="growth-title">
        <div className="growth-icon"><Rocket size={30} aria-hidden="true" /></div>
        <div>
          <p className="section-kicker">Проверь себя в деле</p>
          <h2 id="growth-title">Твой следующий эксперимент</h2>
          <p>{person.growthIdea}</p>
        </div>
      </section>

      <ParentShareForm person={person} scores={scores} />

      <div className="result-footer-actions">
        <button type="button" className="text-button" onClick={onRestart}>
          <RefreshCcw size={18} aria-hidden="true" /> Пройти тест ещё раз
        </button>
        <a href="https://новатория18.рф" target="_blank" rel="noreferrer noopener">Узнать больше о Новатории <ArrowRight size={17} aria-hidden="true" /></a>
      </div>
    </motion.section>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [scores, setScores] = useState<Record<string, number>>({});
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [screen, reduceMotion]);

  const goHome = () => {
    setScores({});
    setScreen('home');
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Перейти к содержанию</a>
      <div className="ambient-line ambient-line--cyan" aria-hidden="true" />
      <div className="ambient-line ambient-line--lime" aria-hidden="true" />

      <header className="site-header">
        <button type="button" className="brand-button" onClick={goHome} aria-label="Вернуться на главную страницу теста">
          <img src="/brand/logo-white.png" alt="Новатория — детская бизнес-школа" />
        </button>
        <div className="product-mark">
          <span>Тест предпринимателя</span>
          <small>для детей и подростков 7–17 лет</small>
        </div>
      </header>

      <main id="main-content" className="page-content">
        <AnimatePresence mode="wait">
          {screen === 'home' ? <Home key="home" onStart={() => setScreen('test')} /> : null}
          {screen === 'test' ? (
            <Test
              key="test"
              onComplete={(nextScores) => {
                setScores(nextScores);
                setScreen('result');
              }}
            />
          ) : null}
          {screen === 'result' ? (
            <Result
              key="result"
              scores={scores}
              onRestart={() => {
                setScores({});
                setScreen('test');
              }}
            />
          ) : null}
        </AnimatePresence>
      </main>

      <footer className="site-footer">
        <span>Новатория · школа лидерства и бизнес-навыков</span>
        <a href="https://новатория18.рф/page38711582.html" target="_blank" rel="noreferrer noopener">Политика конфиденциальности</a>
      </footer>
    </div>
  );
}
