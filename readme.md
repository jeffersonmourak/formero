# DESTEK FORM GENERATOR V1.0#

É uma biblioteca Jquery para o desenvolvimento dos fomulário das inscrições

## A Função ##

O Destek tem uma função chamada Init, nela deve conter os campos nos que serão enviados ao servidor
Ex.:
```
#!javascript

	$(seletor).destek().init({
	    fields: ["campos","do","formulário"],
	});

```

Os campos que podem ser usados 

* ```name```
* ```code```
* ```email```
* ```phone```
* ```company```
* ```job```
* ```schooling```
* ```course```
* ```street```
* ```number```
* ```complement```
* ```neighborhood```
* ```city```
* ```state```