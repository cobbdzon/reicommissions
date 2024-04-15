import { buildIncludes } from "./modular.mjs";
import "fs";
import { promisify } from "util";

import config from "./config.json" assert { type: 'json' };
buildIncludes(config, [fs, promisify])