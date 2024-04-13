import { buildIncludes } from "./modular.mjs";

import config from "./config.json" assert { type: 'json' };
buildIncludes(config)