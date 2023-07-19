import InstanceStore from "./storage/instance.js";
import CommunityStore from "./storage/community.js";
import UptimeStore from "./storage/uptime.js";
import FediverseStore from "./storage/fediverse.js";
import TrackingStore from "./storage/tracking.js";
import KBinStore from "./storage/kbin.js";

declare class RedisStorage {
  client: import("@redis/client").RedisClientType<
    {
      graph: {
        CONFIG_GET: typeof import("@redis/graph/dist/commands/CONFIG_GET.js");
        configGet: typeof import("@redis/graph/dist/commands/CONFIG_GET.js");
        CONFIG_SET: typeof import("@redis/graph/dist/commands/CONFIG_SET.js");
        configSet: typeof import("@redis/graph/dist/commands/CONFIG_SET.js");
        DELETE: typeof import("@redis/graph/dist/commands/DELETE.js");
        delete: typeof import("@redis/graph/dist/commands/DELETE.js");
        EXPLAIN: typeof import("@redis/graph/dist/commands/EXPLAIN.js");
        explain: typeof import("@redis/graph/dist/commands/EXPLAIN.js");
        LIST: typeof import("@redis/graph/dist/commands/LIST.js");
        list: typeof import("@redis/graph/dist/commands/LIST.js");
        PROFILE: typeof import("@redis/graph/dist/commands/PROFILE.js");
        profile: typeof import("@redis/graph/dist/commands/PROFILE.js");
        QUERY: typeof import("@redis/graph/dist/commands/QUERY.js");
        query: typeof import("@redis/graph/dist/commands/QUERY.js");
        RO_QUERY: typeof import("@redis/graph/dist/commands/RO_QUERY.js");
        roQuery: typeof import("@redis/graph/dist/commands/RO_QUERY.js");
        SLOWLOG: typeof import("@redis/graph/dist/commands/SLOWLOG.js");
        slowLog: typeof import("@redis/graph/dist/commands/SLOWLOG.js");
      };
      json: {
        ARRAPPEND: typeof import("@redis/json/dist/commands/ARRAPPEND.js");
        arrAppend: typeof import("@redis/json/dist/commands/ARRAPPEND.js");
        ARRINDEX: typeof import("@redis/json/dist/commands/ARRINDEX.js");
        arrIndex: typeof import("@redis/json/dist/commands/ARRINDEX.js");
        ARRINSERT: typeof import("@redis/json/dist/commands/ARRINSERT.js");
        arrInsert: typeof import("@redis/json/dist/commands/ARRINSERT.js");
        ARRLEN: typeof import("@redis/json/dist/commands/ARRLEN.js");
        arrLen: typeof import("@redis/json/dist/commands/ARRLEN.js");
        ARRPOP: typeof import("@redis/json/dist/commands/ARRPOP.js");
        arrPop: typeof import("@redis/json/dist/commands/ARRPOP.js");
        ARRTRIM: typeof import("@redis/json/dist/commands/ARRTRIM.js");
        arrTrim: typeof import("@redis/json/dist/commands/ARRTRIM.js");
        DEBUG_MEMORY: typeof import("@redis/json/dist/commands/DEBUG_MEMORY.js");
        debugMemory: typeof import("@redis/json/dist/commands/DEBUG_MEMORY.js");
        DEL: typeof import("@redis/json/dist/commands/DEL.js");
        del: typeof import("@redis/json/dist/commands/DEL.js");
        FORGET: typeof import("@redis/json/dist/commands/FORGET.js");
        forget: typeof import("@redis/json/dist/commands/FORGET.js");
        GET: typeof import("@redis/json/dist/commands/GET.js");
        get: typeof import("@redis/json/dist/commands/GET.js");
        MGET: typeof import("@redis/json/dist/commands/MGET.js");
        mGet: typeof import("@redis/json/dist/commands/MGET.js");
        NUMINCRBY: typeof import("@redis/json/dist/commands/NUMINCRBY.js");
        numIncrBy: typeof import("@redis/json/dist/commands/NUMINCRBY.js");
        NUMMULTBY: typeof import("@redis/json/dist/commands/NUMMULTBY.js");
        numMultBy: typeof import("@redis/json/dist/commands/NUMMULTBY.js");
        OBJKEYS: typeof import("@redis/json/dist/commands/OBJKEYS.js");
        objKeys: typeof import("@redis/json/dist/commands/OBJKEYS.js");
        OBJLEN: typeof import("@redis/json/dist/commands/OBJLEN.js");
        objLen: typeof import("@redis/json/dist/commands/OBJLEN.js");
        RESP: typeof import("@redis/json/dist/commands/RESP.js");
        resp: typeof import("@redis/json/dist/commands/RESP.js");
        SET: typeof import("@redis/json/dist/commands/SET.js");
        set: typeof import("@redis/json/dist/commands/SET.js");
        STRAPPEND: typeof import("@redis/json/dist/commands/STRAPPEND.js");
        strAppend: typeof import("@redis/json/dist/commands/STRAPPEND.js");
        STRLEN: typeof import("@redis/json/dist/commands/STRLEN.js");
        strLen: typeof import("@redis/json/dist/commands/STRLEN.js");
        TYPE: typeof import("@redis/json/dist/commands/TYPE.js");
        type: typeof import("@redis/json/dist/commands/TYPE.js");
      };
      ft: {
        _LIST: typeof import("@redis/search/dist/commands/_LIST.js");
        _list: typeof import("@redis/search/dist/commands/_LIST.js");
        ALTER: typeof import("@redis/search/dist/commands/ALTER.js");
        alter: typeof import("@redis/search/dist/commands/ALTER.js");
        AGGREGATE_WITHCURSOR: typeof import("@redis/search/dist/commands/AGGREGATE_WITHCURSOR.js");
        aggregateWithCursor: typeof import("@redis/search/dist/commands/AGGREGATE_WITHCURSOR.js");
        AGGREGATE: typeof import("@redis/search/dist/commands/AGGREGATE.js");
        aggregate: typeof import("@redis/search/dist/commands/AGGREGATE.js");
        ALIASADD: typeof import("@redis/search/dist/commands/ALIASADD.js");
        aliasAdd: typeof import("@redis/search/dist/commands/ALIASADD.js");
        ALIASDEL: typeof import("@redis/search/dist/commands/ALIASDEL.js");
        aliasDel: typeof import("@redis/search/dist/commands/ALIASDEL.js");
        ALIASUPDATE: typeof import("@redis/search/dist/commands/ALIASUPDATE.js");
        aliasUpdate: typeof import("@redis/search/dist/commands/ALIASUPDATE.js");
        CONFIG_GET: typeof import("@redis/search/dist/commands/CONFIG_GET.js");
        configGet: typeof import("@redis/search/dist/commands/CONFIG_GET.js");
        CONFIG_SET: typeof import("@redis/search/dist/commands/CONFIG_SET.js");
        configSet: typeof import("@redis/search/dist/commands/CONFIG_SET.js");
        CREATE: typeof import("@redis/search/dist/commands/CREATE.js");
        create: typeof import("@redis/search/dist/commands/CREATE.js");
        CURSOR_DEL: typeof import("@redis/search/dist/commands/CURSOR_DEL.js");
        cursorDel: typeof import("@redis/search/dist/commands/CURSOR_DEL.js");
        CURSOR_READ: typeof import("@redis/search/dist/commands/CURSOR_READ.js");
        cursorRead: typeof import("@redis/search/dist/commands/CURSOR_READ.js");
        DICTADD: typeof import("@redis/search/dist/commands/DICTADD.js");
        dictAdd: typeof import("@redis/search/dist/commands/DICTADD.js");
        DICTDEL: typeof import("@redis/search/dist/commands/DICTDEL.js");
        dictDel: typeof import("@redis/search/dist/commands/DICTDEL.js");
        DICTDUMP: typeof import("@redis/search/dist/commands/DICTDUMP.js");
        dictDump: typeof import("@redis/search/dist/commands/DICTDUMP.js");
        DROPINDEX: typeof import("@redis/search/dist/commands/DROPINDEX.js");
        dropIndex: typeof import("@redis/search/dist/commands/DROPINDEX.js");
        EXPLAIN: typeof import("@redis/search/dist/commands/EXPLAIN.js");
        explain: typeof import("@redis/search/dist/commands/EXPLAIN.js");
        EXPLAINCLI: typeof import("@redis/search/dist/commands/EXPLAINCLI.js");
        explainCli: typeof import("@redis/search/dist/commands/EXPLAINCLI.js");
        INFO: typeof import("@redis/search/dist/commands/INFO.js");
        info: typeof import("@redis/search/dist/commands/INFO.js");
        PROFILESEARCH: typeof import("@redis/search/dist/commands/PROFILE_SEARCH.js");
        profileSearch: typeof import("@redis/search/dist/commands/PROFILE_SEARCH.js");
        PROFILEAGGREGATE: typeof import("@redis/search/dist/commands/PROFILE_AGGREGATE.js");
        profileAggregate: typeof import("@redis/search/dist/commands/PROFILE_AGGREGATE.js");
        SEARCH: typeof import("@redis/search/dist/commands/SEARCH.js");
        search: typeof import("@redis/search/dist/commands/SEARCH.js");
        SPELLCHECK: typeof import("@redis/search/dist/commands/SPELLCHECK.js");
        spellCheck: typeof import("@redis/search/dist/commands/SPELLCHECK.js");
        SUGADD: typeof import("@redis/search/dist/commands/SUGADD.js");
        sugAdd: typeof import("@redis/search/dist/commands/SUGADD.js");
        SUGDEL: typeof import("@redis/search/dist/commands/SUGDEL.js");
        sugDel: typeof import("@redis/search/dist/commands/SUGDEL.js");
        SUGGET_WITHPAYLOADS: typeof import("@redis/search/dist/commands/SUGGET_WITHPAYLOADS.js");
        sugGetWithPayloads: typeof import("@redis/search/dist/commands/SUGGET_WITHPAYLOADS.js");
        SUGGET_WITHSCORES_WITHPAYLOADS: typeof import("@redis/search/dist/commands/SUGGET_WITHSCORES_WITHPAYLOADS.js");
        sugGetWithScoresWithPayloads: typeof import("@redis/search/dist/commands/SUGGET_WITHSCORES_WITHPAYLOADS.js");
        SUGGET_WITHSCORES: typeof import("@redis/search/dist/commands/SUGGET_WITHSCORES.js");
        sugGetWithScores: typeof import("@redis/search/dist/commands/SUGGET_WITHSCORES.js");
        SUGGET: typeof import("@redis/search/dist/commands/SUGGET.js");
        sugGet: typeof import("@redis/search/dist/commands/SUGGET.js");
        SUGLEN: typeof import("@redis/search/dist/commands/SUGLEN.js");
        sugLen: typeof import("@redis/search/dist/commands/SUGLEN.js");
        SYNDUMP: typeof import("@redis/search/dist/commands/SYNDUMP.js");
        synDump: typeof import("@redis/search/dist/commands/SYNDUMP.js");
        SYNUPDATE: typeof import("@redis/search/dist/commands/SYNUPDATE.js");
        synUpdate: typeof import("@redis/search/dist/commands/SYNUPDATE.js");
        TAGVALS: typeof import("@redis/search/dist/commands/TAGVALS.js");
        tagVals: typeof import("@redis/search/dist/commands/TAGVALS.js");
      };
      ts: {
        ADD: typeof import("@redis/time-series/dist/commands/ADD.js");
        add: typeof import("@redis/time-series/dist/commands/ADD.js");
        ALTER: typeof import("@redis/time-series/dist/commands/ALTER.js");
        alter: typeof import("@redis/time-series/dist/commands/ALTER.js");
        CREATE: typeof import("@redis/time-series/dist/commands/CREATE.js");
        create: typeof import("@redis/time-series/dist/commands/CREATE.js");
        CREATERULE: typeof import("@redis/time-series/dist/commands/CREATERULE.js");
        createRule: typeof import("@redis/time-series/dist/commands/CREATERULE.js");
        DECRBY: typeof import("@redis/time-series/dist/commands/DECRBY.js");
        decrBy: typeof import("@redis/time-series/dist/commands/DECRBY.js");
        DEL: typeof import("@redis/time-series/dist/commands/DEL.js");
        del: typeof import("@redis/time-series/dist/commands/DEL.js");
        DELETERULE: typeof import("@redis/time-series/dist/commands/DELETERULE.js");
        deleteRule: typeof import("@redis/time-series/dist/commands/DELETERULE.js");
        GET: typeof import("@redis/time-series/dist/commands/GET.js");
        get: typeof import("@redis/time-series/dist/commands/GET.js");
        INCRBY: typeof import("@redis/time-series/dist/commands/INCRBY.js");
        incrBy: typeof import("@redis/time-series/dist/commands/INCRBY.js");
        INFO_DEBUG: typeof import("@redis/time-series/dist/commands/INFO_DEBUG.js");
        infoDebug: typeof import("@redis/time-series/dist/commands/INFO_DEBUG.js");
        INFO: typeof import("@redis/time-series/dist/commands/INFO.js");
        info: typeof import("@redis/time-series/dist/commands/INFO.js");
        MADD: typeof import("@redis/time-series/dist/commands/MADD.js");
        mAdd: typeof import("@redis/time-series/dist/commands/MADD.js");
        MGET: typeof import("@redis/time-series/dist/commands/MGET.js");
        mGet: typeof import("@redis/time-series/dist/commands/MGET.js");
        MGET_WITHLABELS: typeof import("@redis/time-series/dist/commands/MGET_WITHLABELS.js");
        mGetWithLabels: typeof import("@redis/time-series/dist/commands/MGET_WITHLABELS.js");
        QUERYINDEX: typeof import("@redis/time-series/dist/commands/QUERYINDEX.js");
        queryIndex: typeof import("@redis/time-series/dist/commands/QUERYINDEX.js");
        RANGE: typeof import("@redis/time-series/dist/commands/RANGE.js");
        range: typeof import("@redis/time-series/dist/commands/RANGE.js");
        REVRANGE: typeof import("@redis/time-series/dist/commands/REVRANGE.js");
        revRange: typeof import("@redis/time-series/dist/commands/REVRANGE.js");
        MRANGE: typeof import("@redis/time-series/dist/commands/MRANGE.js");
        mRange: typeof import("@redis/time-series/dist/commands/MRANGE.js");
        MRANGE_WITHLABELS: typeof import("@redis/time-series/dist/commands/MRANGE_WITHLABELS.js");
        mRangeWithLabels: typeof import("@redis/time-series/dist/commands/MRANGE_WITHLABELS.js");
        MREVRANGE: typeof import("@redis/time-series/dist/commands/MREVRANGE.js");
        mRevRange: typeof import("@redis/time-series/dist/commands/MREVRANGE.js");
        MREVRANGE_WITHLABELS: typeof import("@redis/time-series/dist/commands/MREVRANGE_WITHLABELS.js");
        mRevRangeWithLabels: typeof import("@redis/time-series/dist/commands/MREVRANGE_WITHLABELS.js");
      };
      bf: {
        ADD: typeof import("@redis/bloom/dist/commands/bloom/ADD.js");
        add: typeof import("@redis/bloom/dist/commands/bloom/ADD.js");
        CARD: typeof import("@redis/bloom/dist/commands/bloom/CARD.js");
        card: typeof import("@redis/bloom/dist/commands/bloom/CARD.js");
        EXISTS: typeof import("@redis/bloom/dist/commands/bloom/EXISTS.js");
        exists: typeof import("@redis/bloom/dist/commands/bloom/EXISTS.js");
        INFO: typeof import("@redis/bloom/dist/commands/bloom/INFO.js");
        info: typeof import("@redis/bloom/dist/commands/bloom/INFO.js");
        INSERT: typeof import("@redis/bloom/dist/commands/bloom/INSERT.js");
        insert: typeof import("@redis/bloom/dist/commands/bloom/INSERT.js");
        LOADCHUNK: typeof import("@redis/bloom/dist/commands/bloom/LOADCHUNK.js");
        loadChunk: typeof import("@redis/bloom/dist/commands/bloom/LOADCHUNK.js");
        MADD: typeof import("@redis/bloom/dist/commands/bloom/MADD.js");
        mAdd: typeof import("@redis/bloom/dist/commands/bloom/MADD.js");
        MEXISTS: typeof import("@redis/bloom/dist/commands/bloom/MEXISTS.js");
        mExists: typeof import("@redis/bloom/dist/commands/bloom/MEXISTS.js");
        RESERVE: typeof import("@redis/bloom/dist/commands/bloom/RESERVE.js");
        reserve: typeof import("@redis/bloom/dist/commands/bloom/RESERVE.js");
        SCANDUMP: typeof import("@redis/bloom/dist/commands/bloom/SCANDUMP.js");
        scanDump: typeof import("@redis/bloom/dist/commands/bloom/SCANDUMP.js");
      };
      cms: {
        INCRBY: typeof import("@redis/bloom/dist/commands/count-min-sketch/INCRBY.js");
        incrBy: typeof import("@redis/bloom/dist/commands/count-min-sketch/INCRBY.js");
        INFO: typeof import("@redis/bloom/dist/commands/count-min-sketch/INFO.js");
        info: typeof import("@redis/bloom/dist/commands/count-min-sketch/INFO.js");
        INITBYDIM: typeof import("@redis/bloom/dist/commands/count-min-sketch/INITBYDIM.js");
        initByDim: typeof import("@redis/bloom/dist/commands/count-min-sketch/INITBYDIM.js");
        INITBYPROB: typeof import("@redis/bloom/dist/commands/count-min-sketch/INITBYPROB.js");
        initByProb: typeof import("@redis/bloom/dist/commands/count-min-sketch/INITBYPROB.js");
        MERGE: typeof import("@redis/bloom/dist/commands/count-min-sketch/MERGE.js");
        merge: typeof import("@redis/bloom/dist/commands/count-min-sketch/MERGE.js");
        QUERY: typeof import("@redis/bloom/dist/commands/count-min-sketch/QUERY.js");
        query: typeof import("@redis/bloom/dist/commands/count-min-sketch/QUERY.js");
      };
      cf: {
        ADD: typeof import("@redis/bloom/dist/commands/cuckoo/ADD.js");
        add: typeof import("@redis/bloom/dist/commands/cuckoo/ADD.js");
        ADDNX: typeof import("@redis/bloom/dist/commands/cuckoo/ADDNX.js");
        addNX: typeof import("@redis/bloom/dist/commands/cuckoo/ADDNX.js");
        COUNT: typeof import("@redis/bloom/dist/commands/cuckoo/COUNT.js");
        count: typeof import("@redis/bloom/dist/commands/cuckoo/COUNT.js");
        DEL: typeof import("@redis/bloom/dist/commands/cuckoo/DEL.js");
        del: typeof import("@redis/bloom/dist/commands/cuckoo/DEL.js");
        EXISTS: typeof import("@redis/bloom/dist/commands/cuckoo/EXISTS.js");
        exists: typeof import("@redis/bloom/dist/commands/cuckoo/EXISTS.js");
        INFO: typeof import("@redis/bloom/dist/commands/cuckoo/INFO.js");
        info: typeof import("@redis/bloom/dist/commands/cuckoo/INFO.js");
        INSERT: typeof import("@redis/bloom/dist/commands/cuckoo/INSERT.js");
        insert: typeof import("@redis/bloom/dist/commands/cuckoo/INSERT.js");
        INSERTNX: typeof import("@redis/bloom/dist/commands/cuckoo/INSERTNX.js");
        insertNX: typeof import("@redis/bloom/dist/commands/cuckoo/INSERTNX.js");
        LOADCHUNK: typeof import("@redis/bloom/dist/commands/cuckoo/LOADCHUNK.js");
        loadChunk: typeof import("@redis/bloom/dist/commands/cuckoo/LOADCHUNK.js");
        RESERVE: typeof import("@redis/bloom/dist/commands/cuckoo/RESERVE.js");
        reserve: typeof import("@redis/bloom/dist/commands/cuckoo/RESERVE.js");
        SCANDUMP: typeof import("@redis/bloom/dist/commands/cuckoo/SCANDUMP.js");
        scanDump: typeof import("@redis/bloom/dist/commands/cuckoo/SCANDUMP.js");
      };
      tDigest: {
        ADD: typeof import("@redis/bloom/dist/commands/t-digest/ADD.js");
        add: typeof import("@redis/bloom/dist/commands/t-digest/ADD.js");
        BYRANK: typeof import("@redis/bloom/dist/commands/t-digest/BYRANK.js");
        byRank: typeof import("@redis/bloom/dist/commands/t-digest/BYRANK.js");
        BYREVRANK: typeof import("@redis/bloom/dist/commands/t-digest/BYREVRANK.js");
        byRevRank: typeof import("@redis/bloom/dist/commands/t-digest/BYREVRANK.js");
        CDF: typeof import("@redis/bloom/dist/commands/t-digest/CDF.js");
        cdf: typeof import("@redis/bloom/dist/commands/t-digest/CDF.js");
        CREATE: typeof import("@redis/bloom/dist/commands/t-digest/CREATE.js");
        create: typeof import("@redis/bloom/dist/commands/t-digest/CREATE.js");
        INFO: typeof import("@redis/bloom/dist/commands/t-digest/INFO.js");
        info: typeof import("@redis/bloom/dist/commands/t-digest/INFO.js");
        MAX: typeof import("@redis/bloom/dist/commands/t-digest/MAX.js");
        max: typeof import("@redis/bloom/dist/commands/t-digest/MAX.js");
        MERGE: typeof import("@redis/bloom/dist/commands/t-digest/MERGE.js");
        merge: typeof import("@redis/bloom/dist/commands/t-digest/MERGE.js");
        MIN: typeof import("@redis/bloom/dist/commands/t-digest/MIN.js");
        min: typeof import("@redis/bloom/dist/commands/t-digest/MIN.js");
        QUANTILE: typeof import("@redis/bloom/dist/commands/t-digest/QUANTILE.js");
        quantile: typeof import("@redis/bloom/dist/commands/t-digest/QUANTILE.js");
        RANK: typeof import("@redis/bloom/dist/commands/t-digest/RANK.js");
        rank: typeof import("@redis/bloom/dist/commands/t-digest/RANK.js");
        RESET: typeof import("@redis/bloom/dist/commands/t-digest/RESET.js");
        reset: typeof import("@redis/bloom/dist/commands/t-digest/RESET.js");
        REVRANK: typeof import("@redis/bloom/dist/commands/t-digest/REVRANK.js");
        revRank: typeof import("@redis/bloom/dist/commands/t-digest/REVRANK.js");
        TRIMMED_MEAN: typeof import("@redis/bloom/dist/commands/t-digest/TRIMMED_MEAN.js");
        trimmedMean: typeof import("@redis/bloom/dist/commands/t-digest/TRIMMED_MEAN.js");
      };
      topK: {
        ADD: typeof import("@redis/bloom/dist/commands/top-k/ADD.js");
        add: typeof import("@redis/bloom/dist/commands/top-k/ADD.js");
        COUNT: typeof import("@redis/bloom/dist/commands/top-k/COUNT.js");
        count: typeof import("@redis/bloom/dist/commands/top-k/COUNT.js");
        INCRBY: typeof import("@redis/bloom/dist/commands/top-k/INCRBY.js");
        incrBy: typeof import("@redis/bloom/dist/commands/top-k/INCRBY.js");
        INFO: typeof import("@redis/bloom/dist/commands/top-k/INFO.js");
        info: typeof import("@redis/bloom/dist/commands/top-k/INFO.js");
        LIST_WITHCOUNT: typeof import("@redis/bloom/dist/commands/top-k/LIST_WITHCOUNT.js");
        listWithCount: typeof import("@redis/bloom/dist/commands/top-k/LIST_WITHCOUNT.js");
        LIST: typeof import("@redis/bloom/dist/commands/top-k/LIST.js");
        list: typeof import("@redis/bloom/dist/commands/top-k/LIST.js");
        QUERY: typeof import("@redis/bloom/dist/commands/top-k/QUERY.js");
        query: typeof import("@redis/bloom/dist/commands/top-k/QUERY.js");
        RESERVE: typeof import("@redis/bloom/dist/commands/top-k/RESERVE.js");
        reserve: typeof import("@redis/bloom/dist/commands/top-k/RESERVE.js");
      };
    } & import("redis").RedisModules,
    import("redis").RedisFunctions,
    import("redis").RedisScripts
  >;

  attributeMaxAge: number;

  instance: InstanceStore;
  community: CommunityStore;
  uptime: UptimeStore;
  fediverse: FediverseStore;
  tracking: TrackingStore;
  kbin: KBinStore;

  constructor();

  connect(): Promise<void>;
  close(): Promise<void>;

  // data is serialized to JSON with `JSON.stringify` before being stored
  putRedis(key: string, value: any): Promise<void>;
  putRedisTTL(key: string, value: any, expireInSeconds: number): Promise<void>;

  // returns a single stored object, json parsed
  getRedis(key: string): Promise<any | null>;

  // returns an array of stored objects, json parsed
  listRedis(key: string): Promise<string[]>;

  // returns a key-> value mapping of stored objects, json parsed
  listRedisWithKeys(key: string): Promise<{ key: string; value: string }[]>;

  // add a scored set to db
  redisZAdd(key: string, score: number, value: any): Promise<void>;

  deleteRedis(key: string): Promise<void>;

  getAttributeArray(baseUrl: string, attributeName: string): Promise<string[]>;

  getAttributesWithScores(
    baseUrl: string,
    attributeName: string
  ): Promise<{ value: string; score: number }[]>;
}

declare const storage: RedisStorage;
export default storage;
