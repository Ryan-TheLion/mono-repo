import type { UserConfig } from "@commitlint/types";
import { RuleConfigSeverity } from "@commitlint/types";

const Configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      RuleConfigSeverity.Error,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "rename",
        "remove",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
      ],
    ],
    "subject-case": [RuleConfigSeverity.Disabled],
  },
};

export default Configuration;
