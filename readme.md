# FORMERO FORM GENERATOR V1.0#

É uma biblioteca Jquery para o desenvolvimento dos fomulário das inscrições

## A Função ##

O Formero tem uma função chamada Init, nela deve conter os campos nos que serão enviados ao servidor
Ex.:
```

	$(seletor).formero().init({
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

## O EVENTO ##
O *formero* contém um evento que é dado assim que o botão de fechar é clicado, esse evento tem como objetivo comunicar à página que o fomulário foi finalizado.

### Como usar ###
```
#!javascript

	document.addEventListener("formero-close-form", function(e) {
        //Seu código aqui
    })

```

## Funções e dados Globais ##

Todas as funções e variáveis globais do formero estão contidas no objeto ``` formeroData ```
O objeto é dividido em quatro métodos:

| **Método**      | **Tipo**         | **Informação**                                               |
|-------------|--------------|-----------------------------------------------------------|
| *step*      | ```Objeto``` | Esse objeto contém as funções das abas do formulário      |
| *mask*      | ```Função``` | Essa Função Gera as mascaras dos campos de texto          |
| *variables* | ```Objeto``` | Esse Objeto contém os valores padrões públicos do formero |
| *events*    | ```Objeto``` | Esse Objeto contém as funções de evento do formero        |


## Objeto STEP ##
O objeto step contém três funções para facilitar a navegação entre as abas,

| **Função**     | **Informação**                                                                                   |
|------------|----------------------------------------------------------------------------------------------|
| **set**      | Essa função seleciona a aba atual, nela você pode navegar para qualquer aba indicando o alvo |
| **next**     | Essa função seleciona a próxima aba com base na atual                                        |
| **previous** | Essa função seleciona a aba anterior com base na atual                                       |

## função MASK ##
Essa função é uma extenção da biblioteca **Jquery.Mask** ela mascara todos os campos disponíveis e mascaráveis.
Ex.: ``` CPF ```, ``` CEP ```, ``` Telefone ```

## Objeto EVENT ##
Esse objeto, contém funções que podem ser utilizadas para manipular o formero

| **Função**       | **Informação**                                                                 |
|----------------|------------------------------------------------------------------------------|
| ```validate``` | Essa função Valida os campo assim que chamado                                |
| ```dispatch``` | Essa função lança um evento assim que o formulário é finalizado com sucesso. |
| ```submit```   | Essa função envia os dados do formulário ao servido                          |


## Objeto VALIDATOR ##
Esse é um objeto privado que valida os dados dos formulários, ele contém dois tipos de validação

* Dados - que valida os dados digitados nos campos
* UI    - que valida o DOM montando os feedbacks