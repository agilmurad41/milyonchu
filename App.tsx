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
  Save,
  Hash,
  Star,
  Trash2,
  Wrench,
  Edit,
  Search,
  Info
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
       <div className={`text-white font-extrabold ${titleSize} leading-none tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase font-serif z-10`}>Bilməcə Live</div>
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
  const [adminSearch, setAdminSearch] = useState('');
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [adminEditForm, setAdminEditForm] = useState({
    name: '',
    age: '',
    gender: '' as 'Kişi' | 'Qadın' | '',
    password: '',
    totalPoints: 0
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

  // --- AUTH LOGIC ---
  
  // Username validation effect
  useEffect(() => {
    if (!authForm.username) {
      setUsernameStatus('idle');
      return;
    }
    if (authForm.username.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    // Debounce checking against DB
    const checkUsername = async () => {
      setUsernameStatus('checking');
      const users = await dbService.getUsers();
      const taken = users.some(u => u.username === authForm.username);
      setUsernameStatus(taken ? 'taken' : 'valid');
    };

    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);

  }, [authForm.username]);

  // Password validation effect
  useEffect(() => {
    if (!authForm.password) {
      setPasswordStatus('idle');
      return;
    }
    if (authForm.password.length >= 5 && authForm.password.length <= 10) {
      setPasswordStatus('valid');
    } else {
      setPasswordStatus('invalid');
    }
  }, [authForm.password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    // Validation Checks
    if (!authForm.username.trim() || authForm.username.length < 3) {
        setAuthError("İstifadəçi adı ən az 3 simvol olmalıdır.");
        setIsAuthLoading(false);
        return;
    }
    if (usernameStatus === 'taken') {
      setAuthError("Bu istifadəçi adı artıq mövcuddur.");
      setIsAuthLoading(false);
      return;
    }
    if (authForm.password.length < 5 || authForm.password.length > 10) {
      setAuthError("Şifrə 5 ilə 10 simvol arasında olmalıdır.");
      setIsAuthLoading(false);
      return;
    }
    if (!authForm.name.trim()) {
        setAuthError("Ad daxil edilməlidir.");
        setIsAuthLoading(false);
        return;
    }
    if (!authForm.age.trim()) {
        setAuthError("Yaş daxil edilməlidir.");
        setIsAuthLoading(false);
        return;
    }
    if (!authForm.gender) {
        setAuthError("Cins seçilməlidir.");
        setIsAuthLoading(false);
        return;
    }

    const newUser: User = {
      username: authForm.username,
      password: authForm.password,
      name: authForm.name,
      age: authForm.age,
      gender: authForm.gender,
      totalPoints: 0,
      completedTopics: [],
      gamesPlayed: 0,
      seenQuestions: []
    };

    const success = await dbService.addUser(newUser);
    
    if (success) {
      setCurrentUser(newUser); 
      setRegistrationSuccess(true);
      refreshLeaderboard(); // Update stats
    } else {
      setAuthError("Qeydiyyat xətası baş verdi. İnterneti yoxlayın.");
    }
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
    } else {
      setAuthError("İstifadəçi adı və ya şifrə yanlışdır.");
    }
    setIsAuthLoading(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setGameStatus(GameStatus.AUTH_CHOICE);
  };

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

    if (success) {
      setCurrentUser(updatedUser);
      refreshLeaderboard();
    }
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

    const updates = {
         name: editProfileForm.name,
         age: editProfileForm.age,
         gender: editProfileForm.gender
    };

    const success = await dbService.updateUser(currentUser.username, updates);

    if (success) {
       setCurrentUser({ ...currentUser, ...updates });
       setProfileSaveStatus('saved');
       setTimeout(() => setProfileSaveStatus('idle'), 2000);
       refreshLeaderboard();
    }
  };

  // ADMIN FUNCTIONS
  const handleDeleteUser = async (usernameToDelete: string) => {
    if (window.confirm(`${usernameToDelete} istifadəçisini silmək istədiyinizə əminsiniz?`)) {
      const success = await dbService.deleteUser(usernameToDelete);
      if (success) {
        refreshLeaderboard();
      }
    }
  };

  const startEditingUser = (user: User) => {
    setUserToEdit(user);
    setAdminEditForm({
      name: user.name,
      age: user.age,
      gender: user.gender,
      password: user.password,
      totalPoints: user.totalPoints
    });
  };

  const handleAdminSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    
    const success = await dbService.updateUser(userToEdit.username, {
      name: adminEditForm.name,
      age: adminEditForm.age,
      gender: adminEditForm.gender,
      password: adminEditForm.password,
      totalPoints: Number(adminEditForm.totalPoints)
    });

    if (success) {
      await refreshLeaderboard();
      setUserToEdit(null); // Close modal
    } else {
      alert("Yadda saxlanılmadı, xəta oldu.");
    }
  };

  const openProfile = () => {
    if (!currentUser) return;
    setEditProfileForm({ 
      name: currentUser.name, 
      age: currentUser.age,
      gender: currentUser.gender 
    });
    setPreviousStatus(gameStatus);
    if (gameStatus === GameStatus.PLAYING) {
      setIsTimerPaused(true);
    }
    setGameStatus(GameStatus.PROFILE);
  };

  const closeProfile = () => {
    if (previousStatus) {
      setGameStatus(previousStatus);
      if (previousStatus === GameStatus.PLAYING) {
        setIsTimerPaused(false);
      }
    } else {
      setGameStatus(GameStatus.AUTH_CHOICE);
    }
  };

  // --- GAME LOGIC ---
  
  useEffect(() => {
    if (gameStatus === GameStatus.PLAYING && answerState === AnswerState.IDLE && !isTimerPaused) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameStatus, answerState, currentQuestionIndex, isTimerPaused]);

  const handleTimeUp = () => {
     if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
     setLossReason('timeout');
     setGameStatus(GameStatus.LOST);
     updateUserStats(currentQuestionIndex * 50);
  };

  const startGameWithTopic = (topic: Topic) => {
    if (currentUser?.completedTopics.includes(topic)) return;
    setSelectedTopic(topic);
    setQuestions(getQuestionsByTopic(topic, currentUser?.seenQuestions || []));
    setGameStatus(GameStatus.PLAYING);
    setCurrentQuestionIndex(0);
    setLifelines({ fiftyFifty: true, askAudience: true, askAI: true });
    resetQuestionState(0);
  };

  const resetQuestionState = (levelIndex: number) => {
    setSelectedAnswerIndex(null);
    setAnswerState(AnswerState.IDLE);
    setHiddenOptions([]);
    setAudienceData(null);
    setAiHint(null);
    setTimeLeft(30);
    setIsTimerPaused(false);
    setLossReason(null);
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

          const levelScore = (currentQuestionIndex + 1) * 100;
          
          if (currentQuestionIndex + 1 >= questions.length) {
            setGameStatus(GameStatus.WON);
            updateUserStats(levelScore + 5000, selectedTopic || undefined);
          } else {
            setCurrentQuestionIndex(prev => {
              const next = prev + 1;
              resetQuestionState(next);
              return next;
            });
          }
        } else {
          setLossReason('wrong');
          setGameStatus(GameStatus.LOST);
          updateUserStats((currentQuestionIndex) * 50);
        }
      }, 2500);
    }, 1500);
  }, [answerState, currentQuestionIndex, questions, selectedTopic, currentUser]);

  const useFiftyFifty = () => {
    if (!lifelines.fiftyFifty) return;
    const correct = questions[currentQuestionIndex].correctAnswerIndex;
    const wrongs = [0, 1, 2, 3].filter(i => i !== correct).sort(() => 0.5 - Math.random());
    setHiddenOptions([wrongs[0], wrongs[1]]);
    setLifelines(prev => ({ ...prev, fiftyFifty: false }));
  };

  const useAskAudience = () => {
    if (!lifelines.askAudience) return;
    setIsTimerPaused(true);
    setTimeout(() => {
        const correct = questions[currentQuestionIndex].correctAnswerIndex;
        let correctPerc = Math.floor(Math.random() * 30) + 50; 
        const remaining = 100 - correctPerc;
        const w1 = Math.floor(Math.random() * remaining);
        const w2 = Math.floor(Math.random() * (remaining - w1));
        const w3 = remaining - w1 - w2;
        const data = [0, 0, 0, 0];
        data[correct] = correctPerc;
        let wrongIndices = [0, 1, 2, 3].filter(i => i !== correct);
        data[wrongIndices[0]] = w1; data[wrongIndices[1]] = w2; data[wrongIndices[2]] = w3;
        setAudienceData({ A: data[0], B: data[1], C: data[2], D: data[3] });
        setLifelines(prev => ({ ...prev, askAudience: false }));
        setIsTimerPaused(false);
    }, 2000);
  };

  const useAskAI = async () => {
    if (!lifelines.askAI || aiLoading) return;
    setAiLoading(true);
    setIsTimerPaused(true);
    const hint = await getAIHint(questions[currentQuestionIndex].text, questions[currentQuestionIndex].options);
    setAiHint(hint);
    setAiLoading(false);
    setIsTimerPaused(false);
    setLifelines(prev => ({ ...prev, askAI: false }));
  };

  // --- STYLES ---
  const bgClass = "bg-[#020220]"; 
  const cardClass = "bg-slate-900/80 border-blue-500/50 text-white";
  const inputClass = "bg-slate-800 border-slate-600 text-white";

  // --- RENDER HELP MODAL ---
  const renderHelpModal = () => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
      <div className={`${cardClass} p-6 rounded-2xl w-full max-w-md shadow-2xl bg-[#000030] relative`}>
        <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
        <div className="flex items-center gap-2 mb-4 text-teal-400">
           <HelpCircle size={28} />
           <h2 className="text-xl font-bold">Oyun Qaydaları</h2>
        </div>
        <div className="space-y-3 text-slate-300 text-sm md:text-base">
           <p className="flex items-start gap-2"><span className="text-yellow-500 font-bold">•</span><span>Oyuna başlamaq üçün qeydiyyatdan keçin.</span></p>
           <p className="flex items-start gap-2"><span className="text-yellow-500 font-bold">•</span><span>Hər mövzuda <strong>10 sual</strong> var. Sona çatmaq üçün hamısını tapmalısınız.</span></p>
           <p className="flex items-start gap-2"><span className="text-yellow-500 font-bold">•</span><span>Hər sual üçün <strong>30 saniyə</strong> vaxtınız var.</span></p>
           <p className="flex items-start gap-2"><span className="text-yellow-500 font-bold">•</span><span>3 Köməkçi vasitə: <strong>50/50</strong>, <strong>Auditoriya</strong> və <strong>Bilgə İnsan (AI)</strong>.</span></p>
           <p className="flex items-start gap-2"><span className="text-yellow-500 font-bold">•</span><span>Məqsəd ən yüksək xalı toplayıb reytinq cədvəlinə düşməkdir!</span></p>
        </div>
        <Button onClick={() => setShowHelp(false)} fullWidth className="mt-6 bg-teal-700 hover:bg-teal-600 border-teal-500">Aydındır</Button>
      </div>
    </div>
  );

  // --- RENDER SCREENS ---

  const renderAuthChoice = () => {
    const isLoggedIn = !!currentUser;
    const isAdmin = currentUser?.username === 'admin';
    const btnBase = "py-3 md:py-4 text-sm md:text-base font-bold border-2 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg rounded-xl";

    // Stats calculation
    const highestScore = allUsers.length > 0 ? Math.max(...allUsers.map(u => u.totalPoints)) : 0;
    const playerCount = allUsers.length;

    return (
      <div className="flex flex-col h-full w-full relative z-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <div className="flex flex-col min-h-full w-full justify-between">
            
            {/* Top Section Group */}
            <div className="flex flex-col items-center w-full">
                {/* Logo and Slogan */}
                <div className="flex flex-col items-center justify-center pt-16 md:pt-24 shrink-0 relative z-20 px-4">
                   <div className="scale-105 md:scale-110">
                     <GameLogo size="xl" />
                   </div>
                   <div className="mt-8 md:mt-12 text-center z-30 px-4">
                     <p className="text-blue-100 text-sm md:text-base font-semibold tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                       Bilgi gücdür,
                     </p>
                     <p className="text-yellow-400 text-lg md:text-xl font-bold italic tracking-widest drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]">
                       Bilməcə Live isə meydan!
                     </p>
                   </div>
                </div>

                {/* Top Section - Real-time Stats */}
                <div className="flex justify-between items-center px-6 w-full max-w-sm mx-auto gap-4 mt-2">
                   <div className="flex-1 flex flex-col justify-center px-3 py-2 bg-[#000030]/80 border border-blue-600 rounded-xl shadow-[0_0_10px_rgba(37,99,235,0.3)] min-h-[50px] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors"></div>
                      <div className="flex items-center gap-2 relative z-10">
                        <Trophy size={16} className="text-yellow-400 shrink-0" />
                        <div className="flex flex-col">
                           <span className="text-[8px] text-blue-200 uppercase tracking-wider mb-0.5">Rekord Xal</span>
                           <span className="text-sm font-bold text-white leading-none font-mono">{highestScore.toLocaleString()}</span>
                        </div>
                      </div>
                   </div>
                   <div className="flex-1 flex flex-col justify-center px-3 py-2 bg-[#000030]/80 border border-blue-600 rounded-xl shadow-[0_0_10px_rgba(37,99,235,0.3)] min-h-[50px] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors"></div>
                      <div className="flex items-center gap-2 relative z-10">
                        <Users size={16} className="text-blue-400 shrink-0" />
                         <div className="flex flex-col">
                           <span className="text-[8px] text-blue-200 uppercase tracking-wider mb-0.5">Oyunçu Sayı</span>
                           <span className="text-sm font-bold text-white leading-none font-mono">{playerCount.toLocaleString()}</span>
                        </div>
                      </div>
                   </div>
                </div>
            </div>

            {/* Middle Section - Welcome */}
            <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-2 min-h-[60px]">
               {isLoggedIn && (
                  <div className="text-center animate-fade-in bg-[#000040]/50 p-4 rounded-2xl border border-blue-500/20 backdrop-blur-sm shadow-xl w-full max-w-xs mx-auto">
                     <p className={`text-[10px] text-blue-300 mb-2 uppercase tracking-[0.2em] font-bold`}>Xoş gəldin</p>
                     <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] mb-3 truncate">{currentUser.name}</h2>
                     <div className="flex items-center justify-center gap-2 text-yellow-400 bg-[#000030] px-5 py-2 rounded-full border border-yellow-600/50 mx-auto w-fit shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                        <Trophy size={18} className="text-yellow-500" />
                        <span className="font-bold text-base md:text-lg">{currentUser.totalPoints} xal</span>
                     </div>
                  </div>
               )}
            </div>

            {/* Bottom Section */}
            <div className="w-full px-6 pb-4 md:pb-6 flex flex-col items-center shrink-0 max-w-xs mx-auto z-20">
               <div className="w-full flex flex-col gap-3">
               {!isLoggedIn ? (
                 <>
                   <Button 
                      fullWidth 
                      onClick={() => setGameStatus(GameStatus.LOGIN)} 
                      className={`${btnBase} bg-blue-900/80 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] hover:bg-blue-800`}
                   >
                     <LogIn size={20} /> Daxil ol
                   </Button>
                   <Button 
                      fullWidth 
                      onClick={() => setGameStatus(GameStatus.REGISTER)} 
                      className={`${btnBase} bg-fuchsia-900/80 border-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)] hover:shadow-[0_0_25px_rgba(217,70,239,0.6)] hover:bg-fuchsia-800`}
                   >
                     <UserPlus size={20} /> Qeydiyyat
                   </Button>
                   <Button 
                      fullWidth 
                      onClick={() => setShowHelp(true)} 
                      className={`${btnBase} bg-teal-900/80 border-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)] hover:shadow-[0_0_25px_rgba(20,184,166,0.6)] hover:bg-teal-800`}
                   >
                     <HelpCircle size={20} /> Kömək
                   </Button>
                   <Button 
                      fullWidth 
                      onClick={() => setGameStatus(GameStatus.LEADERBOARD)} 
                      className={`${btnBase} bg-amber-900/80 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:bg-amber-800`}
                   >
                     <Trophy size={20} /> Reytinq
                   </Button>
                 </>
               ) : (
                 <>
                   <Button 
                      fullWidth 
                      onClick={() => setGameStatus(GameStatus.TOPIC_SELECTION)} 
                      className={`${btnBase} bg-green-900/80 border-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] hover:bg-green-800`}
                   >
                      <Play size={22} fill="currentColor" /> Oyuna Başla
                   </Button>
                   {isAdmin && (
                    <Button 
                      fullWidth 
                      onClick={() => setGameStatus(GameStatus.ADMIN_DASHBOARD)} 
                      className={`${btnBase} bg-gray-800/80 border-gray-500 text-white shadow-[0_0_15px_rgba(107,114,128,0.4)] hover:bg-gray-700`}
                    >
                      <Wrench size={20} /> Admin Panel
                    </Button>
                   )}
                    <Button 
                      fullWidth 
                      onClick={() => setGameStatus(GameStatus.LEADERBOARD)} 
                      className={`${btnBase} bg-amber-900/80 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:bg-amber-800`}
                   >
                      <Trophy size={20} /> Reytinq
                   </Button>
                   <Button 
                      fullWidth 
                      onClick={handleLogout} 
                      className={`${btnBase} bg-red-900/60 border-red-500/80 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-900/80 hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]`}
                   >
                     <LogOut size={20} /> Çıxış
                   </Button>
                 </>
               )}
               </div>
               <div className="text-[10px] text-white mt-4 font-mono">
                  © 2025 by Aqil Muradov | Gemini 3
               </div>
            </div>
        </div>
        {showHelp && renderHelpModal()}
      </div>
    );
  };

  const renderLeaderboard = () => {
    const sortedUsers = [...allUsers].sort((a, b) => b.totalPoints - a.totalPoints);

    return (
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 z-10">
        <div className="flex justify-between items-center mb-6 shrink-0 bg-slate-900/80 p-4 rounded-xl border border-slate-700">
           <div className="flex items-center gap-3">
             <Trophy size={32} className="text-yellow-500" />
             <h2 className="text-xl font-bold text-white">Liderlər Cədvəli</h2>
           </div>
           <Button variant="secondary" onClick={() => setGameStatus(previousStatus || GameStatus.AUTH_CHOICE)} className="py-1 px-3 text-sm h-10 border-slate-600 bg-slate-800">
             <ArrowLeft size={18} />
           </Button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-2">
          {sortedUsers.map((user, index) => (
            <div key={user.username} className={`flex items-center justify-between p-4 rounded-lg border ${user.username === currentUser?.username ? 'bg-blue-900/40 border-blue-500' : 'bg-slate-800/80 border-slate-600'}`}>
               <div className="flex items-center gap-4">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${index < 3 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-300'}`}>
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-bold text-white text-lg">{user.name}</div>
                    <div className="text-xs text-slate-400">Oyunlar: {user.gamesPlayed}</div>
                  </div>
               </div>
               <div className="text-green-400 font-mono font-bold text-xl">{user.totalPoints.toLocaleString()}</div>
            </div>
          ))}
          {sortedUsers.length === 0 && <div className="text-center text-slate-400 mt-10">Hələ ki heç kim oynamayıb.</div>}
        </div>
      </div>
    );
  };

  const renderLogin = () => (
    <div className="flex flex-col h-full items-center justify-center p-4 z-10 w-full max-w-md mx-auto">
      <div className={`${cardClass} p-8 rounded-2xl w-full shadow-2xl bg-[#000030]`}>
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-400 uppercase tracking-widest">Daxil Ol</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">İstifadəçi adı</label>
            <input 
              type="text" 
              required 
              className={`w-full p-3 rounded-lg border ${inputClass} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
              value={authForm.username}
              onChange={e => setAuthForm({...authForm, username: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Şifrə</label>
            <input 
              type="password" 
              required 
              className={`w-full p-3 rounded-lg border ${inputClass} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
              value={authForm.password}
              onChange={e => setAuthForm({...authForm, password: e.target.value})}
            />
          </div>
          
          {authError && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {authError}
            </div>
          )}

          <Button type="submit" fullWidth disabled={isAuthLoading} className="mt-4">
            {isAuthLoading ? 'Yoxlanılır...' : 'Daxil Ol'}
          </Button>
          
          <div className="mt-4 text-center">
             <button type="button" onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="text-slate-400 hover:text-white text-sm underline">Geri qayıt</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderRegister = () => {
    if (registrationSuccess) {
       return (
        <div className="flex flex-col h-full items-center justify-center p-4 z-10">
          <div className={`${cardClass} p-8 rounded-2xl w-full max-w-md shadow-2xl text-center bg-[#000030]`}>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Qeydiyyat Uğurlu!</h2>
            <p className="text-slate-300 mb-6">İndi oyun oynaya bilərsiniz.</p>
            <Button onClick={finishRegistration} fullWidth>Davam et</Button>
          </div>
        </div>
       );
    }

    return (
      <div className="flex flex-col h-full items-center justify-center p-4 z-10 w-full max-w-md mx-auto">
        <div className={`${cardClass} p-6 md:p-8 rounded-2xl w-full shadow-2xl bg-[#000030] overflow-y-auto max-h-[90vh]`}>
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-center text-fuchsia-400 uppercase tracking-widest">Qeydiyyat</h2>
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs md:text-sm text-slate-400 mb-1">İstifadəçi adı (min 3 simvol)</label>
              <div className="relative">
                <input 
                  type="text" 
                  required 
                  minLength={3}
                  className={`w-full p-2.5 rounded-lg border ${inputClass} ${usernameStatus === 'valid' ? 'border-green-500' : usernameStatus === 'taken' ? 'border-red-500' : ''} outline-none`}
                  value={authForm.username}
                  onChange={e => setAuthForm({...authForm, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
                />
                <div className="absolute right-3 top-3">
                  {usernameStatus === 'checking' && <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>}
                  {usernameStatus === 'valid' && <Check size={16} className="text-green-500" />}
                  {usernameStatus === 'taken' && <X size={16} className="text-red-500" />}
                </div>
              </div>
              {usernameStatus === 'taken' && <p className="text-xs text-red-400 mt-1">Bu ad artıq tutulub.</p>}
            </div>

            <div>
              <label className="block text-xs md:text-sm text-slate-400 mb-1">Şifrə (5-10 simvol)</label>
              <input 
                type="text" 
                required 
                minLength={5}
                maxLength={10}
                className={`w-full p-2.5 rounded-lg border ${inputClass} ${passwordStatus === 'valid' ? 'border-green-500' : passwordStatus === 'invalid' && authForm.password.length > 0 ? 'border-red-500' : ''} outline-none`}
                value={authForm.password}
                onChange={e => setAuthForm({...authForm, password: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm text-slate-400 mb-1">Adınız</label>
              <input 
                type="text" 
                required 
                className={`w-full p-2.5 rounded-lg border ${inputClass} outline-none`}
                value={authForm.name}
                onChange={e => setAuthForm({...authForm, name: e.target.value})}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs md:text-sm text-slate-400 mb-1">Yaş</label>
                <input 
                  type="number" 
                  required 
                  className={`w-full p-2.5 rounded-lg border ${inputClass} outline-none`}
                  value={authForm.age}
                  onChange={e => setAuthForm({...authForm, age: e.target.value})}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm text-slate-400 mb-1">Cins</label>
                <select 
                  required
                  className={`w-full p-2.5 rounded-lg border ${inputClass} outline-none`}
                  value={authForm.gender}
                  onChange={e => setAuthForm({...authForm, gender: e.target.value as any})}
                >
                  <option value="" disabled>Seçin</option>
                  <option value="Kişi">Kişi</option>
                  <option value="Qadın">Qadın</option>
                </select>
              </div>
            </div>
            
            {authError && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-2.5 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {authError}
              </div>
            )}

            <Button type="submit" fullWidth disabled={isAuthLoading} className="mt-2">
              {isAuthLoading ? 'Qeydiyyat...' : 'Qeydiyyatdan keç'}
            </Button>
            
            <div className="mt-2 text-center">
               <button type="button" onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="text-slate-400 hover:text-white text-sm underline">Ləğv et</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderTopicSelection = () => (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 z-10">
      <div className="flex justify-between items-center mb-6 shrink-0 bg-slate-900/80 p-4 rounded-xl border border-slate-700">
         <h2 className="text-xl md:text-2xl font-bold text-white">Mövzu Seçimi</h2>
         <Button variant="secondary" onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="py-1 px-3 text-sm h-10 border-slate-600 bg-slate-800">
           <ArrowLeft size={18} /> <span className="hidden md:inline ml-2">Geri</span>
         </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-4">
         {TOPICS.map((topic) => {
           const Icon = ICON_MAP[topic.icon] || HelpCircle;
           const isCompleted = currentUser?.completedTopics.includes(topic.id);
           
           return (
             <button
               key={topic.id}
               onClick={() => startGameWithTopic(topic.id)}
               disabled={isCompleted}
               className={`
                 relative overflow-hidden group p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center h-48
                 ${isCompleted 
                   ? 'bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed grayscale' 
                   : `bg-slate-800/80 border-slate-600 hover:border-${topic.color}-500 hover:bg-slate-800 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]`
                 }
               `}
             >
               <div className={`
                 w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-colors duration-300
                 ${isCompleted ? 'bg-slate-800 text-slate-500' : `bg-slate-700 text-${topic.color}-400 group-hover:bg-${topic.color}-500 group-hover:text-white`}
               `}>
                 {isCompleted ? <CheckCircle size={32} /> : <Icon size={32} />}
               </div>
               
               <div>
                 <h3 className={`text-xl font-bold mb-1 ${isCompleted ? 'text-slate-500' : 'text-white'}`}>{topic.label}</h3>
                 <p className="text-xs text-slate-400 line-clamp-2">{topic.description}</p>
               </div>

               {isCompleted && (
                 <div className="absolute top-3 right-3 text-green-500 bg-green-900/20 p-1 rounded-full">
                   <Check size={16} />
                 </div>
               )}
             </button>
           );
         })}
      </div>
    </div>
  );

  const renderPlaying = () => {
    if (!questions.length || !questions[currentQuestionIndex]) return <div>Yüklənir...</div>;

    const currentQ = questions[currentQuestionIndex];
    const moneyTreeLevel = currentQuestionIndex;

    return (
      <div className="flex flex-col h-full w-full max-w-6xl mx-auto p-2 md:p-4 z-10">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4 bg-slate-900/80 p-3 rounded-lg border border-slate-700">
           <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Mövzu:</span>
              <span className="font-bold text-blue-300">{TOPICS.find(t => t.id === selectedTopic)?.label}</span>
           </div>
           
           <div className={`flex items-center gap-2 px-4 py-1 rounded-full border ${timeLeft <= 10 ? 'bg-red-900/50 border-red-500 text-red-200 animate-pulse' : 'bg-slate-800 border-slate-600 text-white'}`}>
             <span className="font-mono font-bold text-xl">{timeLeft}</span>
             <span className="text-xs">san</span>
           </div>

           <Button variant="secondary" onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="py-1 px-3 text-xs h-8 border-slate-600 bg-slate-800">
             Çıxış
           </Button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
           {/* Left/Main Side: Question & Options */}
           <div className="flex-1 flex flex-col justify-center">
              
              {/* Image would go here if we implemented it */}
              
              {/* Question Card */}
              <div className="bg-[#000040]/90 border-2 border-blue-500/50 p-6 md:p-8 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-6 text-center relative">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 px-4 py-1 rounded-full text-xs font-bold text-white border border-blue-400 shadow-lg">
                   Sual {currentQuestionIndex + 1} / 10
                 </div>
                 <h2 className="text-lg md:text-2xl font-semibold text-white leading-relaxed">{currentQ.text}</h2>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
                {currentQ.options.map((option, idx) => {
                  if (hiddenOptions.includes(idx)) {
                     return <div key={idx} className="invisible h-14 md:h-16"></div>;
                  }

                  let stateClass = "";
                  if (answerState === AnswerState.SELECTED && selectedAnswerIndex === idx) stateClass = "bg-yellow-600 border-yellow-400 text-white";
                  else if (answerState === AnswerState.CORRECT && selectedAnswerIndex === idx) stateClass = "bg-green-600 border-green-400 text-white animate-pulse";
                  else if (answerState === AnswerState.WRONG && selectedAnswerIndex === idx) stateClass = "bg-red-600 border-red-400 text-white";
                  else if (answerState === AnswerState.CORRECT && currentQ.correctAnswerIndex === idx) stateClass = "bg-green-600 border-green-400 text-white"; // Show correct one if wrong selected
                  else stateClass = ""; // Default handled by Button variant='option'

                  // Show audience percentage if active
                  const percentage = audienceData ? (idx === 0 ? audienceData.A : idx === 1 ? audienceData.B : idx === 2 ? audienceData.C : audienceData.D) : null;

                  return (
                    <Button 
                      key={idx} 
                      variant="option" 
                      onClick={() => handleAnswerSelect(idx)}
                      disabled={answerState !== AnswerState.IDLE}
                      className={`h-auto min-h-[60px] md:min-h-[70px] flex items-center px-4 relative group ${stateClass}`}
                    >
                      <span className="text-yellow-500 font-bold mr-3 text-lg">{['A', 'B', 'C', 'D'][idx]}:</span>
                      <span className="flex-1">{option}</span>
                      {percentage !== null && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold bg-white/20 px-2 py-1 rounded">
                          {percentage}%
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* Lifelines */}
              <div className="flex justify-center gap-4 mt-6 md:mt-8">
                 <button 
                   onClick={useFiftyFifty} 
                   disabled={!lifelines.fiftyFifty || answerState !== AnswerState.IDLE}
                   className={`flex flex-col items-center gap-1 transition-all ${!lifelines.fiftyFifty ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
                 >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-900 border-2 border-blue-400 flex items-center justify-center shadow-lg font-bold text-white text-sm md:text-base">50:50</div>
                    <span className="text-[10px] text-blue-300 font-bold uppercase">50/50</span>
                 </button>
                 <button 
                   onClick={useAskAudience} 
                   disabled={!lifelines.askAudience || answerState !== AnswerState.IDLE}
                   className={`flex flex-col items-center gap-1 transition-all ${!lifelines.askAudience ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
                 >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-900 border-2 border-blue-400 flex items-center justify-center shadow-lg text-white">
                      <Users size={24} />
                    </div>
                    <span className="text-[10px] text-blue-300 font-bold uppercase">Zal</span>
                 </button>
                 <button 
                   onClick={useAskAI} 
                   disabled={!lifelines.askAI || answerState !== AnswerState.IDLE}
                   className={`flex flex-col items-center gap-1 transition-all ${!lifelines.askAI ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
                 >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-fuchsia-900 border-2 border-fuchsia-400 flex items-center justify-center shadow-lg text-white relative">
                      {aiLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <BrainCircuit size={24} />}
                    </div>
                    <span className="text-[10px] text-fuchsia-300 font-bold uppercase">AI</span>
                 </button>
              </div>

              {/* AI Hint Box */}
              {aiHint && (
                <div className="mt-4 bg-fuchsia-900/20 border border-fuchsia-500/30 p-4 rounded-lg animate-fade-in flex gap-3 items-start">
                   <div className="bg-fuchsia-500/20 p-2 rounded-full shrink-0">
                     <BrainCircuit size={20} className="text-fuchsia-300" />
                   </div>
                   <div>
                     <div className="text-xs text-fuchsia-300 font-bold mb-1 uppercase">Bilgə İnsan deyir:</div>
                     <p className="text-sm text-fuchsia-100 italic">"{aiHint}"</p>
                   </div>
                </div>
              )}
           </div>

           {/* Right Side: Money Tree */}
           <div className="hidden md:flex flex-col justify-center">
             <MoneyTree currentLevel={moneyTreeLevel} />
           </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => {
     if (!currentUser) return null;

     return (
      <div className="flex flex-col h-full items-center justify-center p-4 z-10 w-full max-w-md mx-auto">
        <div className={`${cardClass} p-6 rounded-2xl w-full shadow-2xl bg-[#000030]`}>
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-white uppercase tracking-widest">Profil</h2>
             <button onClick={closeProfile} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full"><X size={20}/></button>
           </div>
           
           <div className="flex items-center gap-4 mb-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white shadow-lg">
                 {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                 <div className="text-xs text-slate-400 uppercase">İstifadəçi adı</div>
                 <div className="text-lg font-bold text-blue-300">@{currentUser.username}</div>
                 <div className="text-xs text-slate-400 mt-1">Ümumi Xal: <span className="text-green-400 font-bold">{currentUser.totalPoints}</span></div>
              </div>
           </div>

           <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Adınız</label>
                <input 
                  type="text" 
                  className={`w-full p-2.5 rounded-lg border ${inputClass} outline-none`}
                  value={editProfileForm.name}
                  onChange={e => setEditProfileForm({...editProfileForm, name: e.target.value})}
                />
              </div>
              <div className="flex gap-3">
                 <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-1">Yaş</label>
                    <input 
                      type="number" 
                      className={`w-full p-2.5 rounded-lg border ${inputClass} outline-none`}
                      value={editProfileForm.age}
                      onChange={e => setEditProfileForm({...editProfileForm, age: e.target.value})}
                    />
                 </div>
                 <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-1">Cins</label>
                    <select 
                      className={`w-full p-2.5 rounded-lg border ${inputClass} outline-none`}
                      value={editProfileForm.gender}
                      onChange={e => setEditProfileForm({...editProfileForm, gender: e.target.value as any})}
                    >
                      <option value="Kişi">Kişi</option>
                      <option value="Qadın">Qadın</option>
                    </select>
                 </div>
              </div>
              
              <Button type="submit" fullWidth disabled={profileSaveStatus === 'saved'} className={profileSaveStatus === 'saved' ? 'bg-green-600 border-green-500' : ''}>
                {profileSaveStatus === 'saved' ? <><Check size={18} className="mr-2 inline" /> Yadda saxlanıldı</> : 'Yadda saxla'}
              </Button>
           </form>
           
           <div className="mt-6 pt-4 border-t border-slate-700/50">
              <h3 className="text-sm font-bold text-slate-300 mb-2">Statistika</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                 <div className="bg-slate-800 p-2 rounded text-slate-400">Oyunlar: <span className="text-white font-bold block text-sm">{currentUser.gamesPlayed}</span></div>
                 <div className="bg-slate-800 p-2 rounded text-slate-400">Tamamlanan: <span className="text-white font-bold block text-sm">{currentUser.completedTopics.length} mövzu</span></div>
              </div>
           </div>
        </div>
      </div>
     );
  };

  const renderGameOver = (isWin: boolean) => {
    // Prize calculation logic:
    // If Win: 1,000,000
    // If Loss:
    //   If index < 5 (safe haven 1 at 5th q - 1000): 0
    //   If index < 8 (safe haven 2 at 8th q - 16000): 1000
    //   Else: 16000
    // Actually PRIZE_LADDER indices are 0 to 9 (10 qs)
    // Safe havens are usually Q5 and Q8 in this simplified version logic?
    // Let's use the prize from previous question as "won" amount roughly or use standard rules.
    // The requirement says "adjusted to 10 levels".
    // 100, 200, 300, 500 (Safe 1 - 500?), 1000, 2000, 4000 (Safe 2 - 4000?), 8000, 16000, 1000000
    
    // Simplification for the display:
    let prize = "0 ₼";
    if (isWin) {
      prize = "1,000,000 ₼";
    } else {
      // Logic for guaranteed sums
      if (currentQuestionIndex >= 7) prize = "4,000 ₼"; // Passed Q7
      else if (currentQuestionIndex >= 3) prize = "500 ₼"; // Passed Q3
      else prize = "0 ₼";
    }

    return (
      <div className="flex flex-col h-full items-center justify-center p-4 z-10 w-full max-w-md mx-auto text-center">
         <div className={`${cardClass} p-8 rounded-2xl w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 ${isWin ? 'border-yellow-500' : 'border-red-900'} bg-[#000030] relative overflow-hidden`}>
            {isWin && <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>}
            
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isWin ? 'bg-yellow-500 text-black animate-bounce' : 'bg-red-900/50 text-red-500'}`}>
               {isWin ? <Trophy size={48} /> : <X size={48} />}
            </div>

            <h2 className={`text-3xl font-extrabold mb-2 ${isWin ? 'text-yellow-400' : 'text-red-400'} uppercase tracking-widest`}>
              {isWin ? "MİLYONÇU!" : "Məğlub Oldunuz"}
            </h2>
            
            {!isWin && lossReason === 'timeout' && <p className="text-red-300 text-sm mb-4">Vaxtınız bitdi!</p>}
            {!isWin && lossReason === 'wrong' && <p className="text-red-300 text-sm mb-4">Yanlış cavab!</p>}

            <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700 mb-8 relative z-10">
               <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Qazandığınız Məbləğ</p>
               <p className="text-4xl font-mono font-bold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">{prize}</p>
            </div>

            <div className="space-y-3 relative z-10">
               <Button onClick={() => setGameStatus(GameStatus.TOPIC_SELECTION)} fullWidth className="bg-blue-600 hover:bg-blue-500 border-blue-400">
                 Yenidən Oyna
               </Button>
               <Button onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} fullWidth variant="secondary">
                 Ana Menyu
               </Button>
            </div>
         </div>
      </div>
    );
  };

  const renderAdminDashboard = () => {
    const filteredUsers = allUsers.filter(u => 
      u.username.toLowerCase().includes(adminSearch.toLowerCase()) || 
      u.name.toLowerCase().includes(adminSearch.toLowerCase())
    );

    return (
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 z-10 overflow-hidden">
        <header className="flex justify-between items-center mb-4 shrink-0 bg-slate-900/80 p-4 rounded-xl border border-slate-700">
           <div className="flex items-center gap-3">
             <Wrench size={32} className="text-gray-300" />
             <h2 className="text-xl font-bold text-white">Admin Panel</h2>
           </div>
           <Button variant="secondary" onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="py-1 px-3 text-sm h-10 border-slate-600 bg-slate-800">Ana Menyu</Button>
        </header>

        {/* Search */}
        <div className="mb-4 relative">
          <input 
            type="text" 
            placeholder="İstifadəçi axtar (ad və ya username)..." 
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
            className={`w-full p-3 pl-10 rounded-lg border ${inputClass}`}
          />
          <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-3">
          {filteredUsers.map(user => (
            <div key={user.username} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-800/80 rounded-lg border border-slate-600 gap-4">
               <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-lg">{user.name}</span>
                    <span className="text-xs text-blue-300 px-2 py-0.5 bg-blue-900/50 rounded-full">{user.username}</span>
                    {user.gender && <span className="text-xs text-purple-300 px-2 py-0.5 bg-purple-900/50 rounded-full">{user.gender}</span>}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">Yaş: {user.age} | Xal: <span className="text-green-400 font-mono font-bold">{user.totalPoints}</span> | Şifrə: <span className="text-red-300 font-mono">{user.password}</span></div>
               </div>
               <div className="flex gap-2">
                 <button 
                    onClick={() => startEditingUser(user)}
                    className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm font-bold"
                 >
                    <Edit size={16} /> Düzəlt
                 </button>
                 <button 
                    onClick={() => handleDeleteUser(user.username)}
                    className="p-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm font-bold"
                 >
                    <Trash2 size={16} /> Sil
                 </button>
               </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {userToEdit && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
             <div className={`${cardClass} p-6 rounded-2xl w-full max-w-md shadow-2xl bg-[#000030]`}>
                <h3 className="text-xl font-bold mb-4 text-white">İstifadəçini Redaktə et: {userToEdit.username}</h3>
                <form onSubmit={handleAdminSaveUser} className="space-y-3">
                   <div>
                      <label className="text-xs text-blue-300 block mb-1">Ad</label>
                      <input type="text" value={adminEditForm.name} onChange={e => setAdminEditForm({...adminEditForm, name: e.target.value})} className={`w-full p-2 rounded border ${inputClass}`} />
                   </div>
                   <div className="flex gap-2">
                      <div className="flex-1">
                         <label className="text-xs text-blue-300 block mb-1">Yaş</label>
                         <input type="number" value={adminEditForm.age} onChange={e => setAdminEditForm({...adminEditForm, age: e.target.value})} className={`w-full p-2 rounded border ${inputClass}`} />
                      </div>
                      <div className="flex-1">
                          <label className="text-xs text-blue-300 block mb-1">Cins</label>
                          <select value={adminEditForm.gender} onChange={e => setAdminEditForm({...adminEditForm, gender: e.target.value as any})} className={`w-full p-2 rounded border ${inputClass}`}>
                             <option value="Kişi">Kişi</option>
                             <option value="Qadın">Qadın</option>
                          </select>
                      </div>
                   </div>
                   <div>
                      <label className="text-xs text-red-300 block mb-1">Şifrə (Admin dəyişə bilər)</label>
                      <input type="text" value={adminEditForm.password} onChange={e => setAdminEditForm({...adminEditForm, password: e.target.value})} className={`w-full p-2 rounded border ${inputClass}`} />
                   </div>
                   <div>
                      <label className="text-xs text-green-300 block mb-1">Ümumi Xal</label>
                      <input type="number" value={adminEditForm.totalPoints} onChange={e => setAdminEditForm({...adminEditForm, totalPoints: Number(e.target.value)})} className={`w-full p-2 rounded border ${inputClass}`} />
                   </div>
                   
                   <div className="flex gap-2 mt-4">
                      <Button type="submit" fullWidth className="bg-green-700">Yadda saxla</Button>
                      <Button type="button" fullWidth variant="secondary" onClick={() => setUserToEdit(null)}>Ləğv et</Button>
                   </div>
                </form>
             </div>
          </div>
        )}
      </div>
    );
  };
  
  // Return the rest of the component
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