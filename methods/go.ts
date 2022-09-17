import {reduce} from "lodash";

export function go (a: any, ...fs: any[]) {
  return reduce(fs, (a, f) => f(a), a);
}
