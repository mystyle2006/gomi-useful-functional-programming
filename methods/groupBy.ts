// https://lodash.com/docs/4.17.15#groupBy
// 특정 조건을 기준으로 컬렉션을 그룹화하여 객체로 리턴해줌

import { groupBy } from "lodash";

function groupByExample(target: string) {
  return groupBy(['one', 'two', 'three'], target);
}

console.log(groupByExample('length'))
