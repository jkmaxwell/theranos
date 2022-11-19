TheranOS.UI.Button = function(buttonType, buttonText, buttonDisabledStatus, buttonID, buttonDestination, buttonPageTransitionType) {
	
	var that = this;
	
	$.log('TheranOS.UI.Button('+buttonType+', '+buttonText+')');
	
	this.type = buttonType;
	this.text = buttonText || "";
	this.disabled = buttonDisabledStatus;
	this.id = buttonID;
	this.destination = buttonDestination;
	this.pageTransitionType = buttonPageTransitionType
	
	// Create the HTML.
	this.element = $("<a href='#' class='button'><span>"+this.text+"</span></a>")
		.addClass(this.type)
		.addClass(this.disabled)
		.attr({'id': this.id})
		
	// Attach events.
	this.element.click(function(e){
        if (!$(this).hasClass('disabled')) {
			switch(that.destination) {
				case "start":
					TheranOS.UI.PageManager.drawPage('screen:first', that.pageTransitionType);
					break;
				case "configuration_start":
                case "enrollment_start":
                    var answer = passwordCheck(that.destination);
                    if (answer) {
						TheranOS.UI.PageManager.drawPage('screen[name="' + that.destination + '"]', that.pageTransitionType);
                    } else {
						TheranOS.UI.PageManager.drawPage('screen[name="start"]', that.pageTransitionType);
					}
                    break;
                default:	
					TheranOS.UI.PageManager.drawPage('screen[name="' + that.destination + '"]', that.pageTransitionType);
                    break;
			}
        }
        return false;		
	})
/*    var passwordCheck = function(passwordType) {
        var passcode = 303;
        var verified = (parseInt($('input:first').val()) == passcode) ? true: false; // !!!!!! this is what i was just doing
        return verified
        // DID USER ENTER PROPER PASSWORD?
    }
	*/
}

TheranOS.UI.Button.prototype = {
	draw: function() {
		return this.element;
	}
}