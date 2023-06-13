export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// timeout for the instance and community crawlers
export const CRAWL_TIMEOUT = {
  INSTANCE: 120 * 1000, // 2 minutes in ms
  COMMUNITY: 120 * 1000, // 2 minutes in ms
};

// how many times to retry a failed job
export const CRAWL_RETRY = {
  INSTANCE: 2,
  COMMUNITY: 2,
};

// the minimum amount of time (in ms) between crawling the same instance
export const MIN_RECRAWL_MS = 5 * 60 * 1000; // 5 minutes in ms

// look for old records to re-crawl
export const RECRAWL_AGED_MS = 24 * 60 * 60 * 1000; // 24 hours in ms

// how often should the cron run with --cron
export const AGED_CRON = "*/5 * * * *"; // every 5 minutes

// the maximum age (in ms) for output items to be included in the json dumps
export const OUTPUT_MAX_AGE_MS = 10 * 60 * 60 * 1000; // 24 hours in ms

export const FEDDIT_URLS = [
  "0xdd.org.ru",
  "1337lemmy.com",
  "aiparadise.moe",
  "anarch.is",
  "apollo.town",
  "aussie.zone",
  "bakchodi.org",
  "baomi.tv",
  "baraza.africa",
  "bbs.9tail.net",
  "bbs.darkwitch.net",
  "beehaw.org",
  "bluuit.org",
  "board.minimally.online",
  "bolha.social",
  "booty.world",
  "bulletintree.com",
  "butts.international",
  "cigar.cx",
  "civilloquy.com",
  "clatter.eu",
  "code4lib.net",
  "collapse.cat",
  "communick.news",
  "community.nicfab.it",
  "compuverse.uk",
  "cubing.social",
  "dataterm.digital",
  "diggit.xyz",
  "discuss.jacen.moe",
  "discuss.ntfy.sh",
  "discuss.online",
  "discuss.tchncs.de",
  "dmv.social",
  "donky.social",
  "dormi.zone",
  "drak.gg",
  "eslemmy.es",
  "eviltoast.org",
  "exploding-heads.com",
  "fanaticus.social",
  "feddi.no",
  "feddit.ch",
  "feddit.cl",
  "feddit.de",
  "feddit.dk",
  "feddit.eu",
  "feddit.it",
  "feddit.jp",
  "feddit.nl",
  "federotica.com",
  "fedibb.ml",
  "fediverse.ro",
  "fig.systems",
  "footkaput.com",
  "foros.fediverso.gal",
  "forum.nobigtech.es",
  "granitestate.social",
  "group.lt",
  "hakbox.social",
  "haynerds.com",
  "hc.frorayz.tech",
  "info.prou.be",
  "infosec.pub",
  "innernet.link",
  "invariant-marxism.red",
  "ka.tet42.org",
  "kyu.de",
  "l.nulltext.org",
  "labdegato.com",
  "latte.isnot.coffee",
  "lem.ph3j.com",
  "lem.simple-gear.com",
  "lemm.ee",
  "lemmit.online",
  "lemmit.xyz",
  "lemmy-ujt-u4842.vm.elestio.app",
  "lemmy.4d2.org",
  "lemmy.ananace.dev",
  "lemmy.anji.nl",
  "lemmy.antemeridiem.xyz",
  "lemmy.best",
  "lemmy.blahaj.zone",
  "lemmy.borlax.com",
  "lemmy.bulwarkob.com",
  "lemmy.burdocksoft.com",
  "lemmy.burger.rodeo",
  "lemmy.ca",
  "lemmy.cablepick.net",
  "lemmy.cafe",
  "lemmy.click",
  "lemmy.cnschn.com",
  "lemmy.cock.social",
  "lemmy.com.tr",
  "lemmy.comfysnug.space",
  "lemmy.coupou.fr",
  "lemmy.dbzer0.com",
  "lemmy.dcrich.net",
  "lemmy.deadca.de",
  "lemmy.directory",
  "lemmy.dormedas.com",
  "lemmy.dougiverse.io",
  "lemmy.douwes.co.uk",
  "lemmy.dupper.net",
  "lemmy.easfrq.live",
  "lemmy.einval.net",
  "lemmy.eus",
  "lemmy.fdvrs.xyz",
  "lemmy.fedisonic.cloud",
  "lemmy.fediverse.jp",
  "lemmy.film",
  "lemmy.fmhy.ml",
  "lemmy.frozeninferno.xyz",
  "lemmy.fun",
  "lemmy.gjz010.com",
  "lemmy.glasgow.social",
  "lemmy.graz.social",
  "lemmy.gsp8181.co.uk",
  "lemmy.helios42.de",
  "lemmy.helvetet.eu",
  "lemmy.hopskipjump.cloud",
  "lemmy.hpost.no",
  "lemmy.initq.net",
  "lemmy.intai.tech",
  "lemmy.jerick.xyz",
  "lemmy.johnpanos.com",
  "lemmy.jpaulus.io",
  "lemmy.jpiolho.com",
  "lemmy.juggler.jp",
  "lemmy.keychat.org",
  "lemmy.knocknet.net",
  "lemmy.ko4abp.com",
  "lemmy.kya.moe",
  "lemmy.loomy.li",
  "lemmy.maples.dev",
  "lemmy.matthe815.dev",
  "lemmy.media",
  "lemmy.menos.gotdns.org",
  "lemmy.mentalarts.info",
  "lemmy.ml",
  "lemmy.my.id",
  "lemmy.nauk.io",
  "lemmy.nerdcore.social",
  "lemmy.nexus",
  "lemmy.nine-hells.net",
  "lemmy.notdead.net",
  "lemmy.nrd.li",
  "lemmy.nz",
  "lemmy.one",
  "lemmy.otakufarms.com",
  "lemmy.parasrah.com",
  "lemmy.pastwind.top",
  "lemmy.pe1uca.dev",
  "lemmy.perthchat.org",
  "lemmy.picote.ch",
  "lemmy.pimenta.pt",
  "lemmy.pineapplemachine.com",
  "lemmy.pipe01.net",
  "lemmy.plasmatrap.com",
  "lemmy.podycust.co.uk",
  "lemmy.ppl.town",
  "lemmy.pt",
  "lemmy.ptznetwork.org",
  "lemmy.reckless.dev",
  "lemmy.redkrieg.com",
  "lemmy.rimkus.it",
  "lemmy.rogers-net.com",
  "lemmy.rollenspiel.monster",
  "lemmy.roombob.cat",
  "lemmy.s9m.xyz",
  "lemmy.saik0.com",
  "lemmy.scam-mail.me",
  "lemmy.schuerz.at",
  "lemmy.sdf.org",
  "lemmy.secnd.me",
  "lemmy.services.coupou.fr",
  "lemmy.smeargle.fans",
  "lemmy.snoot.tube",
  "lemmy.spacestation14.com",
  "lemmy.sprawl.club",
  "lemmy.srv.eco",
  "lemmy.staphup.nl",
  "lemmy.starlightkel.xyz",
  "lemmy.studio",
  "lemmy.tanktrace.de",
  "lemmy.tedomum.net",
  "lemmy.tf",
  "lemmy.tillicumnet.com",
  "lemmy.today",
  "lemmy.toot.pt",
  "lemmy.towards.vision",
  "lemmy.trippy.pizza",
  "lemmy.tuiter.ovh",
  "lemmy.umainfo.live",
  "lemmy.uncomfortable.business",
  "lemmy.uninsane.org",
  "lemmy.utopify.org",
  "lemmy.vanoverloop.xyz",
  "lemmy.villa-straylight.social",
  "lemmy.vrchat-dev.tech",
  "lemmy.w9r.de",
  "lemmy.weckhorst.no",
  "lemmy.wizjenkins.com",
  "lemmy.world",
  "lemmy.wtf",
  "lemmy.wxbu.de",
  "lemmy.xoynq.com",
  "lemmy.zip",
  "lemmy.zmiguel.me",
  "lemmy2.addictmud.org",
  "lemmybedan.com",
  "lemmydeals.com",
  "lemmyfly.org",
  "lemmygrad.ml",
  "lemmyland.com",
  "lemmyngs.social",
  "lemmynsfw.com",
  "lemmypets.xyz",
  "lemmyrs.org",
  "lib.lgbt",
  "liminal.southfox.me",
  "link.fossdle.org",
  "linkage.ds8.zone",
  "links.decafbad.com",
  "links.hackliberty.org",
  "links.rocks",
  "links.roobre.es",
  "lm.gsk.moe",
  "lm.korako.me",
  "lm.paradisus.day",
  "lm.qtt.no",
  "lmmy.net",
  "lostcheese.com",
  "mander.xyz",
  "matejc.com",
  "merv.news",
  "midwest.social",
  "mindshare.space",
  "monero.house",
  "mujico.org",
  "mylem.my",
  "negativenull.com",
  "news.deghg.org",
  "news.juliette.page",
  "no.lastname.nz",
  "nuniandfamily.com",
  "omg.qa",
  "orava.dev",
  "outpost.zeuslink.net",
  "partizle.com",
  "pathfinder.social",
  "pathofexile-discuss.com",
  "pawb.social",
  "philly.page",
  "popplesburger.hilciferous.nl",
  "poptalk.scrubbles.tech",
  "possumpat.io",
  "posta.no",
  "programming.dev",
  "quex.cc",
  "radiation.party",
  "rammy.site",
  "read.widerweb.org",
  "reddthat.com",
  "remmy.dragonpsi.xyz",
  "retarded.dev",
  "seemel.ink",
  "sffa.community",
  "sh.itjust.works",
  "sha1.nl",
  "sigmet.io",
  "slangenettet.pyjam.as",
  "slrpnk.net",
  "social.sour.is",
  "sopuli.xyz",
  "stammtisch.hallertau.social",
  "startrek.website",
  "streetbikes.club",
  "sub.wetshaving.social",
  "suppo.fi",
  "szmer.info",
  "tezzo.f0rk.pl",
  "theotter.social",
  "thesimplecorner.org",
  "toast.ooo",
  "toons.zone",
  "tucson.social",
  "vlemmy.net",
  "voxpop.social",
  "waveform.social",
  "wayfarershaven.eu",
  "whatyoulike.club",
  "whiskers.bim.boats",
  "yiffit.net",
  "zemmy.cc",
  "zoo.splitlinux.org",
];

export const START_URLS = ["lemmy.tgxn.net", ...FEDDIT_URLS];
