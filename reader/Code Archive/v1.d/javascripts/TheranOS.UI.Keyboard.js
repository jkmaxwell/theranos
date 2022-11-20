/*
	- Change "delete" to something else
*/

TheranOS.UI.Keyboard = function(targetInput) {
	$.log('TheranOS.UI.Keyboard.('+targetInput+')');
	var that = this;												// Our friend the great scope fixer
	
	this.keys = {
		rowOne: ['1','2','3','4','5','6','7','8','9','0','Delete'],
		rowTwo: ['q','w','e','r','t','y','u','i','o','p'],
		rowThree: ['a','s','d','f','g','h','j','k','l'],
		rowFour: ['z','x','c','v','b','n','m'],
		rowFive: ['Space']
	};

	this.keys.rowOne.div = ".tui-row-1";
	this.keys.rowTwo.div = ".tui-row-2";
	this.keys.rowThree.div = ".tui-row-3";
	this.keys.rowFour.div = ".tui-row-4";
	this.keys.rowFive.div = ".tui-row-5";

	this.selectedInput = targetInput;
	this.selectedInputName = $(targetInput).attr('name');
	$.log('the name of this is...'+$(targetInput).attr('name'))
	$.log('about to suck') // something is going on where it doesn't see the new field
	this.currentValue = TheranOS.Data.User.read(this.selectedInputName) || "";
	$.log('should have just sucked')
	
	this.element = $("<div class='tui-container'>")
		.append("<div class='tui-row tui-row-1'>")
		.append("<div class='tui-row tui-row-2'>")
		.append("<div class='tui-row tui-row-3'>")
		.append("<div class='tui-row tui-row-4'>")
		.append("<div class='tui-row tui-row-5'>");
	
	$([this.keys.rowOne, this.keys.rowTwo, this.keys.rowThree, this.keys.rowFour, this.keys.rowFive ]).each(function() {
		var d = this.div;
		$(this).each(function() {
			var kv = this + "";
			var classNames = "tui-key";
			if (kv.length > 1) classNames += " tui-special-key";
			if (kv.toLowerCase() == "space") classNames += " tui-spacebar-key";
			$(d,that.element).append( $("<div class='" + classNames + "'>")
				.append($('<span>').append(kv)) 
				.bind('mousedown', function(e) {
					//e.stopPropagation();
					e.preventDefault();
					var i = 0;
					var key = this;
					// parse for key, branch for special keys
					var k = $(key).text();
					if (k.toLowerCase() == "space") { that.input(" "); }
					else if (k.toLowerCase() == "delete") { that.backspace(); }
					else { that.input($(key).text()); }			
			}));
		});
	});
	$(this.element)
		.append(
			$("<div class='close'>")
				.append("<span>Enter</span>")
				.click(function() {
					$.log("$('.tui-entry-field').val().length = "+$('.tui-entry-field').val().length)
					if ($('.tui-entry-field').val().length > 0) {
						// Write some data
						TheranOS.Data.User.clear($(targetInput).attr('name'))
						TheranOS.Data.User.write($(targetInput).attr('name'),$('.tui-entry-field').val())
						// enable next button
                    	$('.disabled').fadeTo(500, 1.0).removeClass('disabled');
					} else {
	                    $('.button.next').fadeTo(500, 0.1).addClass('disabled');
					};	
					TheranOS.UI.PageManager.removeKeyboard();
				})
		)
}

TheranOS.UI.Keyboard.prototype = {
	draw: function() {
		$.log('TheranOS.UI.Keyboard.draw()');
		return this.element;
	},
	show: function() {
		$.log('TheranOS.UI.Keyboard.show()');
		this.element.css({opacity: 0, visibility: 'visible'})
		this.element.animate({opacity: 1}, 'slow')
	},
	input: function(value) {
		$.log('TheranOS.UI.Keyboard.input('+value+')');
		this.currentValue += value;
		$.log('TheranOS.UI.Keyboard.input('+value+'): this.currentValue = '+this.currentValue);
		$(this.selectedInput).val(this.currentValue);
	},
	backspace: function() {
		$.log('TheranOS.UI.Keyboard.backspace()');
		if (this.currentValue.length > 0)
			this.currentValue = this.currentValue.substring(0, this.currentValue.length-1);
		$.log('TheranOS.UI.Keyboard.backspace(): this.currentValue = '+this.currentValue);
		$(this.selectedInput).val(this.currentValue);
	},
	getValue: function() {
		$.log('TheranOS.UI.Keyboard.getValue()');
		this.currentValue = $(this.selectedInput).val();
	}
}	