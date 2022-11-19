TheranOS.UI.Survey.Smiley = function() {
	
	var that = this;
	
	this.selectedSmiley = null;
	this.count = 10;
	
	// Create the HTML.
	this.element = $('<div class="smileys">');
	
    for (i = this.count; i > 0; i--) {
        var elem = $('<a class="smiley" name="survey.feelingtoday.answer.'+i+'"><span>&nbsp;</span></a>');
        elem.click(function() {
			TheranOS.Data.User.clear("survey1")
			TheranOS.Data.User.write("survey1",this.name);
            $('.smiley').removeClass('selected');
            $(this).addClass('selected');
            that.selectedSmiley = $(this);
            $('.disabled').fadeTo(500, 1.0).removeClass('disabled');
        });	
        elem.find('span').css('backgroundPosition', "-" + (i - 1) * 54 + "px 0px");
        elem.css('left', 16 + (i - 1) * 54 + "px")

        $(that.element).append(elem);

		if(TheranOS.Data.User.read('survey1')) {
			$.log('Found some data in them hills')
			$.log('Current optionName = '+i+' and saved value = '+TheranOS.Data.User.read('survey1').split('.')[3])
			if (i == TheranOS.Data.User.read('survey1').split('.')[3]) {
				$.log('Clicked')
				$('a.smiley:last',that.element).trigger('click')
			}
		}
    }

    // set up labels
    var labels = new Array();
    labels["very bad"] = "rgb(114,121,197)";
    labels["average"] = "rgb(128,128,128)";
    labels["very good"] = "rgb(162,157,40)";
    for (var label in labels) {
        this.element.append($('<label>').text(label).css('color', labels[label]));
    }
    $(this.element).find('label:eq(1)').css({
        'text-align': 'center',
        'width': '200px',
        'left': '190px'
    })
    $(this.element).find('label:eq(2)').css('right', 0);
}

TheranOS.UI.Survey.Smiley.prototype = {
	draw: function() {
		$.log('TheranOS.UI.Survey.Smiley.draw()');
		return this.element;
	}
}

TheranOS.UI.Survey.SmileyElement = function(smileyName) {
	this.name = smileyName;
	
	// Create the HTML
}

TheranOS.UI.Survey.SmileyElement.prototype = {
	draw: function() {
		return this.element;
	},
	select: function() {
		
	},
	deselect: function() {
		
	}
}