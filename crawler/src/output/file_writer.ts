import path from "node:path";
import { open, rm, mkdir } from "node:fs/promises";

/**
 * OutputFileWriter - This class handles writing the output JSON files.
 *
 * It handles splitting/chunking the data into smaller files for easier loading.
 *
 */

// love you all

// split communities.json and instances.json into smaller files for easier loading

// community-index.json
// {
//     "baseurl": "lemmy.world",
//     "url": "https://lemmy.world/c/dua_lipa",
//     "name": "dua_lipa",
//     "title": "Dualipa",
//     "desc": "",
//     "icon": null,
//     "banner": null,
//     "nsfw": false,
//     "counts": {
//       "id": 10634,
//       "community_id": 30413,
//       "subscribers": 1,
//       "posts": 0,
//       "comments": 0,
//       "published": "2023-06-23T11:16:56.018957",
//       "users_active_day": 0,
//       "users_active_week": 0,
//       "users_active_month": 0,
//       "users_active_half_year": 0,
//       "hot_rank": 7
//     },
//     "time": 1687658284587,
//     "isSuspicious": false,
//     "score": 724
//   }

// minified version, only enough for sort/filter
// {
//     "base": "lemmy.ml",
//     "title": "Lemmy!",
//     "name": "lemmy",
//     "desc": "lemmy instance is cool and stuff!",
//     "sort": {
//       "score": 724,  //smart sort
//       "subscribers": 1,
//       "users": "users_active_week",
//       "posts": 0,
//       "comments": 0,
//      }
// }

// instance-index.json

// should do all the things needed to transform the redis data into data for frontend
export default class OutputFileWriter {
  private publicDataFolder: string;
  private metricsPath: string;
  private communityMetricsPath: string;

  private communitiesPerFile: number;
  private instancesPerFile: number;
  private magazinesPerFile: number;

  constructor() {
    this.publicDataFolder = `../frontend/public/data`;

    // stores a .meta file for each instance
    this.metricsPath = `${this.publicDataFolder}/metrics`;

    // stores a .meta file for each community under instance DIR
    this.communityMetricsPath = `${this.publicDataFolder}/community-metrics`;

    // tuning the amount of entries per-file
    this.communitiesPerFile = 500;
    this.instancesPerFile = 100;
    this.magazinesPerFile = 500;
  }

  async storeInstanceData(instanceArray) {
    await this.storeChunkedData(
      "instance",
      this.instancesPerFile,
      instanceArray
    );

    // minified version, just names and base urls
    const minInstanceArray = instanceArray.map((instance) => {
      return {
        name: instance.name,
        base: instance.baseurl,
        score: instance.score,
      };
    });

    await this.writeJsonFile(
      `${this.publicDataFolder}/instance.min.json`,
      JSON.stringify(minInstanceArray)
    );
  }

  async storeCommunityData(communityArray) {
    await this.storeChunkedData(
      "community",
      this.communitiesPerFile,
      communityArray
    );

    for (let i = 0; i < communityArray.length; i++) {
      await this.storeCommunityMetricsData(
        communityArray[i].baseurl,
        communityArray[i]
      );
    }
  }

  /**
   * this method is used to split the data into smaller files for easier loading
   *
   * @param {string} chunkName - the name of the chunk, used for the filename
   * @param {number} perFile - how many entries per file
   * @param {array} dataArray - the data array to split
   */
  async storeChunkedData(chunkName: string, perFile: number, dataArray: any) {
    await this.writeJsonFile(
      `${this.publicDataFolder}/${chunkName}.full.json`,
      JSON.stringify(dataArray)
    );

    // mapped versions and the metadata
    await mkdir(path.join(this.publicDataFolder, chunkName), {
      recursive: true,
    });

    let fileCount = 0;
    for (let i = 0; i < dataArray.length; i += perFile) {
      let chunk = dataArray.slice(i, i + perFile);

      await this.writeJsonFile(
        `${this.publicDataFolder}/${chunkName}/${fileCount}.json`,
        JSON.stringify(chunk)
      );
      fileCount++;
    }

    await this.writeJsonFile(
      `${this.publicDataFolder}/${chunkName}.json`,
      JSON.stringify({
        count: fileCount,
      })
    );
  }

  /**
   * this method is used to store the fediverse data
   *
   * @param {object} data - the fediverse data
   * @param {object} softwareData - the fediverse software data
   * @param {object} softwareBaseUrls - the fediverse software base urls
   */
  async storeFediverseData(
    data: any,
    softwareData: any,
    softwareBaseUrls: any,
    fediTags: any
  ) {
    await this.writeJsonFile(
      `${this.publicDataFolder}/fediverse.json`,
      JSON.stringify(data)
    );
    await this.writeJsonFile(
      `${this.publicDataFolder}/fediverse_software_counts.json`,
      JSON.stringify(softwareData)
    );
    await this.writeJsonFile(
      `${this.publicDataFolder}/fediverse_software_sites.json`,
      JSON.stringify(softwareBaseUrls)
    );

    // write tags meta
    await this.writeJsonFile(
      `${this.publicDataFolder}/tags.meta.json`,
      JSON.stringify(fediTags)
    );
  }

  /**
   * this method is used to store the instance metrics data
   *
   * @param {string} instanceBaseUrl - the base url of the instance
   * @param {object} data - the instance metrics data
   */
  async storeInstanceMetricsData(instanceBaseUrl: String, data: any) {
    await mkdir(this.metricsPath, {
      recursive: true,
    });

    await this.writeJsonFile(
      `${this.metricsPath}/${instanceBaseUrl}.meta.json`,
      JSON.stringify(data)
    );
  }

  /**
   * this method is used to store the community metrics data
   *
   * @param {string} instanceBaseUrl - the base url of the instance
   * @param {object} data - the instance metrics data
   */
  async storeCommunityMetricsData(instanceBaseUrl: string, communityData: any) {
    await mkdir(`${this.communityMetricsPath}/${instanceBaseUrl}`, {
      recursive: true,
    });

    await this.writeJsonFile(
      `${this.communityMetricsPath}/${instanceBaseUrl}/${communityData.name}.meta.json`,
      JSON.stringify(communityData)
    );
  }

  async storeMetaData(data: any) {
    await this.writeJsonFile(
      `${this.publicDataFolder}/meta.json`,
      JSON.stringify(data)
    );
  }

  async storeInstanceErrors(data: any) {
    await this.writeJsonFile(
      `${this.publicDataFolder}/instanceErrors.json`,
      JSON.stringify(data)
    );
  }

  async storeSuspicousData(data: any) {
    await this.writeJsonFile(
      `${this.publicDataFolder}/sus.json`,
      JSON.stringify(data)
    );
  }

  async storeKbinInstanceList(data: any) {
    await this.writeJsonFile(
      `${this.publicDataFolder}/kbin.min.json`,
      JSON.stringify(data)
    );
  }

  async storeKBinMagazineData(data: any) {
    await this.storeChunkedData("magazines", this.magazinesPerFile, data);
  }

  async cleanData() {
    await rm(this.publicDataFolder, { recursive: true, force: true });
    await mkdir(this.publicDataFolder, { recursive: true });
  }

  async writeJsonFile(filename: string, data: any) {
    let filehandle: any = null;
    try {
      filehandle = await open(filename, "w");

      await filehandle?.writeFile(data);
    } finally {
      await filehandle?.close();
    }
  }
}
