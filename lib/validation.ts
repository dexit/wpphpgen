const RESERVED_WORDS = [
  'wp-json', 'wp-admin', 'wp-includes', 'wp-content', 
  'login', 'admin', 'feed', 'wp-login.php', 'wp-cron.php'
];

export function isReservedPath(path: string): boolean {
  const normalizedPath = path.toLowerCase().replace(/^\/+|\/+$/g, '');
  return RESERVED_WORDS.includes(normalizedPath);
}

export function isValidPath(path: string): boolean {
  // Must start with / and contain only alphanumeric, -, _, /, {, }
  return /^\/[a-zA-Z0-9\-_/{}]*$/.test(path);
}
