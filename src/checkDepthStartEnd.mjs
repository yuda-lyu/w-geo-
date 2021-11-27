import each from 'lodash/each'
import get from 'lodash/get'
import sortBy from 'lodash/sortBy'
import cdbl from 'wsemi/src/cdbl.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import { judge } from './dm.mjs'


/**
 * 檢核樣本數據內起訖深度是否有效與連續
 *
 * Unit Test: {@link https://github.com/yuda-lyu/w-geo/blob/master/test/checkDepthStartEnd.test.js Github}
 * @memberOf w-geo
 * @param {Array} rows 輸入數據陣列，各數據為物件，至少需包含起始深度(depthStart)與結束深度(depthEnd)，深度單位為m
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.keyDepthStart='depthStart'] 輸入起始深度欄位鍵值字串，預設'depthStart'
 * @param {String} [opt.keyDepthEnd='depthEnd'] 輸入結束深度欄位鍵值字串，預設'depthEnd'
 * @returns {Array} 回傳錯誤訊息陣列
 * @example
 *
 * let rows
 * let errs
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 5,
 *     },
 *     {
 *         depthStart: 5,
 *         depthEnd: 10,
 *     },
 *     {
 *         depthStart: 10,
 *         depthEnd: 20,
 *     },
 * ]
 * errs = checkDepthStartEnd(rows)
 * console.log(errs)
 * // => []
 *
 * rows = [
 *     {
 *         depthStart: 0,
 *         depthEnd: 5,
 *     },
 *     {
 *         depthStart: 10,
 *         depthEnd: 20,
 *     },
 * ]
 * errs = checkDepthStartEnd(rows)
 * console.log(errs)
 * // => [ '第 1 樣本結束深度depthEnd[5]不等於第 2 個樣本起始深度depthStart[10]' ]
 *
 * rows = [
 *     {
 *         depthStart: '0',
 *         depthEnd: '5',
 *     },
 *     {
 *         depthStart: '5',
 *         depthEnd: '10',
 *     },
 * ]
 * errs = checkDepthStartEnd(rows)
 * console.log(errs)
 * // => []
 *
 * rows = [
 *     {
 *         depthStart: '0',
 *         depthEnd: 'abc',
 *     },
 *     {
 *         depthStart: 'abc',
 *         depthEnd: '10',
 *     },
 * ]
 * errs = checkDepthStartEnd(rows)
 * console.log(errs)
 * // => [
 * //     '第 0 樣本起始非有效數字: depthStart[0], depthEnd[abc]',
 * //     '第 1 樣本起始非有效數字: depthStart[abc], depthEnd[10]'
 * // ]
 *
 * rows = [
 *     {
 *         top_depth: 0,
 *         bottom_depth: 5,
 *     },
 *     {
 *         top_depth: 5,
 *         bottom_depth: 10,
 *     },
 * ]
 * errs = checkDepthStartEnd(rows, { keyDepthStart: 'top_depth', keyDepthEnd: 'bottom_depth' })
 * console.log(errs)
 * // => []
 *
 */
function checkDepthStartEnd(rows, opt = {}) {
    let errs = []

    //check
    if (!isearr(rows)) {
        return errs
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

    //判斷各樣本起訖深度需為有效數字
    each(rows, (v, k) => {

        //ds, de
        let ds = get(v, keyDepthStart, null)
        let de = get(v, keyDepthEnd, null)

        //check
        if (!isnum(ds)) {
            errs.push(`第 ${k} 樣本起始深度${keyDepthStart}[${ds}]非有效數字`)
        }
        if (!isnum(de)) {
            errs.push(`第 ${k} 樣本結束深度${keyDepthEnd}[${de}]非有效數字`)
        }

    })

    //sortBy
    rows = sortBy(rows, (v) => {
        return cdbl(v[keyDepthStart])
    })

    //each
    each(rows, (v, k) => {

        //ds1, de1
        let ds1 = get(v, keyDepthStart, null)
        let de1 = get(v, keyDepthEnd, null)
        ds1 = cdbl(ds1)
        de1 = cdbl(de1)

        //比較起始深度是否大於結束深度
        //if (ds1 > de1) {
        if (judge(ds1, '>', de1)) {
            errs.push(`第 ${k} 個樣本起始深度${keyDepthStart}[${ds1}]大於結束深度${keyDepthEnd}[${de1}]`)
        }

        if (k === 0) {
            return true
        }

        //v0
        let v0 = get(rows, k - 1)

        //ds0, de0
        // let ds0 = get(v0, keyDepthStart, null)
        let de0 = get(v0, keyDepthEnd, null)
        // ds0 = cdbl(ds0)
        de0 = cdbl(de0)

        //比較「上層結束深度」與「下層起始深度」是否相同
        //if (de0 !== ds1) {
        if (judge(de0, '!==', ds1)) {
            errs.push(`第 ${k} 樣本結束深度${keyDepthEnd}[${de0}]不等於第 ${k + 1} 個樣本起始深度${keyDepthStart}[${ds1}]`)
        }

    })

    return errs
}


export default checkDepthStartEnd
