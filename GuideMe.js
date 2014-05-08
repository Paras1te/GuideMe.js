var GM = (function () {
 
    var module = {};
    
    module.getOffset = function (obj) {
        var curleft = 0,
            curtop = 0;
        if (obj.offsetParent) {
        do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
            return { left: curleft, top: curtop };
        }
    };
    
    module.Guide = function () {
        this.currentStep = -1;
        this.steps = [];
        this.currentModal = null;
    };
    
    module.Guide.prototype.end = function () {
        this.goTo(this.steps.length-1);
        this.nextStep();
    };
    
    module.Guide.prototype.start = function () {
        this.goTo(0);
    };
        
    module.Guide.prototype.addStep = function (options) {
        var step = new module.Step(this, options);
        this.steps.push(step);
    };
    
    module.Guide.prototype.clearModal = function () {
        if (this.currentModal != null) {
            this.currentModal.parentNode.removeChild(this.currentModal);
            this.currentModal = null;
        }
    };
    
    module.Guide.prototype.draw = function (index) {
        // Draw Modal
        if (this.steps[index] != null) {
            return this.currentModal = this.steps[index].drawModal();
        }  
        return null;
    };
    
    module.Guide.prototype.nextStep = function () {
        this.clearModal();

        this.currentStep++;
        if(this.currentStep > this.steps.length-1) return false;

        this.draw(this.currentStep);
    };
    
    module.Guide.prototype.goTo = function (option) {
        if (typeof option === 'number') {
            if (option > -1 && option < this.steps.length) {
                this.currentStep = option;
            } else {
                return false;
            }
        } else if (typeof option === 'string') {
            var index = this.getStepIndexByName(option);
            if (index > -1) { 
                this.currentStep = index;
            } else {
                return false;
            }   
        } else {
            return false;
        }
        
        this.clearModal();
        this.draw(this.currentStep); 
    };
    
    module.Guide.prototype.getStepIndexByName = function (name) {
        for (var i = 0; i < this.steps.length; i++) {
            if (this.steps[i].name === name) {
                return i;
            }
        }
        return -1;
    };
    
    module.Step = function (guide, options) {
        this.guide = guide;
        this.options = options || {};
        this.name = this.options.name || "";
        this.modal = this.options.modal || {};
        
        var _this = this;
        
        this.drawModal = function () {
            return new module.Modal(_this, this.modal);
        };
    };
    
    module.Modal = function (step, options) {
        this.step = step;
        this.options = options || {};
        this.name = this.options.name || "";
        this.title = this.options.title || "Step Title";
        this.content = this.options.content || "Step Content";
        this.buttons = this.options.buttons || [ { title: "Next", action: "next" } ];
        this.relativeTo = this.options.relativeTo || document.getElementsByTagName("body")[0];
        this.appendTo = this.options.appendTo || document.getElementsByTagName("body")[0];
        this.position = this.options.position || "bottom-right";
        this.width = this.options.width || "200px";
        this.marginLeft = this.options.marginLeft || 0;
        this.marginTop = this.options.marginTop || 0;
        
        var _this = this;
        
        var modal = document.createElement("div");
        modal.className = "gm--modal";
        modal.style.width = this.width;
        this.appendTo.appendChild(modal);
        var offset = module.getOffset(this.relativeTo);
        // Header
        var modalHeader = document.createElement("div");
        modalHeader.className = "gm--modal-header";
        modal.appendChild(modalHeader);        
        // Title
        var modalTitle = document.createElement("div");
        modalTitle.className = "gm--modal-title";
        modalTitle.appendChild(document.createTextNode(this.title));
        modalHeader.appendChild(modalTitle);
        // Content
        var modalContent = document.createElement("div");
        modalContent.className = "gm--modal-content";
        modal.appendChild(modalContent);
        // Text
        var modalText = document.createElement("div");
        modalText.appendChild(document.createTextNode(this.content));
        modalContent.appendChild(modalText);
        // Buttons Container
        var modalButtonsContainer = document.createElement("div");
        modalButtonsContainer.className = "gm--modal-buttons-container";
        modalContent.appendChild(modalButtonsContainer);
        // Buttons
        for (var i = 0; i < this.buttons.length; i++) {
            var modalButton = document.createElement("div");
            modalButton.className = "gm--modal-button";
            if (typeof this.buttons[i].float !== 'undefined' &&
                this.buttons[i].float == "left") {
                modalButton.style.cssFloat = "left";
            } else {
                modalButton.style.cssFloat = "right";   
            }
            modalButton.appendChild(document.createTextNode(this.buttons[i].title));
            if (typeof this.buttons[i].action === 'function') {
                modalButton.onclick = this.buttons[i].action;
            } else {
                modalButton.onclick = function () { _this.step.guide.nextStep(); };
            }
            
            modalButtonsContainer.appendChild(modalButton);
        }
        // Modal Position
        if (this.position == "bottom-right") {
            modal.style.left = offset.left +
                               this.relativeTo.clientWidth +
                               this.marginLeft + "px";
            modal.style.top = offset.top +
                              this.relativeTo.clientHeight +
                              this.marginTop + "px";
        } else if (this.position == "bottom-left") {
            modal.style.left = offset.left -
                               modal.clientWidth +
                               this.marginLeft + "px";
            modal.style.top = offset.top +
                              this.relativeTo.clientHeight +
                              this.marginTop + "px";
        } else if (this.position == "top-left") {
            $("console").text(modal.clientHeight);
            modal.style.left = offset.left -
                               modal.clientWidth +
                               this.marginLeft + "px";
            modal.style.top = offset.top -
                              modal.clientHeight +
                              this.marginTop + "px";
        } else if (this.position == "top-right") {
            $("console").text(modal.clientHeight);
            modal.style.left = offset.left +
                               this.relativeTo.clientWidth +
                               this.marginLeft + "px";
            modal.style.top = offset.top -
                              modal.clientHeight +
                              this.marginTop + "px";
        }
        return modal;
    };

  return module;
 
})();