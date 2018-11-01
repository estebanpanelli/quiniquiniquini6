# quiniquiniquini6
Comprobador de resultados de Quini 6

## Instalacion
```bash
git clone https://github.com/jdvalentini/quiniquiniquini6.git
cd quiniquiniquini6
npm install
```

## Uso
El programa busca en varias paginas los resultados del ultimo sorteo de Quini6 y lo cruza contra tu jugada.

**USO:** `node index.js <Tu Jugada> [-o {html|term|colorterm|md|nagios}] [-m] [-h|--help] [-t|--test]`

`-o` especifica el formato de salida, siendo estos:
* **html**: STDOUT formateado en HTML
* **term**: STDOUT formateado para salida en consola (Linux)
* **colorterm**: STDOUT formateado para salida en consola a colores (si, adivinaste!)
* **md**: STDOUT formateado en [Markdown][1] (como este README)
* **nagios**: La salida es con codigo de error para usar con Nagios (0:ganaste algo, 2:no ganaste nada, 3:ni idea)

Por defecto el formato sera `md`

`-m` utiliza las opciones dadas en el archivo de configuracion para enviar un correo a una lista de destinatarios, vea la seccion del archivo de configuracion.

`-h` muestra la ayuda y sale

`-t` es para poder usar los tests (O para usar como modulo). Probablemente ningun usuario lo necesita y esta mas bien pensado como herramienta de desarrollo

## Ejemplos
```bash
node index.js 1 3 5 7 9 11          # Devuelve el sorteo con tus apuestas resaltadas
node index.js 1 3 5 7 9 11 -o html  # Devuelve el sorteo con tus apuestas resaltadas en formato HTML (Util para mail)
```

A la salida se vera algo como (Formato markdown):
```
Sorteo: 2614 (Wed Nov 28 2018 00:00:00 GMT-0500 (EST)

                ### Tradicional
                0 10 18 20 21 43
                
                ### Segunda
                2 6 **7** 25 33 42
                
                ### Revancha
                **7** 23 28 32 34 45
                
                ### Siempre Sale
                4 22 23 26 36 42

```
O bien interpretado:

------------------------------------------------------
Sorteo: 2614 (Wed Nov 28 2018 00:00:00 GMT-0500 (EST)
 
### Tradicional
0 10 18 20 21 43
                 
### Segunda
2 6 **7** 25 33 42
                 
### Revancha
**7** 23 28 32 34 45
                 
### Siempre Sale
4 22 23 26 36 42

------------------------------------------------------

## Archivo de configuracion
Desde el archivo de configuracion se especifican principalmente los detalles de [Nodemailer][2] para poder enviar correos con la opcion `-m`, el archivo de configuracion es un archivo JSON que, para el caso de nodemailer simplemente configura los 2 objetos requeridos (vea la documentacion de nodemailer para cambiar los valores por defecto):

```json
{
    "nodemailer": {
        "transport":{
            "host": "smtp.zoho.com",
            "port": 465,
            "secure": true,
            "auth":{
                "user": "maildeservicio@tudominio.com",
                "pass": "SuperS3cretPassword"
            }
        },
        "options":{
            "from": "Resultados Quini <maildeservicio@tudominio.com>",
            "to": "tumail@tudominio.com, elmaildeunamigodellaburoquejuegaconvos@tudominio.com",
            "subject": "Quini 6"
        }
    }
}
```

No tiene muchas opciones mas el archivo pero el nodo output se puede configurar el color del resaltado en HTML:

```json
{
    "output":{
        "html-color": "red"
    }
}
```
Para su conveniencia (querido usuario), agregue un archivo `config.json.example` que sirve como ejemplo, se puede renombrar como `config.json` para tener un modelo de partida. Si no agregas un archivo config, la funcion de mail no va a estar disponible, y se recibe una alerta al iniciar el programa

## Compatibilidad
Todavia no lo se...

## Disclaimer
PROGRAMA SIN GARANTIAS. Para conseguir el ultimo sorteo, uso paginas de resultados con las que no tengo relacion alguna, voy a hacer mi mejor intento por mantener actualizado el programa ante cambios en estas paginas.

Se escribir mejor que esto, pero la falta de tildes en muchas palabras se debe a que tengo teclado en ingles (otro ejemplo de falta de tilde)... prometo que ya lo voy a arreglar...


[1]: https://daringfireball.net/projects/markdown/syntax
[2]: https://nodemailer.com/about/