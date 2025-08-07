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

type IFilterStringTerms = {
  include: string[];
  exclude: string[];
};

/* Split the value on spaces, look for values starting with "-".
 * If found, remove the "-" and add to the exclude list.
 * If not found, append to the search query.
 */
function splitTerms(filterText: string): IFilterStringTerms {
  const exclude: string[] = [];
  const include: string[] = [];

  const searchTerms = filterText.toLowerCase().split(" ");

  searchTerms.forEach((term) => {
    if (term.startsWith("-") && term.substring(1) !== "") {
      exclude.push(term.substring(1));
    } else if (term !== "") {
      include.push(term);
    }
  });

  return { include, exclude };
}

/**
 * Filter out every excluded term and search for any included terms.
 *
 *
      // split the value on spaces, look for values starting with "-"
      // if found, remove the "-" and add to the exclude list
      // if not found, apend to the search query
 *
 * @param items List of items to filter
 * @param filterText The filter text to apply
 * @param fields Function that returns list of searchable fields for the item
 */
export function filterByText<T>(
  items: T[],
  filterText: string,
  fields: (item: T) => (string | undefined)[],
): T[] {
  const { include, exclude } = splitTerms(filterText);

  // search for any included terms
  if (include.length > 0) {
    include.forEach((term) => {
      items = items.filter((item) =>
        fields(item).some((field) => field && field.toLowerCase().includes(term)),
      );
    });
  }

  // filter out every excluded term
  if (exclude.length > 0) {
    exclude.forEach((term) => {
      items = items.filter(
        (item) => !fields(item).some((field) => field && field.toLowerCase().includes(term)),
      );
    });
  }

  return items;
}

/*
example usage:

coinst items = [
  { name: "Item 1", description: "This is item one", tags: ["tag1", "tag2"] },
  { name: "Item 2", description: "This is item two", tags: ["tag2", "tag3"] },
  { name: "Item 3", description: "This is item three", tags: ["tag1", "tag3"] },
];
const filteredItems = filterByText(
  items,
  "item -two tag1",
  (item) => [item.name, item.description, ...item.tags],
);

// filteredItems will contain only items that include "item" and "tag1" but exclude "two".


*/

export type ISorterDefinition = {
  [key: string]: (a: any, b: any) => number;
};

/**
 * Generic helper to sort an array based on a map of comparator functions.
 * If the order key doesn't exist in the map the array is returned untouched.
 *
 * @param items - Array of items to sort
 * @param order - Selected order key
 * @param comparators - Map of comparator functions keyed by order name
 */
export function sortItems<T>(items: T[], orderBy: string, sorters: ISorterDefinition): T[] {
  const sorter = sorters[orderBy];
  if (!sorter) return items;
  return items.sort(sorter);
}
