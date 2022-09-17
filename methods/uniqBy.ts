// https://lodash.com/docs/4.17.15#uniqBy
// 컬럭션을 특정 기준으로 유니크한 값을 추출

import { uniqBy } from "lodash";

function uniqByExample(target: string) {
  return uniqBy([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], target);
}

console.log(uniqByExample('x'))
