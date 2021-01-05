import {
  boolean,
  Decoder,
  oneOf,
  string,
  tuple3,
  tuple5,
} from "@tdreyno/fluent-decoders"

// -----
// DATA
// -----

const arr1 = [
  ["name", "id", "age", "weight", "Cool"],
  ["Susan", "3", "20", "120", true],
  ["John", "1", "21", "150", true],
  ["Bob", "2", "23", "90", false],
  ["Ben", "4", "20", "100", true],
]

const arr2 = [
  ["name", "id", "height"],
  ["Bob", "2", "50"],
  ["John", "1", "45"],
  ["Ben", "4", "43"],
  ["Susan", "3", "48"],
]

const arr3 = [
  ["name", "id", "parent"],
  ["Bob", "2", "yes"],
  ["John", "1", "yes"],
]

// -----
// Types
// -----

type YesNo = "yes" | "no"
const yesNo = oneOf<YesNo>(["yes", "no"])
const isYesNo = (value: string): value is YesNo => ["yes", "no"].includes(value)

enum StringNumBrand {
  _ = "",
}
type StringInt = StringNumBrand & string
const isStringInt = (s: any): s is StringInt => !isNaN(parseInt(s, 10))
const stringInt = string.refine(isStringInt, "Must be string encoded integer")

// -----
// UTILS
// -----

const decodeTable = <T extends { id: StringInt }>(
  decoder: Decoder<T>,
  [_header, ...rows]: Array<unknown[]>,
) =>
  rows
    .map(decoder.guard)
    .reduce(
      (sum, row) => ((sum[row.id] = row), sum),
      {} as Record<StringInt, T>,
    )

// Actually just a deepMerge, could import from library
const merge = (...tables: Array<Record<string, unknown>>) =>
  tables.reduce(
    (sum, table) =>
      Object.keys(table).reduce(
        (sum2, key) => (
          (sum2[key] = Object.assign(sum2[key] || {}, table[key])), sum2
        ),
        sum,
      ),
    {} as Record<string, unknown>,
  )

// -----
// Type Constructors
// -----

const Record1 = ([name, id, age, weight, Cool]: [
  string,
  StringInt,
  StringInt,
  StringInt,
  boolean,
]) => ({
  name,
  id,
  age,
  weight,
  Cool,
})

const Record2 = ([name, id, height]: [string, StringInt, StringInt]) => ({
  name,
  id,
  height,
})

const Record3 = ([name, id, parent]: [string, StringInt, YesNo]) => ({
  name,
  id,
  parent,
})

const record1Decoder = tuple5(
  string,
  string.refine(isStringInt),
  stringInt,
  stringInt,
  boolean,
).map(Record1)

const record2Decoder = tuple3(string, stringInt, stringInt).map(Record2)

const record3Decoder = tuple3(string, stringInt, yesNo).map(Record3)

console.table(
  merge(
    decodeTable(record1Decoder, arr1),
    decodeTable(record2Decoder, arr2),
    decodeTable(record3Decoder, arr3),
  ),
)
