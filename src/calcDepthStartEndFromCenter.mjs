import each from 'lodash/each'
import map from 'lodash/map'
import get from 'lodash/get'
import size from 'lodash/size'
import join from 'lodash/join'
import sortBy from 'lodash/sortBy'
import cdbl from 'wsemi/src/cdbl.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isnum from 'wsemi/src/isnum.mjs'


/**
 * 由樣本中點深度反算各樣本起訖深度
 *
 * Unit Test: {@link https://github.com/yuda-lyu/w-geo/blob/master/test/calcDepthStartEndFromCenter.test.js Github}
 * @memberOf w-geo
 * @param {Array} rows 輸入數據陣列，各數據為物件，至少需包含起始深度(depthStart)與結束深度(depthEnd)，深度單位為m
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.keyDepth='depth'] 輸入中點深度欄位鍵值字串，預設'depth'
 * @param {String} [opt.keyDepthStart='depthStart'] 輸入欲儲存之起始深度欄位鍵值字串，預設'depthStart'
 * @param {String} [opt.keyDepthEnd='depthEnd'] 輸入欲儲存之結束深度欄位鍵值字串，預設'depthEnd'
 * @returns {Array} 回傳添加起訖深度的數據陣列
 * @example
 *
 * let rows
 * let rs
 *
 * rows = [
 *     {
 *         depth: 0,
 *     },
 *     {
 *         depth: 6,
 *     },
 *     {
 *         depth: 20,
 *     },
 * ]
 * rs = calcDepthStartEndFromCenter(rows)
 * console.log(rs)
 * // => [
 * //   { depth: 0, depthStart: 0, depthEnd: 3 },
 * //   { depth: 6, depthStart: 3, depthEnd: 13 },
 * //   { depth: 20, depthStart: 13, depthEnd: 20 }
 * // ]
 *
 * rows = [
 *     {
 *         depth: 4,
 *     },
 *     {
 *         depth: 6,
 *     },
 *     {
 *         depth: 20,
 *     },
 * ]
 * rs = calcDepthStartEndFromCenter(rows)
 * console.log(rs)
 * // => [
 * //   { depth: 4, depthStart: 0, depthEnd: 5 },
 * //   { depth: 6, depthStart: 5, depthEnd: 13 },
 * //   { depth: 20, depthStart: 13, depthEnd: 20 }
 * // ]
 *
 * rows = [
 *     {
 *         dc: 4,
 *     },
 *     {
 *         dc: 6,
 *     },
 *     {
 *         dc: 20,
 *     },
 * ]
 * rs = calcDepthStartEndFromCenter(rows, { keyDepth: 'dc', keyDepthStart: 'ds', keyDepthEnd: 'de' })
 * console.log(rs)
 * // => [
 * //   { dc: 4, ds: 0, de: 5 },
 * //   { dc: 6, ds: 5, de: 13 },
 * //   { dc: 20, ds: 13, de: 20 }
 * // ]
 *
 */
function calcDepthStartEndFromCenter(rows, opt = {}) {
    let errs = []

    //check
    if (!isearr(rows)) {
        throw new Error('無有效資料')
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

    //check
    each(rows, (v, k) => {
        if (k === 0) {
            return true
        }

        //dc0, dc1
        let dc0 = get(rows, `${k - 1}.${keyDepth}`, null)
        let dc1 = get(v, keyDepth, null)
        dc0 = cdbl(dc0)
        dc1 = cdbl(dc1)

        //check
        if (dc0 >= dc1) {
            errs.push(`第 ${k - 1} 樣本之中點深度${keyDepth}[${dc0}]大於等於第 ${k} 樣本之中點深度${keyDepth}[${dc1}]`)
        }

    })

    //check
    if (size(errs) > 0) {
        throw new Error(join(errs, '; '))
    }

    //each
    let up = size(rows) - 1
    rows = map(rows, (v, k) => {

        //v0, v1, v2
        let v0 = get(rows, k - 1)
        let v1 = v
        let v2 = get(rows, k + 1)

        //dc0, dc1, dc2
        let dc0 = get(v0, keyDepth, null)
        let dc1 = get(v1, keyDepth, null)
        let dc2 = get(v2, keyDepth, null)

        //ds
        let ds = null
        if (k === 0) {
            ds = 0
            if (isnum(dc1)) {
                dc1 = cdbl(dc1)
                ds = Math.min(ds, dc1) //k=0樣本深度若<0則取之
            }
        }
        else if (isnum(dc0) && isnum(dc1)) {
            dc0 = cdbl(dc0)
            dc1 = cdbl(dc1)
            ds = (dc0 + dc1) / 2
        }

        //de
        let de = null
        if (k === up) {
            if (isnum(dc1)) {
                de = cdbl(dc1) //若本層樣本深度為數字則使用之, 否則仍保持null
            }
        }
        else if (isnum(dc1) && isnum(dc2)) {
            dc1 = cdbl(dc1)
            dc2 = cdbl(dc2)
            de = (dc1 + dc2) / 2
        }

        //save
        v[keyDepthStart] = ds
        v[keyDepthEnd] = de

        return v
    })

    return rows
}


export default calcDepthStartEndFromCenter
