'use strict';

const workerpool = require('workerpool');
const postcss = require('postcss');
const postcssrc = require('postcss-load-config');

let process = null;

async function transformAsync(css, {filepath, config, cwd, map}) {
  // Initialize processor. `config`, `cwd` won't change until Snowpack is restarted
  if (!process) {
    const {plugins, rcOptions} = await postcssrc({}, config || cwd);
    const processor = postcss(plugins);
    process = (css) => processor.process(css, {...rcOptions, from: filepath, map});
  }

  const result = await process(css);
  return JSON.stringify({css: result.css, map: result.map, messages: result.messages});
}

// create a worker and register public functions
workerpool.worker({
  transformAsync,
});
