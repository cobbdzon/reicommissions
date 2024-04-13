import modular from "./modular.mjs";

import config from "./config.json" assert { type: 'json' };
modular.buildIncludes(config)