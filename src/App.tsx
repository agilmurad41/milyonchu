
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getQuestionsByTopic, TOPICS } from './constants';
import { GameStatus, AnswerState, Lifelines, AudienceData, User, Question, Topic } from './types';
import { Button } from './components/Button';
import { MoneyTree } from './components/MoneyTree';
import { getAIHint } from './services/geminiService';
import { dbService } from './services/db';
import { 
  Trophy, 
  Users, 
  BrainCircuit, 
  X,
  LogOut,
  CheckCircle,
  ArrowLeft,
  LogIn,
  UserPlus,
  Gem,
  HelpCircle,
  Globe, 
  BookOpen, 
  Palette, 
  Moon, 
  Rocket, 
  Clapperboard,
  Check,
  AlertCircle,
  Play,
  Trash2,
  Wrench,
  Edit,
  Search,
  PlusCircle,
  Database
} from 'lucide-react';

// --- ICONS MAPPING ---
const ICON_MAP: Record<string, React.ElementType> = {
  Globe, BookOpen, Palette, Moon, Rocket, Clapperboard, Trophy
};

// Custom Logo Component
const GameLogo = ({ size = 'normal' }: { size?: 'normal' | 'large' | 'xl' }) => {
  // Dynamic Sizes
  let containerSize = 'w-24 h-24';
  let titleSize = 'text-xs';
  let subSize = 'text-[10px]';
  let iconSize = 24;

  if (size === 'large') {
    containerSize = 'w-36 h-36';
    titleSize = 'text-xl';
    subSize = 'text-xs';
    iconSize = 40;
  } else if (size === 'xl') {
    containerSize = 'w-52 h-52 md:w-60 md:h-60';
    titleSize = 'text-2xl md:text-3xl';
    subSize = 'text-xs md:text-lg';
    iconSize = 48;
  }

  return (
    <div className={`relative ${containerSize} rounded-full bg-gradient-to-b from-[#000040] via-[#000080] to-[#000040] border-4 border-yellow-500 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.6)] p-4 text-center animate-pulse-slow mx-auto z-10 transition-all duration-500 shrink-0`}>
       <div className="absolute inset-1 rounded-full border border-yellow-600/50"></div>
       <div className="absolute inset-3 rounded-full border border-blue-400/30"></div>
       
       <div className="text-yellow-500 font-bold tracking-[0.2em] mb-1 drop-shadow-md uppercase text-[8px] md:text-[10px] z-10">Azərbaycan</div>
       <div className={`text-white font-extrabold ${titleSize} leading-none tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase font-serif z-10`}>BİLMƏCƏ<br/>LIVE</div>
       <div className={`text-yellow-400 font-bold ${subSize} mt-1 z-10`}>2026</div>
       
       <div className="absolute -bottom-5 text-yellow-500 animate-spin-slow opacity-100 filter drop-shadow-[0_0_15px_rgba(234,179,8,1)] z-20 bg-[#000040] rounded-full p-1.5 border-2 border-yellow-500">
         <Gem size={iconSize} />
       </div>
    </div>
  );
};

const App: React.FC = () => {
  // --- STATE ---
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.AUTH_CHOICE);
  const [previousStatus, setPreviousStatus] = useState<GameStatus | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]); // For leaderboard and admin
  
  // Auth Form States
  const [authForm, setAuthForm] = useState({ 
    username: '', 
    password: '', 
    name: '', 
    age: '',
    gender: '' as 'Kişi' | 'Qadın' | '' 
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  // Validation States
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'valid' | 'taken' | 'checking'>('idle');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  
  // Game State
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>(AnswerState.IDLE);
  const [lifelines, setLifelines] = useState<Lifelines>({ fiftyFifty: true, askAudience: true, askAI: true });
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [audienceData, setAudienceData] = useState<AudienceData | null>(null);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [lossReason, setLossReason] = useState<'timeout' | 'wrong' | null>(null);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);

  // Profile Edit State
  const [editProfileForm, setEditProfileForm] = useState({ 
    name: '', 
    age: '',
    gender: '' as 'Kişi' | 'Qadın' | '' 
  });
  const [profileSaveStatus, setProfileSaveStatus] = useState<'idle' | 'saved'>('idle');

  // ADMIN STATE
  const [adminTab, setAdminTab] = useState<'users' | 'questions'>('users');
  const [adminSearch, setAdminSearch] = useState('');
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [adminEditForm, setAdminEditForm] = useState({
    name: '',
    age: '',
    gender: '' as 'Kişi' | 'Qadın' | '',
    password: '',
    totalPoints: 0
  });
  
  // Admin Questions State
  const [adminQuestions, setAdminQuestions] = useState<Question[]>([]);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswerIndex: 0,
    topic: 'COGRAFIYA' as Topic,
    difficulty: 'easy' as 'easy' | 'medium' | 'hard'
  });

  // Help Modal State
  const [showHelp, setShowHelp] = useState(false);

  // Load users on mount and when needed
  const refreshLeaderboard = async () => {
    const users = await dbService.getUsers();
    setAllUsers(users);
  };

  useEffect(() => {
    refreshLeaderboard();
  }, []);

  useEffect(() => {
    if (gameStatus === GameStatus.LEADERBOARD || gameStatus === GameStatus.ADMIN_DASHBOARD) {
      refreshLeaderboard();
    }
  }, [gameStatus]);

  // Load questions for admin
  useEffect(() => {
    if (gameStatus === GameStatus.ADMIN_DASHBOARD && adminTab === 'questions') {
      loadAllQuestions();
    }
  }, [gameStatus, adminTab]);

  const loadAllQuestions = async () => {
    const qs = await dbService.getQuestions();
    setAdminQuestions(qs);
  };

  // --- AUTH LOGIC --- (Validations same as before)
  useEffect(() => {
    if (!authForm.username) { setUsernameStatus('idle'); return; }
    if (authForm.username.length < 3) { setUsernameStatus('idle'); return; }
    const checkUsername = async () => {
      setUsernameStatus('checking');
      const users = await dbService.getUsers();
      const taken = users.some(u => u.username === authForm.username);
      setUsernameStatus(taken ? 'taken' : 'valid');
    };
    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [authForm.username]);

  useEffect(() => {
    if (!authForm.password) { setPasswordStatus('idle'); return; }
    if (authForm.password.length >= 5 && authForm.password.length <= 10) { setPasswordStatus('valid'); } 
    else { setPasswordStatus('invalid'); }
  }, [authForm.password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);
    if (!authForm.username.trim() || authForm.username.length < 3) { setAuthError("İstifadəçi adı ən az 3 simvol olmalıdır."); setIsAuthLoading(false); return; }
    if (usernameStatus === 'taken') { setAuthError("Bu istifadəçi adı artıq mövcuddur."); setIsAuthLoading(false); return; }
    if (authForm.password.length < 5 || authForm.password.length > 10) { setAuthError("Şifrə 5 ilə 10 simvol arasında olmalıdır."); setIsAuthLoading(false); return; }
    if (!authForm.name.trim()) { setAuthError("Ad daxil edilməlidir."); setIsAuthLoading(false); return; }
    if (!authForm.age.trim()) { setAuthError("Yaş daxil edilməlidir."); setIsAuthLoading(false); return; }
    if (!authForm.gender) { setAuthError("Cins seçilməlidir."); setIsAuthLoading(false); return; }

    const newUser: User = { username: authForm.username, password: authForm.password, name: authForm.name, age: authForm.age, gender: authForm.gender, totalPoints: 0, completedTopics: [], gamesPlayed: 0, seenQuestions: [] };
    const success = await dbService.addUser(newUser);
    if (success) { setCurrentUser(newUser); setRegistrationSuccess(true); refreshLeaderboard(); } 
    else { setAuthError("Qeydiyyat xətası baş verdi."); }
    setIsAuthLoading(false);
  };

  const finishRegistration = () => {
    setRegistrationSuccess(false);
    setGameStatus(GameStatus.AUTH_CHOICE);
    setAuthForm({ username: '', password: '', name: '', age: '', gender: '' });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);
    const users = await dbService.getUsers();
    const foundUser = users.find(u => u.username === authForm.username && u.password === authForm.password);
    if (foundUser) {
      if (!foundUser.seenQuestions) foundUser.seenQuestions = [];
      setCurrentUser(foundUser);
      setGameStatus(GameStatus.AUTH_CHOICE);
      setAuthForm({ username: '', password: '', name: '', age: '', gender: '' });
    } else { setAuthError("İstifadəçi adı və ya şifrə yanlışdır."); }
    setIsAuthLoading(false);
  };

  const handleLogout = () => { setCurrentUser(null); setGameStatus(GameStatus.AUTH_CHOICE); };

  // SCORING LOGIC - 50 Points Fixed
  const updateUserStats = async (points: number, topicCompleted?: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser };
    updatedUser.totalPoints += points;
    updatedUser.gamesPlayed += 1;
    if (topicCompleted && !updatedUser.completedTopics.includes(topicCompleted)) {
      updatedUser.completedTopics.push(topicCompleted);
    }
    const success = await dbService.updateUser(currentUser.username, {
      totalPoints: updatedUser.totalPoints,
      gamesPlayed: updatedUser.gamesPlayed,
      completedTopics: updatedUser.completedTopics,
      seenQuestions: updatedUser.seenQuestions 
    });
    if (success) { setCurrentUser(updatedUser); refreshLeaderboard(); }
  };

  const markQuestionAsSeen = async (questionText: string) => {
    if (!currentUser) return;
    if (currentUser.seenQuestions.includes(questionText)) return;
    const updatedList = [...currentUser.seenQuestions, questionText];
    setCurrentUser({ ...currentUser, seenQuestions: updatedList });
    await dbService.updateUser(currentUser.username, { seenQuestions: updatedList });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const updates = { name: editProfileForm.name, age: editProfileForm.age, gender: editProfileForm.gender };
    const success = await dbService.updateUser(currentUser.username, updates);
    if (success) { setCurrentUser({ ...currentUser, ...updates }); setProfileSaveStatus('saved'); setTimeout(() => setProfileSaveStatus('idle'), 2000); refreshLeaderboard(); }
  };

  // ADMIN - USERS
  const handleDeleteUser = async (usernameToDelete: string) => {
    if (window.confirm(`${usernameToDelete} istifadəçisini silmək istədiyinizə əminsiniz?`)) {
      const success = await dbService.deleteUser(usernameToDelete);
      if (success) refreshLeaderboard();
    }
  };

  const startEditingUser = (user: User) => {
    setUserToEdit(user);
    setAdminEditForm({ name: user.name, age: user.age, gender: user.gender, password: user.password, totalPoints: user.totalPoints });
  };

  const handleAdminSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    const success = await dbService.updateUser(userToEdit.username, {
      name: adminEditForm.name, age: adminEditForm.age, gender: adminEditForm.gender, password: adminEditForm.password, totalPoints: Number(adminEditForm.totalPoints)
    });
    if (success) { await refreshLeaderboard(); setUserToEdit(null); }
  };

  // ADMIN - QUESTIONS
  const handleSeedQuestions = async () => {
    if (window.confirm("Bütün mövcud suallar bazaya yüklənəcək. Davam edilsin?")) {
      const allStaticQuestions = [];
      TOPICS.forEach(topic => {
        const qs = getQuestionsByTopic(topic.id, []); 
        qs.forEach(q => {
           allStaticQuestions.push({
             text: q.text,
             options: q.options,
             correctAnswerIndex: q.correctAnswerIndex,
             topic: topic.id,
             difficulty: 'medium'
           });
        });
      });
      await dbService.seedQuestions(allStaticQuestions);
      alert("Suallar yükləndi!");
      loadAllQuestions();
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const newQData = {
      text: questionForm.text,
      options: [questionForm.optionA, questionForm.optionB, questionForm.optionC, questionForm.optionD],
      correctAnswerIndex: Number(questionForm.correctAnswerIndex),
      topic: questionForm.topic,
      difficulty: questionForm.difficulty
    };

    if (questionToEdit) {
      await dbService.updateQuestion(questionToEdit.id as string, newQData);
    } else {
      await dbService.addQuestion(newQData);
    }
    setQuestionToEdit(null);
    setIsAddingQuestion(false);
    loadAllQuestions();
  };

  const handleDeleteQuestion = async (id: string) => {
    if (window.confirm("Bu sualı silmək istəyirsiniz?")) {
      await dbService.deleteQuestion(id);
      loadAllQuestions();
    }
  };

  const openQuestionModal = (q?: Question) => {
    if (q) {
      setQuestionToEdit(q);
      setQuestionForm({
        text: q.text,
        optionA: q.options[0], optionB: q.options[1], optionC: q.options[2], optionD: q.options[3],
        correctAnswerIndex: q.correctAnswerIndex,
        topic: (q.topic as Topic) || 'COGRAFIYA',
        difficulty: (q.difficulty as any) || 'medium'
      });
    } else {
      setQuestionToEdit(null);
      setQuestionForm({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswerIndex: 0, topic: 'COGRAFIYA', difficulty: 'easy' });
    }
    setIsAddingQuestion(true);
  };

  // --- GAME LOGIC ---
  
  useEffect(() => {
    if (gameStatus === GameStatus.PLAYING && answerState === AnswerState.IDLE && !isTimerPaused) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { handleTimeUp(); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [gameStatus, answerState, currentQuestionIndex, isTimerPaused]);

  const handleTimeUp = () => {
     if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
     setLossReason('timeout');
     setGameStatus(GameStatus.LOST);
     updateUserStats(0); // No points for timeout
  };

  const startGameWithTopic = async (topic: Topic) => {
    if (currentUser?.completedTopics.includes(topic)) return;
    
    // Try to get questions from DB first
    let gameQuestions = await dbService.getQuestions(topic);
    
    // If no questions in DB, fallback to local static file
    if (gameQuestions.length === 0) {
       console.log("DB boşdur, lokal suallardan istifadə edilir.");
       gameQuestions = getQuestionsByTopic(topic, currentUser?.seenQuestions || []);
    } else {
       // Shuffle and pick 10 if we have enough
       gameQuestions = gameQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
    }

    if (gameQuestions.length === 0) {
      alert("Bu mövzuda sual tapılmadı.");
      return;
    }

    setSelectedTopic(topic);
    setQuestions(gameQuestions);
    setGameStatus(GameStatus.PLAYING);
    setCurrentQuestionIndex(0);
    setLifelines({ fiftyFifty: true, askAudience: true, askAI: true });
    resetQuestionState(0);
  };

  const resetQuestionState = (levelIndex: number) => {
    setSelectedAnswerIndex(null); setAnswerState(AnswerState.IDLE); setHiddenOptions([]); setAudienceData(null); setAiHint(null); setTimeLeft(30); setIsTimerPaused(false); setLossReason(null);
  };

  const handleAnswerSelect = useCallback((index: number) => {
    if (answerState !== AnswerState.IDLE || !questions[currentQuestionIndex]) return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setSelectedAnswerIndex(index);
    setAnswerState(AnswerState.SELECTED);

    setTimeout(() => {
      const isCorrect = index === questions[currentQuestionIndex].correctAnswerIndex;
      setAnswerState(isCorrect ? AnswerState.CORRECT : AnswerState.WRONG);

      setTimeout(() => {
        if (isCorrect) {
          const currentQ = questions[currentQuestionIndex];
          markQuestionAsSeen(currentQ.text);
          // FIXED SCORING: 50 Points per question
          updateUserStats(50);
          
          if (currentQuestionIndex + 1 >= questions.length) {
            setGameStatus(GameStatus.WON);
            updateUserStats(50, selectedTopic || undefined); // Bonus for winning? Or just last question points.
          } else {
            setCurrentQuestionIndex(prev => { const next = prev + 1; resetQuestionState(next); return next; });
          }
        } else {
          setLossReason('wrong');
          setGameStatus(GameStatus.LOST);
          // No points for losing step
        }
      }, 2500);
    }, 1500);
  }, [answerState, currentQuestionIndex, questions, selectedTopic, currentUser]);

  const useFiftyFifty = () => { if (!lifelines.fiftyFifty) return; const correct = questions[currentQuestionIndex].correctAnswerIndex; const wrongs = [0, 1, 2, 3].filter(i => i !== correct).sort(() => 0.5 - Math.random()); setHiddenOptions([wrongs[0], wrongs[1]]); setLifelines(prev => ({ ...prev, fiftyFifty: false })); };
  const useAskAudience = () => { if (!lifelines.askAudience) return; setIsTimerPaused(true); setTimeout(() => { const correct = questions[currentQuestionIndex].correctAnswerIndex; let correctPerc = Math.floor(Math.random() * 30) + 50; const remaining = 100 - correctPerc; const w1 = Math.floor(Math.random() * remaining); const w2 = Math.floor(Math.random() * (remaining - w1)); const w3 = remaining - w1 - w2; const data = [0, 0, 0, 0]; data[correct] = correctPerc; let wrongIndices = [0, 1, 2, 3].filter(i => i !== correct); data[wrongIndices[0]] = w1; data[wrongIndices[1]] = w2; data[wrongIndices[2]] = w3; setAudienceData({ A: data[0], B: data[1], C: data[2], D: data[3] }); setLifelines(prev => ({ ...prev, askAudience: false })); setIsTimerPaused(false); }, 2000); };
  const useAskAI = async () => { if (!lifelines.askAI || aiLoading) return; setAiLoading(true); setIsTimerPaused(true); const hint = await getAIHint(questions[currentQuestionIndex].text, questions[currentQuestionIndex].options); setAiHint(hint); setAiLoading(false); setIsTimerPaused(false); setLifelines(prev => ({ ...prev, askAI: false })); };

  // --- STYLES & RENDERS ---
  const bgClass = "bg-[#020220]"; const cardClass = "bg-slate-900/80 border-blue-500/50 text-white"; const inputClass = "bg-slate-800 border-slate-600 text-white";

  const renderHelpModal = () => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
      <div className={`${cardClass} p-6 rounded-2xl w-full max-w-md shadow-2xl bg-[#000030] relative`}>
        <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
        <div className="flex items-center gap-2 mb-4 text-teal-400"><HelpCircle size={28} /><h2 className="text-xl font-bold">Oyun qaydaları</h2></div>
        <div className="space-y-3 text-slate-300 text-sm md:text-base">
           <p className="flex items-start gap-2"><span className="text-yellow-500 font-bold">•</span><span>Oyuna başlamaq üçün qeydiyyatdan keçin.</span></p>
           <p className="flex items-start gap-2"><span className="text-yellow-500 font-bold">•</span><span>Hər mövzuda <strong>10 sual</strong> var.</span></p>
           <p className="flex items-start gap-2"><span className="text-yellow-500 font-bold">•</span><span>Hər düzgün cavab <strong>50 Xal</strong> qazandırır.</span></p>
           <p className="flex items-start gap-2"><span className="text-yellow-500 font-bold">•</span><span>Hər sual üçün <strong>30 saniyə</strong> vaxtınız var.</span></p>
           <p className="flex items-start gap-2"><span className="text-yellow-500 font-bold">•</span><span>3 Köməkçi vasitə: <strong>50/50</strong>, <strong>Auditoriya</strong> və <strong>Bilgə İnsan (AI)</strong>.</span></p>
        </div>
        <Button onClick={() => setShowHelp(false)} fullWidth className="mt-6 bg-teal-700 hover:bg-teal-600 border-teal-500">Aydındır</Button>
      </div>
    </div>
  );

  const renderAuthChoice = () => {
    const isLoggedIn = !!currentUser;
    const isAdmin = currentUser?.username === 'admin';
    const btnBase = "py-3 md:py-4 text-sm md:text-base font-bold border-2 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg rounded-xl";
    // Filter out admin from count
    const validUsers = allUsers.filter(u => u.username !== 'admin');
    const highestScore = validUsers.length > 0 ? Math.max(...validUsers.map(u => u.totalPoints)) : 0;
    const playerCount = validUsers.length;

    return (
      <div className="flex flex-col h-full w-full relative z-10 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col min-h-full w-full justify-between">
            <div className="flex flex-col items-center w-full">
                <div className="flex flex-col items-center justify-center pt-16 md:pt-24 shrink-0 relative z-20 px-4">
                   <div className="scale-105 md:scale-110"><GameLogo size="xl" /></div>
                   <div className="mt-10 md:mt-12 text-center z-30 px-4">
                     <p className="text-blue-100 text-sm md:text-base font-semibold tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Bilgi gücdür,</p>
                     <p className="text-yellow-400 text-lg md:text-xl font-bold italic tracking-widest drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]">Bilməcə Live isə meydan!</p>
                   </div>
                </div>
                <div className="flex justify-between items-center px-6 w-full max-w-sm mx-auto gap-4 mt-4">
                   <div className="flex-1 flex flex-col justify-center px-3 py-2 bg-[#000030]/80 border border-blue-600 rounded-xl shadow-[0_0_10px_rgba(37,99,235,0.3)] min-h-[50px] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors"></div>
                      <div className="flex items-center gap-2 relative z-10">
                        <Trophy size={16} className="text-yellow-400 shrink-0" />
                        <div className="flex flex-col"><span className="text-[8px] text-blue-200 uppercase tracking-wider mb-0.5">Rekord Xal</span><span className="text-sm font-bold text-white leading-none font-mono">{highestScore.toLocaleString()}</span></div>
                      </div>
                   </div>
                   <div className="flex-1 flex flex-col justify-center px-3 py-2 bg-[#000030]/80 border border-blue-600 rounded-xl shadow-[0_0_10px_rgba(37,99,235,0.3)] min-h-[50px] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors"></div>
                      <div className="flex items-center gap-2 relative z-10">
                        <Users size={16} className="text-blue-400 shrink-0" />
                         <div className="flex flex-col"><span className="text-[8px] text-blue-200 uppercase tracking-wider mb-0.5">Oyunçu sayı</span><span className="text-sm font-bold text-white leading-none font-mono">{playerCount.toLocaleString()}</span></div>
                      </div>
                   </div>
                </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-2 min-h-[60px]">
               {isLoggedIn && (
                  <div className="text-center animate-fade-in bg-[#000040]/50 p-4 rounded-2xl border border-blue-500/20 backdrop-blur-sm shadow-xl w-full max-w-xs mx-auto">
                     <p className={`text-[10px] text-blue-300 mb-2 uppercase tracking-[0.2em] font-bold`}>Xoş gəldin</p>
                     <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] mb-3 truncate">{currentUser.name}</h2>
                     <div className="flex items-center justify-center gap-2 text-yellow-400 bg-[#000030] px-5 py-2 rounded-full border border-yellow-600/50 mx-auto w-fit shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                        <Trophy size={18} className="text-yellow-500" /><span className="font-bold text-base md:text-lg">{currentUser.totalPoints} xal</span>
                     </div>
                  </div>
               )}
            </div>
            <div className="w-full px-6 pb-4 md:pb-6 flex flex-col items-center shrink-0 max-w-xs mx-auto z-20">
               <div className="w-full flex flex-col gap-3">
               {!isLoggedIn ? (
                 <>
                   <Button fullWidth onClick={() => setGameStatus(GameStatus.LOGIN)} className={`${btnBase} bg-blue-900/80 border-blue-500 text-white`}><LogIn size={20} /> Daxil ol</Button>
                   <Button fullWidth onClick={() => setGameStatus(GameStatus.REGISTER)} className={`${btnBase} bg-fuchsia-900/80 border-fuchsia-500 text-white`}><UserPlus size={20} /> Qeydiyyat</Button>
                   <Button fullWidth onClick={() => setShowHelp(true)} className={`${btnBase} bg-teal-900/80 border-teal-500 text-white`}><HelpCircle size={20} /> Kömək</Button>
                   <Button fullWidth onClick={() => setGameStatus(GameStatus.LEADERBOARD)} className={`${btnBase} bg-amber-900/80 border-amber-500 text-white`}><Trophy size={20} /> Reytinq</Button>
                 </>
               ) : (
                 <>
                   <Button fullWidth onClick={() => setGameStatus(GameStatus.TOPIC_SELECTION)} className={`${btnBase} bg-green-900/80 border-green-500 text-white`}><Play size={22} fill="currentColor" /> Oyuna başla</Button>
                   {isAdmin && <Button fullWidth onClick={() => setGameStatus(GameStatus.ADMIN_DASHBOARD)} className={`${btnBase} bg-gray-800/80 border-gray-500 text-white`}><Wrench size={20} /> Admin Panel</Button>}
                    <Button fullWidth onClick={() => setGameStatus(GameStatus.LEADERBOARD)} className={`${btnBase} bg-amber-900/80 border-amber-500 text-white`}><Trophy size={20} /> Reytinq</Button>
                   <Button fullWidth onClick={handleLogout} className={`${btnBase} bg-red-900/60 border-red-500/80 text-red-100`}><LogOut size={20} /> Çıxış</Button>
                 </>
               )}
               </div>
               <div className="text-[10px] text-white mt-4 font-mono">© 2025 by Agil Muradov | Gemini 3</div>
            </div>
        </div>
        {showHelp && renderHelpModal()}
      </div>
    );
  };

  const renderLeaderboard = () => {
    // Hide Admin from leaderboard
    const sortedUsers = [...allUsers].filter(u => u.username !== 'admin').sort((a, b) => b.totalPoints - a.totalPoints);
    return (
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 z-10">
        <div className="flex justify-between items-center mb-6 shrink-0 bg-slate-900/80 p-4 rounded-xl border border-slate-700">
           <div className="flex items-center gap-3"><Trophy size={32} className="text-yellow-500" /><h2 className="text-xl font-bold text-white">Reytinq cədvəli</h2></div>
           <Button variant="secondary" onClick={() => setGameStatus(previousStatus || GameStatus.AUTH_CHOICE)} className="py-1 px-3 text-sm h-10 border-slate-600 bg-slate-800"><ArrowLeft size={18} /></Button>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-2">
          {sortedUsers.map((user, index) => (
            <div key={user.username} className={`flex items-center justify-between p-4 rounded-lg border ${user.username === currentUser?.username ? 'bg-blue-900/40 border-blue-500' : 'bg-slate-800/80 border-slate-600'}`}>
               <div className="flex items-center gap-4">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${index < 3 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-300'}`}>{index + 1}</span>
                  <div><div className="font-bold text-white text-lg">{user.name}</div><div className="text-xs text-slate-400">Oyunlar: {user.gamesPlayed}</div></div>
               </div>
               <div className="text-green-400 font-mono font-bold text-xl">{user.totalPoints.toLocaleString()}</div>
            </div>
          ))}
          {sortedUsers.length === 0 && <div className="text-center text-slate-400 mt-10">Hələ ki heç kim oynamayıb.</div>}
        </div>
      </div>
    );
  };

  const renderAdminDashboard = () => {
    // Filter out admin from list
    const filteredUsers = allUsers.filter(u => u.username !== 'admin' && (u.username.toLowerCase().includes(adminSearch.toLowerCase()) || u.name.toLowerCase().includes(adminSearch.toLowerCase())));
    
    // Questions Filter
    const filteredQuestions = adminQuestions.filter(q => q.text.toLowerCase().includes(adminSearch.toLowerCase()));

    return (
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 z-10 overflow-hidden">
        <header className="flex justify-between items-center mb-4 shrink-0 bg-slate-900/80 p-4 rounded-xl border border-slate-700">
           <div className="flex items-center gap-3"><Wrench size={32} className="text-gray-300" /><h2 className="text-xl font-bold text-white">Admin Panel</h2></div>
           <Button variant="secondary" onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="py-1 px-3 text-sm h-10 border-slate-600 bg-slate-800">Çıxış</Button>
        </header>

        <div className="flex gap-2 mb-4">
           <button onClick={() => setAdminTab('users')} className={`flex-1 p-2 rounded-lg font-bold transition-colors ${adminTab === 'users' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>İstifadəçilər</button>
           <button onClick={() => setAdminTab('questions')} className={`flex-1 p-2 rounded-lg font-bold transition-colors ${adminTab === 'questions' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Suallar</button>
        </div>

        {/* Search */}
        <div className="mb-4 relative">
          <input type="text" placeholder="Axtarış..." value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} className={`w-full p-3 pl-10 rounded-lg border ${inputClass}`} />
          <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
        </div>

        {adminTab === 'users' ? (
          <div className="flex-1 overflow-y-auto bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-3">
            {filteredUsers.map(user => (
              <div key={user.username} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-800/80 rounded-lg border border-slate-600 gap-4">
                 <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-lg">{user.name}</span>
                      <span className="text-xs text-blue-300 px-2 py-0.5 bg-blue-900/50 rounded-full">{user.username}</span>
                    </div>
                    <div className="text-sm text-slate-400 mt-1">Xal: <span className="text-green-400 font-mono font-bold">{user.totalPoints}</span> | Şifrə: <span className="text-red-300 font-mono">{user.password}</span></div>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={() => startEditingUser(user)} className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition-colors"><Edit size={16} /></button>
                   <button onClick={() => handleDeleteUser(user.username)} className="p-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-colors"><Trash2 size={16} /></button>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
             <div className="flex gap-2 mb-2">
                <Button onClick={() => openQuestionModal()} className="flex-1 bg-green-700 text-sm py-2"><PlusCircle size={16} className="mr-2"/> Yeni Sual</Button>
                <Button onClick={handleSeedQuestions} className="flex-1 bg-yellow-700 text-sm py-2"><Database size={16} className="mr-2"/> Bazanı Doldur</Button>
             </div>
             <div className="flex-1 overflow-y-auto bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-3">
               {filteredQuestions.map((q, idx) => (
                 <div key={q.id || idx} className="p-4 bg-slate-800/80 rounded-lg border border-slate-600">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-bold text-blue-300 bg-blue-900/30 px-2 py-1 rounded uppercase">{q.topic}</span>
                       <div className="flex gap-2">
                          <button onClick={() => openQuestionModal(q)} className="text-blue-400 hover:text-white"><Edit size={16}/></button>
                          <button onClick={() => handleDeleteQuestion(q.id as string)} className="text-red-400 hover:text-white"><Trash2 size={16}/></button>
                       </div>
                    </div>
                    <p className="text-white font-semibold mb-2">{q.text}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                       {q.options.map((opt, i) => (
                         <span key={i} className={i === q.correctAnswerIndex ? "text-green-400 font-bold" : ""}>{opt}</span>
                       ))}
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* User Edit Modal */}
        {userToEdit && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
             <div className={`${cardClass} p-6 rounded-2xl w-full max-w-md shadow-2xl bg-[#000030]`}>
                <h3 className="text-xl font-bold mb-4 text-white">Redaktə et: {userToEdit.username}</h3>
                <form onSubmit={handleAdminSaveUser} className="space-y-3">
                   <div><label className="text-xs text-blue-300 block mb-1">Ad</label><input type="text" value={adminEditForm.name} onChange={e => setAdminEditForm({...adminEditForm, name: e.target.value})} className={`w-full p-2 rounded border ${inputClass}`} /></div>
                   <div className="flex gap-2">
                      <div className="flex-1"><label className="text-xs text-blue-300 block mb-1">Yaş</label><input type="number" value={adminEditForm.age} onChange={e => setAdminEditForm({...adminEditForm, age: e.target.value})} className={`w-full p-2 rounded border ${inputClass}`} /></div>
                      <div className="flex-1"><label className="text-xs text-blue-300 block mb-1">Cins</label><select value={adminEditForm.gender} onChange={e => setAdminEditForm({...adminEditForm, gender: e.target.value as any})} className={`w-full p-2 rounded border ${inputClass}`}><option value="Kişi">Kişi</option><option value="Qadın">Qadın</option></select></div>
                   </div>
                   <div><label className="text-xs text-red-300 block mb-1">Şifrə</label><input type="text" value={adminEditForm.password} onChange={e => setAdminEditForm({...adminEditForm, password: e.target.value})} className={`w-full p-2 rounded border ${inputClass}`} /></div>
                   <div><label className="text-xs text-green-300 block mb-1">Xal</label><input type="number" value={adminEditForm.totalPoints} onChange={e => setAdminEditForm({...adminEditForm, totalPoints: Number(e.target.value)})} className={`w-full p-2 rounded border ${inputClass}`} /></div>
                   <div className="flex gap-2 mt-4"><Button type="submit" fullWidth className="bg-green-700">Yadda saxla</Button><Button type="button" fullWidth variant="secondary" onClick={() => setUserToEdit(null)}>Ləğv et</Button></div>
                </form>
             </div>
          </div>
        )}

        {/* Question Add/Edit Modal */}
        {isAddingQuestion && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
             <div className={`${cardClass} p-6 rounded-2xl w-full max-w-lg shadow-2xl bg-[#000030] overflow-y-auto max-h-[90vh]`}>
                <h3 className="text-xl font-bold mb-4 text-white">{questionToEdit ? "Sualı Düzəlt" : "Yeni Sual"}</h3>
                <form onSubmit={handleSaveQuestion} className="space-y-3">
                   <div><label className="text-xs text-blue-300 block mb-1">Sual Mətni</label><textarea value={questionForm.text} onChange={e => setQuestionForm({...questionForm, text: e.target.value})} className={`w-full p-2 rounded border ${inputClass}`} required /></div>
                   <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-xs text-slate-400">Variant A</label><input type="text" value={questionForm.optionA} onChange={e => setQuestionForm({...questionForm, optionA: e.target.value})} className={`w-full p-2 rounded border ${inputClass}`} required /></div>
                      <div><label className="text-xs text-slate-400">Variant B</label><input type="text" value={questionForm.optionB} onChange={e => setQuestionForm({...questionForm, optionB: e.target.value})} className={`w-full p-2 rounded border ${inputClass}`} required /></div>
                      <div><label className="text-xs text-slate-400">Variant C</label><input type="text" value={questionForm.optionC} onChange={e => setQuestionForm({...questionForm, optionC: e.target.value})} className={`w-full p-2 rounded border ${inputClass}`} required /></div>
                      <div><label className="text-xs text-slate-400">Variant D</label><input type="text" value={questionForm.optionD} onChange={e => setQuestionForm({...questionForm, optionD: e.target.value})} className={`w-full p-2 rounded border ${inputClass}`} required /></div>
                   </div>
                   <div className="flex gap-2">
                      <div className="flex-1">
                         <label className="text-xs text-green-300 block mb-1">Düzgün Variant</label>
                         <select value={questionForm.correctAnswerIndex} onChange={e => setQuestionForm({...questionForm, correctAnswerIndex: Number(e.target.value)})} className={`w-full p-2 rounded border ${inputClass}`}>
                            <option value={0}>A</option><option value={1}>B</option><option value={2}>C</option><option value={3}>D</option>
                         </select>
                      </div>
                      <div className="flex-1">
                         <label className="text-xs text-blue-300 block mb-1">Mövzu</label>
                         <select value={questionForm.topic} onChange={e => setQuestionForm({...questionForm, topic: e.target.value as Topic})} className={`w-full p-2 rounded border ${inputClass}`}>
                            {TOPICS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                         </select>
                      </div>
                   </div>
                   <div className="flex gap-2 mt-4"><Button type="submit" fullWidth className="bg-green-700">Yadda saxla</Button><Button type="button" fullWidth variant="secondary" onClick={() => setIsAddingQuestion(false)}>Ləğv et</Button></div>
                </form>
             </div>
          </div>
        )}
      </div>
    );
  };

  const renderLogin = () => (
    <div className="flex flex-col items-center justify-center min-h-full p-6 w-full max-w-md mx-auto relative z-20">
      <div className="bg-[#000030]/90 p-8 rounded-2xl border border-blue-500/50 shadow-2xl w-full backdrop-blur-md">
         <div className="flex justify-center mb-6"><div className="p-3 bg-blue-900/50 rounded-full border border-blue-400"><LogIn size={32} className="text-blue-300"/></div></div>
         <h2 className="text-2xl font-bold text-center text-white mb-6">Giriş</h2>
         {authError && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm flex items-center gap-2"><AlertCircle size={16}/>{authError}</div>}
         <form onSubmit={handleLogin} className="space-y-4">
           <div><label className="text-blue-300 text-xs uppercase font-bold ml-1 mb-1 block">İstifadəçi adı</label><input type="text" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} className="w-full bg-slate-800/80 border border-blue-500/30 rounded-lg p-3 text-white focus:border-blue-400 outline-none transition-colors" placeholder="Username" /></div>
           <div><label className="text-blue-300 text-xs uppercase font-bold ml-1 mb-1 block">Şifrə</label><input type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full bg-slate-800/80 border border-blue-500/30 rounded-lg p-3 text-white focus:border-blue-400 outline-none transition-colors" placeholder="Password" /></div>
           <Button type="submit" fullWidth disabled={isAuthLoading} className="mt-4">{isAuthLoading ? 'Gözləyin...' : 'Daxil ol'}</Button>
         </form>
         <div className="mt-6 text-center"><button onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="text-slate-400 hover:text-white text-sm underline">Geri qayıt</button></div>
      </div>
    </div>
  );

  const renderRegister = () => (
    <div className="flex flex-col items-center justify-center min-h-full p-6 w-full max-w-md mx-auto relative z-20 my-auto">
      <div className="bg-[#000030]/90 p-6 md:p-8 rounded-2xl border border-fuchsia-500/50 shadow-2xl w-full backdrop-blur-md max-h-[90vh] overflow-y-auto">
         {!registrationSuccess ? (
           <>
             <div className="flex justify-center mb-4"><div className="p-3 bg-fuchsia-900/50 rounded-full border border-fuchsia-400"><UserPlus size={32} className="text-fuchsia-300"/></div></div>
             <h2 className="text-2xl font-bold text-center text-white mb-4">Qeydiyyat</h2>
             {authError && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm flex items-center gap-2"><AlertCircle size={16}/>{authError}</div>}
             <form onSubmit={handleRegister} className="space-y-3">
               <div>
                 <label className="text-fuchsia-300 text-xs uppercase font-bold ml-1 mb-1 block">İstifadəçi adı</label>
                 <div className="relative">
                   <input type="text" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} className={`w-full bg-slate-800/80 border ${usernameStatus === 'taken' ? 'border-red-500' : usernameStatus === 'valid' ? 'border-green-500' : 'border-fuchsia-500/30'} rounded-lg p-3 text-white focus:border-fuchsia-400 outline-none transition-colors`} placeholder="Minimum 3 simvol" />
                   {usernameStatus === 'checking' && <div className="absolute right-3 top-3.5"><div className="animate-spin h-4 w-4 border-2 border-fuchsia-500 rounded-full border-t-transparent"></div></div>}
                   {usernameStatus === 'valid' && <CheckCircle size={18} className="absolute right-3 top-3.5 text-green-500" />}
                 </div>
               </div>
               <div>
                  <label className="text-fuchsia-300 text-xs uppercase font-bold ml-1 mb-1 block">Ad Soyad</label>
                  <input type="text" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className="w-full bg-slate-800/80 border border-fuchsia-500/30 rounded-lg p-3 text-white focus:border-fuchsia-400 outline-none transition-colors" />
               </div>
               <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-fuchsia-300 text-xs uppercase font-bold ml-1 mb-1 block">Yaş</label>
                    <input type="number" value={authForm.age} onChange={e => setAuthForm({...authForm, age: e.target.value})} className="w-full bg-slate-800/80 border border-fuchsia-500/30 rounded-lg p-3 text-white focus:border-fuchsia-400 outline-none transition-colors" />
                  </div>
                  <div className="flex-1">
                    <label className="text-fuchsia-300 text-xs uppercase font-bold ml-1 mb-1 block">Cins</label>
                    <select value={authForm.gender} onChange={e => setAuthForm({...authForm, gender: e.target.value as any})} className="w-full bg-slate-800/80 border border-fuchsia-500/30 rounded-lg p-3 text-white focus:border-fuchsia-400 outline-none transition-colors appearance-none">
                      <option value="">Seçin</option>
                      <option value="Kişi">Kişi</option>
                      <option value="Qadın">Qadın</option>
                    </select>
                  </div>
               </div>
               <div>
                 <label className="text-fuchsia-300 text-xs uppercase font-bold ml-1 mb-1 block">Şifrə</label>
                 <input type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className={`w-full bg-slate-800/80 border ${passwordStatus === 'invalid' && authForm.password.length > 0 ? 'border-red-500' : 'border-fuchsia-500/30'} rounded-lg p-3 text-white focus:border-fuchsia-400 outline-none transition-colors`} placeholder="5-10 simvol" />
                 <p className="text-[10px] text-slate-400 mt-1 ml-1">Şifrə 5-10 simvol arası olmalıdır.</p>
               </div>
               <Button type="submit" fullWidth disabled={isAuthLoading} className="mt-4 bg-fuchsia-700 hover:bg-fuchsia-600 border-fuchsia-500">{isAuthLoading ? 'Gözləyin...' : 'Qeydiyyatdan keç'}</Button>
             </form>
             <div className="mt-4 text-center"><button onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="text-slate-400 hover:text-white text-sm underline">Geri qayıt</button></div>
           </>
         ) : (
           <div className="text-center py-8 animate-fade-in">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-400 border-2 border-green-500"><Check size={32} /></div>
              <h2 className="text-2xl font-bold text-white mb-2">Uğurlu Qeydiyyat!</h2>
              <p className="text-slate-300 mb-6">Hesabınız yaradıldı. İndi giriş edə bilərsiniz.</p>
              <Button onClick={finishRegistration} fullWidth className="bg-green-600 border-green-400">Davam et</Button>
           </div>
         )}
      </div>
    </div>
  );

  const renderTopicSelection = () => (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 z-10">
      <div className="flex justify-between items-center mb-6 shrink-0 bg-slate-900/80 p-4 rounded-xl border border-slate-700">
         <div className="flex items-center gap-3"><BrainCircuit size={32} className="text-blue-400" /><h2 className="text-xl font-bold text-white">Mövzu Seçimi</h2></div>
         <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setGameStatus(GameStatus.PROFILE)} className="py-1 px-3 text-sm h-10 border-slate-600 bg-slate-800"><Edit size={18} /></Button>
            <Button variant="secondary" onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="py-1 px-3 text-sm h-10 border-slate-600 bg-slate-800"><ArrowLeft size={18} /></Button>
         </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pb-4">
        {TOPICS.map((topic) => {
           const Icon = ICON_MAP[topic.icon] || Globe;
           const isCompleted = currentUser?.completedTopics.includes(topic.id);
           // Simple color mapping for tailwind classes (can be improved)
           let colorClass = "border-blue-500/50 hover:border-blue-400 bg-blue-900/20 hover:bg-blue-900/40";
           if(topic.color === 'amber') colorClass = "border-amber-500/50 hover:border-amber-400 bg-amber-900/20 hover:bg-amber-900/40";
           if(topic.color === 'fuchsia') colorClass = "border-fuchsia-500/50 hover:border-fuchsia-400 bg-fuchsia-900/20 hover:bg-fuchsia-900/40";
           if(topic.color === 'emerald') colorClass = "border-emerald-500/50 hover:border-emerald-400 bg-emerald-900/20 hover:bg-emerald-900/40";
           if(topic.color === 'violet') colorClass = "border-violet-500/50 hover:border-violet-400 bg-violet-900/20 hover:bg-violet-900/40";
           if(topic.color === 'rose') colorClass = "border-rose-500/50 hover:border-rose-400 bg-rose-900/20 hover:bg-rose-900/40";

           return (
             <button
               key={topic.id}
               onClick={() => startGameWithTopic(topic.id)}
               disabled={isCompleted}
               className={`relative p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-all duration-300 group ${isCompleted ? 'opacity-50 grayscale cursor-not-allowed border-slate-700 bg-slate-800' : colorClass}`}
             >
                <div className={`p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors`}>
                   <Icon size={40} className="text-white drop-shadow-md" />
                </div>
                <div className="text-center">
                   <h3 className="text-lg md:text-xl font-bold text-white mb-1">{topic.label}</h3>
                   <p className="text-xs md:text-sm text-slate-300">{topic.description}</p>
                </div>
                {isCompleted && <div className="absolute top-2 right-2 text-green-500"><CheckCircle size={24} /></div>}
             </button>
           );
        })}
      </div>
    </div>
  );

  const renderPlaying = () => {
    if (!questions[currentQuestionIndex]) return <div>Yüklənir...</div>;
    const currentQ = questions[currentQuestionIndex];
    
    return (
      <div className="flex flex-col h-full w-full relative z-10 max-w-5xl mx-auto md:px-4">
         {/* Top Bar */}
         <div className="flex justify-between items-start p-4 shrink-0">
             <div className="flex gap-2 items-center">
               <button onClick={() => setGameStatus(GameStatus.TOPIC_SELECTION)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white border border-slate-600"><ArrowLeft size={20}/></button>
               <div className="bg-slate-900/80 px-4 py-2 rounded-full border border-blue-500/30 flex items-center gap-2">
                 <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">Sual</span>
                 <span className="text-white font-mono font-bold">{currentQuestionIndex + 1}/10</span>
               </div>
             </div>
             <div className="flex gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-all ${timeLeft <= 10 ? 'border-red-500 text-red-500 animate-pulse' : 'border-blue-500 text-blue-400'} bg-slate-900 shadow-lg`}>
                  {timeLeft}
                </div>
             </div>
         </div>

         {/* Money Tree (Hidden on mobile, drawer on desktop usually, but let's just show current Prize) */}
         <div className="absolute top-20 right-4 hidden md:block z-20">
            <MoneyTree currentLevel={currentQuestionIndex} />
         </div>
         
         <div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-3xl mx-auto">
             {/* Question Card */}
             <div className="w-full bg-[#000040]/90 border-2 border-blue-500/50 rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(59,130,246,0.3)] backdrop-blur-md mb-6 md:mb-10 text-center relative animate-fade-in-up">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg uppercase tracking-widest border border-blue-400">
                  {currentQ.prize}
                </div>
                <h2 className="text-lg md:text-2xl font-bold text-white leading-relaxed">{currentQ.text}</h2>
             </div>

             {/* Options Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
                {currentQ.options.map((opt, idx) => {
                   if (hiddenOptions.includes(idx)) {
                     return <div key={idx} className="h-14 md:h-16"></div>; // Placeholder
                   }
                   
                   let variant: 'option' | 'primary' | 'secondary' = 'option';
                   let extraClass = "";
                   
                   if (selectedAnswerIndex === idx) {
                      if (answerState === AnswerState.SELECTED) extraClass = "bg-yellow-600 border-yellow-400 text-black";
                      else if (answerState === AnswerState.CORRECT) extraClass = "bg-green-600 border-green-400 animate-pulse";
                      else if (answerState === AnswerState.WRONG) extraClass = "bg-red-600 border-red-400";
                   } else if (answerState !== AnswerState.IDLE && idx === currentQ.correctAnswerIndex && answerState !== AnswerState.SELECTED) {
                      // Show correct answer if wrong was selected
                      if (answerState === AnswerState.WRONG) extraClass = "bg-green-600 border-green-400 opacity-80"; 
                   }

                   return (
                     <button
                       key={idx}
                       onClick={() => handleAnswerSelect(idx)}
                       disabled={answerState !== AnswerState.IDLE}
                       className={`
                         relative overflow-hidden group border-2 rounded-xl p-3 md:p-4 text-left transition-all duration-200 shadow-md active:scale-95 flex items-center
                         ${extraClass || "bg-slate-800/80 border-slate-600 hover:bg-blue-900/60 hover:border-blue-400 text-white"}
                       `}
                     >
                       <span className="font-bold text-yellow-500 mr-3 text-lg">{['A','B','C','D'][idx]}:</span>
                       <span className="font-medium text-sm md:text-base">{opt}</span>
                     </button>
                   );
                })}
             </div>

             {/* Lifelines Bar */}
             <div className="flex gap-4 justify-center w-full">
                <button 
                  onClick={useFiftyFifty} 
                  disabled={!lifelines.fiftyFifty || answerState !== AnswerState.IDLE} 
                  className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${!lifelines.fiftyFifty || answerState !== AnswerState.IDLE ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:-translate-y-1'}`}
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 border-2 border-purple-400 flex items-center justify-center font-bold text-white text-xs md:text-sm shadow-lg">50:50</div>
                </button>
                <button 
                   onClick={useAskAudience} 
                   disabled={!lifelines.askAudience || answerState !== AnswerState.IDLE}
                   className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${!lifelines.askAudience || answerState !== AnswerState.IDLE ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:-translate-y-1'}`}
                >
                   <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-900 border-2 border-cyan-400 flex items-center justify-center text-white shadow-lg"><Users size={24} /></div>
                </button>
                <button 
                   onClick={useAskAI} 
                   disabled={!lifelines.askAI || answerState !== AnswerState.IDLE || aiLoading}
                   className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${!lifelines.askAI || answerState !== AnswerState.IDLE ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:-translate-y-1'}`}
                >
                   <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-900 border-2 border-emerald-400 flex items-center justify-center text-white shadow-lg relative">
                      {aiLoading ? <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div> : <BrainCircuit size={24} />}
                   </div>
                </button>
             </div>
         </div>

         {/* Modals/Overlays */}
         {/* Audience Graph */}
         {audienceData && (
            <div className="absolute inset-0 bg-black/60 z-30 flex items-end justify-center pb-20 pointer-events-none">
               <div className="bg-slate-900/95 border border-cyan-500 p-6 rounded-xl shadow-2xl flex gap-6 items-end pointer-events-auto animate-fade-in-up">
                  {['A', 'B', 'C', 'D'].map((label) => (
                    <div key={label} className="flex flex-col items-center gap-2">
                       <div className="text-cyan-300 font-bold text-sm">{(audienceData as any)[label]}%</div>
                       <div className="w-8 md:w-10 bg-gradient-to-t from-cyan-900 to-cyan-500 rounded-t-sm transition-all duration-1000" style={{ height: `${(audienceData as any)[label] * 1.5}px` }}></div>
                       <div className="text-white font-bold text-lg">{label}</div>
                    </div>
                  ))}
               </div>
            </div>
         )}
         
         {/* AI Hint */}
         {aiHint && (
            <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4">
               <div className="bg-[#000030] border-2 border-emerald-500 p-6 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.4)] max-w-md w-full relative animate-bounce-in">
                  <button onClick={() => setAiHint(null)} className="absolute top-3 right-3 text-slate-400 hover:text-white"><X size={20}/></button>
                  <div className="flex items-center gap-3 mb-4 text-emerald-400 border-b border-emerald-500/30 pb-3">
                     <BrainCircuit size={32} />
                     <h3 className="text-xl font-bold">Bilgə İnsan deyir:</h3>
                  </div>
                  <p className="text-white text-lg leading-relaxed italic">"{aiHint}"</p>
                  <Button onClick={() => setAiHint(null)} fullWidth className="mt-6 bg-emerald-700 hover:bg-emerald-600 border-emerald-500">Təşəkkürlər</Button>
               </div>
            </div>
         )}
      </div>
    );
  };

  const renderProfile = () => (
     <div className="flex flex-col items-center justify-center min-h-full p-6 w-full max-w-md mx-auto relative z-20">
      <div className="bg-[#000030]/90 p-8 rounded-2xl border border-blue-500/50 shadow-2xl w-full backdrop-blur-md">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Profil</h2>
            <button onClick={() => setGameStatus(GameStatus.TOPIC_SELECTION)} className="text-slate-400 hover:text-white"><X size={24}/></button>
         </div>
         {currentUser && (
           <form onSubmit={handleProfileUpdate} className="space-y-4">
               <div>
                  <label className="text-blue-300 text-xs uppercase font-bold ml-1 mb-1 block">İstifadəçi adı (dəyişdirilə bilməz)</label>
                  <input type="text" value={currentUser.username} disabled className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-slate-400 cursor-not-allowed" />
               </div>
               <div>
                  <label className="text-blue-300 text-xs uppercase font-bold ml-1 mb-1 block">Ad Soyad</label>
                  <input type="text" value={editProfileForm.name || currentUser.name} onChange={e => setEditProfileForm({...editProfileForm, name: e.target.value})} className="w-full bg-slate-800/80 border border-blue-500/30 rounded-lg p-3 text-white focus:border-blue-400 outline-none transition-colors" />
               </div>
               <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-blue-300 text-xs uppercase font-bold ml-1 mb-1 block">Yaş</label>
                    <input type="number" value={editProfileForm.age || currentUser.age} onChange={e => setEditProfileForm({...editProfileForm, age: e.target.value})} className="w-full bg-slate-800/80 border border-blue-500/30 rounded-lg p-3 text-white focus:border-blue-400 outline-none transition-colors" />
                  </div>
                  <div className="flex-1">
                    <label className="text-blue-300 text-xs uppercase font-bold ml-1 mb-1 block">Cins</label>
                    <select value={editProfileForm.gender || currentUser.gender} onChange={e => setEditProfileForm({...editProfileForm, gender: e.target.value as any})} className="w-full bg-slate-800/80 border border-blue-500/30 rounded-lg p-3 text-white focus:border-blue-400 outline-none transition-colors">
                      <option value="Kişi">Kişi</option>
                      <option value="Qadın">Qadın</option>
                    </select>
                  </div>
               </div>
               <div className="pt-2">
                 <div className="flex justify-between text-sm text-slate-400 mb-2"><span>Toplam Xal:</span> <span className="text-yellow-500 font-bold">{currentUser.totalPoints}</span></div>
                 <div className="flex justify-between text-sm text-slate-400"><span>Oynanılan Oyunlar:</span> <span className="text-white font-bold">{currentUser.gamesPlayed}</span></div>
               </div>
               <Button type="submit" fullWidth className="mt-4">{profileSaveStatus === 'saved' ? 'Yadda saxlanıldı!' : 'Yadda saxla'}</Button>
           </form>
         )}
      </div>
    </div>
  );

  const renderGameOver = (isWin: boolean) => (
     <div className="flex flex-col items-center justify-center h-full w-full p-6 relative z-30">
        <div className={`p-8 rounded-3xl border-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-lg w-full text-center backdrop-blur-md animate-scale-in ${isWin ? 'bg-gradient-to-b from-green-900/90 to-green-950/95 border-green-500' : 'bg-gradient-to-b from-red-900/90 to-red-950/95 border-red-500'}`}>
           <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center border-4 mb-6 shadow-xl ${isWin ? 'bg-green-800 border-green-400 text-green-200' : 'bg-red-800 border-red-400 text-red-200'}`}>
              {isWin ? <Trophy size={48} /> : <LogOut size={48} className="ml-1" />}
           </div>
           
           <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-lg uppercase tracking-wider">{isWin ? "Təbriklər!" : "Məğlub oldunuz"}</h1>
           <p className={`text-lg md:text-xl font-medium mb-8 ${isWin ? 'text-green-200' : 'text-red-200'}`}>
             {isWin 
               ? "Möhtəşəm! Bütün suallara düzgün cavab verdiniz." 
               : lossReason === 'timeout' 
                  ? "Vaxtınız bitdi." 
                  : "Təəssüf ki, cavab yanlışdır."}
           </p>
           
           <div className="bg-black/30 rounded-xl p-4 mb-8 border border-white/10">
              <div className="text-slate-300 text-sm uppercase tracking-widest mb-1">Qazanılan Məbləğ</div>
              <div className="text-4xl font-bold text-yellow-400 font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {currentQuestionIndex > 0 ? questions[currentQuestionIndex - 1].prize : "0 ₼"}
              </div>
           </div>
           
           <div className="flex flex-col gap-3">
              <Button onClick={() => setGameStatus(GameStatus.TOPIC_SELECTION)} fullWidth className={`${isWin ? 'bg-green-700 hover:bg-green-600' : 'bg-red-700 hover:bg-red-600'} border-white/30`}>Digər Mövzu Seç</Button>
              <Button onClick={() => setGameStatus(GameStatus.LEADERBOARD)} variant="secondary" fullWidth>Liderlər Cədvəli</Button>
           </div>
        </div>
     </div>
  );

  return (
    <div className={`fixed inset-0 h-[100dvh] w-full overflow-hidden flex flex-col transition-colors duration-500 ${bgClass}`}>
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[radial-gradient(circle,rgba(30,64,175,0.25)_0%,transparent_65%)] blur-xl"></div>
         <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-[conic-gradient(from_180deg_at_50%_100%,transparent_35%,rgba(59,130,246,0.15)_50%,transparent_65%)] blur-3xl"></div>
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>
         <div className="absolute inset-0 bg-[radial-gradient(transparent_40%,#020210_100%)]"></div>
      </div>
      <div className="flex-1 relative z-10 w-full h-full overflow-hidden font-sans">
         {gameStatus === GameStatus.AUTH_CHOICE && renderAuthChoice()}
         {gameStatus === GameStatus.LEADERBOARD && renderLeaderboard()}
         {gameStatus === GameStatus.LOGIN && renderLogin()}
         {gameStatus === GameStatus.REGISTER && renderRegister()}
         {gameStatus === GameStatus.TOPIC_SELECTION && renderTopicSelection()}
         {gameStatus === GameStatus.PLAYING && renderPlaying()}
         {gameStatus === GameStatus.PROFILE && renderProfile()}
         {gameStatus === GameStatus.ADMIN_DASHBOARD && renderAdminDashboard()}
         {(gameStatus === GameStatus.WON || gameStatus === GameStatus.LOST) && renderGameOver(gameStatus === GameStatus.WON)}
      </div>
    </div>
  );
};

export default App;
