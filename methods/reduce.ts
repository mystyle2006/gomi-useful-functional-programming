// https://lodash.com/docs/4.17.15#reduce
// 컬렉션을 연산하여 누적 결과를 만듭니다.

import { reduce } from "lodash";

function sum(collections: number[]) {
  return reduce(collections, function(sum, n) {
    return sum + n;
  }, 0)
};

console.log(sum([1, 2, 3, 4]))
