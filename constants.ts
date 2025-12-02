
import { Question, Topic, TopicInfo } from './types';
import { Globe, BookOpen, Palette, Moon, Rocket, Clapperboard, Cpu, Dumbbell } from 'lucide-react';

export const TOPICS: TopicInfo[] = [
  { 
    id: 'COGRAFIYA', 
    label: { az: 'Coğrafiya', en: 'Geography' }, 
    icon: 'Globe', 
    description: { az: 'Dünya ölkələri, paytaxtlar və təbiət', en: 'Countries, capitals, and nature' }, 
    color: 'blue' 
  },
  { 
    id: 'TARIX', 
    label: { az: 'Tarix', en: 'History' }, 
    icon: 'BookOpen', 
    description: { az: 'Azərbaycan və Dünya tarixi, hadisələr', en: 'World and local history, events' }, 
    color: 'amber' 
  },
  { 
    id: 'INCESENET', 
    label: { az: 'İncəsənət', en: 'Art' }, 
    icon: 'Palette', 
    description: { az: 'Rəsm, Musiqi, Ədəbiyyat və Memarlıq', en: 'Painting, Music, Literature, Architecture' }, 
    color: 'fuchsia' 
  },
  { 
    id: 'DIN', 
    label: { az: 'Din', en: 'Religion' }, 
    icon: 'Moon', 
    description: { az: 'İslam tarixi, Peyğəmbərlər və inanclar', en: 'Islamic history, Prophets, and beliefs' }, 
    color: 'emerald' 
  },
  { 
    id: 'FANTASTIK', 
    label: { az: 'Fantastik', en: 'Sci-Fi' }, 
    icon: 'Rocket', 
    description: { az: 'Elmi-fantastika, kosmos və gələcək', en: 'Sci-fi, space, and the future' }, 
    color: 'violet' 
  },
  { 
    id: 'FILM', 
    label: { az: 'Film', en: 'Movies' }, 
    icon: 'Clapperboard', 
    description: { az: 'Kino, aktyorlar və məşhur sitatlar', en: 'Cinema, actors, and famous quotes' }, 
    color: 'rose' 
  },
  { 
    id: 'TEXNOLOGIYA', 
    label: { az: 'Texnologiya', en: 'Technology' }, 
    icon: 'Cpu', 
    description: { az: 'Kompüterlər, İxtiralar və İT', en: 'Computers, Inventions, and IT' }, 
    color: 'cyan' 
  },
  { 
    id: 'IDMAN', 
    label: { az: 'İdman', en: 'Sports' }, 
    icon: 'Dumbbell', 
    description: { az: 'Futbol, Olimpiada və İdman növləri', en: 'Football, Olympics, and Sports' }, 
    color: 'orange' 
  },
];

// Helper to create questions (Defaults to 'az' language)
const createQ = (text: string, options: string[], correct: number, lang: 'az' | 'en' = 'az'): Omit<Question, 'id' | 'prize'> => ({
  text,
  options,
  correctAnswerIndex: correct,
  language: lang
});

// --- QUESTION DATABASE BY TOPIC ---
// Keeping existing questions, explicitly marking them as 'az' in the helper or leaving as default.
const DB: Record<string, { easy: any[], medium: any[], hard: any[] }> = {
  COGRAFIYA: {
    easy: [
      createQ("Azərbaycanın paytaxtı hansı şəhərdir?", ["Gəncə", "Bakı", "Sumqayıt", "Mingəçevir"], 1),
      createQ("Dünyanın ən böyük okeanı hansıdır?", ["Atlantik okeanı", "Hind okeanı", "Sakit okean", "Şimal Buzlu okeanı"], 2),
      createQ("Azərbaycanın ən uzun çayı hansıdır?", ["Kür", "Araz", "Qabırri", "Samur"], 0),
      createQ("Avropa qitəsinin ən hündür dağı hansıdır?", ["Montblan", "Elbrus", "Matterhorn", "Mont Blanc"], 1),
      createQ("Xəzər dənizi hansı qitələr arasında yerləşir?", ["Asiya və Afrika", "Avropa və Asiya", "Avropa və Afrika", "Asiya və Avstraliya"], 1),
    ],
    medium: [
      createQ("Azərbaycanın ən şimal nöqtəsi hansı rayondadır?", ["Qusar", "Xaçmaz", "Quba", "Siyəzən"], 0),
      createQ("Böyük Qafqaz dağ silsiləsi hansı istiqamətdədir?", ["Şimal-cənub", "Şərq-qərb", "Şimal-qərb - cənub-şərq", "Şimal-şərq - cənub-qərb"], 2),
      createQ("Himalay dağları hansı ölkələrdə yerləşir?", ["Çin və Hindistan", "Nepal, Hindistan, Çin", "Pakistan və Hindistan", "Nepal və Çin"], 1),
    ],
    hard: [
      createQ("Azərbaycanın ən qərb nöqtəsi hansı rayondadır?", ["Qazax", "Ağstafa", "Tovuz", "Kəlbəcər"], 3),
      createQ("Bazardüzü zirvəsinin hündürlüyü neçə metrdir?", ["4446", "4466", "4656", "4736"], 2),
      createQ("Murovdağ dağ silsiləsi hansı dağ sisteminin tərkibindədir?", ["Böyük Qafqaz", "Kiçik Qafqaz", "Talış dağları", "Naxçıvan dağları"], 1),
    ]
  },
  DIN: {
    easy: [
      createQ("İslamda müqəddəs kitab hansıdır?", ["Tövrat", "Quran", "İncil", "Zəbur"], 1),
      createQ("Müsəlmanların qibləsi hansı şəhərdədir?", ["Mədinə", "Qüds", "Məkkə", "Bağdad"], 2),
      createQ("İslam dininə görə peyğəmbərlərin sonuncusu kimdir?", ["İsa", "Musa", "İbrahim", "Məhəmməd"], 3),
    ],
    medium: [
      createQ("Qurani-Kərimin neçə surəsi var?", ["100", "110", "114", "120"], 2),
      createQ("İslamda ilk xəlifə kim olmuşdur?", ["Əli", "Əbu Bəkir", "Ömər", "Osman"], 1),
      createQ("Qədir gecəsi hansı ayın hansı gecəsidir?", ["Ramazanın 21-ci gecəsi", "Ramazanın 23-cü gecəsi", "Ramazanın 25-ci gecəsi", "Ramazanın 27-ci gecəsi"], 3),
    ],
    hard: [
      createQ("\"Əl-Buhari\" kimdir?", ["Xəlifə", "Məşhur hədis alimi", "Filosof", "Şair"], 1),
      createQ("Qurani-Kərimin ilk nazil olan ayələri hansı surədəndir?", ["Fatiha", "Ələk", "Qələm", "Müddəssir"], 1),
      createQ("İslam hüququnun dörd əsas mənbəyi hansılardır?", ["Quran, Hədis, İcma, Qiyas", "Quran, Hədis, Rəy, İcma", "Quran, Sünni, İcma, İctihad", "Quran, Hədis, Fiqh, İcma"], 0),
    ]
  },
  TARIX: {
    easy: [
      createQ("Azərbaycan Xalq Cümhuriyyəti hansı ildə yaradılmışdır?", ["1917", "1918", "1919", "1920"], 1),
      createQ("Birinci Dünya Müharibəsi hansı illərdə baş vermişdir?", ["1912-1916", "1914-1918", "1916-1920", "1918-1922"], 1),
      createQ("Azərbaycanın milli liderinə hansı ünvan verilib?", ["Əbdürrəhim bəy Haqverdiyev", "Məmməd Əmin Rəsulzadə", "Heydər Əliyev", "Nəriman Nərimanov"], 2),
    ],
    medium: [
      createQ("Azərbaycan Xalq Cümhuriyyətinin ilk baş naziri kim olmuşdur?", ["Məmməd Əmin Rəsulzadə", "Fətəli xan Xoyski", "Nəsib bəy Yusifbəyli", "Əlimərdan bəy Topçubaşov"], 1),
      createQ("Neftçilər günü Azərbaycanda nə vaxt qeyd edilir?", ["19 Sentyabr", "20 Sentyabr", "21 Sentyabr", "22 Sentyabr"], 1),
      createQ("Nizami Gəncəvi hansı əsrdə yaşamışdır?", ["X əsr", "XI əsr", "XII əsr", "XIII əsr"], 2),
    ],
    hard: [
      createQ("Azərbaycan Xalq Cümhuriyyətində qadınlara seçki hüququ nə vaxt verilmişdir?", ["1918", "1919", "1920", "Heç vaxt"], 0),
      createQ("Manna dövləti hansı dövrdə mövcud olmuşdur?", ["E.ə. XII-VII əsrlər", "E.ə. X-VI əsrlər", "E.ə. IX-VII əsrlər", "E.ə. VIII-V əsrlər"], 2),
      createQ("Əlincə qalası hansı xanlıqda yerləşirdi?", ["Qarabağ xanlığı", "İrəvan xanlığı", "Naxçıvan xanlığı", "Gəncə xanlığı"], 1),
    ]
  },
  FANTASTIK: {
    easy: [
      createQ("\"Harry Potter\" seriyasının müəllifi kimdir?", ["J.R.R. Tolkien", "J.K. Rowling", "George R.R. Martin", "C.S. Lewis"], 1),
      createQ("\"Üzüklərin Hökmdarı\" əsərinin müəllifi kimdir?", ["J.K. Rowling", "C.S. Lewis", "J.R.R. Tolkien", "George R.R. Martin"], 2),
      createQ("Harry Potter hansı evdə oxuyurdu?", ["Slytherin", "Ravenclaw", "Hufflepuff", "Gryffindor"], 3),
    ],
    medium: [
      createQ("\"The Hobbit\" və \"Üzüklərin Hökmdarı\" hansı kainatda cərəyan edir?", ["Narnia", "Middle-earth (Orta Dünya)", "Westeros", "Azeroth"], 1),
      createQ("Harry Potter-in valideynləri necə ölmüşlər?", ["Qəzada", "Xəstəlikdən", "Voldemort tərəfindən öldürülüblər", "Qocalıqdan"], 2),
      createQ("\"Foundation\" (Bünövrə) seriyasının müəllifi kimdir?", ["Arthur C. Clarke", "Isaac Asimov", "Robert Heinlein", "Philip K. Dick"], 1),
    ],
    hard: [
      createQ("\"Neuromancer\" əsərinin müəllifi kimdir?", ["William Gibson", "Neal Stephenson", "Bruce Sterling", "Philip K. Dick"], 0),
      createQ("Tolkien-in Middle-earth əfsanəsində Valar neçə nəfərdir?", ["12", "14", "15", "17"], 2),
      createQ("\"Hyperion Cantos\" seriyasının müəllifi kimdir?", ["Iain M. Banks", "Dan Simmons", "Alastair Reynolds", "Peter F. Hamilton"], 1),
    ]
  },
  INCESENET: {
    easy: [
      createQ("\"Mona Lisa\" əsərinin müəllifi kimdir?", ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"], 1),
      createQ("Azərbaycanın milli rəssamı kimdir?", ["Sattar Bəhlulzadə", "Mir Mövsüm Nəvvab", "Tahir Salahov", "Tofiq Bəhramov"], 0),
      createQ("\"Leyli və Məcnun\" operasının bəstəkarı kimdir?", ["Qara Qarayev", "Fikrət Əmirov", "Üzeyir Hacıbəyov", "Niyazi"], 2),
    ],
    medium: [
      createQ("\"Gülüstan\" operasının bəstəkarı kimdir?", ["Üzeyir Hacıbəyov", "Fikrət Əmirov", "Qara Qarayev", "Niyazi"], 2),
      createQ("Michelangelo-nun Sikstin kapellasındakı freska əsəri nə vaxt tamamlanmışdır?", ["1508-1512", "1512-1516", "1516-1520", "1520-1524"], 0),
      createQ("\"Sənsiz\" mahnısının müəllifi kimdir?", ["Rəşid Behbudov", "Müslüm Maqomayev", "Polad Bülbüloğlu", "Bülbül"], 1),
    ],
    hard: [
      createQ("\"Doktor Faustus\" kantatasının bəstəkarı kimdir?", ["Igor Stravinski", "Arnold Schönberg", "Alban Berg", "Anton Webern"], 1),
      createQ("Hieronymus Bosch hansı əsrdə yaşamışdır?", ["XIV əsr", "XV əsr", "XV-XVI əsr", "XVI əsr"], 2),
      createQ("\"Qarabağ şikəstəsi\" əsərinin müəllifi kimdir?", ["Qara Qarayev", "Fikrət Əmirov", "Üzeyir Hacıbəyov", "Niyazi"], 2),
    ]
  },
  FILM: {
    easy: [
      createQ("\"Titanic\" filminin rejissoru kimdir?", ["Steven Spielberg", "James Cameron", "Martin Scorsese", "Christopher Nolan"], 1),
      createQ("\"Arşın mal alan\" filmi hansı ildə çəkilmişdir?", ["1945", "1955", "1965", "1975"], 2),
      createQ("\"Godfather\" (Xaç ata) filminin rejissoru kimdir?", ["Martin Scorsese", "Francis Ford Coppola", "Brian De Palma", "Sidney Lumet"], 1),
    ],
    medium: [
      createQ("\"Pulp Fiction\" filminin rejissoru kimdir?", ["Quentin Tarantino", "Martin Scorsese", "Guy Ritchie", "David Fincher"], 0),
      createQ("\"Inception\" filmi hansı ildə ekranlara çıxıb?", ["2008", "2010", "2012", "2014"], 1),
      createQ("Oskar mükafatı hansı ildən verilməyə başlanıb?", ["1927", "1929", "1932", "1935"], 1),
    ],
    hard: [
      createQ("\"Citizen Kane\" filminin rejissoru kimdir?", ["Orson Welles", "Alfred Hitchcock", "Stanley Kubrick", "Billy Wilder"], 0),
      createQ("İlk rəngli film texnologiyası necə adlanırdı?", ["Technicolor", "Kodakcolor", "Cinemacolor", "Polycolor"], 0),
      createQ("Tarkovskinin \"Stalker\" filmi hansı ilin istehsalıdır?", ["1972", "1979", "1983", "1986"], 1),
    ]
  },
  TEXNOLOGIYA: {
    easy: [
      createQ("İlk kompüter siçanını kim ixtira edib?", ["Steve Jobs", "Douglas Engelbart", "Bill Gates", "Tim Berners-Lee"], 1),
      createQ("iPhone ilk dəfə neçənci ildə təqdim olunub?", ["2005", "2007", "2008", "2010"], 1),
      createQ("WWW nəyin qısaltmasıdır?", ["World Wide Web", "World Web Wibe", "Wide World Web", "Web World Wide"], 0),
    ],
    medium: [
      createQ("Proqramlaşdırma dillərindən hansı daha qədimdir?", ["Python", "Java", "C", "Fortran"], 3),
      createQ("Linux əməliyyat sisteminin yaradıcısı kimdir?", ["Linus Torvalds", "Steve Wozniak", "Dennis Ritchie", "Ken Thompson"], 0),
      createQ("Wi-Fi texnologiyası neçənci ildə standartlaşdırılıb?", ["1995", "1997", "1999", "2001"], 1),
    ],
    hard: [
      createQ("Bitcoin-in yaradıcısı kimdir (ləqəb)?", ["Satoshi Nakamoto", "Vitalik Buterin", "Charlie Lee", "Nick Szabo"], 0),
      createQ("İlk mikroprosessor hansı şirkət tərəfindən istehsal olunub?", ["AMD", "Intel", "IBM", "Motorola"], 1),
      createQ("Turing testini kim təklif edib?", ["Alan Turing", "John von Neumann", "Ada Lovelace", "Grace Hopper"], 0),
    ]
  },
  IDMAN: {
    easy: [
      createQ("Futbol oyununda neçə oyunçu olur (bir komandada)?", ["9", "10", "11", "12"], 2),
      createQ("Olimpiya oyunları neçə ildən bir keçirilir?", ["2", "3", "4", "5"], 2),
      createQ("Basketbolda bir atış maksimum neçə xal gətirir?", ["2", "3", "4", "5"], 1),
    ],
    medium: [
      createQ("İlk dünya futbol çempionatı hansı ildə keçirilib?", ["1926", "1930", "1934", "1938"], 1),
      createQ("Tennisdə \"Böyük Dəbilqə\" turnirləri neçə dənədir?", ["3", "4", "5", "6"], 1),
      createQ("Boks rinqinin tərəfləri neçə metrdir (standart)?", ["5-6 m", "4.9-6.1 m", "6-7 m", "7-8 m"], 1),
    ],
    hard: [
      createQ("Müasir Olimpiya oyunlarının banisi kimdir?", ["Pierre de Coubertin", "Juan Antonio Samaranch", "Thomas Bach", "Avery Brundage"], 0),
      createQ("Futbolda \"Qızıl top\" mükafatını ən çox kim qazanıb?", ["Cristiano Ronaldo", "Lionel Messi", "Michel Platini", "Johan Cruyff"], 1),
      createQ("Formula 1 yarışları ilk dəfə hansı ildə keçirilib?", ["1948", "1950", "1952", "1954"], 1),
    ]
  }
};

// Returns questions filtered by language
export const getQuestionsByTopic = (topicId: string, seenQuestions: string[], lang: 'az' | 'en' = 'az'): Question[] => {
  const topicData = DB[topicId];
  if (!topicData) return [];
  
  const allLevels = [
    ...topicData.easy,
    ...topicData.medium,
    ...topicData.hard
  ];

  // 1. Filter by language (Default to 'az' if undefined in DB object, as existing ones are AZ)
  // 2. Filter out seen questions
  return allLevels.filter(q => {
     const qLang = q.language || 'az'; // Default to AZ for existing data
     return qLang === lang && !seenQuestions.includes(q.text);
  });
};
