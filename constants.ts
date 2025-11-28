
import { Question, Topic, TopicInfo } from './types';
import { Globe, BookOpen, Palette, Moon, Rocket, Clapperboard, Cpu, Dumbbell } from 'lucide-react';

export const TOPICS: TopicInfo[] = [
  { id: 'COGRAFIYA', label: 'Coğrafiya', icon: 'Globe', description: 'Dünya ölkələri, paytaxtlar və təbiət', color: 'blue' },
  { id: 'TARIX', label: 'Tarix', icon: 'BookOpen', description: 'Azərbaycan və Dünya tarixi, hadisələr', color: 'amber' },
  { id: 'INCESENET', label: 'İncəsənət', icon: 'Palette', description: 'Rəsm, Musiqi, Ədəbiyyat və Memarlıq', color: 'fuchsia' },
  { id: 'DIN', label: 'Din', icon: 'Moon', description: 'İslam tarixi, Peyğəmbərlər və inanclar', color: 'emerald' },
  { id: 'FANTASTIK', label: 'Fantastik', icon: 'Rocket', description: 'Elmi-fantastika, kosmos və gələcək', color: 'violet' },
  { id: 'FILM', label: 'Film', icon: 'Clapperboard', description: 'Kino, aktyorlar və məşhur sitatlar', color: 'rose' },
  { id: 'TEXNOLOGIYA', label: 'Texnologiya', icon: 'Cpu', description: 'Kompüterlər, İxtiralar və İT', color: 'cyan' },
  { id: 'IDMAN', label: 'İdman', icon: 'Dumbbell', description: 'Futbol, Olimpiada və İdman növləri', color: 'orange' },
];

// Helper to create questions
const createQ = (text: string, options: string[], correct: number): Omit<Question, 'id' | 'prize'> => ({
  text,
  options,
  correctAnswerIndex: correct,
});

// --- QUESTION DATABASE BY TOPIC ---
const DB: Record<string, { easy: any[], medium: any[], hard: any[] }> = {
  COGRAFIYA: {
    easy: [
      createQ("Azərbaycanın paytaxtı haradır?", ["Gəncə", "Bakı", "Sumqayıt", "Lənkəran"], 1),
      createQ("Dünyanın ən böyük okeanı hansıdır?", ["Sakit", "Atlantik", "Hind", "Şimal Buzlu"], 0),
      createQ("Türkiyənin paytaxtı hansı şəhərdir?", ["İstanbul", "İzmir", "Ankara", "Antalya"], 2),
      createQ("Günəş sisteminin ən böyük planeti hansıdır?", ["Mars", "Yer", "Yupiter", "Saturn"], 2),
      createQ("Afrika bir ___dir.", ["Ölkə", "Qitə", "Şəhər", "Ada"], 1),
      createQ("Eyfel qülləsi harada yerləşir?", ["London", "Berlin", "Paris", "Roma"], 2),
      createQ("Nil çayı hansı qitədə axır?", ["Asiya", "Afrika", "Amerika", "Avropa"], 1),
      createQ("Bakı hansı dənizin sahilində yerləşir?", ["Qara dəniz", "Xəzər dənizi", "Aral dənizi", "Azov dənizi"], 1),
      createQ("Şimal qütbündə hansı heyvan yaşayır?", ["Pinqvin", "Qütb Ayısı", "Şir", "Kenquru"], 1),
      createQ("İtaliyanın paytaxtı haradır?", ["Roma", "Milan", "Neapol", "Venesiya"], 0),
      createQ("Yer kürəsi Günəş ətrafında neçə günə fırlanır?", ["30", "180", "365", "1"], 2),
      createQ("Azərbaycanın ən böyük gölü hansıdır?", ["Göygöl", "Xəzər dənizi", "Ağgöl", "Maral gölü"], 1),
      createQ("Dünyanın ən uzun çayı hansıdır?", ["Nil", "Amazonka", "Volqa", "Dəclə"], 0),
      createQ("Yaponiyanın paytaxtı haradır?", ["Seul", "Tokio", "Pekin", "Osaka"], 1),
      createQ("Qızılqum və Qaraqum hansı materikdə yerləşir?", ["Asiya", "Afrika", "Avropa", "Amerika"], 0),
      createQ("Azərbaycanın ən hündür dağı hansıdır?", ["Tufandağ", "Bazardüzü", "Şahdağ", "Qəmbərağa"], 1),
      createQ("Azərbaycanın ən böyük çayı hansıdır?", ["Araz", "Kür", "Samur", "Tərtər"], 1),
      createQ("Dünyanın ən böyük səhra adı nədir?", ["Qobi", "Sahara", "Kalahari", "Qızılqum"], 1),
      createQ("Almaniyanın paytaxtı hansıdır?", ["Berlin", "Hamburq", "Frankfurt", "Bremen"], 0),
      createQ("Avstraliya hansı tip ərazidir?", ["Ölkə", "Ada və Kontinent", "Şəhər", "Qitə deyil"], 1),
      createQ("Dünyanın ən böyük qitəsi hansıdır?", ["Afrika", "Asiya", "Avropa", "Amerika"], 1),
    ],
    medium: [
      createQ("Azərbaycanın ən hündür zirvəsi hansıdır?", ["Bazardüzü", "Şahdağ", "Tufandağ", "Babadağ"], 0),
      createQ("Vatikan hansı şəhərin daxilində yerləşir?", ["Venesiya", "Milan", "Roma", "Florensiya"], 2),
      createQ("Braziliyanın rəsmi dili hansıdır?", ["İspan", "Portuqal", "İngilis", "Fransız"], 1),
      createQ("Araz çayı hansı çaya tökülür?", ["Kür", "Volqa", "Samur", "Tərtər"], 0),
      createQ("Dünyanın ən dərin gölü hansıdır?", ["Xəzər", "Baykal", "Viktoriya", "Mişiqan"], 1),
      createQ("Hansı ölkə 'Gündoğar ölkə' adlanır?", ["Çin", "Koreya", "Yaponiya", "Vyetnam"], 2),
      createQ("Panama kanalı hansı iki okeanı birləşdirir?", ["Sakit və Hind", "Atlantik və Sakit", "Hind və Atlantik", "Şimal və Baltik"], 1),
      createQ("Avstraliyanın paytaxtı haradır?", ["Sidney", "Melburn", "Kanberra", "Brisben"], 2),
      createQ("Dünyanın ən böyük adası hansıdır?", ["Qrenlandiya", "Madaqaskar", "Böyük Britaniya", "Yaponiya"], 0),
      createQ("Hansı ölkə həm Asiyada, həm Avropada yerləşir?", ["Misir", "Rusiya", "İran", "Çin"], 1),
      createQ("Himalay dağlarında yerləşən dünyanın ən hündür zirvəsi hansıdır?", ["Everest", "K2", "Kançencanqa", "Lhotse"], 0),
      createQ("Sahara səhrası hansı qitədə yerləşir?", ["Asiya", "Afrika", "Avropa", "Cənubi Amerika"], 1),
      createQ("Dünyanın ən böyük şəlalələr sistemi hansıdır?", ["İqvasu", "Niagara", "Anxel", "Viktoriya"], 0),
      createQ("Yer kürəsinin mərkəzi əsasən nədən ibarətdir?", ["Qranit", "Buz", "Dəmir və nikel", "Qum və gil"], 2),
      createQ("Hansı dəniz ən duzludur?", ["Qara dəniz", "Ölü dəniz", "Xəzər dənizi", "Qırmızı dəniz"], 1),
      createQ("Dünyanın ən böyük yarımadası hansıdır?", ["Hindistan", "Skandinaviya", "Ərəbistan", "Kamçatka"], 2),
      createQ("Qara dənizlə Aralıq dənizini birləşdirən boğaz hansıdır?", ["Bosfor", "Dardanel", "Gibraltar", "Kerç"], 0),
      createQ("Hansı ölkənin ərazisi tamamilə And dağlarında yerləşir?", ["Çili", "Ekvador", "Boliviya", "Peru"], 2),
      createQ("Amazonka çayı hansı okeana tökülür?", ["Hind", "Atlantik", "Sakit", "Şimal Buzlu"], 1),
      createQ("Yer qabığının hərəkəti nəticəsində yaranan hadisə hansıdır?", ["Musson", "Tektonika", "Tsunami", "Buzlaq"], 1),
      createQ("Türkiyə ilə Yunanıstan arasında yerləşən dəniz hansıdır?", ["Adriatik", "Egey", "İyon", "Qırmızı"], 1),
      createQ("Kilimancaro dağı hansı ölkədə yerləşir?", ["Kenya", "Tanzaniya", "Efiopiya", "Cənubi Afrika"], 1),
    ],
    hard: [
      createQ("Mariana çökəkliyinin dərinliyi təxminən neçə metrdir?", ["11 000 m", "8 500 m", "14 000 m", "9 200 m"], 0),
      createQ("Nepal bayrağının qeyri-standart formaya malik olma səbəbi nədir?", ["Dini simvolizm", "Tarixi krallıq simgəsi", "Coğrafi şərait", "Heç biri"], 1),
      createQ("Dünyanın ən böyük delta sistemi hansıdır?", ["Nil deltası", "Qanq-Brahmaputra deltası", "Amazon deltası", "Huangxe deltası"], 1),
      createQ("Yer kürəsində ən az yağıntı alan yer haradır?", ["Şahra səhrası", "Atakama", "Namib", "Qobi"], 1),
      createQ("Hansı ölkə ekvatoru, baş meridianı və cənub yarımkürəsini əhatə edir?", ["Keniya", "İndoneziya", "Sinqapur", "Qabon"], 0),
      createQ("Dünyanın ən böyük yeraltı mağarası hansıdır?", ["Son Doong", "Mulu", "Lechuguilla", "Karaca"], 0),
      createQ("Antarktida buzlaqlarının təxminən neçə faizi içməli sudur?", ["50%", "70%", "90%", "30%"], 2),
      createQ("Rusiyanın ən şimaldakı qəzası/əyaləti hansıdır?", ["Çukotka", "Yakutiya", "Murmansk", "Kamçatka"], 0),
      createQ("Tibet platosu nəyə görə məşhurdur?", ["Ən yüksək yayla", "Ən küləkli ərazi", "Ən çox vulkanlı zona", "Ən quraq yayla"], 0),
      createQ("Erkən geoloji dövrdə mövcud olmuş super-qitənin adı nədir?", ["Laurasiya", "Pangea", "Gondvana", "Rodinia"], 1),
      createQ("Hansı çay dünyanın ən geniş çay məcrasına malikdir?", ["Amazon", "Nil", "Yantszi", "Konqo"], 0),
      createQ("Aralıq dənizində yerləşən ən böyük ada hansıdır?", ["Kipr", "Sitsiliya", "Sardiniya", "Kreta"], 1),
      createQ("Kanadada rəsmi dil sayılan iki dil hansıdır?", ["İngilis və Alman", "İngilis və Fransız", "Fransız və İspan", "İngilis və İtalyan"], 1),
      createQ("Bərpa olunan enerji üzrə lider olan ölkə hansıdır?", ["ABŞ", "İslandiya", "Norveç", "Çin"], 1),
      createQ("Hansı ölkə ən çox aktiv vulkana malikdir?", ["Yaponiya", "İndoneziya", "Filippin", "Meksika"], 1),
      createQ("Dünyanın ən sürətli küləkləri harada qeydə alınmışdır?", ["Everest", "Antarktida", "İzlandiya", "Sahara"], 1),
      createQ("Yer qabığının orta qalınlığı neçə kilometrdir?", ["5–10 km", "30–50 km", "70–100 km", "100–120 km"], 1),
      createQ("Qırmızı dəniz nə ilə məşhurdur?", ["Ən duzlu dənizdir", "Çox isti suları var", "Qırmızı yosunlarla zəngindir", "Ən dərin dənizdir"], 2),
      createQ("Dünyanın ən böyük su ehtiyatı hansı formada saxlanılır?", ["Buzlaqlar", "Yeraltı su", "Çaylar və göllər", "Atmosfer suyu"], 0),
      createQ("Pasifik Halqası nəyə görə tanınır?", ["Şiddətli zəlzələlər və vulkanizm", "Quraq iqlim", "Buzlaşma zonası", "Dünyanın ən böyük ada qrupları"], 0),
      createQ("Hansı ölkə heç vaxt koloniyaya çevrilməyib?", ["Tailand", "Nepal", "İran", "Bütün cavablar"], 3),
    ]
  },
  TARIX: {
    easy: [
      createQ("Şah İsmayıl Xətai hansı sülalənin banisidir?", ["Səfəvilər", "Qaraqoyunlu", "Osmanlı", "Şirvanşahlar"], 0),
      createQ("Roma imperatorları hansı titul daşıyırdı?", ["Kral", "Firon", "Sezar", "Şah"], 2),
      createQ("Piramidalar hansı ölkədə yerləşir?", ["Misir", "Meksika", "Çin", "Hindistan"], 0),
      createQ("Qədim Azərbaycan ərazisində hansı dövlət mövcud olub?", ["Səfəvilər", "Şirvanşahlar", "Atropatena", "Manna"], 3),
      createQ("Osmanlı imperiyasının dini nə idi?", ["İslam", "Budizm", "Xristianlıq", "Yahudilik"], 0),
      createQ("Dünya tarixində ilk yazı harada yaranıb?", ["Misir", "Çin", "Mesopotamiya", "Hindistan"], 2),
      createQ("II Dünya müharibəsi hansı ildən başlamışdır?", ["1939", "1945", "1941", "1930"], 0),
      createQ("Makedoniyalı İsgəndərin atası kim idi?", ["II Filip", "Dara", "Kserks", "Kir"], 0),
      createQ("Qədim Roma hansı materikdə yerləşirdi?", ["Asiya", "Avropa", "Afrika", "Amerika"], 1),
      createQ("Orta əsrlərdə Avropada məqsədi din uğrunda olan yürüşlərə nə deyilir?", ["Səlib yürüşləri", "İnkvizisiya", "Yürüşlər", "Yurd müharibəsi"], 0),
      createQ("Azərbaycan Xalq Cümhuriyyəti nə qədər yaşamışdır?", ["23 ay", "5 il", "3 il", "1 ay"], 0),
      createQ("Qədim insanların əsas məşğuliyyəti nə idi?", ["Ticarət", "Əkinçilik", "Ovçuluq", "Kənd Təsərrüfatı"], 2),
      createQ("Heykəllər və məbədlərlə məşhur olan qədim şəhər?", ["Roma", "Afina", "Babil", "Qahirə"], 1),
      createQ("Səfəvi dövləti ilk paytaxtı haradır?", ["Təbriz", "Qəzvin", "İsfahan", "Ərdəbil"], 0),
      createQ("Qızıl Orda dövlətinə kim rəhbərlik etmişdir?", ["Çingiz xan", "Batu xan", "Tamerlan", "Xətai"], 1),
      createQ("Çingiz xan hansı xalqdan idi?", ["Türk", "Monqol", "Fars", "Slavyan"], 1),
      createQ("Qədim yunanlar hansı idman oyununu yaratdı?", ["Olimpiya", "Futbol", "Güləş", "Karate"], 0),
      createQ("Vikinglər hansı regionun sakinləri idi?", ["Skandinaviya", "Asiya", "Afrika", "Amerika"], 0),
      createQ("Ən qədim dövlət idarə forması hansıdır?", ["Monarxiya", "Respublika", "Demokratiya", "Əmirlik"], 0),
      createQ("Hitler hansı ölkəyə rəhbərlik etmişdir?", ["Almaniya", "İtaliya", "Fransa", "Avstriya"], 0),
      createQ("Roma imperiyası hansı dildə danışırdı?", ["Latın", "Yunan", "Fransız", "İngilis"], 0),
    ],
    medium: [
      createQ("Türkmançay müqaviləsi neçə il imzalanmışdır?", ["1828", "1813", "1723", "1801"], 0),
      createQ("Böyük İpək yolunun əsas mərkəzlərindən biri?", ["Səmərqənd", "Buxara", "Naxçıvan", "Şuşa"], 0),
      createQ("Atropatena adını haradan alır?", ["Hakim Atropat", "Şah Isgəndər", "Qədim tayfa", "Mitoloji obraz"], 0),
      createQ("Təbriz ilk dəfə hansı sülalənin paytaxtı olub?", ["Səfəvilər", "Qaraqoyunlu", "Şirvanşahlar", "Sasanilər"], 1),
      createQ("Azərbaycan dilinin rəsmi status aldığı il:", ["1995", "1992", "1978", "2000"], 1),
      createQ("Monqol imperiyasının ən böyük ərazisi hansı əsrdə idi?", ["XII", "XIII", "XIV", "XI"], 1),
      createQ("Koroğlu hansı dövrdə yaşamışdır?", ["XVI əsr", "XV əsr", "XIV əsr", "XVII əsr"], 0),
      createQ("Ən qədim məbədlərdən biri - Göbəklitəpə haradadır?", ["Türkiyə", "İraq", "Misir", "İran"], 0),
      createQ("Qədim Misirdə yazı sistemi necə adlanırdı?", ["Hieroqlif", "Run", "Mixi", "Sanskrit"], 0),
      createQ("Roma imperiyasını iki hissəyə bölən əmr?", ["Diokletian", "Konstantin", "Neron", "Sezar"], 0),
      createQ("Qacarlar dövləti harada yaranmışdır?", ["İran", "Türkiyə", "Azərbaycan", "Əfqanıstan"], 0),
      createQ("Babək məğlub olduğu döyüş yeri?", ["Bəzz qalası", "Dəbil", "Tərtər", "Mərənd"], 0),
      createQ("İslam dünyasının ilk universitetlərindən biri?", ["Əl-Əzhər", "Bagdad", "Qurtuba", "Şam"], 0),
      createQ("Fateh Sultan Mehmet İstanbul şəhərini neçə ildə fəth edib?", ["1453", "1458", "1481", "1435"], 0),
      createQ("Spartak hansı döyüşdə məşhur üsyan etmişdir?", ["Qladiator üsyanı", "Səlib yürüşü", "Vikinqlər üsyanı", "Pirat döyüşü"], 0),
      createQ("Şumerlər hansı ixtiraya görə məşhurdur?", ["Təkər", "Kompas", "Pul", "Atəş"], 0),
      createQ("Təbrizin 'İlk Azərbaycan türkcəsi rəsmi dili' statusu hansı sülalədə?", ["Səfəvi", "Şirvanşahlar", "Əfşar", "Qacar"], 0),
      createQ("Berlin divarı nə vaxt yıxıldı?", ["1989", "1991", "1981", "1995"], 0),
      createQ("Napoleon hansı döyüşdə məğlub olmuşdur?", ["Waterloo", "Paris", "Roma", "Neftçi"], 0),
      createQ("Şah Abbas hansı şəhəri paytaxt etdi?", ["İsfahan", "Təbriz", "Qəzvin", "Şiraz"], 0),
      createQ("Amerika qitəsini kim kəşf edib?", ["Kolumb", "Vasko da Qama", "Maqellan", "Cook"], 0),
    ],
    hard: [
      createQ("Səfəvilər dövlətinin rəsmi məzhəbi nə idi?", ["Şiəlik", "Sünnilik", "Katoliklik", "Ortodoks"], 0),
      createQ("Nadir Şah hansı döyüşdə Osmanlı ilə mübarizə aparmışdır?", ["Bağdad", "Naxçıvan", "Mərənd", "Gəncə"], 1),
      createQ("Ərəb xilafəti ən geniş ərazisinə hansı dövrdə çatdı?", ["Əməvilər", "Abbasilər", "Rəşidilər", "Fatimilər"], 0),
      createQ("Xəzər xaqanlığı hansı dinə məxsus idi?", ["Yəhudilik", "İslam", "Xristianlıq", "Budizm"], 0),
      createQ("Kimmerlərin Azərbaycan ərazisində izləri hansı əsrdədir?", ["VIII-VII", "IV-III", "I", "X"], 0),
      createQ("Atropatenanın paytaxtı?", ["Qazaka", "Həmədan", "Təbriz", "Maraga"], 0),
      createQ("Ən qədim türkcə yazılı abidələr hansı əsrdəndir?", ["VIII əsr", "X əsr", "XIV əsr", "IX əsr"], 0),
      createQ("Mesopotamya sözü nə deməkdir?", ["İki çay arası", "İsti torpaq", "Su ölkəsi", "Bərəkətli ova"], 0),
      createQ("Hind-Ari tayfaları hansı bölgəyə gəlmişdir?", ["Hindistan", "İran", "Mərkəzi Asiya", "Çin"], 0),
      createQ("Şah İsmayılın 'Dəqiq məhkəməsi' kimi tanınan qanunları?", ["Kəmaləddin nizamı", "Dəsturül-əməl", "Təzkirətül-mülk", "Tövhidnamə"], 1),
      createQ("Babəkə qarşı yürüşlərə rəhbərlik etmiş sərkərdə?", ["Afşin", "Məmun", "Əl-Mansur", "Mütəsim"], 0),
      createQ("Hunların Avropadakı ən məşhur hökmdarı?", ["Atilla", "Bumin", "Köl Tigin", "Əfşin"], 0),
      createQ("Səlib yürüşləri neçə il davam etmişdir?", ["1096-1291", "1110-1300", "1000-1200", "1096-1220"], 0),
      createQ("Böyük Moğol imperiyasını kim qurmuşdur?", ["Babur", "Akbar", "Tamerlan", "Humayun"], 0),
      createQ("Roma imperiyasında bərpa dövrü hansı adla tanınırdı?", ["Renessans", "Bərpa dövrü", "Dominat", "Respublica nova"], 2),
      createQ("Azərbaycanın ilk konstitusiyası neçə ildə qəbul olunub?", ["1995", "1991", "1993", "1999"], 0),
      createQ("Sasanilər ilə Bizans arasında əsas mübarizə səbəbi?", ["Ticarət yolları", "Din", "Torpaq mübahisəsi", "Vergi sistemi"], 0),
      createQ("Monqol darmadağınına uğramış dövlət?", ["Xarəzmşahlar", "Sasanilər", "Misir Xilafəti", "Oğuzlar"], 0),
      createQ("Aşşur hökmdarları nə ilə məşhur idi?", ["Qəddarlıq və hərb", "Elm və dini", "Ticarət", "Sənətkarlıq"], 0),
      createQ("Manna dövlətinin əsas məşğuliyyəti?", ["Kənd təsərrüfatı", "Metallurgiya", "Ticarət", "Heyvandarlıq"], 3),
    ]
  },
  INCESENET: {
    easy: [
      createQ("Mona Liza əsərinin müəllifi kimdir?", ["Pikasso", "Da Vinçi", "Van Qoq", "Mikelancelo"], 1),
      createQ("Azərbaycanın milli musiqi aləti hansıdır?", ["Gitara", "Tar", "Skripka", "Piano"], 1),
      createQ("'Yeddi Gözəl' baletinin müəllifi kimdir?", ["Qara Qarayev", "Üzeyir Hacıbəyli", "Fikrət Əmirov", "Niyazi"], 0),
      createQ("Romeo və Cülyetta əsərini kim yazıb?", ["Şekspir", "Dante", "Hüqo", "Tolstoy"], 0),
      createQ("Kamança neçə simdən ibarətdir?", ["3", "4", "5", "6"], 1),
      createQ("Kim rəssam deyil?", ["Pikasso", "Motsart", "Dali", "Rembrandt"], 1),
      createQ("'Koroğlu' operasını kim bəstələyib?", ["Üzeyir Hacıbəyli", "Müslüm Maqomayev", "Qara Qarayev", "Fikrət Əmirov"], 0),
      createQ("Heykəltəraşlıq hansı sənət növüdür?", ["Təsviri", "Musiqi", "Ədəbiyyat", "Kino"], 0),
    ],
    medium: [
      createQ("'O olmasın, bu olsun' operettasının digər adı nədir?", ["Arşın mal alan", "Məşədi İbad", "Qaynana", "Dərviş Parisi partladır"], 1),
      createQ("Van Qoq qulağını kəsdikdən sonra çəkdiyi rəsm?", ["Ulduzlu Gecə", "Günəbaxanlar", "Avtoportret", "Kafe Terrası"], 2),
      createQ("Muğam üçlüyünə daxil olmayan alət?", ["Tar", "Kamança", "Qaval", "Balaban"], 3),
      createQ("Nizami Gəncəvinin ilk poeması hansıdır?", ["Sirlər Xəzinəsi", "Xosrov və Şirin", "Leyli və Məcnun", "İsgəndərnamə"], 0),
      createQ("Sürrealizm cərəyanının ən məşhur nümayəndəsi?", ["Dali", "Mone", "Rembrandt", "Warhol"], 0),
      createQ("Azərbaycan himninin musiqisini kim bəstələyib?", ["Üzeyir Hacıbəyli", "Müslüm Maqomayev", "Səid Rüstəmov", "Hacı Xanməmmədov"], 0),
      createQ("'Xəmsə' neçə poemadan ibarətdir?", ["3", "5", "7", "9"], 1),
    ],
    hard: [
      createQ("Azərbaycanın ilk professional qadın rəssamı kimdir?", ["Maral Rəhmanzadə", "Vəcihə Səmədova", "Qeysər Kaşıyeva", "Elmira Şahtaxtinskaya"], 2),
      createQ("Bethovenin kar olduğu halda bəstələdiyi simfoniya?", ["5-ci", "9-cu", "3-cü", "7-ci"], 1),
      createQ("Azərbaycanın ilk baleti hansıdır?", ["Yeddi Gözəl", "Qız qalası", "Babək", "Min bir gecə"], 1),
      createQ("İntibah dövrü harada yaranmışdır?", ["Fransa", "İtaliya", "Yunanıstan", "İspaniya"], 1),
      createQ("Pikasso hansı cərəyanın banisidir?", ["Kubizm", "İmpressionizm", "Sürrealizm", "Futurizm"], 0),
      createQ("Vaqif Mustafazadə hansı janrın banisidir?", ["Caz-Muğam", "Pop", "Rok", "Simfonik Muğam"], 0),
    ]
  },
  DIN: {
    easy: [
      createQ("İslam dininin müqəddəs kitabı hansıdır?", ["Quran", "Tövrat", "İncil", "Zəbur"], 0),
      createQ("Müsəlmanların ibadət evi necə adlanır?", ["Məscid", "Kilsə", "Sinaqoq", "Məbəd"], 0),
      createQ("İslamın neçə şərti var?", ["3", "5", "7", "4"], 1),
      createQ("Sonuncu peyğəmbər kimdir?", ["Musa", "İsa", "Məhəmməd", "Davud"], 2),
      createQ("Ramazan ayında nə edilir?", ["Qurban kəsilir", "Oruc tutulur", "Həccə gedilir", "Zəkat verilir"], 1),
    ],
    medium: [
      createQ("Qurani-Kərim neçə surədən ibarətdir?", ["114", "110", "120", "100"], 0),
      createQ("Kəbə evi harada yerləşir?", ["Mədinə", "Məkkə", "Qüds", "Bağdad"], 1),
      createQ("Həzrəti Məhəmmədin (s.ə.s) anasının adı nədir?", ["Xədicə", "Fatimə", "Əminə", "Həlimə"], 2),
      createQ("İlk vəhy harada gəlmişdir?", ["Hira mağarası", "Kəbə", "Uhud dağı", "Mədinə"], 0),
      createQ("Zəmzəm suyu haradan çıxır?", ["Məkkə", "Mədinə", "Qüds", "Nəcəf"], 0),
    ],
    hard: [
      createQ("Uhud döyüşü neçənci ildə baş vermişdir?", ["624", "625", "630", "622"], 1),
      createQ("Quranın ən uzun surəsi hansıdır?", ["Ali-İmran", "Maidə", "Bəqərə", "Nisa"], 2),
      createQ("İlk xəlifə kim olmuşdur?", ["Əli", "Ömər", "Əbubəkr", "Osman"], 2),
      createQ("Mədinəyə hicrət hansı ildə olub?", ["622", "610", "632", "600"], 0),
      createQ("Təbük döyüşü kimlərə qarşı olmuşdur?", ["Məkkəlilərə", "Bizansa", "Sasanilərə", "Yəhudilərə"], 1),
    ]
  },
  FANTASTIK: {
    easy: [
      createQ("Supermen hansı planetdən gəlib?", ["Mars", "Kripton", "Venera", "Saturn"], 1),
      createQ("Hörümçək adamın əsl adı nədir?", ["Peter Parker", "Bruce Wayne", "Tony Stark", "Clark Kent"], 0),
      createQ("Harri Potterin oxuduğu məktəb?", ["Hogwarts", "Harvard", "Oksford", "Yel"], 0),
      createQ("Üzüklərin hökmdarı filmindəki balaca adamlar?", ["Hobbitlər", "Elflər", "Orklar", "Qnomlar"], 0),
      createQ("Betmenin yaşadığı şəhər?", ["Metropolis", "Gotham", "New York", "Chicago"], 1),
    ],
    medium: [
      createQ("Ulduz müharibələrindəki pis personaj kimdir?", ["Darth Vader", "Yoda", "Luke", "Han Solo"], 0),
      createQ("Matrix filmindəki baş qəhrəman?", ["Neo", "Morpheus", "Trinity", "Smith"], 0),
      createQ("Torun silahı nədir?", ["Qılınc", "Çəkic", "Ox", "Qalxan"], 1),
      createQ("Dəmir Adamın kostyumunu kim düzəldib?", ["Tony Stark", "Bruce Banner", "Steve Rogers", "Nick Fury"], 0),
      createQ("Avatar filmindəki yerlilər necə adlanır?", ["Na'vi", "Klingon", "Vulkan", "Jedi"], 0),
    ],
    hard: [
      createQ("Doktor Kim (Doctor Who) serialında zaman maşınının adı?", ["TARDIS", "DeLorean", "Enterprise", "Serenity"], 0),
      createQ("Deyv Consun gəmisi necə adlanır?", ["Qara İnci", "Uçan Hollandiyalı", "Kraliça Anna", "Sakit Meri"], 1),
      createQ("Frankenşteynin müəllifi kimdir?", ["Mary Shelley", "Bram Stoker", "H.G. Wells", "Jules Verne"], 0),
      createQ("H.G. Wells-in yazdığı zaman səyahəti romanı?", ["Zaman Maşını", "Dünyalar müharibəsi", "Görünməz adam", "Doktor Moro"], 0),
      createQ("Asimovun robot qanunları neçə dənədir?", ["3", "4", "5", "2"], 0),
    ]
  },
  FILM: {
    easy: [
      createQ("Titanik gəmisinin batdığı il?", ["1912", "1905", "1920", "1899"], 0),
      createQ("Şrek hansı heyvandır?", ["Oqr", "Əjdaha", "Eşşək", "Qurbağa"], 0),
      createQ("Ceyms Bondun kod nömrəsi?", ["007", "001", "911", "112"], 0),
      createQ("Kral Şir cizgi filminin baş qəhrəmanı?", ["Simba", "Mufasa", "Timon", "Pumba"], 0),
      createQ("Evdə Tək filminin baş qəhrəmanı?", ["Kevin", "Harri", "Marv", "Buzz"], 0),
    ],
    medium: [
      createQ("Oskar mükafatı hansı sahədə verilir?", ["Musiqi", "Kino", "Teatr", "Ədəbiyyat"], 1),
      createQ("Terminator filmindəki məşhur fraza?", ["I'll be back", "Hello World", "Goodbye", "Hasta la vista"], 0),
      createQ("Xaç atası filminin rejissoru?", ["Coppola", "Spielberg", "Tarantino", "Scorsese"], 0),
      createQ("Pulp Fiction filminin rejissoru?", ["Tarantino", "Nolan", "Cameron", "Fincher"], 0),
      createQ("Jokerin düşməni kimdir?", ["Betmen", "Supermen", "Fleym", "Akvamen"], 0),
    ],
    hard: [
      createQ("Tarixdə ən çox Oskar alan film?", ["Titanik", "Avatar", "Üzüklərin Hökmdarı", "Ben-Hur"], 3),
      createQ("İlk səsli film hansı ildə çəkilib?", ["1927", "1930", "1920", "1915"], 0),
      createQ("Hitchcock-un məşhur qorxu filmi?", ["Psycho", "Birds", "Vertigo", "Rear Window"], 0),
      createQ("Azərbaycanın ilk rəngli bədii filmi?", ["O olmasın, bu olsun", "Arşın mal alan", "Görüş", "Koroğlu"], 0),
      createQ("Kann festivalının baş mükafatı?", ["Qızıl Palma", "Qızıl Şir", "Oskar", "Qızıl Ayı"], 0),
    ]
  },
  TEXNOLOGIYA: {
    easy: [
      createQ("iPhone-u hansı şirkət istehsal edir?", ["Samsung", "Apple", "Nokia", "Sony"], 1),
      createQ("Windows əməliyyat sisteminin yaradıcısı kimdir?", ["Bill Gates", "Steve Jobs", "Mark Zuckerberg", "Elon Musk"], 0),
      createQ("Kompüterin beyni nə sayılır?", ["Monitor", "Prosessor", "Maus", "Klaviatura"], 1),
      createQ("WWW nə deməkdir?", ["World Wide Web", "World Web War", "Wide World Web", "Web World Wide"], 0),
    ],
    medium: [
      createQ("Süni İntellekt (AI) nədir?", ["Robot", "Proqram", "Ağıllı sistem", "Hamısı"], 3),
      createQ("Python nədir?", ["İlan", "Proqramlaşdırma dili", "Oyun", "Film"], 1),
      createQ("Wifi nə üçün istifadə olunur?", ["Yemək bişirmək", "İnternetə qoşulmaq", "Şəkil çəkmək", "Musiqi dinləmək"], 1),
    ],
    hard: [
      createQ("İlk kompüter proqramçısı kim sayılır?", ["Ada Lovelace", "Alan Turing", "Charles Babbage", "Grace Hopper"], 0),
      createQ("HTTP protokolunda S hərfi nəyi bildirir?", ["Speed", "Secure", "System", "Server"], 1),
      createQ("Blockchain texnologiyası əsasən harada istifadə olunur?", ["Kriptovalyuta", "Sosial şəbəkə", "Bulud yaddaşı", "Oyunlar"], 0),
    ]
  },
  IDMAN: {
    easy: [
      createQ("Futbol komandasında neçə oyunçu olur?", ["11", "9", "7", "12"], 0),
      createQ("Qarabağ FK hansı şəhəri təmsil edir?", ["Bakı", "Ağdam", "Gəncə", "Şuşa"], 1),
      createQ("Olimpiya oyunları neçə ildən bir keçirilir?", ["2", "4", "3", "5"], 1),
      createQ("Lionel Messi hansı ölkənin vətəndaşıdır?", ["Braziliya", "Portuqaliya", "Argentina", "İspaniya"], 2),
      createQ("Voleybolda topa əl ilə vurmaq olar?", ["Bəli", "Xeyr", "Bəzən", "Yalnız kapitan"], 0),
    ],
    medium: [
      createQ("Dünya Çempionatı kuboku neçə kiloqram qızıldan ibarətdir?", ["5 kq", "6.1 kq", "3 kq", "10 kq"], 1),
      createQ("Azərbaycanın ilk Olimpiya çempionu kimdir?", ["Namiq Abdullayev", "Nazim Hüseynov", "Elnur Məmmədli", "Toğrul Əsgərov"], 1),
      createQ("Basketbol oyununda bir komandada neçə nəfər olur?", ["5", "6", "7", "11"], 0),
      createQ("Tennisdə 'Love' termini nə deməkdir?", ["Sevgi", "Sıfır xal", "Qələbə", "Bərabərlik"], 1),
      createQ("Forma 1 yarışlarında ən çox çempion olan pilotlardan biri?", ["Hamilton", "Verstappen", "Alonso", "Perez"], 0),
    ],
    hard: [
      createQ("İlk Dünya Kuboku hansı ildə keçirilib?", ["1930", "1950", "1924", "1938"], 0),
      createQ("Marafon qaçışının məsafəsi nə qədərdir?", ["40 km", "42.195 km", "45 km", "38 km"], 1),
      createQ("Cüdo idman növü hansı ölkədə yaranıb?", ["Çin", "Koreya", "Yaponiya", "Monqolustan"], 2),
      createQ("Qızıl Top (Ballon d'Or) mükafatını ən çox kim qazanıb?", ["Ronaldo", "Messi", "Pele", "Maradona"], 1),
      createQ("100 metr qaçış üzrə dünya rekordu kimə məxsusdur?", ["Usain Bolt", "Tyson Gay", "Yohan Blake", "Carl Lewis"], 0),
    ]
  }
};

export const getQuestionsByTopic = (topic: Topic, seenQuestions: string[] = []): Question[] => {
  const topicData = DB[topic];
  if (!topicData) return []; // Handle cases where topic might not exist in DB yet
  const { easy, medium, hard } = topicData;

  const getUnseen = (pool: any[]) => pool.filter(q => !seenQuestions.includes(q.text));

  let availEasy = getUnseen(easy);
  let availMedium = getUnseen(medium);
  let availHard = getUnseen(hard);

  if (availEasy.length < 4) availEasy = easy; 
  if (availMedium.length < 3) availMedium = medium;
  if (availHard.length < 3) availHard = hard;

  const shuffle = (arr: any[]) => [...arr].sort(() => 0.5 - Math.random());
  
  const selectedEasy = shuffle(availEasy).slice(0, 4);
  const selectedMedium = shuffle(availMedium).slice(0, 3);
  const selectedHard = shuffle(availHard).slice(0, 3);

  const gameQuestions = [...selectedEasy, ...selectedMedium, ...selectedHard];

  return gameQuestions.map((q, index) => ({
    id: index + 1,
    text: q.text,
    options: q.options,
    correctAnswerIndex: q.correctAnswerIndex,
  }));
};