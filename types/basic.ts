/**
 * A string representing a base URL for a fediverse instance/etc.
 *
 * Example: `lemmy.example.org`
 */
export type BaseURL = string;

/**
 * A string representing a Lemmy actor ID.
 *
 * Example: `https://lemmy.example.org/c/example_community`, `https://lemmy.example.org/u/example_user`
 */
export type ActorID = string;

/**
 * A string representing a time in the format used by Lemmy.
 *
 * Example: `2023-06-13T01:51:01.061316`
 */
export type LemmyTimeString = string;

/**
 * A string representing a time in the format used by Lemmy.
 *
 * Example: `2023-06-15T05:02:07.318980Z`
 */
export type LemmyTimeStringZ = string;
