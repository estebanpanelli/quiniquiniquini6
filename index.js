/*
    Este programa es software libre: puede redistribuirlo y/o modificarlo
    bajo los terminos de la Licencia General Pública de GNU (GNU GPL)
    publicada por la Free Software Foundation (FSF), en la version 3 o
    versiones posteriores.

    Este programa se distribuye con la esperanza de que pueda ser útil,
    pero SIN NINGUNA GARANTIA; Sin siquiera la garantía implicita de SER
    COMERCIABLE o ADAPTARSE A UN PROPOSITO PARTICULAR. Por favor, lea la
    Licencia General Pública de GNU para mas detalles.

    Usted debería haber recibido una copia de la licencia GNU GPL junto
    con este programa, en caso contrario, vea <https://www.gnu.org/licenses/>.
--
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const fetch = require('node-fetch')
const HTMLParser = require('node-html-parser');
const nodemailer = require('nodemailer');
const log = require('electron-log');

try {
    const config = require('./config.json');
    global.gConfig = config
    if (global.gConfig.output == undefined) {global.gConfig.output = {
        'html-color': 'green'
    }}
    else if (global.gConfig.output['html-color'] == undefined) {global.gConfig.output['html-color'] = 'green'}
}
catch(error) {
    log.warn('No hay archivo de configuracion, la funcion de mail no estara disponible')
    global.gNoConfig = true
}

global.gTests = [{
        id: 'telekinos',
        url: 'http://www.telekinos.com.ar/quini6.html',
        timeout: 8000,
        checkSSL: false,
        enabled: false,
    },{
        id: 'quini-6-resultados',
        url: 'https://www.quini-6-resultados.com.ar/',
        timeout: 8000,
        checkSSL: false,
        enabled: true,
    }]


function fetchResults(URL, CHECKSSL, TIMEOUT) {
    return new Promise((resolve, reject) =>{
        var fetchOptions = {
            headers:{'Access-Control-Allow-Headers':'X-Requested-With,content-type'},
            timeout:TIMEOUT
        }
        if (!CHECKSSL && URL.split(":")[0] == 'https'){
            const https = require('https')
            fetchOptions['agent'] = new https.Agent({rejectUnauthorized: false})
        }
        fetch(URL,fetchOptions).then((res) =>{
            resolve(res.text());
        }).catch((error) =>{
            reject(JSON.stringify(error));
        })
    })
}


const parseQuini = {
    'quini-6-resultados': function (TEST){
        return new Promise((resolve,reject) => {
            fetchResults(TEST.url, TEST.checkSSL, TEST.timeout).then(html =>{
                data = HTMLParser.parse(html)
                lines = data.structuredText.split('\n')
                for (line of lines){
                    reg = /^Sorteo del dia (\d+)\/(\d+)\/(\d+) Nro. Sorteo: (\d+)/
                    if ((r = reg.exec(line)) !== null) {
                        var resultssection = true
                        var sorteo = r[4]   // Numero de sorteo
                        var D = r[1]        // Dia
                        var M = r[2]        // Mes
                        var Y = r[3]        // Año
                        var results = {fechastr:D+'/'+M+'/'+Y, fecha:new Date(Y,M,D), sorteo:parseInt(sorteo), resultados:{}}
                    }
                    else if (resultssection) {
                        if ((r = /(\d+) - (\d+) - (\d+) - (\d+) - (\d+) - (\d+)/.exec(line)) !== null) {
                            if ('siempresale' in results.resultados) break
                            else if ('revancha' in results.resultados) results.resultados.siempresale = [parseInt(r[1]),parseInt(r[2]),parseInt(r[3]),parseInt(r[4]),parseInt(r[5]),parseInt(r[6])]
                            else if ('segunda' in results.resultados) results.resultados.revancha = [parseInt(r[1]),parseInt(r[2]),parseInt(r[3]),parseInt(r[4]),parseInt(r[5]),parseInt(r[6])]
                            else if ('tradicional' in results.resultados) results.resultados.segunda = [parseInt(r[1]),parseInt(r[2]),parseInt(r[3]),parseInt(r[4]),parseInt(r[5]),parseInt(r[6])]
                            else results.resultados.tradicional = [parseInt(r[1]),parseInt(r[2]),parseInt(r[3]),parseInt(r[4]),parseInt(r[5]),parseInt(r[6])]
                        }
                    }
                }
                resolve(results)
            }).catch(error => {
                reject('Error: ' + error)
            })
        })
    },
    'telekinos': function(TEST){
        return new Promise((resolve, reject) => {
            fetchResults(TEST.url, TEST.checkSSL, TEST.timeout).then(html => {
                data = HTMLParser.parse(html)
                lines = data.structuredText.split('\n')
                var cont = 0
                var results = {resultados: {tradicional:[], segunda:[], revancha:[], siempresale:[]}}
                for (line of lines){
                    reg = /^Quini 6 sorteo (\d+) Fecha: (\d+)\/(\d+)\/(\d+)/
                    if ((r = reg.exec(line)) !== null) {
                        var resultssection = true
                        var sorteo = r[1]
                        var D = r[2]
                        var M = r[3]
                        var Y = r[4]
                        results.date = new Date(Y,M,D)
                        results.datestring = D + '/' + M + '/' + Y
                        results.sorteo = parseInt(sorteo)
                    }
                    else if (resultssection) {
                        if (/\d+/.test(line)) {
                            if (cont < 6) results.resultados.tradicional.push(parseInt(line))
                            else if (cont < 12) results.resultados.segunda.push(parseInt(line))
                            else if (cont < 18) results.resultados.revancha.push(parseInt(line))
                            else if (cont < 24) results.resultados.siempresale.push(parseInt(line))
                            else break
                            cont += 1
                        }
                    }
                }
                resolve(results)
            }).catch(error => {
                reject('Error: ' + error)
            })
        })
    }
}

const results = {
    check: function(SORTEO,JUGADA){
        rondas = ['tradicional', 'segunda', 'revancha', 'siempresale']
        matches = {}
        var all = SORTEO.resultados.tradicional.concat(SORTEO.resultados.segunda).concat(SORTEO.resultados.revancha).concat(SORTEO.resultados.siempresale)
        for (numero of JUGADA){
            all = all.map((value) => {
                if (value == numero) {return 'm' + value}
                else return value
            })
        }
        separate = {
            sorteos: {
                tradicional: {name:'Tradicional', array: all.slice(0,6)},
                segunda: {name:'Segunda', array: all.slice(6,12)},
                revancha: {name:'Revancha', array: all.slice(12,18)},
                siempresale: {name:'Siempre Sale',array: all.slice(18,24)},
            }
        }
        for (i in separate.sorteos){
            separate.sorteos[i].hits = separate.sorteos[i].array.filter(A => /^m(\d+)/.test(A)).length
            separate.sorteos[i].string = separate.sorteos[i].array.join(' ')
            separate.sorteos[i].matched = separate.sorteos[i].array.filter(A => /^m(\d+)/.test(A)).map(F => /(\d+)/.exec(F)[1])
            separate.sorteos[i].unmatched = separate.sorteos[i].array.filter(A => /^(\d+)/.test(A))
        }
        separate.pozoextra = separate.sorteos.tradicional.hits + separate.sorteos.segunda.hits + separate.sorteos.revancha.hits
        if (separate.pozoextra >= 6 || separate.sorteos.tradicional.hits >= 4 || separate.sorteos.segunda.hits >= 4 || separate.sorteos.revancha.hits >= 4 || separate.sorteos.siempresale.hits >= 4) {
            separate.ganastealgo = true
        } else {separate.ganastealgo = false}

        return separate
    },
    output: function(RESULTS,FORMAT,NUMSORTEO,FECHA){
        FORMAT = FORMAT || 'colorterm'

        if (FORMAT == 'nagios'){
            if (RESULTS.ganastealgo){
                console.log('Parece que ganaste algo...')
                process.exit(0)
            }
            else {
                console.log('No hubo suerte esta vez...')
                process.exit(2)
            }
        }

        if (RESULTS.ganastealgo){
            if (FORMAT == 'colorterm'){var text = '\x1b[1m\x1b[36mPsst... Creo que ganaste algo...\x1b[0m\x1b[1m\r\n'}
            else if (FORMAT == 'html'){var text = '<h2>Psst... Creo que ganaste algo...</h2>\r\n'}
            else if (FORMAT == 'term'){var text = '\x1b[1mPsst... Creo que ganaste algo...\x1b[22m\r\n'}
            else if (FORMAT == 'md'){var text = '##Psst... Creo que ganaste algo...\r\n'}
        } else var text = ''

        if (/colorterm|term/.test(FORMAT)){var text = 'Sorteo: ' + NUMSORTEO + ' (' + FECHA + ')\r\n'}
        else if (FORMAT == 'html'){var text = '<p>Sorteo: ' + NUMSORTEO + ' (' + FECHA + ')</p>\r\n'}
        else if (FORMAT == 'md'){var text = '>Sorteo: ' + NUMSORTEO + ' (' + FECHA + ')' + '\r\n\r\n'}

        for (i in RESULTS.sorteos){
            if (FORMAT == 'html'){
                text += `
                <h4 style="margin-bottom:2px"> ${RESULTS.sorteos[i].name} </h4>
                ${RESULTS.sorteos[i].string.replace(/m(\d+)/g,'<b style="color:'+global.gConfig.output['html-color']+'">$1</b>')}
                `
            }
            else if (FORMAT == 'term'){
                text += `
                \x1b[1m ${RESULTS.sorteos[i].name} \x1b[22m
                ${RESULTS.sorteos[i].string.replace(/m(\d+)/g,'\x1b[1m$1\x1b[22m')}
                `
            }
            else if (FORMAT == 'colorterm'){
                text += `
                \x1b[1m ${RESULTS.sorteos[i].name} \x1b[22m
                ${RESULTS.sorteos[i].string.replace(/m(\d+)/g,'\x1b[1m\x1b[31m$1\x1b[0m\x1b[22m')}
                `
            }
            else if (FORMAT == 'md'){
                text += '**' + RESULTS.sorteos[i].name + '**\r\n\r\n'
                text += RESULTS.sorteos[i].string.replace(/m(\d+)/g,'`$1`') + '\r\n\r\n'
            }
        }
        return text
    }
}

const runtime = {
    getArguments: function(ARGV){
        if (/ (-t|--test)/.test(ARGV.join(' '))) {return {test:true}} // No hace nada si recibe -t, es para poder usar en tests y/o como modulo

        if (/ (-h|--help)/.test(ARGV.join(' '))) {runtime.showUsage(0)}
        
        if (/ -m/.test(ARGV.join(' '))) {mailResults = true}
        else mailResults = false

        if ((r = / -o (\w+)/.exec(ARGV.join(' '))) !== null) {format = r[1]}
        else if (mailResults) format = 'html'
        else format = 'colorterm'
        
        var jugada = ARGV.filter(ARGUMENTS => {
            return /^(\d+)$/.test(ARGUMENTS)
        }).map(NUMERO => {
            return parseInt(NUMERO)
        })
        
        // Revision de parametros
        if (jugada.length !== 6) throw new Error('No me pasaste los 6 valores gil')
        if (!(/^(html|colorterm|term|nagios|md)$/.test(format))) throw new Error('Ese output no es valido, las elecciones son html, term, colorterm, md o nagios')
        if (mailResults && (/^(colorterm|term|nagios)$/.test(format))) throw new Error('La opcion mail no es compatible con ese formato de salida')
        if (mailResults && global.gNoConfig) throw new Error('No se puede usar la funcion de mail si no hay archivo de configuracion')

        return {jugada:jugada, format:format, mail:mailResults}
    },
    sendMail: function(HTML){
        var transporter = nodemailer.createTransport(global.gConfig.nodemailer.transport);
        var message = global.gConfig.nodemailer.options;
        message.html = HTML
        transporter.sendMail(message, (err, info) => {
            if (err) throw new Error(err)
            // console.log('Message sent: %s', info.messageId);
        });
    },
    showUsage: function(EXITCODE){
        var usage = `
  \x1b[1mUSAGE:\x1b[22m node index.js <Tu Jugada> [-o {html|term|colorterm|nagios}]
  \x1b[1mEXAMPLE:\x1b[22m node index.js 4 7 15 25 32 38             # Devuelve el sorteo con tus apuestas resaltadas
  \x1b[1mEXAMPLE:\x1b[22m node index.js 4 7 15 25 32 38 -o html     # Devuelve el sorteo con tus apuestas resaltadas en formato HTML (Util para mail)
  \x1b[1mEXAMPLE:\x1b[22m node index.js 4 7 15 25 32 38 -o nagios   # Devuelve codigos de error para Nagios (0:ganaste algo, 2:no ganaste nada, 3:ni idea)
`
        console.log(usage)
        if (EXITCODE !== undefined) process.exit(EXITCODE)
    },
}

// console.log(`Config: ${JSON.stringify(global.gConfig)}`)
// console.log(JSON.stringify(process.argv))
try {
    var args = runtime.getArguments(process.argv)
}
catch(error){
    log.error(error)
    runtime.showUsage()
    process.exit(1)
}
// console.log(JSON.stringify(args))

if (!(args.test)){
    for (test of global.gTests){
        if (test.enabled){
            parseQuini[test.id](test).then(sorteo =>{
                // console.log(JSON.stringify(sorteo))
                ganamo = results.check(sorteo,args.jugada)
                // console.log(JSON.stringify(ganamo))
                out = results.output(ganamo, args.format, sorteo.sorteo, sorteo.fechastr)
                if (args.mail){
                    console.log("mail" + out)
                    try {
                        runtime.sendMail(out)
                    }
                    catch(error) {
                        log.error('Error occurred. ' + error);
                        return process.exit(4);
                    }
                } else console.log(out)
                // process.exit(0)     // Para el formato nagios el exit se hace en el output
            }).catch(error => {
                console.log(error.message)
                process.exit(3)     // Sirve como UNKNOWN para Nagios
            })
        }
    }
}
else {   
    module.exports = {
        resultsCheck: results.check,
        resultsOutput: results.output,
        runtimeGetArguments: runtime.getArguments,
    }
}