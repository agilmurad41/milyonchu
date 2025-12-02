
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
      // EN
      createQ("What is the capital of Azerbaijan?", ["Ganja", "Baku", "Sumgayit", "Mingachevir"], 1, 'en'),
      createQ("Which is the largest ocean in the world?", ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"], 2, 'en'),
      createQ("What is the longest river in Azerbaijan?", ["Kura", "Araz", "Qabirri", "Samur"], 0, 'en'),
      createQ("What is the highest mountain in Europe?", ["Mont Blanc", "Elbrus", "Matterhorn", "Olympus"], 1, 'en'),
      createQ("Between which continents is the Caspian Sea located?", ["Asia and Africa", "Europe and Asia", "Europe and Africa", "Asia and Australia"], 1, 'en'),
    ],
    medium: [
      createQ("Azərbaycanın ən şimal nöqtəsi hansı rayondadır?", ["Qusar", "Xaçmaz", "Quba", "Siyəzən"], 0),
      createQ("Böyük Qafqaz dağ silsiləsi hansı istiqamətdədir?", ["Şimal-cənub", "Şərq-qərb", "Şimal-qərb - cənub-şərq", "Şimal-şərq - cənub-qərb"], 2),
      createQ("Himalay dağları hansı ölkələrdə yerləşir?", ["Çin və Hindistan", "Nepal, Hindistan, Çin", "Pakistan və Hindistan", "Nepal və Çin"], 1),
      // EN
      createQ("In which district is the northernmost point of Azerbaijan?", ["Qusar", "Khachmaz", "Quba", "Siyezen"], 0, 'en'),
      createQ("In which direction does the Greater Caucasus mountain range extend?", ["North-South", "East-West", "Northwest - Southeast", "Northeast - Southwest"], 2, 'en'),
      createQ("The Himalayas are located in which countries?", ["China and India", "Nepal, India, China", "Pakistan and India", "Nepal and China"], 1, 'en'),
    ],
    hard: [
      createQ("Azərbaycanın ən qərb nöqtəsi hansı rayondadır?", ["Qazax", "Ağstafa", "Tovuz", "Kəlbəcər"], 3),
      createQ("Bazardüzü zirvəsinin hündürlüyü neçə metrdir?", ["4446", "4466", "4656", "4736"], 2),
      createQ("Murovdağ dağ silsiləsi hansı dağ sisteminin tərkibindədir?", ["Böyük Qafqaz", "Kiçik Qafqaz", "Talış dağları", "Naxçıvan dağları"], 1),
      // EN
      createQ("In which district is the westernmost point of Azerbaijan?", ["Qazakh", "Agstafa", "Tovuz", "Kalbajar"], 3, 'en'),
      createQ("What is the height of Mount Bazarduzu?", ["4446 m", "4466 m", "4466 m", "4736 m"], 2, 'en'),
      createQ("Which mountain system does Murovdag belong to?", ["Greater Caucasus", "Lesser Caucasus", "Talysh Mountains", "Nakhchivan Mountains"], 1, 'en'),
    ]
  },
  DIN: {
    easy: [
      createQ("İslamda müqəddəs kitab hansıdır?", ["Tövrat", "Quran", "İncil", "Zəbur"], 1),
      createQ("Müsəlmanların qibləsi hansı şəhərdədir?", ["Mədinə", "Qüds", "Məkkə", "Bağdad"], 2),
      createQ("İslam dininə görə peyğəmbərlərin sonuncusu kimdir?", ["İsa", "Musa", "İbrahim", "Məhəmməd"], 3),
      // EN
      createQ("What is the holy book in Islam?", ["Torah", "Quran", "Bible", "Psalms"], 1, 'en'),
      createQ("In which city is the Qibla located?", ["Medina", "Jerusalem", "Mecca", "Baghdad"], 2, 'en'),
      createQ("Who is the last prophet in Islam?", ["Jesus", "Moses", "Abraham", "Muhammad"], 3, 'en'),
    ],
    medium: [
      createQ("Qurani-Kərimin neçə surəsi var?", ["100", "110", "114", "120"], 2),
      createQ("İslamda ilk xəlifə kim olmuşdur?", ["Əli", "Əbu Bəkir", "Ömər", "Osman"], 1),
      createQ("Qədir gecəsi hansı ayın hansı gecəsidir?", ["Ramazanın 21-ci gecəsi", "Ramazanın 23-cü gecəsi", "Ramazanın 25-ci gecəsi", "Ramazanın 27-ci gecəsi"], 3),
      // EN
      createQ("How many Surahs are there in the Quran?", ["100", "110", "114", "120"], 2, 'en'),
      createQ("Who was the first Caliph in Islam?", ["Ali", "Abu Bakr", "Umar", "Uthman"], 1, 'en'),
      createQ("When is the Night of Power (Laylat al-Qadr)?", ["21st of Ramadan", "23rd of Ramadan", "25th of Ramadan", "27th of Ramadan"], 3, 'en'),
    ],
    hard: [
      createQ("\"Əl-Buhari\" kimdir?", ["Xəlifə", "Məşhur hədis alimi", "Filosof", "Şair"], 1),
      createQ("Qurani-Kərimin ilk nazil olan ayələri hansı surədəndir?", ["Fatiha", "Ələk", "Qələm", "Müddəssir"], 1),
      createQ("İslam hüququnun dörd əsas mənbəyi hansılardır?", ["Quran, Hədis, İcma, Qiyas", "Quran, Hədis, Rəy, İcma", "Quran, Sünni, İcma, İctihad", "Quran, Hədis, Fiqh, İcma"], 0),
      // EN
      createQ("Who is Al-Bukhari?", ["Caliph", "Famous Hadith scholar", "Philosopher", "Poet"], 1, 'en'),
      createQ("Which Surah contains the first revealed verses of the Quran?", ["Fatiha", "Al-Alaq", "Al-Qalam", "Al-Muddathir"], 1, 'en'),
      createQ("What are the four main sources of Islamic law?", ["Quran, Hadith, Ijma, Qiyas", "Quran, Hadith, Rai, Ijma", "Quran, Sunnah, Ijma, Ijtihad", "Quran, Hadith, Fiqh, Ijma"], 0, 'en'),
    ]
  },
  TARIX: {
    easy: [
      createQ("Azərbaycan Xalq Cümhuriyyəti hansı ildə yaradılmışdır?", ["1917", "1918", "1919", "1920"], 1),
      createQ("Birinci Dünya Müharibəsi hansı illərdə baş vermişdir?", ["1912-1916", "1914-1918", "1916-1920", "1918-1922"], 1),
      createQ("Azərbaycanın milli liderinə hansı ünvan verilib?", ["Əbdürrəhim bəy Haqverdiyev", "Məmməd Əmin Rəsulzadə", "Heydər Əliyev", "Nəriman Nərimanov"], 2),
      // EN
      createQ("In which year was the Azerbaijan Democratic Republic founded?", ["1917", "1918", "1919", "1920"], 1, 'en'),
      createQ("When did World War I take place?", ["1912-1916", "1914-1918", "1916-1920", "1918-1922"], 1, 'en'),
      createQ("Who is considered the National Leader of Azerbaijan?", ["Abdurrahim bey Hagverdiyev", "Mammad Amin Rasulzadeh", "Heydar Aliyev", "Nariman Narimanov"], 2, 'en'),
    ],
    medium: [
      createQ("Azərbaycan Xalq Cümhuriyyətinin ilk baş naziri kim olmuşdur?", ["Məmməd Əmin Rəsulzadə", "Fətəli xan Xoyski", "Nəsib bəy Yusifbəyli", "Əlimərdan bəy Topçubaşov"], 1),
      createQ("Neftçilər günü Azərbaycanda nə vaxt qeyd edilir?", ["19 Sentyabr", "20 Sentyabr", "21 Sentyabr", "22 Sentyabr"], 1),
      createQ("Nizami Gəncəvi hansı əsrdə yaşamışdır?", ["X əsr", "XI əsr", "XII əsr", "XIII əsr"], 2),
      // EN
      createQ("Who was the first Prime Minister of the Azerbaijan Democratic Republic?", ["Mammad Amin Rasulzadeh", "Fatali Khan Khoyski", "Nasib bey Yusifbeyli", "Alimardan bey Topchubashov"], 1, 'en'),
      createQ("When is Oil Workers' Day celebrated in Azerbaijan?", ["September 19", "September 20", "September 21", "September 22"], 1, 'en'),
      createQ("In which century did Nizami Ganjavi live?", ["10th", "11th", "12th", "13th"], 2, 'en'),
    ],
    hard: [
      createQ("Azərbaycan Xalq Cümhuriyyətində qadınlara seçki hüququ nə vaxt verilmişdir?", ["1918", "1919", "1920", "Heç vaxt"], 0),
      createQ("Manna dövləti hansı dövrdə mövcud olmuşdur?", ["E.ə. XII-VII əsrlər", "E.ə. X-VI əsrlər", "E.ə. IX-VII əsrlər", "E.ə. VIII-V əsrlər"], 2),
      createQ("Əlincə qalası hansı xanlıqda yerləşirdi?", ["Qarabağ xanlığı", "İrəvan xanlığı", "Naxçıvan xanlığı", "Gəncə xanlığı"], 1),
      // EN
      createQ("When were women granted the right to vote in the Azerbaijan Democratic Republic?", ["1918", "1919", "1920", "Never"], 0, 'en'),
      createQ("In which period did the Manna state exist?", ["XII-VII BC", "X-VI BC", "IX-VII BC", "VIII-V BC"], 2, 'en'),
      createQ("In which khanate was the Alinja fortress located?", ["Karabakh Khanate", "Nakhchivan Khanate", "Erivan Khanate", "Ganja Khanate"], 1, 'en'),
    ]
  },
  FANTASTIK: {
    easy: [
      createQ("\"Harry Potter\" seriyasının müəllifi kimdir?", ["J.R.R. Tolkien", "J.K. Rowling", "George R.R. Martin", "C.S. Lewis"], 1),
      createQ("\"Üzüklərin Hökmdarı\" əsərinin müəllifi kimdir?", ["J.K. Rowling", "C.S. Lewis", "J.R.R. Tolkien", "George R.R. Martin"], 2),
      createQ("Harry Potter hansı evdə oxuyurdu?", ["Slytherin", "Ravenclaw", "Hufflepuff", "Gryffindor"], 3),
      // EN
      createQ("Who is the author of the 'Harry Potter' series?", ["J.R.R. Tolkien", "J.K. Rowling", "George R.R. Martin", "C.S. Lewis"], 1, 'en'),
      createQ("Who is the author of 'The Lord of the Rings'?", ["J.K. Rowling", "C.S. Lewis", "J.R.R. Tolkien", "George R.R. Martin"], 2, 'en'),
      createQ("Which house did Harry Potter belong to?", ["Slytherin", "Ravenclaw", "Hufflepuff", "Gryffindor"], 3, 'en'),
    ],
    medium: [
      createQ("\"The Hobbit\" və \"Üzüklərin Hökmdarı\" hansı kainatda cərəyan edir?", ["Narnia", "Middle-earth (Orta Dünya)", "Westeros", "Azeroth"], 1),
      createQ("Harry Potter-in valideynləri necə ölmüşlər?", ["Qəzada", "Xəstəlikdən", "Voldemort tərəfindən öldürülüblər", "Qocalıqdan"], 2),
      createQ("\"Foundation\" (Bünövrə) seriyasının müəllifi kimdir?", ["Arthur C. Clarke", "Isaac Asimov", "Robert Heinlein", "Philip K. Dick"], 1),
      // EN
      createQ("In which universe are 'The Hobbit' and 'The Lord of the Rings' set?", ["Narnia", "Middle-earth", "Westeros", "Azeroth"], 1, 'en'),
      createQ("How did Harry Potter's parents die?", ["Car accident", "Illness", "Killed by Voldemort", "Old age"], 2, 'en'),
      createQ("Who is the author of the 'Foundation' series?", ["Arthur C. Clarke", "Isaac Asimov", "Robert Heinlein", "Philip K. Dick"], 1, 'en'),
    ],
    hard: [
      createQ("\"Neuromancer\" əsərinin müəllifi kimdir?", ["William Gibson", "Neal Stephenson", "Bruce Sterling", "Philip K. Dick"], 0),
      createQ("Tolkien-in Middle-earth əfsanəsində Valar neçə nəfərdir?", ["12", "14", "15", "17"], 2),
      createQ("\"Hyperion Cantos\" seriyasının müəllifi kimdir?", ["Iain M. Banks", "Dan Simmons", "Alastair Reynolds", "Peter F. Hamilton"], 1),
      // EN
      createQ("Who is the author of 'Neuromancer'?", ["William Gibson", "Neal Stephenson", "Bruce Sterling", "Philip K. Dick"], 0, 'en'),
      createQ("How many Valar are there in Tolkien's legendarium?", ["12", "14", "15", "17"], 2, 'en'),
      createQ("Who is the author of the 'Hyperion Cantos'?", ["Iain M. Banks", "Dan Simmons", "Alastair Reynolds", "Peter F. Hamilton"], 1, 'en'),
    ]
  },
  INCESENET: {
    easy: [
      createQ("\"Mona Lisa\" əsərinin müəllifi kimdir?", ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"], 1),
      createQ("Azərbaycanın milli rəssamı kimdir?", ["Sattar Bəhlulzadə", "Mir Mövsüm Nəvvab", "Tahir Salahov", "Tofiq Bəhramov"], 0),
      createQ("\"Leyli və Məcnun\" operasının bəstəkarı kimdir?", ["Qara Qarayev", "Fikrət Əmirov", "Üzeyir Hacıbəyov", "Niyazi"], 2),
      // EN
      createQ("Who painted the 'Mona Lisa'?", ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"], 1, 'en'),
      createQ("Who is a famous People's Painter of Azerbaijan?", ["Sattar Bahlulzade", "Mir Mohsun Navvab", "Tahir Salahov", "Tofiq Bahramov"], 0, 'en'),
      createQ("Who composed the opera 'Leyli and Majnun'?", ["Gara Garayev", "Fikret Amirov", "Uzeyir Hajibeyov", "Niyazi"], 2, 'en'),
    ],
    medium: [
      createQ("\"Gülüstan\" operasının bəstəkarı kimdir?", ["Üzeyir Hacıbəyov", "Fikrət Əmirov", "Qara Qarayev", "Niyazi"], 2),
      createQ("Michelangelo-nun Sikstin kapellasındakı freska əsəri nə vaxt tamamlanmışdır?", ["1508-1512", "1512-1516", "1516-1520", "1520-1524"], 0),
      createQ("\"Sənsiz\" mahnısının müəllifi kimdir?", ["Rəşid Behbudov", "Müslüm Maqomayev", "Polad Bülbüloğlu", "Bülbül"], 1),
      // EN
      createQ("Who composed the symphonic poem 'Leyli and Majnun'?", ["Uzeyir Hajibeyov", "Fikret Amirov", "Gara Garayev", "Niyazi"], 2, 'en'),
      createQ("When was Michelangelo's Sistine Chapel ceiling completed?", ["1508-1512", "1512-1516", "1516-1520", "1520-1524"], 0, 'en'),
      createQ("Who composed the song 'Sansiz' (Without You)?", ["Rashid Behbudov", "Uzeyir Hajibeyov", "Polad Bulbuloglu", "Bulbul"], 1, 'en'),
    ],
    hard: [
      createQ("\"Doktor Faustus\" kantatasının bəstəkarı kimdir?", ["Igor Stravinski", "Arnold Schönberg", "Alban Berg", "Anton Webern"], 1),
      createQ("Hieronymus Bosch hansı əsrdə yaşamışdır?", ["XIV əsr", "XV əsr", "XV-XVI əsr", "XVI əsr"], 2),
      createQ("\"Qarabağ şikəstəsi\" əsərinin müəllifi kimdir?", ["Qara Qarayev", "Fikrət Əmirov", "Üzeyir Hacıbəyov", "Niyazi"], 2),
      // EN
      createQ("Who composed the 'Doctor Faustus' cantata?", ["Igor Stravinsky", "Alfred Schnittke", "Alban Berg", "Anton Webern"], 1, 'en'),
      createQ("In which century did Hieronymus Bosch live?", ["14th", "15th", "15th-16th", "16th"], 2, 'en'),
      createQ("Who is the composer of the symphonic mugam 'Karabakh Shikastasi'?", ["Gara Garayev", "Fikret Amirov", "Vasif Adigozalov", "Niyazi"], 2, 'en'),
    ]
  },
  FILM: {
    easy: [
      createQ("\"Titanic\" filminin rejissoru kimdir?", ["Steven Spielberg", "James Cameron", "Martin Scorsese", "Christopher Nolan"], 1),
      createQ("\"Arşın mal alan\" filmi hansı ildə çəkilmişdir?", ["1945", "1955", "1965", "1975"], 2),
      createQ("\"Godfather\" (Xaç ata) filminin rejissoru kimdir?", ["Martin Scorsese", "Francis Ford Coppola", "Brian De Palma", "Sidney Lumet"], 1),
      // EN
      createQ("Who directed the movie 'Titanic'?", ["Steven Spielberg", "James Cameron", "Martin Scorsese", "Christopher Nolan"], 1, 'en'),
      createQ("In which year was the famous version of 'Arshin Mal Alan' released?", ["1945", "1955", "1965", "1975"], 2, 'en'),
      createQ("Who directed 'The Godfather'?", ["Martin Scorsese", "Francis Ford Coppola", "Brian De Palma", "Sidney Lumet"], 1, 'en'),
    ],
    medium: [
      createQ("\"Pulp Fiction\" filminin rejissoru kimdir?", ["Quentin Tarantino", "Martin Scorsese", "Guy Ritchie", "David Fincher"], 0),
      createQ("\"Inception\" filmi hansı ildə ekranlara çıxıb?", ["2008", "2010", "2012", "2014"], 1),
      createQ("Oskar mükafatı hansı ildən verilməyə başlanıb?", ["1927", "1929", "1932", "1935"], 1),
      // EN
      createQ("Who directed 'Pulp Fiction'?", ["Quentin Tarantino", "Martin Scorsese", "Guy Ritchie", "David Fincher"], 0, 'en'),
      createQ("In which year was 'Inception' released?", ["2008", "2010", "2012", "2014"], 1, 'en'),
      createQ("When were the Academy Awards (Oscars) first presented?", ["1927", "1929", "1932", "1935"], 1, 'en'),
    ],
    hard: [
      createQ("\"Citizen Kane\" filminin rejissoru kimdir?", ["Orson Welles", "Alfred Hitchcock", "Stanley Kubrick", "Billy Wilder"], 0),
      createQ("İlk rəngli film texnologiyası necə adlanırdı?", ["Technicolor", "Kodakcolor", "Cinemacolor", "Polycolor"], 0),
      createQ("Tarkovskinin \"Stalker\" filmi hansı ilin istehsalıdır?", ["1972", "1979", "1983", "1986"], 1),
      // EN
      createQ("Who directed 'Citizen Kane'?", ["Orson Welles", "Alfred Hitchcock", "Stanley Kubrick", "Billy Wilder"], 0, 'en'),
      createQ("What was the first major color film process called?", ["Technicolor", "Kodakcolor", "Cinemacolor", "Polycolor"], 0, 'en'),
      createQ("When was Tarkovsky's 'Stalker' released?", ["1972", "1979", "1983", "1986"], 1, 'en'),
    ]
  },
  TEXNOLOGIYA: {
    easy: [
      createQ("İlk kompüter siçanını kim ixtira edib?", ["Steve Jobs", "Douglas Engelbart", "Bill Gates", "Tim Berners-Lee"], 1),
      createQ("iPhone ilk dəfə neçənci ildə təqdim olunub?", ["2005", "2007", "2008", "2010"], 1),
      createQ("WWW nəyin qısaltmasıdır?", ["World Wide Web", "World Web Wibe", "Wide World Web", "Web World Wide"], 0),
      // EN
      createQ("Who invented the first computer mouse?", ["Steve Jobs", "Douglas Engelbart", "Bill Gates", "Tim Berners-Lee"], 1, 'en'),
      createQ("In which year was the first iPhone released?", ["2005", "2007", "2008", "2010"], 1, 'en'),
      createQ("What does WWW stand for?", ["World Wide Web", "World Web Wibe", "Wide World Web", "Web World Wide"], 0, 'en'),
    ],
    medium: [
      createQ("Proqramlaşdırma dillərindən hansı daha qədimdir?", ["Python", "Java", "C", "Fortran"], 3),
      createQ("Linux əməliyyat sisteminin yaradıcısı kimdir?", ["Linus Torvalds", "Steve Wozniak", "Dennis Ritchie", "Ken Thompson"], 0),
      createQ("Wi-Fi texnologiyası neçənci ildə standartlaşdırılıb?", ["1995", "1997", "1999", "2001"], 1),
      // EN
      createQ("Which programming language is the oldest?", ["Python", "Java", "C", "Fortran"], 3, 'en'),
      createQ("Who created the Linux kernel?", ["Linus Torvalds", "Steve Wozniak", "Dennis Ritchie", "Ken Thompson"], 0, 'en'),
      createQ("When was the Wi-Fi standard first released?", ["1995", "1997", "1999", "2001"], 1, 'en'),
    ],
    hard: [
      createQ("Bitcoin-in yaradıcısı kimdir (ləqəb)?", ["Satoshi Nakamoto", "Vitalik Buterin", "Charlie Lee", "Nick Szabo"], 0),
      createQ("İlk mikroprosessor hansı şirkət tərəfindən istehsal olunub?", ["AMD", "Intel", "IBM", "Motorola"], 1),
      createQ("Turing testini kim təklif edib?", ["Alan Turing", "John von Neumann", "Ada Lovelace", "Grace Hopper"], 0),
      // EN
      createQ("Who is the creator of Bitcoin (pseudonym)?", ["Satoshi Nakamoto", "Vitalik Buterin", "Charlie Lee", "Nick Szabo"], 0, 'en'),
      createQ("Which company produced the first microprocessor?", ["AMD", "Intel", "IBM", "Motorola"], 1, 'en'),
      createQ("Who proposed the Turing Test?", ["Alan Turing", "John von Neumann", "Ada Lovelace", "Grace Hopper"], 0, 'en'),
    ]
  },
  IDMAN: {
    easy: [
      createQ("Futbol oyununda neçə oyunçu olur (bir komandada)?", ["9", "10", "11", "12"], 2),
      createQ("Olimpiya oyunları neçə ildən bir keçirilir?", ["2", "3", "4", "5"], 2),
      createQ("Basketbolda bir atış maksimum neçə xal gətirir?", ["2", "3", "4", "5"], 1),
      // EN
      createQ("How many players are on a football team?", ["9", "10", "11", "12"], 2, 'en'),
      createQ("How often are the Olympic Games held?", ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"], 2, 'en'),
      createQ("What is the maximum points for a single shot in basketball?", ["2", "3", "4", "5"], 1, 'en'),
    ],
    medium: [
      createQ("İlk dünya futbol çempionatı hansı ildə keçirilib?", ["1926", "1930", "1934", "1938"], 1),
      createQ("Tennisdə \"Böyük Dəbilqə\" turnirləri neçə dənədir?", ["3", "4", "5", "6"], 1),
      createQ("Boks rinqinin tərəfləri neçə metrdir (standart)?", ["5-6 m", "4.9-6.1 m", "6-7 m", "7-8 m"], 1),
      // EN
      createQ("In which year was the first FIFA World Cup held?", ["1926", "1930", "1934", "1938"], 1, 'en'),
      createQ("How many Grand Slam tournaments are there in tennis?", ["3", "4", "5", "6"], 1, 'en'),
      createQ("What is the standard size of a boxing ring side?", ["5-6 m", "4.9-6.1 m", "6-7 m", "7-8 m"], 1, 'en'),
    ],
    hard: [
      createQ("Müasir Olimpiya oyunlarının banisi kimdir?", ["Pierre de Coubertin", "Juan Antonio Samaranch", "Thomas Bach", "Avery Brundage"], 0),
      createQ("Futbolda \"Qızıl top\" mükafatını ən çox kim qazanıb?", ["Cristiano Ronaldo", "Lionel Messi", "Michel Platini", "Johan Cruyff"], 1),
      createQ("Formula 1 yarışları ilk dəfə hansı ildə keçirilib?", ["1948", "1950", "1952", "1954"], 1),
      // EN
      createQ("Who is the founder of the modern Olympic Games?", ["Pierre de Coubertin", "Juan Antonio Samaranch", "Thomas Bach", "Avery Brundage"], 0, 'en'),
      createQ("Who has won the most Ballon d'Or awards in football?", ["Cristiano Ronaldo", "Lionel Messi", "Michel Platini", "Johan Cruyff"], 1, 'en'),
      createQ("In which year was the first Formula 1 championship held?", ["1948", "1950", "1952", "1954"], 1, 'en'),
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
