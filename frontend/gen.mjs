import { execSync } from "node:child_process";

const input = "openapi.json";
const output = "lib/api/schema.d.ts";

execSync(`npx openapi-typescript ${input} -o ${output}`, { stdio: "inherit" });