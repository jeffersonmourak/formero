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
                "street": "rua",
                "number": "numero",
                "complement": "complemento",
                "neighborhood": "bairro",
                "city": "cidade",
                "state": "estado"
            };
            var innerDiv = document.createElement("div");
            for (n in fields) {
                var field = fields[n];
                if (field == "name" || field == "code" || field == "email" || field == "phone") {
                    if (type == "personal") {
                        var input = document.createElement("input");
                        input.name = names[field];
                        input.type = "text";
                        input.className = "destek-field";
                        input.id = names[field];
                        input.placeholder = names[field];
                        innerDiv.appendChild(input);
                    }
                } else if (field == "company" || field == "job" || field == "schooling" || field == "course") {
                    if (type == "profissional") {
                        var input = document.createElement("input");
                        input.name = names[field];
                        input.type = "text";
                        input.className = "destek-field";
                        input.id = names[field];
                        input.placeholder = names[field];
                        innerDiv.appendChild(input);
                    }
                } else if (field == "street" || field == "number" || field == "complement" || field == "neighborhood" || field == "city" || field == "state") {
                    if (type == "address") {
                        var input = document.createElement("input");
                        input.name = names[field];
                        input.type = "text";
                        input.className = "destek-field";
                        input.id = names[field];
                        input.placeholder = names[field];
                        innerDiv.appendChild(input);
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

            var labelsText = ["Dados Pessoais", "Dados Profissionais", "Dados de Endereço"]

            for (var i = 0; i < 3; i++) {
                var stepLabel = document.createElement("div");
                var stepContent = document.createElement("div");
                stepContent.id = "destek-step-" + (i+1);

                if (i == 0) {
                    stepLabel.className = "destek-step-label destek-step-active";
                    stepContent.className = "destek-step-content destek-step-active";

                } else {
                    stepLabel.className = "destek-step-label";
                    stepContent.className = "destek-step-content";

                }

                if (i == 0) {
                    stepContent.appendChild(_generateFields("personal", options.fields));
                } else if (i == 1) {
                    stepContent.appendChild(_generateFields("profissional", options.fields));
                } else if (i == 2) {
                    stepContent.appendChild(_generateFields("address", options.fields));
                }

                stepLabel.innerHTML = "<a class=\"destek-step-link\" data-target=\"destek-step-" + (i+1) +"\" href=\"#\">" + labelsText[i] + "</a>";

                destekStepsDiv.appendChild(stepLabel);
                destekContentDiv.appendChild(stepContent);

            }

            destekMainDiv.appendChild(destekStepsDiv);
            destekMainDiv.appendChild(destekContentDiv);

            self[0].appendChild(destekMainDiv);
        }


        return {
            init: init,
        }
    };

})(jQuery);

var destekData = {
    changeStep: function(target) {
        $(".destek-step-content").each(function(){
        	var selectedClass = $(this).attr("class");
        	if(selectedClass.indexOf("destek-step-active") != -1){
        		$(this).removeClass("destek-step-active");
        	}
        });
        $(".destek-step-label").each(function(){
        	var selectedClass = $(this).attr("class");
        	if(selectedClass.indexOf("destek-step-active") != -1){
        		$(this).removeClass("destek-step-active");
        	}
        	if($(this).children("a").data("target") == target){
        		$(this).addClass("destek-step-active");
        		$("#"+target).addClass("destek-step-active");
        	}
        });
    }
}

$(function() {
    $(document).ready(function() {
        $(".form").destek().init({
            fields: ["name", "code", "email", "phone", "company", "job", "schooling", "course", "street", "number", "complement", "neighborhood", "city", "state"],
        });

        $(".destek-step-link").click(function() {
        	var target = $(this).data("target");
            destekData.changeStep(target);
        });

    });
});
