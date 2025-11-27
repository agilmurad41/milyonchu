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
  Trash2
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
  const [allUsers, setAllUsers] = useState<User[]>([]); // For leaderboard
  
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

  // Load users for leaderboard when needed
  const refreshLeaderboard = async () => {
    const users = await dbService.getUsers();
    setAllUsers(users);
  };

  useEffect(() => {
    if (gameStatus === GameStatus.LEADERBOARD) {
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
      // Legacy support fix
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
    
    // Save to DB
    const success = await dbService.updateUser(currentUser.username, {
      totalPoints: updatedUser.totalPoints,
      gamesPlayed: updatedUser.gamesPlayed,
      completedTopics: updatedUser.completedTopics,
      seenQuestions: updatedUser.seenQuestions // Ensure synced
    });

    if (success) {
      setCurrentUser(updatedUser);
    }
  };

  const markQuestionAsSeen = async (questionText: string) => {
    if (!currentUser) return;
    if (currentUser.seenQuestions.includes(questionText)) return;

    const updatedList = [...currentUser.seenQuestions, questionText];
    
    // Optimistic UI update
    setCurrentUser({ ...currentUser, seenQuestions: updatedList });

    // DB Update
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
    }
  };

  // ADMIN FUNCTION
  const handleDeleteUser = async (usernameToDelete: string) => {
    if (window.confirm(`${usernameToDelete} istifadəçisini silmək istədiyinizə əminsiniz?`)) {
      const success = await dbService.deleteUser(usernameToDelete);
      if (success) {
        refreshLeaderboard(); // Refresh list
      }
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

  // Lifelines
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
  const textClass = "text-slate-300";

  // --- RENDER SCREENS ---

  const renderAuthChoice = () => {
    const isLoggedIn = !!currentUser;
    const btnBase = "py-3 md:py-4 text-sm md:text-base font-bold border-2 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg rounded-xl";

    return (
      <div className="flex flex-col h-full w-full relative z-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <div className="flex flex-col min-h-full w-full justify-between">
            {/* Top Section */}
            <div className="flex flex-col items-center justify-center pt-24 shrink-0 relative z-20 px-4">
               <div className="scale-90 md:scale-100">
                 <GameLogo size="xl" />
               </div>
               <div className="mt-8 md:mt-12 text-center z-30 px-4">
                 <p className="text-blue-100 text-sm md:text-lg font-semibold tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                   Biliyinizi sınayın,
                 </p>
                 <p className="text-yellow-400 text-lg md:text-2xl font-bold italic tracking-widest drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)] mt-2">
                   Bilməcə Live oynayın!
                 </p>
               </div>
            </div>

            {/* Middle Section */}
            <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-4 min-h-[100px]">
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
            <div className="w-full p-6 pb-8 md:pb-12 flex flex-col gap-3 max-w-xs mx-auto z-20 shrink-0">
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
        </div>
      </div>
    );
  };

  const renderLeaderboard = () => {
    const sortedUsers = [...allUsers].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 20);
    const isAdmin = currentUser?.username === 'admin';

    return (
      <div className="flex flex-col items-center justify-center h-full p-4 w-full max-w-md mx-auto overflow-y-auto z-10">
        <div className={`${cardClass} p-6 rounded-2xl border w-full shadow-2xl my-auto bg-[#000030]/90 backdrop-blur-md`}>
          <div className="flex items-center justify-center gap-2 mb-6 text-yellow-400">
            <Trophy size={32} />
            <h2 className="text-2xl font-bold">Reytinq Cədvəli</h2>
          </div>
          
          <div className="space-y-2 mb-6 max-h-[60vh] overflow-y-auto">
            {sortedUsers.length === 0 ? (
              <p className="text-center text-slate-400 italic">Yüklənir və ya hələ heç kim oynamayıb.</p>
            ) : (
              sortedUsers.map((u, idx) => (
                <div key={u.username} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                   <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-400 text-black' : idx === 2 ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                        {idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">{u.name}</span>
                        <span className="text-[10px] text-slate-400">{u.username}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="font-mono font-bold text-green-400 text-sm">{u.totalPoints}</div>
                      {isAdmin && (
                        <button onClick={() => handleDeleteUser(u.username)} className="text-red-500 hover:text-red-400">
                          <Trash2 size={16} />
                        </button>
                      )}
                   </div>
                </div>
              ))
            )}
          </div>
          
          <Button onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="py-2" fullWidth variant="secondary">Geri qayıt</Button>
        </div>
      </div>
    );
  };

  // Re-used renderProfile, renderLogin, renderRegister, renderTopicSelection, renderPlaying, renderGameOver from previous version
  // but just updated to use async calls implicitly via the updated handler functions above.
  // ... (Full render functions preserved for brevity, logic updated in handlers) ...

  const renderProfile = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 w-full max-w-sm mx-auto overflow-y-auto z-10">
      <div className={`${cardClass} p-6 rounded-2xl border w-full shadow-2xl bg-[#000030]/90 backdrop-blur-md`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-blue-300">Profil</h2>
          {profileSaveStatus === 'saved' && <span className="text-green-400 text-xs font-bold animate-pulse">Yadda saxlanıldı!</span>}
        </div>
        
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">İstifadəçi adı</label>
            <div className="w-full p-3 rounded-lg border bg-slate-800/50 border-slate-700 text-slate-400 cursor-not-allowed">
              {currentUser?.username}
            </div>
          </div>
          <div>
             <label className="text-xs text-blue-300 block mb-1">Ad</label>
             <input type="text" value={editProfileForm.name} onChange={e => setEditProfileForm({...editProfileForm, name: e.target.value})} className={`w-full p-3 rounded-lg border ${inputClass}`} />
          </div>
          <div className="flex gap-3">
             <div className="flex-1">
                <label className="text-xs text-blue-300 block mb-1">Yaşınız</label>
                <input type="number" value={editProfileForm.age} onChange={e => setEditProfileForm({...editProfileForm, age: e.target.value})} className={`w-full p-3 rounded-lg border ${inputClass}`} />
             </div>
             <div className="flex-1">
                <label className="text-xs text-blue-300 block mb-1">Cins</label>
                <select value={editProfileForm.gender} onChange={e => setEditProfileForm({...editProfileForm, gender: e.target.value as any})} className={`w-full p-3 rounded-lg border ${inputClass}`}>
                  <option value="">Seçin</option>
                  <option value="Kişi">Kişi</option>
                  <option value="Qadın">Qadın</option>
                </select>
             </div>
          </div>
          <Button type="submit" fullWidth className="py-2 bg-green-700">Yadda saxla</Button>
        </form>
        <Button variant="secondary" fullWidth onClick={closeProfile} className="mt-3 py-2 bg-transparent border border-slate-600">Geri qayıt</Button>
      </div>
    </div>
  );

  const renderLogin = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 w-full max-w-sm mx-auto overflow-y-auto z-10">
      <div className="w-full my-auto flex flex-col items-center">
        <div className="mb-6 p-4 bg-blue-900/30 rounded-full border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]"><LogIn size={40} className="text-blue-400 shrink-0" /></div>
        <div className={`${cardClass} p-6 rounded-2xl border w-full shadow-2xl bg-[#000030]/90 backdrop-blur-md`}>
          <h2 className="text-xl font-bold mb-4 text-center text-blue-300">Giriş et</h2>
          {authError && <div className="bg-red-900/50 border border-red-800 text-red-200 p-2 rounded mb-4 text-xs text-center">{authError}</div>}
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="text" placeholder="İstifadəçi adı" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} className={`w-full p-3 rounded-lg border ${inputClass}`} />
            <input type="password" placeholder="Şifrə" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className={`w-full p-3 rounded-lg border ${inputClass}`} />
            <Button type="submit" fullWidth disabled={isAuthLoading} className="py-2 mt-2 bg-blue-700">{isAuthLoading ? 'Gözləyin...' : 'Daxil ol'}</Button>
          </form>
          <Button variant="secondary" fullWidth onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="mt-3 py-2 bg-transparent border border-slate-600">Geri qayıt</Button>
        </div>
      </div>
    </div>
  );

  const renderRegister = () => {
    if (registrationSuccess) {
       return (
         <div className="flex flex-col items-center justify-center h-full p-6 w-full max-w-sm mx-auto text-center overflow-y-auto z-10">
            <div className={`${cardClass} p-6 rounded-2xl border w-full flex flex-col items-center shadow-2xl my-auto bg-[#000030]/90 backdrop-blur-md`}>
               <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4 animate-bounce"><CheckCircle size={32} className="text-white" /></div>
               <h2 className="text-xl font-bold mb-2 text-green-400">Uğurlu qeydiyyat!</h2>
               <Button onClick={finishRegistration} fullWidth className="bg-green-700">Davam et</Button>
            </div>
         </div>
       );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 w-full max-w-sm mx-auto overflow-y-auto z-10">
        <div className="w-full my-auto flex flex-col items-center">
           <div className="mb-6 p-4 bg-blue-900/30 rounded-full border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]"><UserPlus size={40} className="text-blue-400 shrink-0" /></div>
          <div className={`${cardClass} p-6 rounded-2xl border w-full shadow-2xl bg-[#000030]/90 backdrop-blur-md`}>
            <h2 className="text-xl font-bold mb-4 text-center text-blue-300">Qeydiyyat</h2>
            {authError && <div className="bg-red-900/50 border border-red-800 text-red-200 p-2 rounded mb-4 text-xs text-center">{authError}</div>}
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="relative">
                <input type="text" placeholder="İstifadəçi adı (min. 3 simvol)" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} className={`w-full p-3 rounded-lg border ${inputClass} pr-8`} />
                <div className="absolute right-3 top-3">{authForm.username.length >= 3 && (usernameStatus === 'valid' ? <Check className="text-green-500" size={16} /> : usernameStatus === 'taken' ? <X className="text-red-500" size={16} /> : null)}</div>
              </div>
              {/* Validation message */}
              <div className="relative">
                 <input type="password" placeholder="Şifrə (5-10 simvol)" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className={`w-full p-3 rounded-lg border ${inputClass} pr-8`} />
                 <div className="absolute right-3 top-3">{authForm.password.length > 0 && (passwordStatus === 'valid' ? <Check className="text-green-500" size={16} /> : passwordStatus === 'invalid' ? <X className="text-red-500" size={16} /> : null)}</div>
              </div>
               <input type="text" placeholder="Ad" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className={`w-full p-3 rounded-lg border ${inputClass}`} />
              <div className="flex gap-2">
                 <input type="number" placeholder="Yaşınız" value={authForm.age} onChange={e => setAuthForm({...authForm, age: e.target.value})} className={`w-1/2 p-3 rounded-lg border ${inputClass}`} />
                 <select value={authForm.gender} onChange={e => setAuthForm({...authForm, gender: e.target.value as any})} className={`w-1/2 p-3 rounded-lg border ${inputClass}`}>
                    <option value="">Cins</option>
                    <option value="Kişi">Kişi</option>
                    <option value="Qadın">Qadın</option>
                 </select>
              </div>
              <Button type="submit" fullWidth disabled={usernameStatus === 'taken' || passwordStatus === 'invalid' || isAuthLoading} className="py-2 mt-2 bg-blue-700">{isAuthLoading ? 'Gözləyin...' : 'Qeydiyyatdan keç'}</Button>
            </form>
            <Button variant="secondary" fullWidth onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="mt-3 py-2 bg-transparent border border-slate-600">Geri qayıt</Button>
          </div>
        </div>
      </div>
    );
  };

  const renderTopicSelection = () => (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 overflow-hidden z-10">
      <header className="flex justify-between items-center mb-2 shrink-0">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-800/80 rounded-full flex items-center justify-center text-white font-bold text-base shadow-[0_0_15px_rgba(59,130,246,0.5)] border-2 border-blue-400">{currentUser?.name.charAt(0)}</div>
            <div>
               <div className="font-bold text-sm text-white drop-shadow-md">{currentUser?.name}</div>
               <div className={`text-[10px] text-blue-300 uppercase tracking-wide`}>Ümumi xal: <span className="text-yellow-400 font-bold">{currentUser?.totalPoints}</span></div>
            </div>
         </div>
         <Button variant="secondary" onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="py-1 px-3 text-[10px] h-8 border-slate-600 bg-slate-800/50">Geri qayıt</Button>
      </header>
      <div className="flex flex-col items-center justify-center mb-2 shrink-0">
         <GameLogo size="large" />
         <h2 className="text-lg font-bold text-center mt-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] shrink-0 text-white">Mövzu seçimi</h2>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 w-full pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
           {TOPICS.map(topic => {
              const Icon = ICON_MAP[topic.icon] || HelpCircle;
              const isLocked = currentUser?.completedTopics.includes(topic.id);
              const colorMap: Record<string, string> = { cyan: "border-cyan-500/50 shadow-cyan-500/20", amber: "border-amber-500/50 shadow-amber-500/20", fuchsia: "border-fuchsia-500/50 shadow-fuchsia-500/20", emerald: "border-emerald-500/50 shadow-emerald-500/20", violet: "border-violet-500/50 shadow-violet-500/20", rose: "border-rose-500/50 shadow-rose-500/20" };
              const iconColorMap: Record<string, string> = { cyan: "text-cyan-400 bg-cyan-500/20", amber: "text-amber-400 bg-amber-500/20", fuchsia: "text-fuchsia-400 bg-fuchsia-500/20", emerald: "text-emerald-400 bg-emerald-500/20", violet: "text-violet-400 bg-violet-500/20", rose: "text-rose-400 bg-rose-500/20" };
              return (
                 <button key={topic.id} onClick={() => !isLocked && startGameWithTopic(topic.id)} disabled={isLocked} className={`${cardClass} p-3 rounded-xl flex items-center gap-3 transition-all hover:scale-[1.01] relative overflow-hidden group text-left bg-[#000040]/60 backdrop-blur-sm ${colorMap[topic.color] || colorMap['cyan']}`}>
                    <div className={`p-2.5 rounded-full shrink-0 transition-colors ${isLocked ? 'bg-gray-700' : (iconColorMap[topic.color] || iconColorMap['cyan'])}`}><Icon size={24} /></div>
                    <div className="flex-1 min-w-0">
                       <h3 className="font-bold text-lg leading-tight text-white group-hover:text-white transition-colors truncate">{topic.label}</h3>
                       <p className={`text-[10px] text-gray-400 leading-tight truncate`}>{topic.description}</p>
                    </div>
                    {isLocked && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-green-400 font-bold text-sm tracking-widest backdrop-blur-sm border border-green-500/50 rounded-xl">TAMAMLANDI</div>}
                 </button>
              )
           })}
        </div>
      </div>
    </div>
  );

  const renderPlaying = () => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return <div>Loading...</div>;
    return (
      <div className="flex flex-col h-full max-w-5xl mx-auto p-3 relative overflow-hidden z-10">
        <header className="relative flex justify-between items-center mb-4 shrink-0 z-20 h-16 w-full px-2">
           <button onClick={() => setGameStatus(GameStatus.TOPIC_SELECTION)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/20 border border-red-500/30 text-red-300 hover:bg-red-900/40 transition-colors"><ArrowLeft size={18} /><span className="text-sm font-bold">Geri</span></button>
           <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full border-[3px] ${timeLeft <= 10 ? 'border-red-500 animate-pulse bg-red-900/20' : 'border-yellow-500 bg-[#000040]'} shadow-[0_0_20px_rgba(234,179,8,0.4)] z-30`}><span className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-yellow-400'}`}>{timeLeft}</span></div>
           <button onClick={openProfile} className="w-14 h-14 bg-blue-800 rounded-full flex items-center justify-center font-bold text-xl border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] text-white hover:scale-105 transition-transform">{currentUser?.name.charAt(0)}</button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 overflow-y-auto min-h-0 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
           <div className="w-full flex flex-col items-center my-auto">
             <div className={`${cardClass} p-6 rounded-2xl border-2 border-blue-400/50 text-center w-full max-w-3xl mb-6 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] shrink-0 bg-gradient-to-b from-slate-900/90 to-[#000040]/90`}>
                <h2 className="text-lg md:text-2xl font-medium leading-snug text-white">{currentQ.text}</h2>
             </div>
             <div className="flex justify-between items-center w-full max-w-3xl mb-6 px-2 md:px-4 shrink-0">
                <div className="flex gap-2 md:gap-4">
                    <button onClick={useFiftyFifty} disabled={!lifelines.fiftyFifty} className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 transition-all flex items-center justify-center ${!lifelines.fiftyFifty ? 'opacity-30 grayscale border-gray-600 bg-gray-800' : 'border-blue-400 hover:scale-110 hover:shadow-[0_0_15px_rgba(59,130,246,0.6)] bg-blue-900'}`} title="50/50"><span className="font-bold text-blue-300 text-xs md:text-sm">50:50</span></button>
                    <button onClick={useAskAudience} disabled={!lifelines.askAudience} className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 transition-all flex items-center justify-center ${!lifelines.askAudience ? 'opacity-30 grayscale border-gray-600 bg-gray-800' : 'border-green-400 hover:scale-110 hover:shadow-[0_0_15px_rgba(34,197,94,0.6)] bg-green-900'}`} title="Auditoriya"><Users size={20} className="text-green-300" /></button>
                    <button onClick={useAskAI} disabled={!lifelines.askAI} className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 transition-all flex items-center justify-center ${!lifelines.askAI ? 'opacity-30 grayscale border-gray-600 bg-gray-800' : 'border-purple-400 hover:scale-110 hover:shadow-[0_0_15px_rgba(168,85,247,0.6)] bg-purple-900'}`} title="Bilgə İnsan (AI)"><BrainCircuit size={20} className="text-purple-300" /></button>
                </div>
                <div className="flex flex-col items-end text-right">
                   <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm md:text-base bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-500/30 mb-1"><Hash size={16} /><span>Sual: {currentQuestionIndex + 1} / {questions.length}</span></div>
                   <div className="flex items-center gap-2 text-green-400 font-bold text-sm md:text-base bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/30"><Star size={16} /><span>Xal: {(currentQuestionIndex) * 100}</span></div>
                </div>
             </div>
             {aiHint && (<div className="mb-4 p-4 bg-purple-900/90 border border-purple-500 rounded-xl max-w-2xl animate-fade-in flex gap-3 items-start shadow-[0_0_20px_rgba(168,85,247,0.3)] shrink-0 backdrop-blur-sm w-full"><BrainCircuit className="shrink-0 text-purple-300 mt-1" size={20} /><p className="text-sm text-purple-100 italic">"{aiHint}"</p></div>)}
             {audienceData && (<div className="mb-4 p-3 bg-slate-800/90 rounded-lg flex gap-3 items-end h-24 border border-slate-600 shadow-lg shrink-0 w-full max-w-3xl">{['A','B','C','D'].map(opt => (<div key={opt} className="flex flex-col items-center flex-1 h-full justify-end"><div className="mb-0.5 font-bold text-yellow-500 text-xs">{audienceData[opt as keyof AudienceData]}%</div><div className="w-full bg-blue-600 rounded-t transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ height: `${audienceData[opt as keyof AudienceData]}%` }}></div><div className="mt-0.5 font-bold text-slate-400 text-sm">{opt}</div></div>))}</div>)}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-4xl shrink-0 pb-4">
                {currentQ.options.map((opt, idx) => {
                   if (hiddenOptions.includes(idx)) { return <div key={idx} className="invisible p-3">Hidden</div>; }
                   let stateClass = "bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border-slate-600 text-white shadow-md"; 
                   if (answerState === AnswerState.SELECTED && selectedAnswerIndex === idx) { stateClass = "bg-orange-600 border-orange-400 text-white shadow-[0_0_25px_rgba(249,115,22,0.6)] scale-[1.02] z-10"; } 
                   else if (answerState === AnswerState.CORRECT && idx === currentQ.correctAnswerIndex) { stateClass = "animate-flash-green bg-green-600 border-green-400 text-white font-bold scale-[1.02] shadow-[0_0_30px_rgba(34,197,94,0.8)] z-10"; } 
                   else if (answerState === AnswerState.WRONG && idx === selectedAnswerIndex) { stateClass = "bg-red-700 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)]"; } 
                   else if (answerState === AnswerState.WRONG && idx === currentQ.correctAnswerIndex) { stateClass = "bg-green-600 border-green-400 text-white opacity-80 shadow-[0_0_15px_rgba(34,197,94,0.4)]"; }
                   return (
                     <button key={idx} disabled={answerState !== AnswerState.IDLE} onClick={() => handleAnswerSelect(idx)} className={`relative p-4 rounded-xl border text-left transition-all group overflow-hidden ${stateClass}`}>
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-yellow-500 rotate-45 opacity-70"></div><div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-yellow-500 rotate-45 opacity-70"></div>
                        <div className="flex items-center gap-3 relative z-10 pl-3"><span className="font-bold text-yellow-500 text-lg drop-shadow">{['A','B','C','D'][idx]}:</span><span className="text-base font-medium leading-tight tracking-wide">{opt}</span></div>
                     </button>
                   );
                })}
             </div>
           </div>
        </div>
      </div>
    );
  };

  const renderGameOver = (won: boolean) => {
    const earnedPoints = won ? (questions.length * 100) + 5000 : (currentQuestionIndex * 50);
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center max-w-md mx-auto animate-fade-in overflow-y-auto z-10">
          <div className="w-full my-auto flex flex-col items-center">
            <div className={`mb-6 p-6 rounded-full shrink-0 border-4 ${won ? 'bg-yellow-500/20 shadow-[0_0_50px_rgba(234,179,8,0.5)] border-yellow-500' : 'bg-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.5)] border-red-500'}`}>
              {won ? <Trophy size={80} className="text-yellow-500" /> : <AlertCircle size={80} className="text-red-500" />}
            </div>
            <h2 className="text-4xl font-bold mb-3 shrink-0 text-white drop-shadow-lg">{won ? "TƏBRİKLƏR!" : "OYUN BİTDİ"}</h2>
            {!won && lossReason === 'timeout' && (<p className="text-lg text-red-300 mb-6 font-semibold shrink-0">Vaxtınız bitdi!</p>)}
            {!won && lossReason === 'wrong' && (<p className="text-lg text-red-300 mb-6 font-semibold shrink-0">Cavabınız səhvdir.</p>)}
            {won && <p className="text-xl text-yellow-400 mb-6 font-medium shrink-0 shadow-yellow-500/50">Siz əsl Bilməcə ustasısınız!</p>}
            <div className={`${cardClass} p-6 rounded-2xl border-2 border-yellow-600/50 w-full mb-8 shrink-0 bg-gradient-to-r from-[#000040] to-[#000060]`}>
              <div className="text-xs text-blue-300 uppercase mb-2 tracking-widest">Qazanılan Xal</div>
              <div className="text-4xl font-bold text-green-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{earnedPoints}</div>
            </div>
            <div className="space-y-4 w-full shrink-0 pb-6">
              <Button fullWidth onClick={() => setGameStatus(GameStatus.TOPIC_SELECTION)} className="py-4 text-lg bg-green-700 hover:bg-green-600 border-green-500 shadow-[0_0_20px_rgba(22,163,74,0.4)]">Yeni Oyun</Button>
              <Button fullWidth variant="secondary" onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="py-4 text-lg bg-slate-800/80 hover:bg-slate-800 border-slate-600">Ana Menyu</Button>
            </div>
          </div>
      </div>
    );
  };

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
         {(gameStatus === GameStatus.WON || gameStatus === GameStatus.LOST) && renderGameOver(gameStatus === GameStatus.WON)}
      </div>
    </div>
  );
};

export default App;
