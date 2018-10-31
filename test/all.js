
process.argv.push("-t")

const quini = require('../index.js')
const assert = require('assert')

// sorteo = {
//     "sorteos": {
//         "tradicional": {"name":"Tradicional","array":[0,10,18,20,21,43],"hits":0,"string":"0 10 18 20 21 43","matched":[],"unmatched":[0,10,18,20,21,43]},
//         "segunda": {"name":"Segunda","array":["m2","m6",7,25,33,42],"hits":2,"string":"m2 m6 7 25 33 42","matched":["2","6"],"unmatched":[7,25,33,42]},
//         "revancha":{"name":"Revancha","array":[7,23,28,32,34,45],"hits":0,"string":"7 23 28 32 34 45","matched":[],"unmatched":[7,23,28,32,34,45]},
//         "siempresale":{"name":"Siempre Sale","array":["m4",22,23,26,36,42],"hits":1,"string":"m4 22 23 26 36 42","matched":["4"],"unmatched":[22,23,26,36,42]}
//     },
//     "pozoextra":2,
//     "ganastealgo":false
// }

jugada = [1,2,3,4,5,6]

describe("Funcion runtime.getArguments",() => {
    it("Verifica que los argumentos esten correctos", () => {
        
        // cliArgs = ['node','index.js','1','2','4','5','6']
        // assert.throws(function(){quini.runtimeGetArguments(cliArgs)},Error)
    })
    
    it("Devuelve un objeto con la jugada y el formato", () => {
        cliArgs = ['node','index.js','1','2','3','4','5','6']
        args = quini.runtimeGetArguments(cliArgs)
        assert.equal(args.jugada[0],1)
        assert.equal(args.jugada[1],2)
        assert.equal(args.jugada[2],3)
        assert.equal(args.jugada[3],4)
        assert.equal(args.jugada[4],5)
        assert.equal(args.jugada[5],6)
        
        cliArgs = ['node','index.js','1','2','3','4','5','6','-o','term']
        args = quini.runtimeGetArguments(cliArgs)
        assert.equal(args.format,'term')
    })
})

describe("Funcion results.check",() => {
    it("Revisa los resultados contra tu jugada valor a valor", () => {
        jugada = [1,2,3,4,5,6]
        sorteo = {
            "fecha": "2018-11-28T05:00:00.000Z",
            "sorteo": 2614,
            "resultados": {
                "tradicional": [0,10,18,20,21,43],
                "segunda": [2,6,7,25,33,42],
                "revancha": [7,23,28,32,34,45],
                "siempresale": [4,22,23,26,36,42]
            }
        }
        results = quini.resultsCheck(sorteo,jugada)
        assert.equal(results.sorteos.tradicional.hits,0)
        assert.equal(results.sorteos.segunda.hits,2)
        assert.equal(results.sorteos.revancha.hits,0)
        assert.equal(results.sorteos.siempresale.hits,1)
        assert.equal(results.sorteos.siempresale.matched[0],4)
        assert.equal(results.sorteos.siempresale.matched.length,1)
        assert.equal(results.pozoextra,2)
    })

    it("Devuelve una bandera de posibles premios", () => {
        jugada = [1,2,3,4,5,6]
        sorteo = {
            "fecha": "2018-11-28T05:00:00.000Z",
            "sorteo": 2614,
            "resultados": {
                "tradicional": [0,10,18,20,21,43],
                "segunda": [2,6,7,25,33,42],
                "revancha": [7,23,28,32,34,45],
                "siempresale": [4,22,23,26,36,42]
            }
        }
        results = quini.resultsCheck(sorteo,jugada)
        assert.equal(results.ganastealgo,false)

        jugada = [0,10,18,20,21,45]
        results = quini.resultsCheck(sorteo,jugada)
        assert.equal(results.ganastealgo,true)
    })
})

describe("Funcion results.output",() => {
    it("Devuelve codigos de error para Nagios", () => {
        
    })

    it("Devuelve formato HTML", () => {
        
    })

    it("Devuelve formato consola Linux", () => {
        
    })

    it("Devuelve formato Markdown", () => {
        
    })
})