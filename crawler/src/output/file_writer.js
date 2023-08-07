import { open } from "node:fs/promises";
import path from "node:path";

import { rm, mkdir } from "node:fs/promises";

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
  constructor() {
    this.publicDataFolder = `../frontend/public/data`;
    this.metricsPath = `${this.publicDataFolder}/metrics`;

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
  }

  /**
   * this method is used to split the data into smaller files for easier loading
   *
   * @param {string} chunkName - the name of the chunk, used for the filename
   * @param {number} perFile - how many entries per file
   * @param {array} dataArray - the data array to split
   */
  async storeChunkedData(chunkName, perFile, dataArray) {
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
  async storeFediverseData(data, softwareData, softwareBaseUrls) {
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
  }

  /**
   * this method is used to store the instance metrics data
   *
   * @param {string} instanceBaseUrl - the base url of the instance
   * @param {object} data - the instance metrics data
   */
  async storeInstanceMetricsData(instanceBaseUrl, data) {
    await mkdir(this.metricsPath, {
      recursive: true,
    });

    await this.writeJsonFile(
      `${this.metricsPath}/${instanceBaseUrl}.meta.json`,
      JSON.stringify(data)
    );
  }

  async storeMetaData(data) {
    await this.writeJsonFile(
      `${this.publicDataFolder}/meta.json`,
      JSON.stringify(data)
    );
  }

  async storeInstanceErrors(data) {
    await this.writeJsonFile(
      `${this.publicDataFolder}/instanceErrors.json`,
      JSON.stringify(data)
    );
  }

  async storeSuspicousData(data) {
    await this.writeJsonFile(
      `${this.publicDataFolder}/sus.json`,
      JSON.stringify(data)
    );
  }

  async storeKbinInstanceList(data) {
    await this.writeJsonFile(
      `${this.publicDataFolder}/kbin.min.json`,
      JSON.stringify(data)
    );
  }

  async storeKBinMagazineData(data) {
    await this.storeChunkedData("magazines", this.magazinesPerFile, data);
  }

  async cleanData() {
    await rm(this.publicDataFolder, { recursive: true, force: true });
    await mkdir(this.publicDataFolder, { recursive: true });
  }

  async writeJsonFile(filename, data) {
    let filehandle = null;
    try {
      filehandle = await open(filename, "w");
      await filehandle.writeFile(data);
    } finally {
      await filehandle?.close();
    }
  }
}
