// https://lodash.com/docs/4.17.15#map
// 컬렉션을 순회함

import { map } from "lodash";

function mapExample() {
  return map(['A', 'B', 'C'], (value: string) => console.log(value));
}

mapExample();
