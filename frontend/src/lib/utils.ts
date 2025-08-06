/**
 * Parses a version string into an object containing an array of numbers and a suffix.
 * The version string can be in the format "1.2.3-alpha" or "1.2.3".
 * If the version string does not match the expected format, it will extract digits and any non-digit suffix.
 *
 * @param version - The version string to parse, e.g., "1.2.3-alpha" or "1.2.3".
 * @returns IParsedVersion
 */
export type IParsedVersion = [[number, number, number], string];

export function parseVersion(version: string): IParsedVersion | null {
  // console.log("parseVersion", version);
  if (!version) return null;

  const match = version.match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?([-+].*)?$/);
  if (!match) return null;

  const major = parseInt(match[1], 10);
  const minor = match[2] ? parseInt(match[2], 10) : 0;
  const patch = match[3] ? parseInt(match[3], 10) : 0;

  const suffixMatch = match[4] || "";
  const suffix = suffixMatch.startsWith("-") ? suffixMatch.slice(1) : suffixMatch;

  return [[major, minor, patch], suffix];
}

/**
 * This is meant to be used in a sort function, the output should default to being newest (highest versions first.
 * @param va
 * @param vb
 */
export function compareVersionStrings(va: string, vb: string): number {
  const parsedA = parseVersion(va);
  const parsedB = parseVersion(vb);

  if (!parsedA || !parsedB) {
    return 0; // If either version is invalid, consider them equal
  }

  const [aNumbers, aSuffix] = parsedA;
  const [bNumbers, bSuffix] = parsedB;

  // Compare major, minor, patch
  for (let i = 0; i < 3; i++) {
    if (aNumbers[i] !== bNumbers[i]) {
      return bNumbers[i] - aNumbers[i];
    }
  }

  // If numbers are equal, compare suffixes
  if (aSuffix === bSuffix) return 0;
  if (aSuffix === "") return -1; // release versions should come before pre-releases
  if (bSuffix === "") return 1;

  // Both have suffixes, compare descending lexicographically
  return aSuffix.localeCompare(bSuffix);
}
