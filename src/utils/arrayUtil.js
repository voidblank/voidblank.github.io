/**
 * sort md.js's array by quick sort, sorted by modify time desc
 * @param {array} arr array
 * @returns sorted array
 */
function quickSort (arr) {
  if (arr.length <= 1) return arr

  const index = parseInt(arr.length / 2)
  const mid = arr[index]
  const flagValue = mid.modifyDate

  const leftArr = []
  const rightArr = []

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    if (i === index) continue
    if (item.modifyDate.getTime() > flagValue.getTime()) leftArr.push(item)
    else rightArr.push(item)
  }

  return [...quickSort(leftArr), mid, ...quickSort(rightArr)]
}

export default {
  quickSort
}
