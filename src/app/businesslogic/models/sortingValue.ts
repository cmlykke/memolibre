export const SortingValueAll = ['NOTHING', 'INCLUDE', 'EXCLUDE', 'ONLY'];

export function isSortingValue(value: string): boolean{
    return SortingValueAll.includes(value)
}
