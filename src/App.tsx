
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getQuestionsByTopic, TOPICS } from './constants';
import { GameStatus, AnswerState, Lifelines, AudienceData, User, Question, Topic } from './types';
import { Button } from './components/Button';
import { MoneyTree } from './components/MoneyTree';
import AdSenseBanner from './components/AdSenseBanner';
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
  Database,
  Cpu,
  Feather,
  Dumbbell,
  User as UserIcon,
  Home,
  Shield,
  FileText,
  Info
} from 'lucide-react';

// --- ICONS MAPPING ---
const ICON_MAP: Record<string, React.ElementType> = {
  Globe, BookOpen, Palette, Moon, Rocket, Clapperboard, Trophy, Cpu, Feather, Dumbbell
};

// --- TRANSLATIONS ---
type Language = 'az' | 'en';

const TRANSLATIONS = {
  az: {
    slogan1: "Bilgi gücdür,",
    slogan2: "Bilməcə Live isə meydan!",
    highScore: "Rekord xal",
    players: "Oyunçu sayı",
    welcome: "Xoş gəldin",
    login: "Daxil ol",
    register: "Qeydiyyat",
    help: "Kömək",
    about: "Oyun haqqında",
    aboutTitle: "Oyun qaqqında",
    leaderboard: "Liderlər cədvəli",
    privacy: "Məxfilik siyasəti",
    privacyTitle: "Məxfilik siyasəti",
    startGame: "Oyuna başla",
    adminPanel: "Admin panel",
    logout: "Çıxış",
    username: "İstifadəçi adı",
    password: "Şifrə",
    nameSurname: "Ad və soyad",
    age: "Yaş",
    gender: "Cins",
    male: "Kişi",
    female: "Qadın",
    select: "Seçin",
    save: "Yadda saxla",
    saved: "Yadda saxlanıldı!",
    back: "Geri qayıt",
    loginTitle: "Giriş",
    registerTitle: "Qeydiyyat",
    registerSuccess: "Uğurlu qeydiyyat!",
    registerSuccessDesc: "Hesabınız yaradıldı. İndi giriş edə bilərsiniz.",
    continue: "Davam et",
    loading: "Gözləyin...",
    minChars: "Minimum 3 simvol",
    usernameTaken: "Bu istifadəçi adı artıq mövcuddur.",
    passwordHint: "5-10 simvol arası olmalıdır",
    topicSelection: "Mövzu seçimi",
    question: "Sual",
    lifeline5050: "50/50",
    lifelineAudience: "Auditoriya",
    lifelineAI: "Bilgə İnsan",
    aiSays: "Bilgə İnsan deyir:",
    thanks: "Təşəkkürlər",
    congrats: "Təbriklər!",
    youLost: "Məğlub oldunuz",
    amazingWin: "Möhtəşəm! Bütün suallara düzgün cavab verdiniz.",
    timeUp: "Vaxtınız bitdi.",
    wrongAnswer: "Təəssüf ki, cavab yanlışdır.",
    scoreEarned: "Qazanılan xal",
    chooseOtherTopic: "Digər mövzu seç",
    leaderboardTitle: "Liderlər cədvəli",
    noPlayers: "Hələ ki heç kim oynamayıb.",
    profile: "Profil",
    gamesPlayed: "Oynanılan oyunlar",
    totalPoints: "Toplam xal",
    userExists: "Bu istifadəçi adı artıq mövcuddur.",
    fillAllFields: "Bütün sahələri doldurun.",
    aboutContent: "Bilməcə Live — Azərbaycan dilində onlayn intellektual viktorina oyunudur. Tarix, Coğrafiya, İncəsənət və digər mövzularda sualları cavablandırın, xal toplayın və liderlər siyahısında yüksəlin.",
    privacyContent: {
       updated: "Son yenilənmə: 01 Mart 2025",
       intro: "\"Bilməcə Live\" tətbiqi istifadəçilərin məxfiliyinə hörmət edir.",
       collected: "Toplanan məlumatlar",
       collectedList: [
           "İstifadəçi adı, ad, yaş və cins (oyun təcrübəsi üçün).",
           "Oyun statistikası və xallar.",
           "Texniki cihaz məlumatları (təhlükəsizlik üçün)."
       ],
       contact: "Əlaqə"
    },
    rulesTitle: "Oyun qaydaları",
    rules: [
        "Oyuna başlamaq üçün qeydiyyatdan keçin.",
        "Hər mövzuda 15 sual var (5 asan, 5 orta, 5 çətin).",
        "Hər düzgün cavab 50 Xal qazandırır.",
        "Hər sual üçün 30 saniyə vaxtınız var.",
        "3 köməkçi vasitə: 50/50, Auditoriya və Bilgə İnsan (AI)."
    ],
    understood: "Aydındır",
    close: "Bağla",
    usernameImmutable: "İstifadəçi adı (dəyişdirilə bilməz)"
  },
  en: {
    slogan1: "Knowledge is power,",
    slogan2: "Bilməcə Live is the arena!",
    highScore: "High Score",
    players: "Players",
    welcome: "Welcome",
    login: "Login",
    register: "Register",
    help: "Help",
    about: "About Game",
    aboutTitle: "About Game",
    leaderboard: "Leaderboard",
    privacy: "Privacy Policy",
    privacyTitle: "Privacy Policy",
    startGame: "Start Game",
    adminPanel: "Admin Panel",
    logout: "Logout",
    username: "Username",
    password: "Password",
    nameSurname: "Full Name",
    age: "Age",
    gender: "Gender",
    male: "Male",
    female: "Female",
    select: "Select",
    save: "Save",
    saved: "Saved!",
    back: "Go Back",
    loginTitle: "Login",
    registerTitle: "Register",
    registerSuccess: "Registration Successful!",
    registerSuccessDesc: "Your account has been created. You can now login.",
    continue: "Continue",
    loading: "Please wait...",
    minChars: "Minimum 3 characters",
    usernameTaken: "Username is already taken.",
    passwordHint: "Must be 5-10 characters",
    topicSelection: "Select Topic",
    question: "Question",
    lifeline5050: "50/50",
    lifelineAudience: "Audience",
    lifelineAI: "Wise AI",
    aiSays: "Wise AI says:",
    thanks: "Thanks",
    congrats: "Congratulations!",
    youLost: "Game Over",
    amazingWin: "Amazing! You answered all questions correctly.",
    timeUp: "Time is up.",
    wrongAnswer: "Unfortunately, the answer is wrong.",
    scoreEarned: "Score Earned",
    chooseOtherTopic: "Choose another topic",
    leaderboardTitle: "Leaderboard",
    noPlayers: "No players yet.",
    profile: "Profile",
    gamesPlayed: "Games Played",
    totalPoints: "Total Points",
    userExists: "Username already exists.",
    fillAllFields: "Please fill all fields.",
    aboutContent: "Bilməcə Live is an online trivia game. Test your knowledge in History, Geography, Art, and more. Compete with players, earn points, and climb the leaderboard.",
    privacyContent: {
       updated: "Last updated: March 01, 2025",
       intro: "\"Bilməcə Live\" respects user privacy.",
       collected: "Collected Information",
       collectedList: [
           "Username, name, age, and gender (for game experience).",
           "Game statistics and scores.",
           "Technical device information (for security)."
       ],
       contact: "Contact"
    },
    rulesTitle: "Game Rules",
    rules: [
        "Register to start playing.",
        "Each topic has 15 questions (5 easy, 5 medium, 5 hard).",
        "Each correct answer gives 50 Points.",
        "You have 30 seconds for each question.",
        "3 Lifelines: 50/50, Audience, and Wise AI."
    ],
    understood: "Got it",
    close: "Close",
    usernameImmutable: "Username (cannot be changed)"
  }
};

// Custom Logo Component
const GameLogo = ({ size = 'normal' }: { size?: 'normal' | 'large' | 'xl' }) => {
  // Dynamic Sizes
  let containerSize = 'w-24 h-24';
  let titleSize = 'text-base';
  let subSize = 'text-xs';
  let iconSize = 24;

  if (size === 'large') {
    containerSize = 'w-36 h-36';
    titleSize = 'text-2xl';
    subSize = 'text-sm';
    iconSize = 40;
  } else if (size === 'xl') {
    containerSize = 'w-52 h-52 md:w-60 md:h-60';
    // Increased font sizes for the new layout without top/bottom text
    titleSize = 'text-4xl md:text-5xl';
    subSize = 'text-lg md:text-xl';
    iconSize = 48;
  }

  return (
    <div className={`relative ${containerSize} rounded-full bg-gradient-to-b from-[#000040] via-[#000080] to-[#000040] border-4 border-yellow-500 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.6)] p-4 text-center animate-pulse-slow mx-auto z-10 transition-all duration-500 shrink-0`}>
       <div className="absolute inset-1 rounded-full border border-yellow-600/50"></div>
       <div className="absolute inset-3 rounded-full border border-blue-400/30"></div>
       
       <div className="flex flex-col items-center justify-center z-10">
         <div className={`text-white font-black tracking-tighter leading-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] ${titleSize}`} style={{ textShadow: "0 0 15px rgba(59, 130, 246, 0.6)" }}>
            BİLMƏCƏ
         </div>
         <div className={`text-yellow-400 font-black tracking-[0.25em] leading-none mt-1 md:mt-2 drop-shadow-md ${subSize}`}>
            LIVE
         </div>
       </div>
       
       <div className="absolute -bottom-5 text-yellow-500 animate-spin-slow opacity-100 filter drop-shadow-[0_0_15px_rgba(234,179,8,1)] z-20 bg-[#000040] rounded-full p-1.5 border-2 border-yellow-500">
         <Gem size={iconSize} />
       </div>
    </div>
  );
};

const App: React.FC = () => {
  // --- STATE ---
  const [language, setLanguage] = useState<Language>('az'); // Default Language
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
  const [showProfileModal, setShowProfileModal] = useState(false);

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
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    language: 'az' as 'az' | 'en'
  });

  // Help Modal State
  const [showHelp, setShowHelp] = useState(false);
  
  // Privacy Modal State
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  // About Game Modal State
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Helper for current translations
  const t = TRANSLATIONS[language];

  // Load users on mount and when needed
  const refreshLeaderboard = async () => {
    const users = await dbService.getUsers();
    setAllUsers(users);
  };

  useEffect(() => {
    // Check session on load
    const savedUser = localStorage.getItem('bilmece_user_session');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (e) {
        console.error("Session parse error", e);
      }
    }
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
    if (!authForm.username.trim() || authForm.username.length < 3) { setAuthError(t.minChars); setIsAuthLoading(false); return; }
    if (usernameStatus === 'taken') { setAuthError(t.usernameTaken); setIsAuthLoading(false); return; }
    if (authForm.password.length < 5 || authForm.password.length > 10) { setAuthError(t.passwordHint); setIsAuthLoading(false); return; }
    if (!authForm.name.trim()) { setAuthError(t.fillAllFields); setIsAuthLoading(false); return; }
    if (!authForm.age.trim()) { setAuthError(t.fillAllFields); setIsAuthLoading(false); return; }
    if (!authForm.gender) { setAuthError(t.fillAllFields); setIsAuthLoading(false); return; }

    const newUser: User = { username: authForm.username, password: authForm.password, name: authForm.name, age: authForm.age, gender: authForm.gender, totalPoints: 0, completedTopics: [], gamesPlayed: 0, seenQuestions: [] };
    const success = await dbService.addUser(newUser);
    if (success) { 
        setCurrentUser(newUser);
        localStorage.setItem('bilmece_user_session', JSON.stringify(newUser));
        setRegistrationSuccess(true); 
        refreshLeaderboard(); 
    } 
    else { setAuthError("Error"); }
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
      localStorage.setItem('bilmece_user_session', JSON.stringify(foundUser));
      setGameStatus(GameStatus.AUTH_CHOICE);
      setAuthForm({ username: '', password: '', name: '', age: '', gender: '' });
    } else { setAuthError("Error"); }
    setIsAuthLoading(false);
  };

  const handleLogout = () => { 
      setCurrentUser(null); 
      localStorage.removeItem('bilmece_user_session');
      setGameStatus(GameStatus.AUTH_CHOICE); 
  };

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
    if (success) { 
        setCurrentUser(updatedUser); 
        localStorage.setItem('bilmece_user_session', JSON.stringify(updatedUser));
        refreshLeaderboard(); 
    }
  };

  const markQuestionAsSeen = async (questionText: string) => {
    if (!currentUser) return;
    if (currentUser.seenQuestions.includes(questionText)) return;
    const updatedList = [...currentUser.seenQuestions, questionText];
    const updatedUser = { ...currentUser, seenQuestions: updatedList };
    setCurrentUser(updatedUser);
    localStorage.setItem('bilmece_user_session', JSON.stringify(updatedUser));
    await dbService.updateUser(currentUser.username, { seenQuestions: updatedList });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const updates = { name: editProfileForm.name, age: editProfileForm.age, gender: editProfileForm.gender };
    const success = await dbService.updateUser(currentUser.username, updates);
    if (success) { 
        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser); 
        localStorage.setItem('bilmece_user_session', JSON.stringify(updatedUser));
        setProfileSaveStatus('saved'); 
        setTimeout(() => setProfileSaveStatus('idle'), 2000); 
        refreshLeaderboard(); 
    }
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
      const allStaticQuestions: any[] = [];
      TOPICS.forEach(topic => {
        // Seed default AZ questions
        const qs = getQuestionsByTopic(topic.id, [], 'az'); 
        qs.forEach(q => {
           allStaticQuestions.push({
             text: q.text,
             options: q.options,
             correctAnswerIndex: q.correctAnswerIndex,
             topic: topic.id,
             difficulty: q.difficulty || 'medium',
             language: 'az'
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
      difficulty: questionForm.difficulty,
      language: questionForm.language
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
        difficulty: (q.difficulty as any) || 'medium',
        language: (q.language as any) || 'az'
      });
    } else {
      setQuestionToEdit(null);
      setQuestionForm({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswerIndex: 0, topic: 'COGRAFIYA', difficulty: 'easy', language: 'az' });
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
    // 1. Try to get questions from DB first (Cloud) matching current language
    let rawQuestions = await dbService.getQuestions(topic, language);
    let gameQuestions: Question[] = [];
    
    // Helper shuffle function
    const shuffle = (arr: any[]) => [...arr].sort(() => 0.5 - Math.random());

    // 2. Logic: 5 Easy, 5 Medium, 5 Hard
    if (rawQuestions.length > 0) {
       console.log("DB-dən suallar yüklənir...");
       
       const easy = rawQuestions.filter(q => q.difficulty === 'easy');
       const medium = rawQuestions.filter(q => q.difficulty === 'medium');
       const hard = rawQuestions.filter(q => q.difficulty === 'hard');

       // If we have enough structure, pick 5 from each
       if (easy.length >= 5 && medium.length >= 5 && hard.length >= 5) {
          gameQuestions = [
            ...shuffle(easy).slice(0, 5),
            ...shuffle(medium).slice(0, 5),
            ...shuffle(hard).slice(0, 5)
          ];
       } else {
          // Fallback if structure is weak: just shuffle all and take 15
          gameQuestions = shuffle(rawQuestions).slice(0, 15);
       }
    } else {
       console.log("DB boşdur, lokal suallardan istifadə edilir.");
       // Fallback to local constants which already implements the 5/5/5 logic
       // IMPORTANT: Pass current language to local getter
       gameQuestions = getQuestionsByTopic(topic, currentUser?.seenQuestions || [], language);
    }

    if (gameQuestions.length === 0) {
      alert(language === 'az' ? "Bu mövzuda sual tapılmadı." : "No questions found for this topic.");
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
    
    // Remove focus to prevent "blue" button state on next question
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

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
            updateUserStats(50, selectedTopic || undefined); // Bonus for winning
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
      data[wrongIndices[0]] = w1; 
      data[wrongIndices[1]] = w2; 
      data[wrongIndices[2]] = w3; 
      setAudienceData({ A: data[0], B: data[1], C: data[2], D: data[3] }); 
      setLifelines(prev => ({ ...prev, askAudience: false })); 
      // Timer remains paused while audience help is shown
    }, 2000); 
  };
  
  const useAskAI = async () => { 
    if (!lifelines.askAI || aiLoading) return; 
    setAiLoading(true); 
    setIsTimerPaused(true); 
    const hint = await getAIHint(questions[currentQuestionIndex].text, questions[currentQuestionIndex].options); 
    setAiHint(hint); 
    setAiLoading(false); 
    setIsTimerPaused(true); // Ensure it stays paused
    setLifelines(prev => ({ ...prev, askAI: false })); 
  };

  // --- STYLES & RENDERS ---
  const bgClass = "bg-[#020220]"; const cardClass = "bg-slate-900/80 border-blue-500/50 text-white"; const inputClass = "bg-slate-800 border-slate-600 text-white";

  const renderHelpModal = () => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
      <div className={`${cardClass} p-6 rounded-2xl w-full max-w-md shadow-2xl bg-[#000030] relative`}>
        <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
        <div className="flex items-center gap-2 mb-4 text-teal-400"><HelpCircle size={28} /><h2 className="text-xl font-black">{t.rulesTitle}</h2></div>
        <div className="space-y-3 text-slate-300 text-sm md:text-base font-medium">
           {t.rules.map((rule, idx) => (
             <p key={idx} className="flex items-start gap-2"><span className="text-yellow-500 font-bold">•</span><span>{rule}</span></p>
           ))}
        </div>
        <Button onClick={() => setShowHelp(false)} fullWidth className="mt-6 bg-teal-700 hover:bg-teal-600 border-teal-500">{t.understood}</Button>
      </div>
    </div>
  );
  
  const renderAboutModal = () => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[70] backdrop-blur-sm animate-fade-in">
      <div className={`${cardClass} p-6 rounded-2xl w-full max-w-lg shadow-2xl bg-[#000030] relative overflow-y-auto max-h-[90vh]`}>
        <button onClick={() => setShowAboutModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
        <div className="flex items-center gap-2 mb-4 text-slate-200 border-b border-slate-700 pb-2">
          <Info size={24} className="text-blue-400" />
          <h2 className="text-xl font-black">{t.aboutTitle}</h2>
        </div>
        
        <div className="space-y-6">
            <div className="p-4 bg-slate-900/60 rounded-xl border border-blue-500/20">
                <h3 className="text-blue-300 font-bold text-base mb-2">Bilməcə Live</h3>
                <p className="text-slate-300 text-sm leading-relaxed font-medium">
                    {t.aboutContent}
                </p>
            </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700">
          <Button onClick={() => setShowAboutModal(false)} fullWidth className="bg-blue-900/50 border-blue-500/50 hover:bg-blue-800">{t.close}</Button>
        </div>
      </div>
    </div>
  );

  const renderPrivacyModal = () => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[80] backdrop-blur-sm animate-fade-in">
      <div className={`${cardClass} p-6 rounded-2xl w-full max-w-2xl shadow-2xl bg-[#000030] relative overflow-y-auto max-h-[90vh]`}>
        <button onClick={() => setShowPrivacyModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
        <div className="flex items-center gap-2 mb-4 text-slate-200 border-b border-slate-700 pb-2">
          <Shield size={24} className="text-blue-400" />
          <h2 className="text-xl font-black">{t.privacyTitle}</h2>
        </div>
        
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed font-medium">
            <p><strong>{t.privacyContent.updated}</strong></p>
            <p>{t.privacyContent.intro}</p>
            <h3 className="text-white font-bold">{t.privacyContent.collected}</h3>
            <ul className="list-disc pl-5">
                {t.privacyContent.collectedList.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <h3 className="text-white font-bold mt-4">{t.privacyContent.contact}</h3>
            <p>support@bilmecelive.com</p>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700">
          <Button onClick={() => setShowPrivacyModal(false)} fullWidth className="bg-blue-900/50 border-blue-500/50 hover:bg-blue-800">{t.close}</Button>
        </div>
      </div>
    </div>
  );

  const renderProfileModal = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#000030]/90 p-6 rounded-2xl border border-blue-500/50 shadow-2xl w-full max-w-md backdrop-blur-md relative">
         <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24}/></button>
         <h2 className="text-xl font-black text-white mb-6">{t.profile}</h2>
         {currentUser && (
           <form onSubmit={handleProfileUpdate} className="space-y-4">
               <div>
                  <label className="text-blue-300 text-xs uppercase font-bold ml-1 mb-1 block">{t.usernameImmutable}</label>
                  <input type="text" value={currentUser.username} disabled className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-slate-400 cursor-not-allowed font-medium" />
               </div>
               <div>
                  <label className="text-blue-300 text-xs uppercase font-bold ml-1 mb-1 block">{t.nameSurname}</label>
                  <input type="text" value={editProfileForm.name || currentUser.name} onChange={e => setEditProfileForm({...editProfileForm, name: e.target.value})} className="w-full bg-slate-800/80 border border-blue-500/30 rounded-lg p-3 text-white focus:border-blue-400 outline-none transition-colors font-medium" />
               </div>
               <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-blue-300 text-xs uppercase font-bold ml-1 mb-1 block">{t.age}</label>
                    <input type="number" value={editProfileForm.age || currentUser.age} onChange={e => setEditProfileForm({...editProfileForm, age: e.target.value})} className="w-full bg-slate-800/80 border border-blue-500/30 rounded-lg p-3 text-white focus:border-blue-400 outline-none transition-colors font-medium" />
                  </div>
                  <div className="flex-1">
                    <label className="text-blue-300 text-xs uppercase font-bold ml-1 mb-1 block">{t.gender}</label>
                    <select value={editProfileForm.gender || currentUser.gender} onChange={e => setEditProfileForm({...editProfileForm, gender: e.target.value as any})} className="w-full bg-slate-800/80 border border-blue-500/30 rounded-lg p-3 text-white focus:border-blue-400 outline-none transition-colors font-medium">
                      <option value="Kişi">{t.male}</option>
                      <option value="Qadın">{t.female}</option>
                    </select>
                  </div>
               </div>
               <div className="pt-2">
                 <div className="flex justify-between text-sm text-slate-400 mb-2 font-medium"><span>{t.totalPoints}:</span> <span className="text-yellow-500 font-bold">{currentUser.totalPoints}</span></div>
                 <div className="flex justify-between text-sm text-slate-400 font-medium"><span>{t.gamesPlayed}:</span> <span className="text-white font-bold">{currentUser.gamesPlayed}</span></div>
               </div>
               <Button type="submit" fullWidth className="mt-4">{profileSaveStatus === 'saved' ? t.saved : t.save}</Button>
           </form>
         )}
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
        {/* Language Switcher */}
        <div className="absolute top-4 left-4 z-[60] flex gap-2">
            <button 
                onClick={() => setLanguage('az')} 
                className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all shadow-lg ${language === 'az' ? 'border-yellow-400 scale-110 ring-2 ring-yellow-400/30' : 'border-white/20 opacity-70 hover:opacity-100 grayscale hover:grayscale-0'}`}
                title="Azərbaycan dili"
            >
                <img src="https://flagcdn.com/w40/az.png" alt="AZ" className="w-full h-full object-cover" />
            </button>
            <button 
                onClick={() => setLanguage('en')} 
                className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all shadow-lg ${language === 'en' ? 'border-yellow-400 scale-110 ring-2 ring-yellow-400/30' : 'border-white/20 opacity-70 hover:opacity-100 grayscale hover:grayscale-0'}`}
                title="English"
            >
                <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="w-full h-full object-cover" />
            </button>
        </div>

        <div className="flex flex-col min-h-full w-full justify-between">
            <div className="flex flex-col items-center w-full">
                <div className="flex flex-col items-center justify-center pt-16 md:pt-24 shrink-0 relative z-20 px-4">
                   <div className="scale-105 md:scale-110"><GameLogo size="xl" /></div>
                   <div className="mt-10 md:mt-12 text-center z-30 px-4">
                     <p className="text-blue-100 text-sm md:text-base font-bold tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t.slogan1}</p>
                     <p className="text-yellow-600 text-lg md:text-xl font-black tracking-widest drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]">{t.slogan2}</p>
                   </div>
                </div>
                <div className="flex justify-between items-center px-6 w-full max-w-sm mx-auto gap-4 mt-4">
                   <div className="flex-1 flex flex-col justify-center px-3 py-2 bg-[#000030]/80 border border-blue-600 rounded-xl shadow-[0_0_10px_rgba(37,99,235,0.3)] min-h-[50px] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors"></div>
                      <div className="flex items-center gap-2 relative z-10">
                        <Trophy size={16} className="text-yellow-400 shrink-0" />
                        <div className="flex flex-col"><span className="text-[8px] text-blue-200 uppercase tracking-wider mb-0.5">{t.highScore}</span><span className="text-sm font-black text-white leading-none font-mono">{highestScore.toLocaleString()}</span></div>
                      </div>
                   </div>
                   <div className="flex-1 flex flex-col justify-center px-3 py-2 bg-[#000030]/80 border border-blue-600 rounded-xl shadow-[0_0_10px_rgba(37,99,235,0.3)] min-h-[50px] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors"></div>
                      <div className="flex items-center gap-2 relative z-10">
                        <Users size={16} className="text-blue-400 shrink-0" />
                         <div className="flex flex-col"><span className="text-[8px] text-blue-200 uppercase tracking-wider mb-0.5">{t.players}</span><span className="text-sm font-black text-white leading-none font-mono">{playerCount.toLocaleString()}</span></div>
                      </div>
                   </div>
                </div>
            </div>
            
            {/* Welcome User Section - HORIZONTAL LAYOUT */}
            <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-2 min-h-[60px]">
               {isLoggedIn && (
                  <div className="flex items-center justify-between w-full max-w-xs mx-auto bg-[#000040]/80 p-3 rounded-xl border border-blue-500/30 backdrop-blur-md shadow-lg animate-fade-in mb-2 gap-3">
                     <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shrink-0 border border-blue-400 shadow-inner">
                           {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                           <span className="text-[9px] text-blue-300 uppercase font-bold tracking-wider leading-none mb-1">{t.welcome}</span>
                           <span className="text-sm font-bold text-white truncate leading-none">{currentUser.name}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-1.5 bg-[#000020]/80 px-3 py-1.5 rounded-lg border border-yellow-500/30 shadow-inner shrink-0">
                        <Trophy size={14} className="text-yellow-400" />
                        <span className="font-mono font-bold text-yellow-400 text-sm">{currentUser.totalPoints}</span>
                     </div>
                  </div>
               )}
            </div>

            <div className="w-full px-6 pb-4 md:pb-6 flex flex-col items-center shrink-0 max-w-xs mx-auto z-20">
               <div className="w-full flex flex-col gap-3">
               {!isLoggedIn ? (
                 <>
                   <Button fullWidth onClick={() => setGameStatus(GameStatus.LOGIN)} className={`${btnBase} bg-blue-900/80 border-blue-500 text-white`}><LogIn size={20} /> {t.login}</Button>
                   <Button fullWidth onClick={() => setGameStatus(GameStatus.REGISTER)} className={`${btnBase} bg-fuchsia-900/80 border-fuchsia-500 text-white`}><UserPlus size={20} /> {t.register}</Button>
                   <Button fullWidth onClick={() => setShowHelp(true)} className={`${btnBase} bg-teal-900/80 border-teal-500 text-white`}><HelpCircle size={20} /> {t.help}</Button>
                   <Button fullWidth onClick={() => setShowAboutModal(true)} className={`${btnBase} bg-indigo-900/80 border-indigo-500 text-white`}><Info size={20} /> {t.about}</Button>
                   <Button fullWidth onClick={() => setGameStatus(GameStatus.LEADERBOARD)} className={`${btnBase} bg-amber-900/80 border-amber-500 text-white`}><Trophy size={20} /> {t.leaderboard}</Button>
                 </>
               ) : (
                 <>
                   <Button fullWidth onClick={() => setGameStatus(GameStatus.TOPIC_SELECTION)} className={`${btnBase} bg-green-900/80 border-green-500 text-white`}><Play size={22} fill="currentColor" /> {t.startGame}</Button>
                   {isAdmin && <Button fullWidth onClick={() => setGameStatus(GameStatus.ADMIN_DASHBOARD)} className={`${btnBase} bg-gray-800/80 border-gray-500 text-white`}><Wrench size={20} /> {t.adminPanel}</Button>}
                   <Button fullWidth onClick={() => setGameStatus(GameStatus.LEADERBOARD)} className={`${btnBase} bg-amber-900/80 border-amber-500 text-white`}><Trophy size={20} /> {t.leaderboard}</Button>
                   <Button fullWidth onClick={() => setShowAboutModal(true)} className={`${btnBase} bg-indigo-900/80 border-indigo-500 text-white`}><Info size={20} /> {t.about}</Button>
                   <Button fullWidth onClick={handleLogout} className={`${btnBase} bg-red-900/60 border-red-500/80 text-red-100`}><LogOut size={20} /> {t.logout}</Button>
                 </>
               )}
               </div>
               
               <div className="text-[11px] text-blue-200/60 mt-4 font-mono text-center pb-2">
                  <div>© 2025 by Aqil Muradov | Gemini 3</div>
               </div>
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
           <div className="flex items-center gap-3"><Trophy size={32} className="text-yellow-500" /><h2 className="text-xl font-black text-white">{t.leaderboardTitle}</h2></div>
           <Button variant="secondary" onClick={() => setGameStatus(previousStatus || GameStatus.AUTH_CHOICE)} className="py-1 px-3 text-sm h-10 border-slate-600 bg-slate-800"><ArrowLeft size={18} /></Button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-2">
          {sortedUsers.map((user, index) => (
            <div key={user.username} className={`flex items-center justify-between p-4 rounded-lg border ${user.username === currentUser?.username ? 'bg-blue-900/40 border-blue-500' : 'bg-slate-800/80 border-slate-600'}`}>
               <div className="flex items-center gap-4">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${index < 3 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-300'}`}>{index + 1}</span>
                  <div><div className="font-bold text-white text-lg">{user.name}</div><div className="text-xs text-slate-400 font-medium">{t.gamesPlayed}: {user.gamesPlayed}</div></div>
               </div>
               <div className="text-green-400 font-mono font-bold text-xl">{user.totalPoints.toLocaleString()}</div>
            </div>
          ))}
          {sortedUsers.length === 0 && <div className="text-center text-slate-400 mt-10 font-medium">{t.noPlayers}</div>}
        </div>
        {/* AdSense Leaderboard Bottom */}
        <AdSenseBanner dataAdSlot="1234567890" dataAdFormat="horizontal" />
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
           <div className="flex items-center gap-3"><Wrench size={32} className="text-gray-300" /><h2 className="text-xl font-black text-white">{t.adminPanel}</h2></div>
           <Button variant="secondary" onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="py-1 px-3 text-sm h-10 border-slate-600 bg-slate-800">{t.logout}</Button>
        </header>

        <div className="flex gap-2 mb-4 shrink-0">
           <button onClick={() => setAdminTab('users')} className={`flex-1 p-2 rounded-lg font-bold transition-colors ${adminTab === 'users' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>İstifadəçilər</button>
           <button onClick={() => setAdminTab('questions')} className={`flex-1 p-2 rounded-lg font-bold transition-colors ${adminTab === 'questions' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Suallar</button>
        </div>

        {/* Search */}
        <div className="mb-4 relative shrink-0">
          <input type="text" placeholder="Axtarış..." value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} className={`w-full p-3 pl-10 rounded-lg border font-medium ${inputClass}`} />
          <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
        </div>

        {adminTab === 'users' ? (
          <div className="flex-1 min-h-0 overflow-y-auto bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-3">
            {filteredUsers.map(user => (
              <div key={user.username} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-800/80 rounded-lg border border-slate-600 gap-4">
                 <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-lg">{user.name}</span>
                      <span className="text-xs text-blue-300 px-2 py-0.5 bg-blue-900/50 rounded-full font-medium">{user.username}</span>
                    </div>
                    <div className="text-sm text-slate-400 mt-1 font-medium">{t.totalPoints}: <span className="text-green-400 font-mono font-bold">{user.totalPoints}</span> | {t.password}: <span className="text-red-300 font-mono">{user.password}</span></div>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={() => startEditingUser(user)} className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition-colors"><Edit size={16} /></button>
                   <button onClick={() => handleDeleteUser(user.username)} className="p-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-colors"><Trash2 size={16} /></button>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
             <div className="flex gap-2 mb-2 shrink-0">
                <Button onClick={() => openQuestionModal()} className="flex-1 bg-green-700 text-sm py-2"><PlusCircle size={16} className="mr-2"/> Yeni Sual</Button>
                <Button onClick={handleSeedQuestions} className="flex-1 bg-yellow-700 text-sm py-2"><Database size={16} className="mr-2"/> Bazanı Doldur</Button>
             </div>
             <div className="flex-1 min-h-0 overflow-y-auto bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-3">
               {filteredQuestions.map((q, idx) => (
                 <div key={q.id || idx} className="p-4 bg-slate-800/80 rounded-lg border border-slate-600">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-bold text-blue-300 bg-blue-900/30 px-2 py-1 rounded uppercase mr-2">{q.topic}</span>
                       <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${q.language === 'en' ? 'bg-purple-900/30 text-purple-300' : 'bg-yellow-900/30 text-yellow-300'}`}>{q.language || 'az'}</span>
                       <div className="flex gap-2 ml-auto">
                          <button onClick={() => openQuestionModal(q)} className="text-blue-400 hover:text-white"><Edit size={16}/></button>
                          <button onClick={() => handleDeleteQuestion(q.id as string)} className="text-red-400 hover:text-white"><Trash2 size={16}/></button>
                       </div>
                    </div>
                    <p className="text-white font-bold mb-2">{q.text}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 font-medium">
                       {q.options.map((opt, i) => (
                         <span key={i} className={i === q.correctAnswerIndex ? "text-green-400 font-bold" : ""}>{opt}</span>
                       ))}
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}
        {/* AdSense Admin Bottom */}
        <AdSenseBanner dataAdSlot="1234567890" dataAdFormat="horizontal" />

        {/* User Edit Modal */}
        {userToEdit && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
             <div className={`${cardClass} p-6 rounded-2xl w-full max-w-md shadow-2xl bg-[#000030]`}>
                <h3 className="text-xl font-bold mb-4 text-white">Redaktə et: {userToEdit.username}</h3>
                <form onSubmit={handleAdminSaveUser} className="space-y-3">
                   <div><label className="text-xs text-blue-300 block mb-1">{t.nameSurname}</label><input type="text" value={adminEditForm.name} onChange={e => setAdminEditForm({...adminEditForm, name: e.target.value})} className={`w-full p-2 rounded border font-medium ${inputClass}`} /></div>
                   <div className="flex gap-2">
                      <div className="flex-1"><label className="text-xs text-blue-300 block mb-1">{t.age}</label><input type="number" value={adminEditForm.age} onChange={e => setAdminEditForm({...adminEditForm, age: e.target.value})} className={`w-full p-2 rounded border font-medium ${inputClass}`} /></div>
                      <div className="flex-1"><label className="text-xs text-blue-300 block mb-1">{t.gender}</label><select value={adminEditForm.gender} onChange={e => setAdminEditForm({...adminEditForm, gender: e.target.value as any})} className={`w-full p-2 rounded border font-medium ${inputClass}`}><option value="Kişi">{t.male}</option><option value="Qadın">{t.female}</option></select></div>
                   </div>
                   <div><label className="text-xs text-red-300 block mb-1">{t.password}</label><input type="text" value={adminEditForm.password} onChange={e => setAdminEditForm({...adminEditForm, password: e.target.value})} className={`w-full p-2 rounded border font-medium ${inputClass}`} /></div>
                   <div><label className="text-xs text-green-300 block mb-1">{t.totalPoints}</label><input type="number" value={adminEditForm.totalPoints} onChange={e => setAdminEditForm({...adminEditForm, totalPoints: Number(e.target.value)})} className={`w-full p-2 rounded border font-medium ${inputClass}`} /></div>
                   <div className="flex gap-2 mt-4"><Button type="submit" fullWidth className="bg-green-700">{t.save}</Button><Button type="button" fullWidth variant="secondary" onClick={() => setUserToEdit(null)}>Ləğv et</Button></div>
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
                   <div><label className="text-xs text-blue-300 block mb-1">Sual Mətni</label><textarea value={questionForm.text} onChange={e => setQuestionForm({...questionForm, text: e.target.value})} className={`w-full p-2 rounded border font-medium ${inputClass}`} required /></div>
                   <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-xs text-slate-400">Variant A</label><input type="text" value={questionForm.optionA} onChange={e => setQuestionForm({...questionForm, optionA: e.target.value})} className={`w-full p-2 rounded border font-medium ${inputClass}`} required /></div>
                      <div><label className="text-xs text-slate-400">Variant B</label><input type="text" value={questionForm.optionB} onChange={e => setQuestionForm({...questionForm, optionB: e.target.value})} className={`w-full p-2 rounded border font-medium ${inputClass}`} required /></div>
                      <div><label className="text-xs text-slate-400">Variant C</label><input type="text" value={questionForm.optionC} onChange={e => setQuestionForm({...questionForm, optionC: e.target.value})} className={`w-full p-2 rounded border font-medium ${inputClass}`} required /></div>
                      <div><label className="text-xs text-slate-400">Variant D</label><input type="text" value={questionForm.optionD} onChange={e => setQuestionForm({...questionForm, optionD: e.target.value})} className={`w-full p-2 rounded border font-medium ${inputClass}`} required /></div>
                   </div>
                   <div className="flex gap-2">
                      <div className="flex-1">
                         <label className="text-xs text-green-300 block mb-1">Düzgün Variant</label>
                         <select value={questionForm.correctAnswerIndex} onChange={e => setQuestionForm({...questionForm, correctAnswerIndex: Number(e.target.value)})} className={`w-full p-2 rounded border font-medium ${inputClass}`}>
                            <option value={0}>A</option><option value={1}>B</option><option value={2}>C</option><option value={3}>D</option>
                         </select>
                      </div>
                      <div className="flex-1">
                         <label className="text-xs text-blue-300 block mb-1">Mövzu</label>
                         <select value={questionForm.topic} onChange={e => setQuestionForm({...questionForm, topic: e.target.value as Topic})} className={`w-full p-2 rounded border font-medium ${inputClass}`}>
                            {TOPICS.map(t => <option key={t.id} value={t.id}>{t.label.az}</option>)}
                         </select>
                      </div>
                      <div className="flex-1">
                         <label className="text-xs text-purple-300 block mb-1">Dil</label>
                         <select value={questionForm.language} onChange={e => setQuestionForm({...questionForm, language: e.target.value as 'az' | 'en'})} className={`w-full p-2 rounded border font-medium ${inputClass}`}>
                            <option value="az">AZ</option>
                            <option value="en">EN</option>
                         </select>
                      </div>
                   </div>
                   <div className="flex gap-2 mt-4"><Button type="submit" fullWidth className="bg-green-700">{t.save}</Button><Button type="button" fullWidth variant="secondary" onClick={() => setIsAddingQuestion(false)}>Ləğv et</Button></div>
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
         <h2 className="text-2xl font-black text-center text-white mb-6">{t.loginTitle}</h2>
         {authError && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm flex items-center gap-2 font-medium"><AlertCircle size={16}/>{authError}</div>}
         <form onSubmit={handleLogin} className="space-y-4">
           <div><label className="text-blue-300 text-xs uppercase font-bold ml-1 mb-1 block">{t.username}</label><input type="text" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} className="w-full bg-slate-800/80 border border-blue-500/30 rounded-lg p-3 text-white focus:border-blue-400 outline-none transition-colors font-medium" placeholder={t.username} /></div>
           <div><label className="text-blue-300 text-xs uppercase font-bold ml-1 mb-1 block">{t.password}</label><input type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full bg-slate-800/80 border border-blue-500/30 rounded-lg p-3 text-white focus:border-blue-400 outline-none transition-colors font-medium" placeholder={t.password} /></div>
           <Button type="submit" fullWidth disabled={isAuthLoading} className="mt-4">{isAuthLoading ? t.loading : t.login}</Button>
         </form>
         <div className="mt-6 text-center"><button onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="text-slate-400 hover:text-white text-sm underline font-medium">{t.back}</button></div>
      </div>
    </div>
  );

  const renderRegister = () => (
    <div className="flex flex-col items-center justify-center min-h-full p-6 w-full max-w-md mx-auto relative z-20 my-auto">
      <div className="bg-[#000030]/90 p-6 md:p-8 rounded-2xl border border-fuchsia-500/50 shadow-2xl w-full backdrop-blur-md max-h-[90vh] overflow-y-auto">
         {!registrationSuccess ? (
           <>
             <div className="flex justify-center mb-4"><div className="p-3 bg-fuchsia-900/50 rounded-full border border-fuchsia-400"><UserPlus size={32} className="text-fuchsia-300"/></div></div>
             <h2 className="text-2xl font-black text-center text-white mb-4">{t.registerTitle}</h2>
             {authError && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm flex items-center gap-2 font-medium"><AlertCircle size={16}/>{authError}</div>}
             <form onSubmit={handleRegister} className="space-y-3">
               <div>
                 <label className="text-fuchsia-300 text-xs uppercase font-bold ml-1 mb-1 block">{t.username}</label>
                 <div className="relative">
                   <input type="text" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} className={`w-full bg-slate-800/80 border font-medium ${usernameStatus === 'taken' ? 'border-red-500' : usernameStatus === 'valid' ? 'border-green-500' : 'border-fuchsia-500/30'} rounded-lg p-3 text-white focus:border-fuchsia-400 outline-none transition-colors`} placeholder={t.minChars} />
                   {usernameStatus === 'checking' && <div className="absolute right-3 top-3.5"><div className="animate-spin h-4 w-4 border-2 border-fuchsia-500 rounded-full border-t-transparent"></div></div>}
                   {usernameStatus === 'valid' && <CheckCircle size={18} className="absolute right-3 top-3.5 text-green-500" />}
                 </div>
               </div>
               <div>
                  <label className="text-fuchsia-300 text-xs uppercase font-bold ml-1 mb-1 block">{t.nameSurname}</label>
                  <input type="text" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className="w-full bg-slate-800/80 border border-fuchsia-500/30 rounded-lg p-3 text-white focus:border-fuchsia-400 outline-none transition-colors font-medium" />
               </div>
               <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-fuchsia-300 text-xs uppercase font-bold ml-1 mb-1 block">{t.age}</label>
                    <input type="number" value={authForm.age} onChange={e => setAuthForm({...authForm, age: e.target.value})} className="w-full bg-slate-800/80 border border-fuchsia-500/30 rounded-lg p-3 text-white focus:border-fuchsia-400 outline-none transition-colors font-medium" />
                  </div>
                  <div className="flex-1">
                    <label className="text-fuchsia-300 text-xs uppercase font-bold ml-1 mb-1 block">{t.gender}</label>
                    <select value={authForm.gender} onChange={e => setAuthForm({...authForm, gender: e.target.value as any})} className="w-full bg-slate-800/80 border border-fuchsia-500/30 rounded-lg p-3 text-white focus:border-fuchsia-400 outline-none transition-colors appearance-none font-medium">
                      <option value="">{t.select}</option>
                      <option value="Kişi">{t.male}</option>
                      <option value="Qadın">{t.female}</option>
                    </select>
                  </div>
               </div>
               <div>
                 <label className="text-fuchsia-300 text-xs uppercase font-bold ml-1 mb-1 block">{t.password}</label>
                 <input type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className={`w-full bg-slate-800/80 border font-medium ${passwordStatus === 'invalid' && authForm.password.length > 0 ? 'border-red-500' : 'border-fuchsia-500/30'} rounded-lg p-3 text-white focus:border-fuchsia-400 outline-none transition-colors`} placeholder={t.passwordHint} />
                 <p className="text-[10px] text-slate-400 mt-1 ml-1">{t.passwordHint}</p>
               </div>
               <Button type="submit" fullWidth disabled={isAuthLoading} className="mt-4 bg-fuchsia-700 hover:bg-fuchsia-600 border-fuchsia-500">{isAuthLoading ? t.loading : t.registerTitle}</Button>
             </form>
             <div className="mt-4 text-center"><button onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="text-slate-400 hover:text-white text-sm underline font-medium">{t.back}</button></div>
           </>
         ) : (
           <div className="text-center py-8 animate-fade-in">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-400 border-2 border-green-500"><Check size={32} /></div>
              <h2 className="text-2xl font-black text-white mb-2">{t.registerSuccess}</h2>
              <p className="text-slate-300 mb-6 font-medium">{t.registerSuccessDesc}</p>
              <Button onClick={finishRegistration} fullWidth className="bg-green-600 border-green-400">{t.continue}</Button>
           </div>
         )}
      </div>
    </div>
  );

  const renderTopicSelection = () => (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 z-10">
      <div className="flex justify-between items-center mb-6 shrink-0 bg-slate-900/80 p-4 rounded-xl border border-slate-700">
         <div className="flex items-center gap-3"><BrainCircuit size={32} className="text-blue-400" /><h2 className="text-xl font-black text-white">{t.topicSelection}</h2></div>
         <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowProfileModal(true)} className="py-1 px-3 text-sm h-10 border-slate-600 bg-slate-800"><UserIcon size={18} /></Button>
            <Button variant="secondary" onClick={() => setGameStatus(GameStatus.AUTH_CHOICE)} className="py-1 px-3 text-sm h-10 border-slate-600 bg-slate-800"><Home size={18} /></Button>
         </div>
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pb-4 [&::-webkit-scrollbar]:hidden">
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
           if(topic.color === 'cyan') colorClass = "border-cyan-500/50 hover:border-cyan-400 bg-cyan-900/20 hover:bg-cyan-900/40";
           if(topic.color === 'orange') colorClass = "border-orange-500/50 hover:border-orange-400 bg-orange-900/20 hover:bg-orange-900/40";

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
                   <h3 className="text-lg md:text-xl font-extrabold text-white mb-1">{topic.label[language]}</h3>
                   <p className="text-xs md:text-sm text-slate-300 font-medium">{topic.description[language]}</p>
                </div>
                {isCompleted && <div className="absolute top-2 right-2 text-green-500"><CheckCircle size={24} /></div>}
             </button>
           );
        })}
      </div>
      {/* AdSense Topic Selection Bottom */}
      <AdSenseBanner dataAdSlot="1234567890" dataAdFormat="horizontal" />
    </div>
  );

  const renderPlaying = () => {
    if (!questions[currentQuestionIndex]) return <div>{t.loading}</div>;
    const currentQ = questions[currentQuestionIndex];
    
    return (
      <div className="flex flex-col h-full w-full relative z-10 max-w-5xl mx-auto md:px-4">
         {/* Top Bar */}
         <div className="flex justify-between items-start p-4 shrink-0">
             <div className="flex gap-2 items-center">
               <button onClick={() => setGameStatus(GameStatus.TOPIC_SELECTION)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white border border-slate-600"><ArrowLeft size={20}/></button>
               <div className="bg-slate-900/80 px-4 py-2 rounded-full border border-blue-500/30 flex items-center gap-2">
                 <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">{t.question}</span>
                 <span className="text-white font-mono font-bold">{currentQuestionIndex + 1}/{questions.length}</span>
               </div>
             </div>
             <div>
                <button onClick={() => setShowProfileModal(true)} className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white border-2 border-purple-400 shadow-lg active:scale-95 transition-transform">
                   {currentUser?.name.charAt(0).toUpperCase()}
                </button>
             </div>
         </div>
         
         <div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-3xl mx-auto">
             {/* Question Card */}
             <div className="w-full bg-[#000040] border-4 border-blue-600 rounded-xl p-6 md:p-8 shadow-[0_0_30px_rgba(37,99,235,0.4)] relative mb-6 min-h-[160px] flex items-center justify-center">
                {/* Timer Badge Overlapping */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 shadow-xl z-20 bg-[#000040] ${timeLeft <= 10 ? 'border-red-500 text-red-500 animate-pulse' : 'border-blue-500 text-white'}`}>
                      {timeLeft}
                    </div>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-relaxed text-center">{currentQ.text}</h2>
             </div>

             {/* Options Grid */}
             <div className="grid grid-cols-1 gap-3 w-full mb-8">
                {currentQ.options.map((opt, idx) => {
                   if (hiddenOptions.includes(idx)) {
                     return <div key={idx} className="h-14 md:h-16"></div>; // Placeholder
                   }
                   
                   let extraClass = "";
                   
                   if (selectedAnswerIndex === idx) {
                      if (answerState === AnswerState.SELECTED) extraClass = "bg-yellow-600 border-yellow-400 text-black";
                      else if (answerState === AnswerState.CORRECT) extraClass = "bg-green-600 border-green-400 animate-pulse";
                      else if (answerState === AnswerState.WRONG) extraClass = "bg-red-600 border-red-400";
                   } else if (answerState !== AnswerState.IDLE && idx === currentQ.correctAnswerIndex && answerState !== AnswerState.SELECTED) {
                      if (answerState === AnswerState.WRONG) extraClass = "bg-green-600 border-green-400 opacity-80"; 
                   }

                   return (
                     <button
                       key={`${currentQuestionIndex}-${idx}`} // Unmount/Remount on question change
                       onClick={() => handleAnswerSelect(idx)}
                       disabled={answerState !== AnswerState.IDLE}
                       className={`
                         relative overflow-hidden group border-2 rounded-xl p-3 md:p-4 text-left transition-all duration-200 shadow-md active:scale-95 flex items-center
                         ${extraClass || "bg-slate-800/80 border-slate-600 hover:bg-blue-900/60 hover:border-blue-400 text-white focus:outline-none"}
                       `}
                     >
                       <span className="font-extrabold text-yellow-500 mr-3 text-lg">{['A','B','C','D'][idx]}:</span>
                       <span className="font-bold text-sm md:text-base">{opt}</span>
                     </button>
                   );
                })}
             </div>

             {/* Lifelines Bar */}
             <div className="flex gap-6 justify-center w-full mb-6">
                <button 
                  onClick={useFiftyFifty} 
                  disabled={!lifelines.fiftyFifty || answerState !== AnswerState.IDLE} 
                  className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${!lifelines.fiftyFifty || answerState !== AnswerState.IDLE ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:-translate-y-1'}`}
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-purple-600 border-2 border-purple-400 flex items-center justify-center font-bold text-white text-sm shadow-lg">50:50</div>
                  <span className="text-xs text-purple-300 font-bold tracking-wide">{t.lifeline5050}</span>
                </button>
                <button 
                   onClick={useAskAudience} 
                   disabled={!lifelines.askAudience || answerState !== AnswerState.IDLE}
                   className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${!lifelines.askAudience || answerState !== AnswerState.IDLE ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:-translate-y-1'}`}
                >
                   <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyan-600 border-2 border-cyan-400 flex items-center justify-center text-white shadow-lg"><Users size={32} /></div>
                   <span className="text-xs text-cyan-300 font-bold tracking-wide">{t.lifelineAudience}</span>
                </button>
                <button 
                   onClick={useAskAI} 
                   disabled={!lifelines.askAI || answerState !== AnswerState.IDLE || aiLoading}
                   className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${!lifelines.askAI || answerState !== AnswerState.IDLE ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:-translate-y-1'}`}
                >
                   <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-600 border-2 border-emerald-400 flex items-center justify-center text-white shadow-lg relative">
                      {aiLoading ? <div className="animate-spin h-6 w-6 border-2 border-white rounded-full border-t-transparent"></div> : <BrainCircuit size={32} />}
                   </div>
                   <span className="text-xs text-emerald-300 font-bold tracking-wide">{t.lifelineAI}</span>
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
                  <button onClick={() => { setAiHint(null); setIsTimerPaused(false); }} className="absolute top-3 right-3 text-slate-400 hover:text-white"><X size={20}/></button>
                  <div className="flex items-center gap-3 mb-4 text-emerald-400 border-b border-emerald-500/30 pb-3">
                     <BrainCircuit size={32} />
                     <h3 className="text-xl font-black">{t.aiSays}</h3>
                  </div>
                  <p className="text-white text-lg leading-relaxed italic font-medium">"{aiHint}"</p>
                  <Button onClick={() => { setAiHint(null); setIsTimerPaused(false); }} fullWidth className="mt-6 bg-emerald-700 hover:bg-emerald-600 border-emerald-500">{t.thanks}</Button>
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
            <h2 className="text-2xl font-black text-white">{t.profile}</h2>
            <button onClick={() => setGameStatus(GameStatus.TOPIC_SELECTION)} className="text-slate-400 hover:text-white"><X size={24}/></button>
         </div>
         {currentUser && (
           <form onSubmit={handleProfileUpdate} className="space-y-4">
               <div>
                  <label className="text-blue-300 text-xs uppercase font-bold ml-1 mb-1 block">{t.usernameImmutable}</label>
                  <input type="text" value={currentUser.username} disabled className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-slate-400 cursor-not-allowed font-medium" />
               </div>
               <div>
                  <label className="text-blue-300 text-xs uppercase font-bold ml-1 mb-1 block">{t.nameSurname}</label>
                  <input type="text" value={editProfileForm.name || currentUser.name} onChange={e => setEditProfileForm({...editProfileForm, name: e.target.value})} className="w-full bg-slate-800/80 border border-blue-500/30 rounded-lg p-3 text-white focus:border-blue-400 outline-none transition-colors font-medium" />
               </div>
               <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-blue-300 text-xs uppercase font-bold ml-1 mb-1 block">{t.age}</label>
                    <input type="number" value={editProfileForm.age || currentUser.age} onChange={e => setEditProfileForm({...editProfileForm, age: e.target.value})} className="w-full bg-slate-800/80 border border-blue-500/30 rounded-lg p-3 text-white focus:border-blue-400 outline-none transition-colors font-medium" />
                  </div>
                  <div className="flex-1">
                    <label className="text-blue-300 text-xs uppercase font-bold ml-1 mb-1 block">{t.gender}</label>
                    <select value={editProfileForm.gender || currentUser.gender} onChange={e => setEditProfileForm({...editProfileForm, gender: e.target.value as any})} className="w-full bg-slate-800/80 border border-blue-500/30 rounded-lg p-3 text-white focus:border-blue-400 outline-none transition-colors font-medium">
                      <option value="Kişi">{t.male}</option>
                      <option value="Qadın">{t.female}</option>
                    </select>
                  </div>
               </div>
               <div className="pt-2">
                 <div className="flex justify-between text-sm text-slate-400 mb-2 font-medium"><span>{t.totalPoints}:</span> <span className="text-yellow-500 font-bold">{currentUser.totalPoints}</span></div>
                 <div className="flex justify-between text-sm text-slate-400 font-medium"><span>{t.gamesPlayed}:</span> <span className="text-white font-bold">{currentUser.gamesPlayed}</span></div>
               </div>
               <Button type="submit" fullWidth className="mt-4">{profileSaveStatus === 'saved' ? t.saved : t.save}</Button>
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
           
           <h1 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-lg uppercase tracking-wider">{isWin ? t.congrats : t.youLost}</h1>
           <p className={`text-lg md:text-xl font-bold mb-8 ${isWin ? 'text-green-200' : 'text-red-200'}`}>
             {isWin 
               ? t.amazingWin 
               : lossReason === 'timeout' 
                  ? t.timeUp 
                  : t.wrongAnswer}
           </p>
           
           <div className="bg-black/30 rounded-xl p-4 mb-8 border border-white/10">
              <div className="text-slate-300 text-sm uppercase tracking-widest mb-1 font-bold">{t.scoreEarned}</div>
              <div className="text-4xl font-black text-yellow-400 font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {(isWin ? questions.length : currentQuestionIndex) * 50}
              </div>
           </div>
           
           <div className="flex flex-col gap-3">
              <Button onClick={() => setGameStatus(GameStatus.TOPIC_SELECTION)} fullWidth className={`${isWin ? 'bg-green-700 hover:bg-green-600' : 'bg-red-700 hover:bg-red-600'} border-white/30`}>{t.chooseOtherTopic}</Button>
              <Button onClick={() => setGameStatus(GameStatus.LEADERBOARD)} variant="secondary" fullWidth>{t.leaderboardTitle}</Button>
           </div>
        </div>
        {/* AdSense Game Over Screen */}
        <AdSenseBanner dataAdSlot="1234567890" dataAdFormat="rectangle" />
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
         {showProfileModal && renderProfileModal()}
         {showPrivacyModal && renderPrivacyModal()}
         {showAboutModal && renderAboutModal()}
      </div>
    </div>
  );
};

export default App;
