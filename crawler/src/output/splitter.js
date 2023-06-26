import { open } from "node:fs/promises";

import { rm, mkdir } from "node:fs/promises";

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
export default class PrepareFrontendData {
  constructor() {
    this.publicDataFolder = `../frontend/public/data`;

    this.communityPath = `${this.publicDataFolder}/community`;
    this.instancePath = `${this.publicDataFolder}/instance`;

    this.communitiesPerFile = 500;
    this.instancesPerFile = 200;
  }

  async storeCommunityData(connunityArray) {
    // let storeCommunityData = data;
    // .map((community) => {
    //   return {
    //     b: community.baseurl,
    //     t: community.title,
    //     n: community.name,
    //     d: community.desc,
    //     f: community.nsfw,
    //     s: community.isSuspicious,
    //     o: {
    //       s: community.score,
    //       u: community.counts.subscribers,
    //       a: community.counts.users_active_week,
    //       p: community.counts.posts,
    //       c: community.counts.comments,
    //     },
    //   };
    // });

    let fileCount = 0;
    for (let i = 0; i < connunityArray.length; i += this.communitiesPerFile) {
      let chunk = connunityArray.slice(i, i + this.communitiesPerFile);
      await this.writeJsonFile(
        `${this.communityPath}/${fileCount}.json`,
        JSON.stringify(chunk)
      );
      fileCount++;
    }

    await this.writeJsonFile(
      `${this.publicDataFolder}/community.json`,
      JSON.stringify({
        count: fileCount,
      })
    );
  }

  async storeInstanceData(instanceArray) {
    // mapped versions and the metadata
    let fileCount = 0;
    for (let i = 0; i < instanceArray.length; i += this.instancesPerFile) {
      let chunk = instanceArray.slice(i, i + this.instancesPerFile);
      await this.writeJsonFile(
        `${this.instancePath}/${fileCount}.json`,
        JSON.stringify(chunk)
      );
      fileCount++;
    }
    await this.writeJsonFile(
      `${this.publicDataFolder}/instance.json`,
      JSON.stringify({
        count: fileCount,
      })
    );

    // minified version, just names and base urls
    const minInstanceArray = instanceArray.map((instance) => {
      return {
        n: instance.name,
        b: instance.baseurl,
      };
    });
    await this.writeJsonFile(
      `${this.publicDataFolder}/instance.min.json`,
      JSON.stringify(minInstanceArray)
    );

    // everything, big boi
    await this.writeJsonFile(
      `${this.publicDataFolder}/instance.full.json`,
      JSON.stringify(minInstanceArray)
    );
  }

  async storeFediverseData(data) {
    await this.writeJsonFile(
      `${this.publicDataFolder}/fediverse.json`,
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

  async cleanData() {
    await rm(this.publicDataFolder, { recursive: true, force: true });
    await mkdir(this.communityPath, { recursive: true });
    await mkdir(this.instancePath, { recursive: true });
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