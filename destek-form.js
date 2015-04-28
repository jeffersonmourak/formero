/**
 * jquery.mask.js
 * @version: v1.11.4
 * @author: Igor Escobar
 *
 * Created by Igor Escobar on 2012-03-10. Please report any bug at http://blog.igorescobar.com
 *
 * Copyright (c) 2012 Igor Escobar http://blog.igorescobar.com
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/* jshint laxbreak: true */
/* global define, jQuery, Zepto */

'use strict';

// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/jqueryPluginCommonjs.js
(function (factory) {

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery || Zepto);
    }

}(function ($) {

    var Mask = function (el, mask, options) {
        el = $(el);

        var jMask = this, oldValue = el.val(), regexMask;

        mask = typeof mask === 'function' ? mask(el.val(), undefined, el,  options) : mask;

        var p = {
            invalid: [],
            getCaret: function () {
                try {
                    var sel,
                        pos = 0,
                        ctrl = el.get(0),
                        dSel = document.selection,
                        cSelStart = ctrl.selectionStart;

                    // IE Support
                    if (dSel && navigator.appVersion.indexOf('MSIE 10') === -1) {
                        sel = dSel.createRange();
                        sel.moveStart('character', el.is('input') ? -el.val().length : -el.text().length);
                        pos = sel.text.length;
                    }
                    // Firefox support
                    else if (cSelStart || cSelStart === '0') {
                        pos = cSelStart;
                    }

                    return pos;
                } catch (e) {}
            },
            setCaret: function(pos) {
                try {
                    if (el.is(':focus')) {
                        var range, ctrl = el.get(0);

                        if (ctrl.setSelectionRange) {
                            ctrl.setSelectionRange(pos,pos);
                        } else if (ctrl.createTextRange) {
                            range = ctrl.createTextRange();
                            range.collapse(true);
                            range.moveEnd('character', pos);
                            range.moveStart('character', pos);
                            range.select();
                        }
                    }
                } catch (e) {}
            },
            events: function() {
                el
                .on('keyup.mask', p.behaviour)
                .on('paste.mask drop.mask', function() {
                    setTimeout(function() {
                        el.keydown().keyup();
                    }, 100);
                })
                .on('change.mask', function(){
                    el.data('changed', true);
                })
                .on('blur.mask', function(){
                    if (oldValue !== el.val() && !el.data('changed')) {
                        el.triggerHandler('change');
                    }
                    el.data('changed', false);
                })
                // it's very important that this callback remains in this position
                // otherwhise oldValue it's going to work buggy
                .on('keydown.mask, blur.mask', function() {
                    oldValue = el.val();
                })
                // select all text on focus
                .on('focus.mask', function (e) {
                    if (options.selectOnFocus === true) {
                        $(e.target).select();
                    }
                })
                // clear the value if it not complete the mask
                .on('focusout.mask', function() {
                    if (options.clearIfNotMatch && !regexMask.test(p.val())) {
                       p.val('');
                   }
                });
            },
            getRegexMask: function() {
                var maskChunks = [], translation, pattern, optional, recursive, oRecursive, r;

                for (var i = 0; i < mask.length; i++) {
                    translation = jMask.translation[mask.charAt(i)];

                    if (translation) {

                        pattern = translation.pattern.toString().replace(/.{1}$|^.{1}/g, '');
                        optional = translation.optional;
                        recursive = translation.recursive;

                        if (recursive) {
                            maskChunks.push(mask.charAt(i));
                            oRecursive = {digit: mask.charAt(i), pattern: pattern};
                        } else {
                            maskChunks.push(!optional && !recursive ? pattern : (pattern + '?'));
                        }

                    } else {
                        maskChunks.push(mask.charAt(i).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
                    }
                }

                r = maskChunks.join('');

                if (oRecursive) {
                    r = r.replace(new RegExp('(' + oRecursive.digit + '(.*' + oRecursive.digit + ')?)'), '($1)?')
                         .replace(new RegExp(oRecursive.digit, 'g'), oRecursive.pattern);
                }

                return new RegExp(r);
            },
            destroyEvents: function() {
                el.off(['keydown', 'keyup', 'paste', 'drop', 'blur', 'focusout', ''].join('.mask '));
            },
            val: function(v) {
                var isInput = el.is('input'),
                    method = isInput ? 'val' : 'text',
                    r;

                if (arguments.length > 0) {
                    if (el[method]() !== v) {
                        el[method](v);
                    }
                    r = el;
                } else {
                    r = el[method]();
                }

                return r;
            },
            getMCharsBeforeCount: function(index, onCleanVal) {
                for (var count = 0, i = 0, maskL = mask.length; i < maskL && i < index; i++) {
                    if (!jMask.translation[mask.charAt(i)]) {
                        index = onCleanVal ? index + 1 : index;
                        count++;
                    }
                }
                return count;
            },
            caretPos: function (originalCaretPos, oldLength, newLength, maskDif) {
                var translation = jMask.translation[mask.charAt(Math.min(originalCaretPos - 1, mask.length - 1))];

                return !translation ? p.caretPos(originalCaretPos + 1, oldLength, newLength, maskDif)
                                    : Math.min(originalCaretPos + newLength - oldLength - maskDif, newLength);
            },
            behaviour: function(e) {
                e = e || window.event;
                p.invalid = [];
                var keyCode = e.keyCode || e.which;
                if ($.inArray(keyCode, jMask.byPassKeys) === -1) {

                    var caretPos = p.getCaret(),
                        currVal = p.val(),
                        currValL = currVal.length,
                        changeCaret = caretPos < currValL,
                        newVal = p.getMasked(),
                        newValL = newVal.length,
                        maskDif = p.getMCharsBeforeCount(newValL - 1) - p.getMCharsBeforeCount(currValL - 1);

                    p.val(newVal);

                    // change caret but avoid CTRL+A
                    if (changeCaret && !(keyCode === 65 && e.ctrlKey)) {
                        // Avoid adjusting caret on backspace or delete
                        if (!(keyCode === 8 || keyCode === 46)) {
                            caretPos = p.caretPos(caretPos, currValL, newValL, maskDif);
                        }
                        p.setCaret(caretPos);
                    }

                    return p.callbacks(e);
                }
            },
            getMasked: function(skipMaskChars) {
                var buf = [],
                    value = p.val(),
                    m = 0, maskLen = mask.length,
                    v = 0, valLen = value.length,
                    offset = 1, addMethod = 'push',
                    resetPos = -1,
                    lastMaskChar,
                    check;

                if (options.reverse) {
                    addMethod = 'unshift';
                    offset = -1;
                    lastMaskChar = 0;
                    m = maskLen - 1;
                    v = valLen - 1;
                    check = function () {
                        return m > -1 && v > -1;
                    };
                } else {
                    lastMaskChar = maskLen - 1;
                    check = function () {
                        return m < maskLen && v < valLen;
                    };
                }

                while (check()) {
                    var maskDigit = mask.charAt(m),
                        valDigit = value.charAt(v),
                        translation = jMask.translation[maskDigit];

                    if (translation) {
                        if (valDigit.match(translation.pattern)) {
                            buf[addMethod](valDigit);
                             if (translation.recursive) {
                                if (resetPos === -1) {
                                    resetPos = m;
                                } else if (m === lastMaskChar) {
                                    m = resetPos - offset;
                                }

                                if (lastMaskChar === resetPos) {
                                    m -= offset;
                                }
                            }
                            m += offset;
                        } else if (translation.optional) {
                            m += offset;
                            v -= offset;
                        } else if (translation.fallback) {
                            buf[addMethod](translation.fallback);
                            m += offset;
                            v -= offset;
                        } else {
                          p.invalid.push({p: v, v: valDigit, e: translation.pattern});
                        }
                        v += offset;
                    } else {
                        if (!skipMaskChars) {
                            buf[addMethod](maskDigit);
                        }

                        if (valDigit === maskDigit) {
                            v += offset;
                        }

                        m += offset;
                    }
                }

                var lastMaskCharDigit = mask.charAt(lastMaskChar);
                if (maskLen === valLen + 1 && !jMask.translation[lastMaskCharDigit]) {
                    buf.push(lastMaskCharDigit);
                }

                return buf.join('');
            },
            callbacks: function (e) {
                var val = p.val(),
                    changed = val !== oldValue,
                    defaultArgs = [val, e, el, options],
                    callback = function(name, criteria, args) {
                        if (typeof options[name] === 'function' && criteria) {
                            options[name].apply(this, args);
                        }
                    };

                callback('onChange', changed === true, defaultArgs);
                callback('onKeyPress', changed === true, defaultArgs);
                callback('onComplete', val.length === mask.length, defaultArgs);
                callback('onInvalid', p.invalid.length > 0, [val, e, el, p.invalid, options]);
            }
        };


        // public methods
        jMask.mask = mask;
        jMask.options = options;
        jMask.remove = function() {
            var caret = p.getCaret();
            p.destroyEvents();
            p.val(jMask.getCleanVal());
            p.setCaret(caret - p.getMCharsBeforeCount(caret));
            return el;
        };

        // get value without mask
        jMask.getCleanVal = function() {
           return p.getMasked(true);
        };

       jMask.init = function(onlyMask) {
            onlyMask = onlyMask || false;
            options = options || {};

            jMask.byPassKeys = $.jMaskGlobals.byPassKeys;
            jMask.translation = $.jMaskGlobals.translation;

            jMask.translation = $.extend({}, jMask.translation, options.translation);
            jMask = $.extend(true, {}, jMask, options);

            regexMask = p.getRegexMask();

            if (onlyMask === false) {

                if (options.placeholder) {
                    el.attr('placeholder' , options.placeholder);
                }

                // autocomplete needs to be off. we can't intercept events
                // the browser doesn't  fire any kind of event when something is
                // selected in a autocomplete list so we can't sanitize it.
                el.attr('autocomplete', 'off');
                p.destroyEvents();
                p.events();

                var caret = p.getCaret();
                p.val(p.getMasked());
                p.setCaret(caret + p.getMCharsBeforeCount(caret, true));

            } else {
                p.events();
                p.val(p.getMasked());
            }
        };

        jMask.init(!el.is('input'));
    };

    $.maskWatchers = {};
    var HTMLAttributes = function () {
            var input = $(this),
                options = {},
                prefix = 'data-mask-',
                mask = input.attr('data-mask');

            if (input.attr(prefix + 'reverse')) {
                options.reverse = true;
            }

            if (input.attr(prefix + 'clearifnotmatch')) {
                options.clearIfNotMatch = true;
            }

            if (input.attr(prefix + 'selectonfocus') === 'true') {
               options.selectOnFocus = true;
            }

            if (notSameMaskObject(input, mask, options)) {
                return input.data('mask', new Mask(this, mask, options));
            }
        },
        notSameMaskObject = function(field, mask, options) {
            options = options || {};
            var maskObject = $(field).data('mask'),
                stringify = JSON.stringify,
                value = $(field).val() || $(field).text();
            try {
                if (typeof mask === 'function') {
                    mask = mask(value);
                }
                return typeof maskObject !== 'object' || stringify(maskObject.options) !== stringify(options) || maskObject.mask !== mask;
            } catch (e) {}
        };


    $.fn.mask = function(mask, options) {
        options = options || {};
        var selector = this.selector,
            globals = $.jMaskGlobals,
            interval = $.jMaskGlobals.watchInterval,
            maskFunction = function() {
                if (notSameMaskObject(this, mask, options)) {
                    return $(this).data('mask', new Mask(this, mask, options));
                }
            };

        $(this).each(maskFunction);

        if (selector && selector !== '' && globals.watchInputs) {
            clearInterval($.maskWatchers[selector]);
            $.maskWatchers[selector] = setInterval(function(){
                $(document).find(selector).each(maskFunction);
            }, interval);
        }
        return this;
    };

    $.fn.unmask = function() {
        clearInterval($.maskWatchers[this.selector]);
        delete $.maskWatchers[this.selector];
        return this.each(function() {
            var dataMask = $(this).data('mask');
            if (dataMask) {
                dataMask.remove().removeData('mask');
            }
        });
    };

    $.fn.cleanVal = function() {
        return this.data('mask').getCleanVal();
    };

    $.applyDataMask = function(selector) {
        selector = selector || $.jMaskGlobals.maskElements;
        var $selector = (selector instanceof $) ? selector : $(selector);
        $selector.filter($.jMaskGlobals.dataMaskAttr).each(HTMLAttributes);
    };

    var globals = {
        maskElements: 'input,td,span,div',
        dataMaskAttr: '*[data-mask]',
        dataMask: true,
        watchInterval: 300,
        watchInputs: true,
        watchDataMask: false,
        byPassKeys: [9, 16, 17, 18, 36, 37, 38, 39, 40, 91],
        translation: {
            '0': {pattern: /\d/},
            '9': {pattern: /\d/, optional: true},
            '#': {pattern: /\d/, recursive: true},
            'A': {pattern: /[a-zA-Z0-9]/},
            'S': {pattern: /[a-zA-Z]/}
        }
    };

    $.jMaskGlobals = $.jMaskGlobals || {};
    globals = $.jMaskGlobals = $.extend(true, {}, globals, $.jMaskGlobals);

    // looking for inputs with data-mask attribute
    if (globals.dataMask) { $.applyDataMask(); }

    setInterval(function(){
        if ($.jMaskGlobals.watchDataMask) { $.applyDataMask(); }
    }, globals.watchInterval);
}));

// End Jquery Mask Plugin

// Start Destek Form Generator

(function($) {

    $.fn.destek = function() {
        var self = this;
        window.destekElement = self;

        function _generateFields(type, fields) {
            var names = {
                "name": "nome",
                "code": "cpf",
                "email": "email",
                "phone": "telefone",
                "company": "empresa",
                "job": "funcao",
                "schooling": "escolaridade",
                "course": "curso",
                "zip": "cep",
                "street": "rua",
                "number": "numero",
                "complement": "complemento",
                "neighborhood": "bairro",
                "city": "cidade",
                "state": "estado"
            };

            var labels = {
                "name": "Nome",
                "code": "CPF",
                "email": "Email",
                "phone": "Telefone",
                "company": "Empresa",
                "job": "Cargo",
                "schooling": "Escolaridade",
                "course": "curso",
                "zip": "CEP",
                "street": "Rua",
                "number": "Número",
                "complement": "Complemento",
                "neighborhood": "Bairro",
                "city": "Cidade",
                "state": "Estado"
            };

            var innerDiv = document.createElement("div");
            for (var n in fields) {
                var field = fields[n];
                if (field == "name" || field == "code" || field == "email" || field == "phone") {
                    if (type == "personal") {
                        var grid = document.createElement("div");

                        grid.className = "destek-grid";

                        var input = document.createElement("input");
                        var label = document.createElement("label");
                        var text = document.createElement("span");

                        text.className = "destek-field-label";
                        text.innerHTML = labels[field];


                        input.name = names[field];
                        input.type = "text";
                        input.className = "destek-field";
                        input.id = names[field];
                        label.appendChild(text);
                        label.appendChild(input);
                        grid.appendChild(label);

                        innerDiv.appendChild(grid);

                    }
                } else if (field == "company" || field == "job" || field == "schooling" || field == "course") {
                    if (type == "profissional") {
                        var grid = document.createElement("div");

                        grid.className = "destek-grid";

                        var input = document.createElement("input");
                        var label = document.createElement("label");
                        var text = document.createElement("span");

                        text.className = "destek-field-label";
                        text.innerHTML = labels[field];


                        input.name = names[field];
                        input.type = "text";
                        input.className = "destek-field";
                        input.id = names[field];
                        label.appendChild(text);
                        label.appendChild(input);
                        grid.appendChild(label);

                        innerDiv.appendChild(grid);

                    }
                } else if (field == "zip" || field == "street" || field == "number" || field == "complement" || field == "neighborhood" || field == "city" || field == "state") {
                    if (type == "address") {
                        var grid = document.createElement("div");

                        grid.className = "destek-grid";

                        var input = document.createElement("input");
                        var label = document.createElement("label");
                        var text = document.createElement("span");

                        text.className = "destek-field-label";
                        text.innerHTML = labels[field];


                        input.name = names[field];
                        input.type = "text";
                        input.className = "destek-field";
                        input.id = names[field];
                        label.appendChild(text);
                        label.appendChild(input);
                        grid.appendChild(label);

                        innerDiv.appendChild(grid);
                    }
                }
            }
            return innerDiv;
        }

        function init(options) {
            if (options === undefined) {
                options = {};
            }

            if (options.fields === undefined) {
                options.fields = [];
            }

            var destekMainDiv = document.createElement("div");
            var destekStepsDiv = document.createElement("div");
            var destekContentDiv = document.createElement("div");


            destekMainDiv.className = "destek-default";
            destekStepsDiv.className = "destek-steps";
            destekContentDiv.className = "destek-content";

            var labelsText = ["Dados Pessoais", "Dados Profissionais", "Dados de Endereço"];

            for (var i = 0; i < 3; i++) {
                var stepLabel = document.createElement("div");
                var stepContent = document.createElement("div");
                stepContent.id = "destek-step-" + (i + 1);

                if (i === 0) {
                    stepLabel.className = "destek-step-label destek-step-active";
                    stepContent.className = "destek-step-content destek-step-active";

                } else {
                    stepLabel.className = "destek-step-label";
                    stepContent.className = "destek-step-content";

                }

                if (i === 0) {
                    stepContent.appendChild(_generateFields("personal", options.fields));

                    var grid = document.createElement("div");
                    grid.className = "destek-grid destek-footer destek-previous";

                    stepContent.appendChild(grid);

                    var buttonNext = document.createElement("button");
                    buttonNext.className = "destek-button destek-next";
                    buttonNext.innerHTML = "Próximo";

                    buttonNext.addEventListener("click", destekData.step.next);

                    var grid = document.createElement("div");
                    grid.className = "destek-grid destek-footer destek-next";

                    grid.appendChild(buttonNext);
                    stepContent.appendChild(grid);


                } else if (i == 1) {
                    stepContent.appendChild(_generateFields("profissional", options.fields));

                    var buttonPrevious = document.createElement("button");
                    buttonPrevious.className = "destek-button destek-previous";
                    buttonPrevious.innerHTML = "Anterior";
                    buttonPrevious.addEventListener("click", destekData.step.previous);


                    var grid = document.createElement("div");
                    grid.className = "destek-grid destek-footer destek-previous";

                    grid.appendChild(buttonPrevious);
                    stepContent.appendChild(grid);

                    var buttonNext = document.createElement("button");
                    buttonNext.className = "destek-button destek-next";
                    buttonNext.innerHTML = "Próximo";
                    buttonNext.addEventListener("click", destekData.step.next);



                    var grid = document.createElement("div");
                    grid.className = "destek-grid destek-footer destek-next";

                    grid.appendChild(buttonNext);
                    stepContent.appendChild(grid);


                } else if (i == 2) {
                    stepContent.appendChild(_generateFields("address", options.fields));


                    var buttonPrevious = document.createElement("button");
                    buttonPrevious.className = "destek-button destek-previous";
                    buttonPrevious.innerHTML = "Anterior";
                    buttonPrevious.addEventListener("click", destekData.step.previous);


                    var grid = document.createElement("div");
                    grid.className = "destek-grid destek-footer destek-previous";

                    grid.appendChild(buttonPrevious);
                    stepContent.appendChild(grid);

                    var buttonSuccess = document.createElement("button");
                    buttonSuccess.className = "destek-button destek-success";
                    buttonSuccess.innerHTML = "Finalizar";
                    buttonSuccess.addEventListener("click", destekData.events.submit);



                    var grid = document.createElement("div");
                    grid.className = "destek-grid destek-footer destek-next";

                    grid.appendChild(buttonSuccess);
                    stepContent.appendChild(grid);
                }

                stepLabel.innerHTML = "<a class=\"destek-step-link\" data-target=\"destek-step-" + (i + 1) + "\" href=\"#\">" + labelsText[i] + "</a>";

                destekStepsDiv.appendChild(stepLabel);
                destekContentDiv.appendChild(stepContent);

            }

            var goodByeDiv = document.createElement("div");

            goodByeDiv.id = "destek-goodbye";
            goodByeDiv.className = "destek-step-content";
            goodByeDiv.innerHTML = "<h3 id=\"destek-goodbye-text\">TEXTO</h3>";

            var buttonSuccess = document.createElement("button");
            buttonSuccess.id = "destek-close-form";
            buttonSuccess.className = "destek-button destek-success";
            buttonSuccess.innerHTML = "Fechar";
            buttonSuccess.addEventListener("click", destekData.events.dispatch);

            goodByeDiv.appendChild(buttonSuccess);

            var buttonError = document.createElement("button");
            buttonError.id = "destek-back-form";
            buttonError.className = "destek-button destek-error";
            buttonError.innerHTML = "Voltar";

            buttonError.addEventListener("click", function() {
                destekData.step.set("destek-step-3");
            });

            goodByeDiv.appendChild(buttonError);

            destekContentDiv.appendChild(goodByeDiv);

            destekMainDiv.appendChild(destekStepsDiv);
            destekMainDiv.appendChild(destekContentDiv);


            self[0].appendChild(destekMainDiv);

            destekData.mask();

            $(".destek-step-link").click(function() {
                var target = $(this).data("target");
                destekData.step.set(target);
            });

            $(".destek-field").blur(function() {
                destekData.events.validate(this.id);
            });

        }


        return {
            init: init,
        }
    };


})(jQuery);



function DestekValidator() {

    this.cpf = function(value) {
        var codeString = value.replace("-", "").replace(".", "").replace(".", "");

        for (var i = 0; i < 10; i++) {
            var string = i + "" + i + "" + i + "" + i + "" + i + "" + i + "" + i + "" + i + "" + i + "" + i + "" + i + "";
            if (codeString == string) {
                return false;
            }
        }

        var addition = 0;
        for (var i = 0; i < 9; i++) {
            var multiply = 10 - i;
            var digit = parseInt(codeString[i]);
            addition += digit * multiply;
        }
        var rest = (addition * 10) % 11;

        if (rest == 10 || rest == 11) {
            rest = 0;
        }

        if (codeString[9] == rest) {
            var addition = 0;
            for (var i = 0; i < 10; i++) {
                var multiply = 11 - i;
                var digit = parseInt(codeString[i]);
                addition += digit * multiply;
            }
            rest = (addition * 10) % 11;

            if (codeString[10] == rest) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };


    this.email = function(value) {
        var filter = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return filter.test(value);
    };

    this.phone = function(value) {
        value = value.replace(" ", "");
        value = value.replace("-", "");
        value = value.replace(")", "");
        value = value.replace("(", "");

        var reg = /^\d+$/;

        return reg.test(value);
    };

    this.zip = function(value) {
        var returnValue = false;
        $.ajax({
            url: "http://apps.widenet.com.br/busca-cep/api/cep/" + value + ".json",
            context: document.body
        }).done(function(data) {
            if (data.message === undefined) {
                if ($("#rua").length > 0) {
                    $("#rua").val(data.address);
                    self.ui("rua", true);
                }
                if ($("#numero").length > 0) {
                    $("#numero").val("");
                }
                if ($("#complemento").length > 0) {
                    $("#complemento").val("");
                }
                if ($("#bairro").length > 0) {
                    $("#bairro").val(data.district);
                    self.ui("bairro", true);

                }
                if ($("#cidade").length > 0) {
                    $("#cidade").val(data.city);
                    self.ui("cidade", true);

                }
                if ($("#estado").length > 0) {
                    $("#estado").val(data.state);
                    self.ui("estado", true);
                }
                self.ui("cep", true);
                returnValue = true;
            } else {
                returnValue = false;
            }
        });
        return returnValue;
    };

    this.ui = function(element, result, reset) {
        var errors = {
            "nome": "O campo não pode estar vazio",
            "cpf": "Digite um CPF válido",
            "email": "O campo deve conter um '@'",
            "telefone": "Digite um telefone válido",
            "empresa": "Digite aqui o nome da empresa",
            "funcao": "Digite aqui seu cargo na empresa",
            "escolaridade": "Qual a sua Instituíção de ensino ?",
            "curso": "Qual o seu curso?",
            "rua": "O campo não pode estar vazio",
            "numero": "O campo não pode estar vazio",
            "complemento": "O campo não pode estar vazio",
            "bairro": "O campo não pode estar vazio",
            "cidade": "O campo não pode estar vazio",
            "estado": "O campo não pode estar vazio",
            "cep": "Digite um CEP válido",
        };

        var labels = {
            "nome": "Nome",
            "cpf": "CPF",
            "email": "Email",
            "telefone": "Telefone",
            "empresa": "Empresa",
            "funcao": "Cargo",
            "escolaridade": "Escolaridade",
            "curso": "curso",
            "rua": "Rua",
            "numero": "Número",
            "complemento": "Complemento",
            "bairro": "Bairro",
            "cidade": "Cidade",
            "estado": "Estado",
            "cep": "CEP",
        };

        var label = $("#" + element).parent().children("span");

        if (result === true) {
            if ($("#" + element).attr("class").indexOf("invalid") > -1) {
                $("#" + element).removeClass("invalid");
                label.removeClass("invalid");
                label.html(labels[element]);

            }
            $("#" + element).addClass("valid");
            label.addClass("valid");
        } else {
            if ($("#" + element).attr("class").indexOf("valid") > -1) {
                $("#" + element).removeClass("valid");
                label.removeClass("valid");
            }
            $("#" + element).addClass("invalid");
            label.addClass("invalid");
            label.html(errors[element]);
        }
    };
    var self = this;
}

var validator = new DestekValidator();

var destekData = {
    step: {
        current: 0,
        set: function(target) {
            $(".destek-step-content").each(function() {
                var selectedClass = $(this).attr("class");
                if (selectedClass.indexOf("destek-step-active") != -1) {
                    $(this).removeClass("destek-step-active");
                }
            });
            $(".destek-step-label").each(function() {
                var selectedClass = $(this).attr("class");
                if (selectedClass.indexOf("destek-step-active") != -1) {
                    $(this).removeClass("destek-step-active");
                }
                if ($(this).children("a").data("target") == target) {
                    destekData.step.current = parseInt(target.replace("destek-step-", "")) - 1;
                    $(this).addClass("destek-step-active");
                    $("#" + target).addClass("destek-step-active");
                }
            });
        },
        next: function() {
            var realStep = destekData.step.current + 1;
            destekData.step.set("destek-step-" + (realStep + 1));
        },
        previous: function() {
            var realStep = destekData.step.current + 1;
            destekData.step.set("destek-step-" + (realStep - 1));
        }
    },
    mask: function() {
        if ($("#cpf").length > 0) {
            $("#cpf").mask("000.000.000-00");
        }

        if ($("#telefone").length > 0) {
            $("#telefone").mask("(00) 0000-0000");
        }

        if ($("#cep").length > 0) {
            $("#cep").mask("00000-000");
        }

    },
    variables: {
        dispatch: {
            message: null,
        }
    },
    events: {
        validate: function(element) {
            var value = $("#" + element).val();
            if (value !== "") {

                if (element == "cpf") {
                    validator.ui(element, validator.cpf(value));
                } else if (element == "email") {
                    validator.ui(element, validator.email(value));
                } else if (element == "telefone") {
                    validator.ui(element, validator.phone(value));
                } else if (element == "cep") {
                    validator.zip(value);
                    validator.ui(element, validator.zip(value));
                } else {
                    validator.ui(element, true);
                }


            } else {
                validator.ui(element, false);
            }
        },
        dispatch: function() {

            var event = new Event('destek-close-form');

            document.dispatchEvent(event);

        },
        submit: function() {


            var postData = {};

            $(".destek-field").each(function() {
                postData[this.id] = this.value;
            });



            $.ajax({
                method: "POST",
                url: "destek.php",
                data: postData
            }).done(function() {
                destekData.step.set(3);
                $("#destek-goodbye").addClass("destek-step-active");
                $("#destek-goodbye-text").addClass("valid").html("Inscrito com sucesso");
                $("#destek-close-form").css("display", "inline");
                $("#destek-back-form").css("display", "none");

            }).error(function() {
                destekData.step.set(3);
                $("#destek-goodbye").addClass("destek-step-active");
                $("#destek-goodbye-text").addClass("invalid").html("Erro ao inscrever");
                $("#destek-back-form").css("display", "inline");
                $("#destek-close-form").css("display", "none");
            });
        }
    }
}