// Shown in the sidebar (desktop) and at the bottom of Home / Profile (phone).
// Bump "version" in package.json when you ship a new version.
import pkg from '../package.json'

export const APP_VERSION = pkg.version
export const CREDIT = `© ${new Date().getFullYear()} · Made by Prodigy`
