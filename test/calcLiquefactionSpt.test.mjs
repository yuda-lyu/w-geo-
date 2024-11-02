import assert from 'assert'
import calcLiquefactionSpt from '../src/calcLiquefactionSpt.mjs'
import rowsIn1 from './calcLiquefactionSpt-rowsIn1.json' assert { type: "json" }
import resOut1 from './calcLiquefactionSpt-resOut1.json' assert { type: "json" }
import rowsIn2 from './calcLiquefactionSpt-rowsIn2.json' assert { type: "json" }
import resOut2 from './calcLiquefactionSpt-resOut2.json' assert { type: "json" }


describe(`calcLiquefactionSpt`, function() {

    let methods = [
        'sptHBF2017',
        'sptNJRA2017',
    ]

    let opt = {
        waterLevelUsual: 0.7,
        waterLevelDesign: 0.7,
        PGA: 0.32,
        Mw: 7.3,
        unitSvSvp: 'kPa',
    }

    // let gv = (ds) => {
    //     ds = _.map(ds, (v) => {
    //         let ks = [
    //             'sptHBF2012',
    //             'sptHBF2017',
    //             'sptNJRA1996',
    //             'sptNJRA2017',
    //             'sptNCEER',
    //             'sptSeed',
    //             'sptTY',
    //         ]
    //         let dt = {}
    //         _.each(ks, (k) => {
    //             dt[`${k}-FS`] = _.get(v, `${k}-FS`)
    //             dt[`${k}-stlTS`] = _.get(v, `${k}-stlTS`)
    //             dt[`${k}-stlIY`] = _.get(v, `${k}-stlIY`)
    //             dt[`${k}-H1`] = _.get(v, `${k}-H1`)
    //             dt[`${k}-H1PL`] = _.get(v, `${k}-H1PL`)
    //             dt[`${k}-err`] = _.get(v, `${k}-err`)
    //         })
    //         return dt
    //     })
    //     return ds
    // }

    it(`should return resOut1 when calcLiquefactionSpt(rowsIn1, ${JSON.stringify(methods)}), ${JSON.stringify(opt)})`, function() {
        let r = calcLiquefactionSpt(rowsIn1, methods, opt)
        let rr = resOut1
        // r = gv(r)
        // rr = gv(rr)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return resOut2 when calcLiquefactionSpt(rowsIn2, ${JSON.stringify(methods)}), ${JSON.stringify(opt)})`, function() {
        let r = calcLiquefactionSpt(rowsIn2, methods, opt)
        let rr = resOut2
        // r = gv(r)
        // rr = gv(rr)
        assert.strict.deepStrictEqual(r, rr)
    })

})
