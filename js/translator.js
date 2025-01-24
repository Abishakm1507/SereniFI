// Cache implementation
function Cache() {
  var cache = Object.create(null);

  /**
   * Deletes a key from the cache.
   * @param {string} key - The key to delete.
   */
  function deleteKey(key) {
    delete cache[key];
  }

  /**
   * Sets a value in the cache.
   * @param {string} key - The key to set.
   * @param {*} value - The value to set.
   * @param {number} [timeout] - The timeout in milliseconds.
   * @returns {*} The set value.
   */
  this.set = function(key, value, timeout) {
    if (timeout !== undefined && (typeof timeout !== 'number' || isNaN(timeout) || timeout <= 0)) {
      throw new Error('Cache timeout must be a positive number');
    }

    var existing = cache[key];
    if (existing) {
      clearTimeout(existing.timeout);
    }

    var entry = {
      value: value,
      expire: timeout + Date.now()
    };

    if (!isNaN(entry.expire)) {
      entry.timeout = setTimeout(() => deleteKey(key), timeout);
    }

    cache[key] = entry;
    return value;
  };

  /**
   * Gets a value from the cache.
   * @param {string} key - The key to get.
   * @returns {*} The cached value, or null if not found.
   */
  this.get = function(key) {
    var entry = cache[key];
    if (entry !== undefined) {
      if (isNaN(entry.expire) || entry.expire >= Date.now()) {
        return entry.value;
      }
      delete cache[key];
    }
    return null;
  };

  /**
   * Deletes a key from the cache.
   * @param {string} key - The key to delete.
   * @returns {boolean} Whether the key was deleted.
   */
  this.del = function(key) {
    var success = true;
    var entry = cache[key];

    if (entry) {
      clearTimeout(entry.timeout);
      if (!isNaN(entry.expire) && entry.expire < Date.now()) {
        success = false;
      }
    } else {
      success = false;
    }

    if (success) {
      deleteKey(key);
    }
    return success;
  };

  /**
   * Clears the cache.
   */
  this.clear = function() {
    for (var key in cache) {
      clearTimeout(cache[key].timeout);
    }
    cache = Object.create(null);
  };
}

// Translation engines configuration
const base = 'https://translate.googleapis.com/translate_a/single';

/**
 * Translation engines configuration.
 * @typedef {Object} Engine
 * @property {boolean} needkey - Whether the engine needs a key.
 * @property {function} fetch - The fetch function for the engine.
 * @property {function} parse - The parse function for the engine.
 */
const engines = {
  google: {
    fetch: ({ key, from, to, text }) => [
      ${base}?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)},
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    ],
    parse: async response => {
      if (!response.ok) {
        throw new Error(Translation failed with status: ${response.status});
      }
      const data = await response.json();
      if (!data || !data[0]) {
        throw new Error('Invalid response format from translation service');
      }
      const translation = data[0].map(item => item[0]).join('');
      if (!translation) {
        throw new Error('Translation not found');
      }
      return translation;
    }
  },
  yandex: {
    needkey: true,
    fetch: ({ key, from, to, text }) => [
      https://translate.yandex.net/api/v1.5/tr.json/translate?key=${key}&lang=${from}-${to}&text=${encodeURIComponent(text)},
      { method: 'POST', body: '' }
    ],
    parse: response => response.json().then(data => {
      if (data.code !== 200) throw new Error(data.message);
      return data.text[0];
    })
  },
  libre: {
    needkey: false,
    fetch: ({ url = 'https://libretranslate.com/translate', key, from, to, text }) => [
      url,
      {
        method: 'POST',
        body: JSON.stringify({ q: text, source: from, target: to, api_key: key }),
        headers: { 'Content-Type': 'application/json' }
      }
    ],
    parse: response => response.json().then(data => {
      if (!data) throw new Error('No response found');
      if (data.error) throw new Error(data.error);
      if (!data.translatedText) throw new Error('No response found');
      return data.translatedText;
    })
  },
  deepl: {
    needkey: true,
    fetch: ({ key, from, to, text }) => [
      https://api${key.endsWith(':fx') ? '-free' : ''}.deepl.com/v2/translate?auth_key=${key}&source_lang=${from}&target_lang=${to}&text=${encodeURIComponent(text)},
      { method: 'POST', body: '' }
    ],
    parse: async response => {
      if (!response.ok) {
        if (response.status === 403) throw new Error('Auth Error, please review the key for DeepL');
        throw new Error(Error ${response.status});
      }
      return response.json().then(data => data.translations[0].text);
    }
  }
};

// Language codes and names
const iso = {
  aar: 'aa', abk: 'ab', afr: 'af', aka: 'ak', alb: 'sq', amh: 'am', ara: 'ar'
  // Add more ISO codes as needed
};

const names = {
  afar: 'aa', abkhazian: 'ab', afrikaans: 'af', akan: 'ak', albanian: 'sq'
  // Add more language names as needed
};

const isoKeys = Object.values(iso).sort();

/**
 * Validates a language code.
 * @param {string} lang - The language code to validate.
 * @returns {string} The validated language code.
 */
const languages = lang => {
  if (typeof lang !== 'string') {
    throw new Error('The "language" must be a string, received ' + typeof lang);
  }
  if (lang.length > 100) {
    throw new Error(The "language" is too long at ${lang.length} characters);
  }
  
  lang = lang.toLowerCase();
  lang = names[lang] || iso[lang] || lang;
  
  if (!isoKeys.includes(lang)) {
    throw new Error(The language "${lang}" is not part of the ISO 639-1);
  }
  
  return lang;
};

/**
 * Creates a new Translate instance.
 * @param {Object} [options] - Translation options.
 * @returns {Function} A translate function.
 */
const Translate = function(options = {}) {
  if (!(this instanceof Translate)) return new Translate(options);

  const defaults = {
    from: 'en',
    to: 'en',
    cache: undefined,
    engine: 'google',
    key: undefined,
    url: undefined,
    languages: languages,
    engines: engines,
    keys: {}
  };

  const translate = async (text, opts = {}) => {
    if (typeof opts === 'string') {
      opts = { to: opts };
    }

    // Validate options
    const invalidOption = Object.keys(opts).find(key => key !== 'from' && key !== 'to');
    if (invalidOption) {
      throw new Error(Invalid option with the name '${invalidOption}');
    }

    // Setup translation parameters
    opts.text = text;
    opts.from = languages(opts.from || translate.from);
    opts.to = languages(opts.to || translate.to);
    opts.cache = translate.cache;
    opts.engine = translate.engine;
    opts.url = translate.url;
    opts.id = ${opts.url}:${opts.from}:${opts.to}:${opts.engine}:${opts.text};
    opts.keys = translate.keys || {};

    // Handle API keys
    for (let engine in translate.keys) {
      opts.keys[engine] = opts.keys[engine] || translate.keys[engine];
    }
    opts.key = opts.key || translate.key || opts.keys[opts.engine];

    const engine = translate.engines[opts.engine];
    const cached = translate.cache ? translate.cache.get(opts.id) : null;

    if (cached) return Promise.resolve(cached);
    if (opts.to === opts.from) return Promise.resolve(opts.text);
    if (engine.needkey && !opts.key) {
      throw new Error(The engine "${opts.engine}" needs a key, please provide it);
    }

    const fetchArgs = engine.fetch(opts);
    return fetch(...fetchArgs)
      .then(engine.parse)
      .then(result => {
        if (translate.cache) {
          translate.cache.set(opts.id, result, opts.cache);
        }
        return result;
      });
  };

  // Set instance properties
  for (let key in defaults) {
    translate[key] = options[key] === undefined ? defaults[key] : options[key];
  }

  return translate;
};

// Create default instance with caching
const defaultTranslator = new Translate({
  cache: new Cache()
});
defaultTranslator.Translate = Translate;

export { Translate, defaultTranslator as default };
