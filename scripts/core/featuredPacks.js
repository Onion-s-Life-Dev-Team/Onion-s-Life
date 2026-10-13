import { logger } from "./logger.js";

// Root URLs of featured packs. Each one serves a manifest.json at its root.
// Add a URL here to feature a new pack; no other code changes are needed.
export const FEATURED_PACK_URLS = [
    "https://rawcdn.githack.com/LagTheSystem/KaplayPack/main/"
];

const REQUIRED_FIELDS = ["name", "author", "version", "description"];

// Makes sure a pack root URL ends in "/", so relative asset paths resolve correctly.
export function normalizePackUrl(url) {
    return url.endsWith("/") ? url : url + "/";
}

// Checks that a parsed manifest has every required field as a non-empty string.
// Only the required fields are returned, so unexpected keys never reach the UI.
export function validateManifest(data) {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
        throw new Error("Manifest must be a JSON object");
    }
    const manifest = {};
    for (const field of REQUIRED_FIELDS) {
        const value = data[field];
        if (typeof value !== "string" || value.trim() === "") {
            throw new Error(`Manifest field "${field}" must be a non-empty string`);
        }
        manifest[field] = value.trim();
    }
    return manifest;
}

// Fetches and validates the manifest for one pack root URL.
export async function fetchManifest(rootUrl) {
    const response = await fetch(rootUrl + "manifest.json", { mode: "cors" });
    if (!response.ok) {
        throw new Error(`Manifest request failed with HTTP ${response.status}`);
    }
    return validateManifest(await response.json());
}

// Loads every featured pack's manifest. One failing pack doesn't stop the others;
// each entry reports either a manifest or an error.
export async function loadFeaturedPacks() {
    const roots = FEATURED_PACK_URLS.map(normalizePackUrl);
    const results = await Promise.allSettled(roots.map(fetchManifest));
    return results.map((result, index) => {
        const url = roots[index];
        if (result.status === "fulfilled") {
            return { url, manifest: result.value, error: null };
        }
        logger.warn(`Featured pack unavailable: ${url}`, result.reason);
        return { url, manifest: null, error: result.reason };
    });
}
