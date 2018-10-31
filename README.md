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

`node index.js <Tu Jugada> [-o {html|term|colorterm|nagios}`

`-o` especifica el formato de salida, siendo estos:
* **html**: STDOUT formateado en HTML
* **term**: STDOUT formateado para salida en consola (Linux)
* **colorterm**: STDOUT formateado para salida en consola a colores (si, adivinaste!)
* **nagios**: La salida es con codigo de error para usar con Nagios (0:ganaste algo, 2:no ganaste nada, 3:ni idea)

Proximamente `-m` para mail

## Ejemplos
```bash
node index.js 1 3 5 7 9 11          # Devuelve el sorteo con tus apuestas resaltadas
node index.js 1 3 5 7 9 11 -o html  # Devuelve el sorteo con tus apuestas resaltadas en formato HTML (Util para mail)
```

A la salida se vera algo como (Formato html):
```html
                <h3> Tradicional <h3>
                0 10 18 20 21 43
                
                <h3> Segunda <h3>
                2 6 <b>7</b> 25 33 42
                
                <h3> Revancha <h3>
                <b>7</b> 23 28 32 34 45
                
                <h3> Siempre Sale <h3>
                4 22 23 26 36 42
                
```

## Archivo de configuracion
Todavia no tiene...

## Compatibilidad
Todavia no lo se...

## Disclaimer
PROGRAMA SIN GARANTIAS. Para conseguir el ultimo sorteo, uso paginas de resultados con las que no tengo relacion alguna, voy a hacer mi mejor intento por mantener actualizado el programa ante cambios en estas paginas.