/**
 * @author Phil Teare
 * using wikipedia data
 */
function addCodes(langs) {
  for (const code in langs) {
    const lang = langs[code];
    lang.code = code;
  }
  return langs;
}
export const BETTER_LANGS_LIST = addCodes({
  ab: {
    name: "Abkhaz",
    nativeName: "аҧсуа",
  },
  aa: {
    name: "Afar",
    nativeName: "Afaraf",
  },
  af: {
    name: "Afrikaans",
    nativeName: "Afrikaans",
  },
  ak: {
    name: "Akan",
    nativeName: "Akan",
  },
  sq: {
    name: "Albanian",
    nativeName: "Shqip",
  },
  am: {
    name: "Amharic",
    nativeName: "አማርኛ",
  },
  ar: {
    name: "Arabic",
    nativeName: "العربية",
  },
  an: {
    name: "Aragonese",
    nativeName: "Aragonés",
  },
  hy: {
    name: "Armenian",
    nativeName: "Հայերեն",
  },
  as: {
    name: "Assamese",
    nativeName: "অসমীয়া",
  },
  av: {
    name: "Avaric",
    nativeName: "авар мацӀ, магӀарул мацӀ",
  },
  ae: {
    name: "Avestan",
    nativeName: "avesta",
  },
  ay: {
    name: "Aymara",
    nativeName: "aymar aru",
  },
  az: {
    name: "Azerbaijani",
    nativeName: "azərbaycan dili",
  },
  bm: {
    name: "Bambara",
    nativeName: "bamanankan",
  },
  ba: {
    name: "Bashkir",
    nativeName: "башҡорт теле",
  },
  eu: {
    name: "Basque",
    nativeName: "euskara, euskera",
  },
  be: {
    name: "Belarusian",
    nativeName: "Беларуская",
  },
  bn: {
    name: "Bengali",
    nativeName: "বাংলা",
  },
  bh: {
    name: "Bihari",
    nativeName: "भोजपुरी",
  },
  bi: {
    name: "Bislama",
    nativeName: "Bislama",
  },
  bs: {
    name: "Bosnian",
    nativeName: "bosanski jezik",
  },
  br: {
    name: "Breton",
    nativeName: "brezhoneg",
  },
  bg: {
    name: "Bulgarian",
    nativeName: "български език",
  },
  my: {
    name: "Burmese",
    nativeName: "ဗမာစာ",
  },
  ca: {
    name: "Catalan; Valencian",
    nativeName: "Català",
  },
  ch: {
    name: "Chamorro",
    nativeName: "Chamoru",
  },
  ce: {
    name: "Chechen",
    nativeName: "нохчийн мотт",
  },
  ny: {
    name: "Chichewa; Chewa; Nyanja",
    nativeName: "chiCheŵa, chinyanja",
  },
  zh: {
    name: "Chinese",
    nativeName: "中文 (Zhōngwén), 汉语, 漢語",
  },
  cv: {
    name: "Chuvash",
    nativeName: "чӑваш чӗлхи",
  },
  kw: {
    name: "Cornish",
    nativeName: "Kernewek",
  },
  co: {
    name: "Corsican",
    nativeName: "corsu, lingua corsa",
  },
  cr: {
    name: "Cree",
    nativeName: "ᓀᐦᐃᔭᐍᐏᐣ",
  },
  hr: {
    name: "Croatian",
    nativeName: "hrvatski",
  },
  cs: {
    name: "Czech",
    nativeName: "česky, čeština",
  },
  da: {
    name: "Danish",
    nativeName: "dansk",
  },
  dv: {
    name: "Divehi; Dhivehi; Maldivian;",
    nativeName: "ދިވެހި",
  },
  nl: {
    name: "Dutch",
    nativeName: "Nederlands, Vlaams",
  },
  en: {
    name: "English",
    nativeName: "English",
  },
  eo: {
    name: "Esperanto",
    nativeName: "Esperanto",
  },
  et: {
    name: "Estonian",
    nativeName: "eesti, eesti keel",
  },
  ee: {
    name: "Ewe",
    nativeName: "Eʋegbe",
  },
  fo: {
    name: "Faroese",
    nativeName: "føroyskt",
  },
  fj: {
    name: "Fijian",
    nativeName: "vosa Vakaviti",
  },
  fi: {
    name: "Finnish",
    nativeName: "suomi, suomen kieli",
  },
  fr: {
    name: "French",
    nativeName: "français, langue française",
  },
  ff: {
    name: "Fula; Fulah; Pulaar; Pular",
    nativeName: "Fulfulde, Pulaar, Pular",
  },
  gl: {
    name: "Galician",
    nativeName: "Galego",
  },
  ka: {
    name: "Georgian",
    nativeName: "ქართული",
  },
  de: {
    name: "German",
    nativeName: "Deutsch",
  },
  el: {
    name: "Greek, Modern",
    nativeName: "Ελληνικά",
  },
  gn: {
    name: "Guaraní",
    nativeName: "Avañeẽ",
  },
  gu: {
    name: "Gujarati",
    nativeName: "ગુજરાતી",
  },
  ht: {
    name: "Haitian; Haitian Creole",
    nativeName: "Kreyòl ayisyen",
  },
  ha: {
    name: "Hausa",
    nativeName: "Hausa, هَوُسَ",
  },
  he: {
    name: "Hebrew (modern)",
    nativeName: "עברית",
  },
  hz: {
    name: "Herero",
    nativeName: "Otjiherero",
  },
  hi: {
    name: "Hindi",
    nativeName: "हिन्दी, हिंदी",
  },
  ho: {
    name: "Hiri Motu",
    nativeName: "Hiri Motu",
  },
  hu: {
    name: "Hungarian",
    nativeName: "Magyar",
  },
  ia: {
    name: "Interlingua",
    nativeName: "Interlingua",
  },
  id: {
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
  },
  ie: {
    name: "Interlingue",
    nativeName: "Originally called Occidental; then Interlingue after WWII",
  },
  ga: {
    name: "Irish",
    nativeName: "Gaeilge",
  },
  ig: {
    name: "Igbo",
    nativeName: "Asụsụ Igbo",
  },
  ik: {
    name: "Inupiaq",
    nativeName: "Iñupiaq, Iñupiatun",
  },
  io: {
    name: "Ido",
    nativeName: "Ido",
  },
  is: {
    name: "Icelandic",
    nativeName: "Íslenska",
  },
  it: {
    name: "Italian",
    nativeName: "Italiano",
  },
  iu: {
    name: "Inuktitut",
    nativeName: "ᐃᓄᒃᑎᑐᑦ",
  },
  ja: {
    name: "Japanese",
    nativeName: "日本語 (にほんご／にっぽんご)",
  },
  jv: {
    name: "Javanese",
    nativeName: "basa Jawa",
  },
  kl: {
    name: "Kalaallisut, Greenlandic",
    nativeName: "kalaallisut, kalaallit oqaasii",
  },
  kn: {
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
  },
  kr: {
    name: "Kanuri",
    nativeName: "Kanuri",
  },
  ks: {
    name: "Kashmiri",
    nativeName: "कश्मीरी, كشميري‎",
  },
  kk: {
    name: "Kazakh",
    nativeName: "Қазақ тілі",
  },
  km: {
    name: "Khmer",
    nativeName: "ភាសាខ្មែរ",
  },
  ki: {
    name: "Kikuyu, Gikuyu",
    nativeName: "Gĩkũyũ",
  },
  rw: {
    name: "Kinyarwanda",
    nativeName: "Ikinyarwanda",
  },
  ky: {
    name: "Kirghiz, Kyrgyz",
    nativeName: "кыргыз тили",
  },
  kv: {
    name: "Komi",
    nativeName: "коми кыв",
  },
  kg: {
    name: "Kongo",
    nativeName: "KiKongo",
  },
  ko: {
    name: "Korean",
    nativeName: "한국어 (韓國語), 조선말 (朝鮮語)",
  },
  ku: {
    name: "Kurdish",
    nativeName: "Kurdî, كوردی‎",
  },
  kj: {
    name: "Kwanyama, Kuanyama",
    nativeName: "Kuanyama",
  },
  la: {
    name: "Latin",
    nativeName: "latine, lingua latina",
  },
  lb: {
    name: "Luxembourgish, Letzeburgesch",
    nativeName: "Lëtzebuergesch",
  },
  lg: {
    name: "Luganda",
    nativeName: "Luganda",
  },
  li: {
    name: "Limburgish, Limburgan, Limburger",
    nativeName: "Limburgs",
  },
  ln: {
    name: "Lingala",
    nativeName: "Lingála",
  },
  lo: {
    name: "Lao",
    nativeName: "ພາສາລາວ",
  },
  lt: {
    name: "Lithuanian",
    nativeName: "lietuvių kalba",
  },
  lu: {
    name: "Luba-Katanga",
    nativeName: "",
  },
  lv: {
    name: "Latvian",
    nativeName: "latviešu valoda",
  },
  gv: {
    name: "Manx",
    nativeName: "Gaelg, Gailck",
  },
  mk: {
    name: "Macedonian",
    nativeName: "македонски јазик",
  },
  mg: {
    name: "Malagasy",
    nativeName: "Malagasy fiteny",
  },
  ms: {
    name: "Malay",
    nativeName: "bahasa Melayu, بهاس ملايو‎",
  },
  ml: {
    name: "Malayalam",
    nativeName: "മലയാളം",
  },
  mt: {
    name: "Maltese",
    nativeName: "Malti",
  },
  mi: {
    name: "Māori",
    nativeName: "te reo Māori",
  },
  mr: {
    name: "Marathi (Marāṭhī)",
    nativeName: "मराठी",
  },
  mh: {
    name: "Marshallese",
    nativeName: "Kajin M̧ajeļ",
  },
  mn: {
    name: "Mongolian",
    nativeName: "монгол",
  },
  na: {
    name: "Nauru",
    nativeName: "Ekakairũ Naoero",
  },
  nv: {
    name: "Navajo, Navaho",
    nativeName: "Diné bizaad, Dinékʼehǰí",
  },
  nb: {
    name: "Norwegian Bokmål",
    nativeName: "Norsk bokmål",
  },
  nd: {
    name: "North Ndebele",
    nativeName: "isiNdebele",
  },
  ne: {
    name: "Nepali",
    nativeName: "नेपाली",
  },
  ng: {
    name: "Ndonga",
    nativeName: "Owambo",
  },
  nn: {
    name: "Norwegian Nynorsk",
    nativeName: "Norsk nynorsk",
  },
  no: {
    name: "Norwegian",
    nativeName: "Norsk",
  },
  ii: {
    name: "Nuosu",
    nativeName: "ꆈꌠ꒿ Nuosuhxop",
  },
  nr: {
    name: "South Ndebele",
    nativeName: "isiNdebele",
  },
  oc: {
    name: "Occitan",
    nativeName: "Occitan",
  },
  oj: {
    name: "Ojibwe, Ojibwa",
    nativeName: "ᐊᓂᔑᓈᐯᒧᐎᓐ",
  },
  cu: {
    name: "Old Church Slavonic",
    nativeName: "ѩзыкъ словѣньскъ",
  },
  om: {
    name: "Oromo",
    nativeName: "Afaan Oromoo",
  },
  or: {
    name: "Oriya",
    nativeName: "ଓଡ଼ିଆ",
  },
  os: {
    name: "Ossetian, Ossetic",
    nativeName: "ирон æвзаг",
  },
  pa: {
    name: "Panjabi, Punjabi",
    nativeName: "ਪੰਜਾਬੀ, پنجابی‎",
  },
  pi: {
    name: "Pāli",
    nativeName: "पाऴि",
  },
  fa: {
    name: "Persian",
    nativeName: "فارسی",
  },
  pl: {
    name: "Polish",
    nativeName: "polski",
  },
  ps: {
    name: "Pashto, Pushto",
    nativeName: "پښتو",
  },
  pt: {
    name: "Portuguese",
    nativeName: "Português",
  },
  qu: {
    name: "Quechua",
    nativeName: "Runa Simi, Kichwa",
  },
  rm: {
    name: "Romansh",
    nativeName: "rumantsch grischun",
  },
  rn: {
    name: "Kirundi",
    nativeName: "kiRundi",
  },
  ro: {
    name: "Romanian, Moldavian, Moldovan",
    nativeName: "română",
  },
  ru: {
    name: "Russian",
    nativeName: "русский язык",
  },
  sa: {
    name: "Sanskrit (Saṁskṛta)",
    nativeName: "संस्कृतम्",
  },
  sc: {
    name: "Sardinian",
    nativeName: "sardu",
  },
  sd: {
    name: "Sindhi",
    nativeName: "सिन्धी, سنڌي، سندھی‎",
  },
  se: {
    name: "Northern Sami",
    nativeName: "Davvisámegiella",
  },
  sm: {
    name: "Samoan",
    nativeName: "gagana faa Samoa",
  },
  sg: {
    name: "Sango",
    nativeName: "yângâ tî sängö",
  },
  sr: {
    name: "Serbian",
    nativeName: "српски језик",
  },
  gd: {
    name: "Scottish Gaelic; Gaelic",
    nativeName: "Gàidhlig",
  },
  sn: {
    name: "Shona",
    nativeName: "chiShona",
  },
  si: {
    name: "Sinhala, Sinhalese",
    nativeName: "සිංහල",
  },
  sk: {
    name: "Slovak",
    nativeName: "slovenčina",
  },
  sl: {
    name: "Slovene",
    nativeName: "slovenščina",
  },
  so: {
    name: "Somali",
    nativeName: "Soomaaliga, af Soomaali",
  },
  st: {
    name: "Southern Sotho",
    nativeName: "Sesotho",
  },
  es: {
    name: "Spanish; Castilian",
    nativeName: "español, castellano",
  },
  su: {
    name: "Sundanese",
    nativeName: "Basa Sunda",
  },
  sw: {
    name: "Swahili",
    nativeName: "Kiswahili",
  },
  ss: {
    name: "Swati",
    nativeName: "SiSwati",
  },
  sv: {
    name: "Swedish",
    nativeName: "svenska",
  },
  ta: {
    name: "Tamil",
    nativeName: "தமிழ்",
  },
  te: {
    name: "Telugu",
    nativeName: "తెలుగు",
  },
  tg: {
    name: "Tajik",
    nativeName: "тоҷикӣ, toğikī, تاجیکی‎",
  },
  th: {
    name: "Thai",
    nativeName: "ไทย",
  },
  ti: {
    name: "Tigrinya",
    nativeName: "ትግርኛ",
  },
  bo: {
    name: "Tibetan Standard, Tibetan, Central",
    nativeName: "བོད་ཡིག",
  },
  tk: {
    name: "Turkmen",
    nativeName: "Türkmen, Түркмен",
  },
  tl: {
    name: "Tagalog",
    nativeName: "Wikang Tagalog, ᜏᜒᜃᜅ᜔ ᜆᜄᜎᜓᜄ᜔",
  },
  tn: {
    name: "Tswana",
    nativeName: "Setswana",
  },
  to: {
    name: "Tonga (Tonga Islands)",
    nativeName: "faka Tonga",
  },
  tr: {
    name: "Turkish",
    nativeName: "Türkçe",
  },
  ts: {
    name: "Tsonga",
    nativeName: "Xitsonga",
  },
  tt: {
    name: "Tatar",
    nativeName: "татарча, tatarça, تاتارچا‎",
  },
  tw: {
    name: "Twi",
    nativeName: "Twi",
  },
  ty: {
    name: "Tahitian",
    nativeName: "Reo Tahiti",
  },
  ug: {
    name: "Uighur, Uyghur",
    nativeName: "Uyƣurqə, ئۇيغۇرچە‎",
  },
  uk: {
    name: "Ukrainian",
    nativeName: "українська",
  },
  ur: {
    name: "Urdu",
    nativeName: "اردو",
  },
  uz: {
    name: "Uzbek",
    nativeName: "zbek, Ўзбек, أۇزبېك‎",
  },
  ve: {
    name: "Venda",
    nativeName: "Tshivenḓa",
  },
  vi: {
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
  },
  vo: {
    name: "Volapük",
    nativeName: "Volapük",
  },
  wa: {
    name: "Walloon",
    nativeName: "Walon",
  },
  cy: {
    name: "Welsh",
    nativeName: "Cymraeg",
  },
  wo: {
    name: "Wolof",
    nativeName: "Wollof",
  },
  fy: {
    name: "Western Frisian",
    nativeName: "Frysk",
  },
  xh: {
    name: "Xhosa",
    nativeName: "isiXhosa",
  },
  yi: {
    name: "Yiddish",
    nativeName: "ייִדיש",
  },
  yo: {
    name: "Yoruba",
    nativeName: "Yorùbá",
  },
  za: {
    name: "Zhuang, Chuang",
    nativeName: "Saɯ cueŋƅ, Saw cuengh",
  },
});

// this is the default list of langs as returned by Lemmy.
export const DEFAULT_LANGS = [
  //   {
  //     // und is only present where there are other allowed langs (and not "all")
  //     id: 0,
  //     code: "und",
  //     name: "Undetermined",
  //   },
  {
    id: 1,
    code: "aa",
    name: "Afaraf",
  },
  {
    id: 2,
    code: "ab",
    name: "аҧсуа бызшәа",
  },
  {
    id: 3,
    code: "ae",
    name: "avesta",
  },
  {
    id: 4,
    code: "af",
    name: "Afrikaans",
  },
  {
    id: 5,
    code: "ak",
    name: "Akan",
  },
  {
    id: 6,
    code: "am",
    name: "አማርኛ",
  },
  {
    id: 7,
    code: "an",
    name: "aragonés",
  },
  {
    id: 8,
    code: "ar",
    name: "اَلْعَرَبِيَّةُ",
  },
  {
    id: 9,
    code: "as",
    name: "অসমীয়া",
  },
  {
    id: 10,
    code: "av",
    name: "авар мацӀ",
  },
  {
    id: 11,
    code: "ay",
    name: "aymar aru",
  },
  {
    id: 12,
    code: "az",
    name: "azərbaycan dili",
  },
  {
    id: 13,
    code: "ba",
    name: "башҡорт теле",
  },
  {
    id: 14,
    code: "be",
    name: "беларуская мова",
  },
  {
    id: 15,
    code: "bg",
    name: "български език",
  },
  {
    id: 16,
    code: "bi",
    name: "Bislama",
  },
  {
    id: 17,
    code: "bm",
    name: "bamanankan",
  },
  {
    id: 18,
    code: "bn",
    name: "বাংলা",
  },
  {
    id: 19,
    code: "bo",
    name: "བོད་ཡིག",
  },
  {
    id: 20,
    code: "br",
    name: "brezhoneg",
  },
  {
    id: 21,
    code: "bs",
    name: "bosanski jezik",
  },
  {
    id: 22,
    code: "ca",
    name: "Català",
  },
  {
    id: 23,
    code: "ce",
    name: "нохчийн мотт",
  },
  {
    id: 24,
    code: "ch",
    name: "Chamoru",
  },
  {
    id: 25,
    code: "co",
    name: "corsu",
  },
  {
    id: 26,
    code: "cr",
    name: "ᓀᐦᐃᔭᐍᐏᐣ",
  },
  {
    id: 27,
    code: "cs",
    name: "čeština",
  },
  {
    id: 28,
    code: "cu",
    name: "ѩзыкъ словѣньскъ",
  },
  {
    id: 29,
    code: "cv",
    name: "чӑваш чӗлхи",
  },
  {
    id: 30,
    code: "cy",
    name: "Cymraeg",
  },
  {
    id: 31,
    code: "da",
    name: "dansk",
  },
  {
    id: 32,
    code: "de",
    name: "Deutsch",
  },
  {
    id: 33,
    code: "dv",
    name: "ދިވެހި",
  },
  {
    id: 34,
    code: "dz",
    name: "རྫོང་ཁ",
  },
  {
    id: 35,
    code: "ee",
    name: "Eʋegbe",
  },
  {
    id: 36,
    code: "el",
    name: "Ελληνικά",
  },
  {
    id: 37,
    code: "en",
    name: "English",
  },
  {
    id: 38,
    code: "eo",
    name: "Esperanto",
  },
  {
    id: 39,
    code: "es",
    name: "Español",
  },
  {
    id: 40,
    code: "et",
    name: "eesti",
  },
  {
    id: 41,
    code: "eu",
    name: "euskara",
  },
  {
    id: 42,
    code: "fa",
    name: "فارسی",
  },
  {
    id: 43,
    code: "ff",
    name: "Fulfulde",
  },
  {
    id: 44,
    code: "fi",
    name: "suomi",
  },
  {
    id: 45,
    code: "fj",
    name: "vosa Vakaviti",
  },
  {
    id: 46,
    code: "fo",
    name: "føroyskt",
  },
  {
    id: 47,
    code: "fr",
    name: "Français",
  },
  {
    id: 48,
    code: "fy",
    name: "Frysk",
  },
  {
    id: 49,
    code: "ga",
    name: "Gaeilge",
  },
  {
    id: 50,
    code: "gd",
    name: "Gàidhlig",
  },
  {
    id: 51,
    code: "gl",
    name: "galego",
  },
  {
    id: 52,
    code: "gn",
    name: "Avañe'ẽ",
  },
  {
    id: 53,
    code: "gu",
    name: "ગુજરાતી",
  },
  {
    id: 54,
    code: "gv",
    name: "Gaelg",
  },
  {
    id: 55,
    code: "ha",
    name: "هَوُسَ",
  },
  {
    id: 56,
    code: "he",
    name: "עברית",
  },
  {
    id: 57,
    code: "hi",
    name: "हिन्दी",
  },
  {
    id: 58,
    code: "ho",
    name: "Hiri Motu",
  },
  {
    id: 59,
    code: "hr",
    name: "Hrvatski",
  },
  {
    id: 60,
    code: "ht",
    name: "Kreyòl ayisyen",
  },
  {
    id: 61,
    code: "hu",
    name: "magyar",
  },
  {
    id: 62,
    code: "hy",
    name: "Հայերեն",
  },
  {
    id: 63,
    code: "hz",
    name: "Otjiherero",
  },
  {
    id: 64,
    code: "ia",
    name: "Interlingua",
  },
  {
    id: 65,
    code: "id",
    name: "Bahasa Indonesia",
  },
  {
    id: 66,
    code: "ie",
    name: "Interlingue",
  },
  {
    id: 67,
    code: "ig",
    name: "Asụsụ Igbo",
  },
  {
    id: 68,
    code: "ii",
    name: "ꆈꌠ꒿ Nuosuhxop",
  },
  {
    id: 69,
    code: "ik",
    name: "Iñupiaq",
  },
  {
    id: 70,
    code: "io",
    name: "Ido",
  },
  {
    id: 71,
    code: "is",
    name: "Íslenska",
  },
  {
    id: 72,
    code: "it",
    name: "Italiano",
  },
  {
    id: 73,
    code: "iu",
    name: "ᐃᓄᒃᑎᑐᑦ",
  },
  {
    id: 74,
    code: "ja",
    name: "日本語",
  },
  {
    id: 75,
    code: "jv",
    name: "basa Jawa",
  },
  {
    id: 76,
    code: "ka",
    name: "ქართული",
  },
  {
    id: 77,
    code: "kg",
    name: "Kikongo",
  },
  {
    id: 78,
    code: "ki",
    name: "Gĩkũyũ",
  },
  {
    id: 79,
    code: "kj",
    name: "Kuanyama",
  },
  {
    id: 80,
    code: "kk",
    name: "қазақ тілі",
  },
  {
    id: 81,
    code: "kl",
    name: "kalaallisut",
  },
  {
    id: 82,
    code: "km",
    name: "ខេមរភាសា",
  },
  {
    id: 83,
    code: "kn",
    name: "ಕನ್ನಡ",
  },
  {
    id: 84,
    code: "ko",
    name: "한국어",
  },
  {
    id: 85,
    code: "kr",
    name: "Kanuri",
  },
  {
    id: 86,
    code: "ks",
    name: "कश्मीरी",
  },
  {
    id: 87,
    code: "ku",
    name: "Kurdî",
  },
  {
    id: 88,
    code: "kv",
    name: "коми кыв",
  },
  {
    id: 89,
    code: "kw",
    name: "Kernewek",
  },
  {
    id: 90,
    code: "ky",
    name: "Кыргызча",
  },
  {
    id: 91,
    code: "la",
    name: "latine",
  },
  {
    id: 92,
    code: "lb",
    name: "Lëtzebuergesch",
  },
  {
    id: 93,
    code: "lg",
    name: "Luganda",
  },
  {
    id: 94,
    code: "li",
    name: "Limburgs",
  },
  {
    id: 95,
    code: "ln",
    name: "Lingála",
  },
  {
    id: 96,
    code: "lo",
    name: "ພາສາລາວ",
  },
  {
    id: 97,
    code: "lt",
    name: "lietuvių kalba",
  },
  {
    id: 98,
    code: "lu",
    name: "Kiluba",
  },
  {
    id: 99,
    code: "lv",
    name: "latviešu valoda",
  },
  {
    id: 100,
    code: "mg",
    name: "fiteny malagasy",
  },
  {
    id: 101,
    code: "mh",
    name: "Kajin M̧ajeļ",
  },
  {
    id: 102,
    code: "mi",
    name: "te reo Māori",
  },
  {
    id: 103,
    code: "mk",
    name: "македонски јазик",
  },
  {
    id: 104,
    code: "ml",
    name: "മലയാളം",
  },
  {
    id: 105,
    code: "mn",
    name: "Монгол хэл",
  },
  {
    id: 106,
    code: "mr",
    name: "मराठी",
  },
  {
    id: 107,
    code: "ms",
    name: "Bahasa Melayu",
  },
  {
    id: 108,
    code: "mt",
    name: "Malti",
  },
  {
    id: 109,
    code: "my",
    name: "ဗမာစာ",
  },
  {
    id: 110,
    code: "na",
    name: "Dorerin Naoero",
  },
  {
    id: 111,
    code: "nb",
    name: "Norsk bokmål",
  },
  {
    id: 112,
    code: "nd",
    name: "isiNdebele",
  },
  {
    id: 113,
    code: "ne",
    name: "नेपाली",
  },
  {
    id: 114,
    code: "ng",
    name: "Owambo",
  },
  {
    id: 115,
    code: "nl",
    name: "Nederlands",
  },
  {
    id: 116,
    code: "nn",
    name: "Norsk nynorsk",
  },
  {
    id: 117,
    code: "no",
    name: "Norsk",
  },
  {
    id: 118,
    code: "nr",
    name: "isiNdebele",
  },
  {
    id: 119,
    code: "nv",
    name: "Diné bizaad",
  },
  {
    id: 120,
    code: "ny",
    name: "chiCheŵa",
  },
  {
    id: 121,
    code: "oc",
    name: "occitan",
  },
  {
    id: 122,
    code: "oj",
    name: "ᐊᓂᔑᓈᐯᒧᐎᓐ",
  },
  {
    id: 123,
    code: "om",
    name: "Afaan Oromoo",
  },
  {
    id: 124,
    code: "or",
    name: "ଓଡ଼ିଆ",
  },
  {
    id: 125,
    code: "os",
    name: "ирон æвзаг",
  },
  {
    id: 126,
    code: "pa",
    name: "ਪੰਜਾਬੀ",
  },
  {
    id: 127,
    code: "pi",
    name: "पाऴि",
  },
  {
    id: 128,
    code: "pl",
    name: "Polski",
  },
  {
    id: 129,
    code: "ps",
    name: "پښتو",
  },
  {
    id: 130,
    code: "pt",
    name: "Português",
  },
  {
    id: 131,
    code: "qu",
    name: "Runa Simi",
  },
  {
    id: 132,
    code: "rm",
    name: "rumantsch grischun",
  },
  {
    id: 133,
    code: "rn",
    name: "Ikirundi",
  },
  {
    id: 134,
    code: "ro",
    name: "Română",
  },
  {
    id: 135,
    code: "ru",
    name: "Русский",
  },
  {
    id: 136,
    code: "rw",
    name: "Ikinyarwanda",
  },
  {
    id: 137,
    code: "sa",
    name: "संस्कृतम्",
  },
  {
    id: 138,
    code: "sc",
    name: "sardu",
  },
  {
    id: 139,
    code: "sd",
    name: "सिन्धी",
  },
  {
    id: 140,
    code: "se",
    name: "Davvisámegiella",
  },
  {
    id: 141,
    code: "sg",
    name: "yângâ tî sängö",
  },
  {
    id: 142,
    code: "si",
    name: "සිංහල",
  },
  {
    id: 143,
    code: "sk",
    name: "slovenčina",
  },
  {
    id: 144,
    code: "sl",
    name: "slovenščina",
  },
  {
    id: 145,
    code: "sm",
    name: "gagana fa'a Samoa",
  },
  {
    id: 146,
    code: "sn",
    name: "chiShona",
  },
  {
    id: 147,
    code: "so",
    name: "Soomaaliga",
  },
  {
    id: 148,
    code: "sq",
    name: "Shqip",
  },
  {
    id: 149,
    code: "sr",
    name: "српски језик",
  },
  {
    id: 150,
    code: "ss",
    name: "SiSwati",
  },
  {
    id: 151,
    code: "st",
    name: "Sesotho",
  },
  {
    id: 152,
    code: "su",
    name: "Basa Sunda",
  },
  {
    id: 153,
    code: "sv",
    name: "Svenska",
  },
  {
    id: 154,
    code: "sw",
    name: "Kiswahili",
  },
  {
    id: 155,
    code: "ta",
    name: "தமிழ்",
  },
  {
    id: 156,
    code: "te",
    name: "తెలుగు",
  },
  {
    id: 157,
    code: "tg",
    name: "тоҷикӣ",
  },
  {
    id: 158,
    code: "th",
    name: "ไทย",
  },
  {
    id: 159,
    code: "ti",
    name: "ትግርኛ",
  },
  {
    id: 160,
    code: "tk",
    name: "Türkmençe",
  },
  {
    id: 161,
    code: "tl",
    name: "Wikang Tagalog",
  },
  {
    id: 162,
    code: "tn",
    name: "Setswana",
  },
  {
    id: 163,
    code: "to",
    name: "faka Tonga",
  },
  {
    id: 164,
    code: "tr",
    name: "Türkçe",
  },
  {
    id: 165,
    code: "ts",
    name: "Xitsonga",
  },
  {
    id: 166,
    code: "tt",
    name: "татар теле",
  },
  {
    id: 167,
    code: "tw",
    name: "Twi",
  },
  {
    id: 168,
    code: "ty",
    name: "Reo Tahiti",
  },
  {
    id: 169,
    code: "ug",
    name: "ئۇيغۇرچە‎",
  },
  {
    id: 170,
    code: "uk",
    name: "Українська",
  },
  {
    id: 171,
    code: "ur",
    name: "اردو",
  },
  {
    id: 172,
    code: "uz",
    name: "Ўзбек",
  },
  {
    id: 173,
    code: "ve",
    name: "Tshivenḓa",
  },
  {
    id: 174,
    code: "vi",
    name: "Tiếng Việt",
  },
  {
    id: 175,
    code: "vo",
    name: "Volapük",
  },
  {
    id: 176,
    code: "wa",
    name: "walon",
  },
  {
    id: 177,
    code: "wo",
    name: "Wollof",
  },
  {
    id: 178,
    code: "xh",
    name: "isiXhosa",
  },
  {
    id: 179,
    code: "yi",
    name: "ייִדיש",
  },
  {
    id: 180,
    code: "yo",
    name: "Yorùbá",
  },
  {
    id: 181,
    code: "za",
    name: "Saɯ cueŋƅ",
  },
  {
    id: 182,
    code: "zh",
    name: "中文",
  },
  {
    id: 183,
    code: "zu",
    name: "isiZulu",
  },
];
