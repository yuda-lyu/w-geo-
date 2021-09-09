import each from 'lodash/each'
import map from 'lodash/map'
import get from 'lodash/get'
import size from 'lodash/size'
import join from 'lodash/join'
import sortBy from 'lodash/sortBy'
import pullAt from 'lodash/pullAt'
import cloneDeep from 'lodash/cloneDeep'
import cdbl from 'wsemi/src/cdbl.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import checkDepth from './checkDepth.mjs'


/**
 * 由指定起訖深度陣列並基於各樣本之中點深度，提取各所屬的樣本群組
 *
 * Unit Test: {@link https://github.com/yuda-lyu/w-geo/blob/master/test/groupByDepthStartEnd.test.js Github}
 * @memberOf w-geo
 * @param {Array} rows 輸入數據陣列，各數據為物件，至少需包含深度(depth)，深度單位為m
 * @param {Array|Object} depthStartAndEnds 輸入欲提取數據的起訖深度陣列或物件，為物件時需有至少需包含起始深度(depthStart)與結束深度(depthEnd)，為陣列時則須由前述物件組成之陣列，深度單位為m
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.keyDepth='depth'] 輸入中點深度欄位鍵值字串，預設'depth'
 * @param {String} [opt.keyGroup='group'] 輸入群組代號欄位鍵值字串，預設'group'
 * @param {String} [opt.keyDepthStart='depthStart'] 輸入欲儲存之起始深度欄位鍵值字串，預設'depthStart'
 * @param {String} [opt.keyDepthEnd='depthEnd'] 輸入欲儲存之結束深度欄位鍵值字串，預設'depthEnd'
 * @returns {Array} 回傳群組化後添加起訖深度與所屬原數據的陣列
 * @example
 *
 * let rows
 * let ranges
 * let rs
 *
 * rows = [
 *     {
 *         depth: 0,
 *     },
 *     {
 *         depth: 1,
 *     },
 *     {
 *         depth: 3,
 *     },
 *     {
 *         depth: 10,
 *     },
 * ]
 * ranges = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 1,
 *     },
 *     {
 *         depthStart: 1,
 *         depthEnd: 4,
 *     },
 * ]
 * rs = groupByDepthStartEnd(rows, ranges)
 * console.log(JSON.stringify(rs, null, 2))
 * // => [
 * //   {
 * //     "depthStart": 0,
 * //     "depthEnd": 1,
 * //     "rows": [
 * //       {
 * //         "depth": 0
 * //       },
 * //       {
 * //         "depth": 1
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "depthStart": 1,
 * //     "depthEnd": 4,
 * //     "rows": [
 * //       {
 * //         "depth": 3
 * //       }
 * //     ]
 * //   }
 * // ]
 *
 * rows = [
 *     {
 *         depth: 0,
 *     },
 *     {
 *         depth: 1,
 *     },
 *     {
 *         depth: 3,
 *     },
 *     {
 *         depth: 10,
 *     },
 * ]
 * ranges = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 3,
 *     },
 *     {
 *         depthStart: 1,
 *         depthEnd: 5,
 *     },
 * ]
 * try {
 *     rs = groupByDepthStartEnd(rows, ranges)
 * }
 * catch (err) {
 *     rs = err.toString()
 * }
 * console.log(rs)
 * // => Error: 第 1 樣本結束深度depthEnd[3]大於第 2 個樣本起始深度depthStart[1]
 *
 * rows = [
 *     {
 *         depth: 0,
 *     },
 *     {
 *         depth: 1,
 *     },
 *     {
 *         depth: 3,
 *     },
 *     {
 *         depth: 10,
 *     },
 * ]
 * ranges = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 2,
 *     },
 *     {
 *         depthStart: 5,
 *         depthEnd: 10,
 *     },
 * ]
 * rs = groupByDepthStartEnd(rows, ranges)
 * console.log(JSON.stringify(rs, null, 2))
 * // => [
 * //   {
 * //     "depthStart": 0,
 * //     "depthEnd": 2,
 * //     "rows": [
 * //       {
 * //         "depth": 0
 * //       },
 * //       {
 * //         "depth": 1
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "depthStart": 5,
 * //     "depthEnd": 10,
 * //     "rows": [
 * //       {
 * //         "depth": 10
 * //       }
 * //     ]
 * //   }
 * // ]
 *
 * rows = [
 *     {
 *         depth: 0,
 *     },
 *     {
 *         depth: 1,
 *     },
 *     {
 *         depth: 3,
 *     },
 *     {
 *         depth: 10,
 *     },
 * ]
 * ranges = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 10,
 *     },
 * ]
 * rs = groupByDepthStartEnd(rows, ranges)
 * console.log(JSON.stringify(rs, null, 2))
 * // => [
 * //   {
 * //     "depthStart": 0,
 * //     "depthEnd": 10,
 * //     "rows": [
 * //       {
 * //         "depth": 0
 * //       },
 * //       {
 * //         "depth": 1
 * //       },
 * //       {
 * //         "depth": 3
 * //       },
 * //       {
 * //         "depth": 10
 * //       }
 * //     ]
 * //   }
 * // ]
 *
 * rows = [
 *     {
 *         dc: 0,
 *     },
 *     {
 *         dc: 1,
 *     },
 *     {
 *         dc: 3,
 *     },
 *     {
 *         dc: 10,
 *     },
 * ]
 * ranges = [
 *     {
 *         ds: 0,
 *         de: 1,
 *     },
 *     {
 *         ds: 1,
 *         de: 4,
 *     },
 * ]
 * rs = groupByDepthStartEnd(rows, ranges, { keyDepth: 'dc', keyDepthStart: 'ds', keyDepthEnd: 'de' })
 * console.log(JSON.stringify(rs, null, 2))
 * // => [
 * //   {
 * //     "ds": 0,
 * //     "de": 1,
 * //     "rows": [
 * //       {
 * //         "dc": 0
 * //       },
 * //       {
 * //         "dc": 1
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "ds": 1,
 * //     "de": 4,
 * //     "rows": [
 * //       {
 * //         "dc": 3
 * //       }
 * //     ]
 * //   }
 * // ]
 *
 */
function groupByDepthStartEnd(rows, depthStartAndEnds, opt = {}) {
    let errs = []

    //check
    if (!isearr(rows)) {
        throw new Error('無有效資料')
    }
    if (!isearr(depthStartAndEnds) && !iseobj(depthStartAndEnds)) {
        throw new Error('無有效起訖深度資料')
    }

    //keyDepth
    let keyDepth = get(opt, 'keyDepth')
    if (!isestr(keyDepth)) {
        keyDepth = 'depth'
    }

    //keyDepthStart
    let keyDepthStart = get(opt, 'keyDepthStart')
    if (!isestr(keyDepthStart)) {
        keyDepthStart = 'depthStart'
    }

    //keyDepthEnd
    let keyDepthEnd = get(opt, 'keyDepthEnd')
    if (!isestr(keyDepthEnd)) {
        keyDepthEnd = 'depthEnd'
    }

    //cloneDeep
    rows = cloneDeep(rows)

    //判斷中點深度需為有效數字
    each(rows, (v, k) => {

        //dc
        let dc = get(v, keyDepth, null)

        //check
        if (!isnum(dc)) {
            errs.push(`第 ${k} 樣本中點深度${keyDepth}[${dc}]非有效數字`)
        }

    })

    //check
    if (size(errs) > 0) {
        throw new Error(join(errs, '; '))
    }

    //sortBy
    rows = sortBy(rows, (v) => {
        return cdbl(v[keyDepth])
    })

    //checkDepth
    let ckd = checkDepth(rows, { keyDepth })
    if (size(ckd) > 0) {
        throw new Error(join(ckd, ', '))
    }

    //check
    if (iseobj(depthStartAndEnds)) {
        depthStartAndEnds = [depthStartAndEnds]
    }

    //判斷depthStartAndEnds內各元素之起始深度需為有效數字
    each(depthStartAndEnds, (v, k) => {

        //ds, de
        let ds = get(v, keyDepthStart, null)
        let de = get(v, keyDepthEnd, null)

        //check
        if (!isnum(ds)) {
            errs.push(`群組用起訖深度陣列中，第 ${k} 元素之起始深度${keyDepthStart}[${ds}]非有效數字`)
        }
        if (!isnum(de)) {
            errs.push(`群組用起訖深度陣列中，第 ${k} 元素之結束深度${keyDepthEnd}[${de}]非有效數字`)
        }

    })

    //check
    if (size(errs) > 0) {
        throw new Error(join(errs, '; '))
    }

    //each
    each(depthStartAndEnds, (v, k) => {

        //ds1, de1
        let ds1 = get(v, keyDepthStart, null)
        let de1 = get(v, keyDepthEnd, null)
        ds1 = cdbl(ds1)
        de1 = cdbl(de1)

        //check
        if (ds1 > de1) {
            errs.push(`群組用起訖深度陣列中，第 ${k} 元素之起始深度${keyDepthStart}[${ds1}]大於結束深度${keyDepthEnd}[${de1}]`)
        }

        if (k === 0) {
            return true
        }

        //v0
        let v0 = get(depthStartAndEnds, k - 1)

        //de0
        let de0 = get(v0, keyDepthEnd, null)
        de0 = cdbl(de0)

        //比較「上層結束深度」是否大於「下層起始深度」, 不要求上下層連續(上層結束深度等於下層起始深度)
        if (de0 > ds1) {
            errs.push(`第 ${k} 樣本結束深度${keyDepthEnd}[${de0}]大於第 ${k + 1} 個樣本起始深度${keyDepthStart}[${ds1}]`)
        }

    })

    //check
    if (size(errs) > 0) {
        throw new Error(join(errs, '; '))
    }

    //ts, 備份, 後續會動態刪除提速
    let ts = cloneDeep(rows)

    //rs
    let rs = cloneDeep(depthStartAndEnds)
    rs = map(rs, (v, k) => {

        //ds, de
        let ds = get(v, keyDepthStart, null)
        let de = get(v, keyDepthEnd, null)
        ds = cdbl(ds)
        de = cdbl(de)

        //detect
        let rdels = [] //本群(輪)可刪除的ts指標
        let rrows = [] //本群(輪)所屬的ts樣本
        each(ts, (t, kt) => {
            let rdc = t[keyDepth]
            if (rdc >= ds && rdc <= de) {
                rdels.push(kt)
                rrows.push(t)
            }
            if (rdc > de) {
                return false //break
            }
        })

        //save
        v.rows = cloneDeep(rrows)

        //pullAt
        pullAt(ts, rdels)

        return v
    })

    return rs
}


export default groupByDepthStartEnd
