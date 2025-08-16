import type { Group } from "@task-manager/common";

export interface GroupArrayProp {
  groups: Group[];
}

export interface GroupProp {
  group: Group | undefined | null;
}

export interface GroupDetailProp {
  group: Group;
}
