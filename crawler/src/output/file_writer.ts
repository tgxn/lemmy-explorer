import path from "node:path";
import { open, rm, mkdir, FileHandle, readdir, stat } from "node:fs/promises";

import { OUTPUT_DIR } from "../lib/const";

import type {
  IMetaDataOutput,
  IInstanceDataOutput,
  ICommunityDataOutput,
  IMBinInstanceOutput,
  IMBinMagazineOutput,
  IFediverseDataOutput,
  IClassifiedErrorOutput,
} from "../../../types/output";

/**
 * OutputFileWriter - This class handles writing the output JSON files.
 *
 * It handles splitting/chunking the data into smaller files for easier loading.
 *
 */

// love you all

// type IInstanceOutput = {};

// // minified version, only enough for sort/filter
// // {
// //     "base": "lemmy.ml",
// //     "title": "Lemmy!",
// //     "name": "lemmy",
// //     "desc": "lemmy instance is cool and stuff!",
// //     "sort": {
// //       "score": 724,  //smart sort
// //       "subscribers": 1,
// //       "users": "users_active_week",
// //       "posts": 0,
// //       "comments": 0,
// //      }
// // }
// type IInstanceMinOutput = {};
// type IInstanceMetaOutput = {};

// type ICommunityOutput = {};
// type ICommunityMinOutput = {};

// type IMagazineOutput = {};

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

// instance-index.json

// should do all the things needed to transform the redis data into data for frontend
export default class OutputFileWriter {
  private publicDataFolder: string;
  private metricsPath: string;
  private communityMetricsPath: string;

  private communitiesPerFile: number;
  private instancesPerFile: number;
  private magazinesPerFile: number;
  private piefedCommunitiesPerFile: number;

  constructor() {
    // throw if the output directory is not set
    if (!OUTPUT_DIR || OUTPUT_DIR === "") {
      throw new Error("OUTPUT_DIR is not set. Please set it in the environment variables.");
    }

    this.publicDataFolder = OUTPUT_DIR;

    // stores a .meta file for each instance
    this.metricsPath = `${this.publicDataFolder}/metrics`;

    // stores a .meta file for each community under instance DIR
    this.communityMetricsPath = `${this.publicDataFolder}/community-metrics`;

    // tuning the amount of entries per-file
    this.communitiesPerFile = 500;
    this.instancesPerFile = 100;
    this.magazinesPerFile = 500;
    this.piefedCommunitiesPerFile = 500;
  }

  async storeInstanceData(instanceArray) {
    await this.storeChunkedData("instance", this.instancesPerFile, instanceArray);

    // minified version, just names and base urls
    const minInstanceArray = instanceArray.map((instance) => {
      return {
        name: instance.name,
        base: instance.baseurl,
        score: instance.score,
      };
    });

    await this.writeJsonFile(`${this.publicDataFolder}/instance.min.json`, JSON.stringify(minInstanceArray));
  }

  async storeCommunityData(communityArray) {
    await this.storeChunkedData("community", this.communitiesPerFile, communityArray);

    for (let i = 0; i < communityArray.length; i++) {
      await this.storeCommunityMetricsData(communityArray[i].baseurl, communityArray[i]);
    }
  }

  /**
   * this method is used to store the fediverse data
   */
  public async storeFediverseData(data: any, softwareData: any, softwareBaseUrls: any, fediTags: any) {
    await this.writeJsonFile(`${this.publicDataFolder}/fediverse.json`, JSON.stringify(data));
    await this.writeJsonFile(
      `${this.publicDataFolder}/fediverse_software_counts.json`,
      JSON.stringify(softwareData),
    );
    await this.writeJsonFile(
      `${this.publicDataFolder}/fediverse_software_sites.json`,
      JSON.stringify(softwareBaseUrls),
    );

    // write tags meta
    await this.writeJsonFile(`${this.publicDataFolder}/tags.meta.json`, JSON.stringify(fediTags));
  }

  async storeMetricsSeries(data: { versions: any; versionKeys: any; uniqueVersions: any }) {
    await this.writeJsonFile(`${this.publicDataFolder}/metrics.series.json`, JSON.stringify(data, null, 2));
  }
  /**v
   * this method is used to store the instance metrics data
   */

  public async storeInstanceMetricsData(
    instanceBaseUrl: String,
    data: {
      instance: any[];
      communityCount: number;
      users: any[];
      communities: any[];
      posts: any[];
      comments: any[];
      versions: any[];
      usersActiveDay: any[];
      usersActiveMonth: any[];
      usersActiveWeek: any[];
    },
  ) {
    await mkdir(this.metricsPath, {
      recursive: true,
    });

    await this.writeJsonFile(`${this.metricsPath}/${instanceBaseUrl}.meta.json`, JSON.stringify(data));
  }

  /**
   * this method is used to store the community metrics data
   */
  public async storeCommunityMetricsData(instanceBaseUrl: string, communityData: any) {
    // make sure the directory exists for the instance
    await mkdir(`${this.communityMetricsPath}/${instanceBaseUrl}`, {
      recursive: true,
    });

    await this.writeJsonFile(
      `${this.communityMetricsPath}/${instanceBaseUrl}/${communityData.name}.meta.json`,
      JSON.stringify(communityData),
    );
  }

  public async storeMetaData(data: IMetaDataOutput) {
    await this.writeJsonFile(`${this.publicDataFolder}/meta.json`, JSON.stringify(data));
  }

  public async storeInstanceErrors(data: any) {
    await this.writeJsonFile(`${this.publicDataFolder}/instanceErrors.json`, JSON.stringify(data));
  }

  public async storeSuspicousData(data: any) {
    await this.writeJsonFile(`${this.publicDataFolder}/sus.json`, JSON.stringify(data));
  }

  // stores an array of the string baseUrl
  public async storeMBinInstanceData(data: string[]) {
    await this.writeJsonFile(`${this.publicDataFolder}/mbin.min.json`, JSON.stringify(data));
  }

  public async storeMBinMagazineData(data: any) {
    await this.storeChunkedData("magazines", this.magazinesPerFile, data);
  }

  // stores an array of the string baseUrl
  public async storePiefedInstanceData(data: string[]) {
    await this.writeJsonFile(`${this.publicDataFolder}/piefed.min.json`, JSON.stringify(data));
  }

  public async storePiefedCommunityData(data: any) {
    await this.storeChunkedData("piefed_communities", this.piefedCommunitiesPerFile, data);
  }

  /**
   * this method is used to clean (delete all files) the data folder
   */
  public async cleanData(): Promise<void> {
    await rm(this.publicDataFolder, { recursive: true, force: true });
    await mkdir(this.publicDataFolder, { recursive: true });
  }

  /**
   * this method is used to split the data into smaller files for easier loading
   */
  private async storeChunkedData(chunkName: string, perFile: number, dataArray: []): Promise<void> {
    await this.writeJsonFile(`${this.publicDataFolder}/${chunkName}.full.json`, JSON.stringify(dataArray));

    // mapped versions and the metadata
    await mkdir(path.join(this.publicDataFolder, chunkName), {
      recursive: true,
    });

    let fileCount = 0;
    for (let i = 0; i < dataArray.length; i += perFile) {
      let chunk = dataArray.slice(i, i + perFile);

      await this.writeJsonFile(
        `${this.publicDataFolder}/${chunkName}/${fileCount}.json`,
        JSON.stringify(chunk),
      );
      fileCount++;
    }

    await this.writeJsonFile(
      `${this.publicDataFolder}/${chunkName}.json`,
      JSON.stringify({
        count: fileCount,
      }),
    );
  }

  /**
   * this method is used to write a JSON file
   */
  private async writeJsonFile(fileName: string, data: string): Promise<void> {
    let filehandle: FileHandle | null = null;
    try {
      filehandle = await open(fileName, "w");

      await filehandle?.writeFile(data);
    } finally {
      await filehandle?.close();
    }
  }

  // this function will do a recurive file size on the output directory, and calculate the total size for each folder and file, (sub-files should be hidden in the total for the folder itself.)
  // then it should show the top-5 files and directories by size in a nice table format.
  // it must not rely on any other classes
  public async calculateFilesizeMetrics() {
    // scan the directory
    const outputDir = this.publicDataFolder;

    const outputFiles = await readdir(outputDir, { withFileTypes: true });

    const fileSizes: { [key: string]: number } = {};

    for (const file of outputFiles) {
      const filePath = path.join(outputDir, file.name);

      // if it is a directory, get the size of the directory
      if (file.isDirectory()) {
        const dirSize = await this.getDirectorySize(filePath);
        fileSizes[file.name] = dirSize;
      } else {
        // if it is a file, get the size of the file
        const stats = await stat(filePath);
        fileSizes[file.name] = stats.size;
      }
    }

    // sort the files by size

    const sortedFiles = Object.entries(fileSizes).sort((a, b) => b[1] - a[1]);

    // get the top 10 files and directories

    const topFiles = sortedFiles.slice(0, 10).map(([name, size]) => ({
      name,
      size: (size / (1024 * 1024)).toFixed(2) + " MB", // convert to MB
    }));

    //  output to a table
    console.table(topFiles, ["name", "size"]);
  }

  // get the size of a directory recursively
  private async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;

    const files = await readdir(dirPath, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dirPath, file.name);

      if (file.isDirectory()) {
        // if it is a directory, get the size of the directory recursively
        totalSize += await this.getDirectorySize(filePath);
      } else {
        // if it is a file, get the size of the file
        const stats = await stat(filePath);
        totalSize += stats.size;
      }
    }

    return totalSize;
  }
}
