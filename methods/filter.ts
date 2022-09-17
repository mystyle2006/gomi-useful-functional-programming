// https://lodash.com/docs/4.17.15#filter
// 컬렉션을 필터하기 위한 용도
import { filter } from "lodash";

function filterExample(target: string) {
  return filter(['A', 'B', 'C'], (value: string) => value === target);
}

console.log(filterExample('A'));
