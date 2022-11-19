jQuery(document).ready(function() {
	
	var keys = {
		rowOne: ['1','2','3','4','5','6','7','8','9','0','-','=','DELETE'],
		rowTwo: ['q','w','e','r','t','y','u','i','o','p','[',']','\\'],
		rowThree: ['a','s','d','f','g','h','j','k','l',';','\'','ENTER'],
		rowFour: ['SHIFT','z','x','c','v','b','n','m',',','.','/','?'],
		rowFive: ['SPACE']
	};
	
	keys.rowOne.div = ".tui-row-1";
	keys.rowTwo.div = ".tui-row-2";
	keys.rowThree.div = ".tui-row-3";
	keys.rowFour.div = ".tui-row-4";
	keys.rowFive.div = ".tui-row-5";
	
	jQuery('.tui-entry-field') // auto bind to all tui-entry-fields on the page
		.bind('focus', function(e) {
			
			// hide any visible keyboards:
			jQuery('.tui-container').animate({opacity: 0}, 'slow', 'easeout', function() {
				jQuery(this).remove();
			})
		
			var currentValue = this.value;
			var selectedInput = this;
			
			jQuery("body").append(
				jQuery("<div class='tui-container'>")
					.append("<div class='tui-row tui-row-1'>")
					.append("<div class='tui-row tui-row-2'>")
					.append("<div class='tui-row tui-row-3'>")
					.append("<div class='tui-row tui-row-4'>")
					.append("<div class='tui-row tui-row-5'>")
			
			);
			
			jQuery([keys.rowOne, keys.rowTwo, keys.rowThree, keys.rowFour, keys.rowFive ]).each(function() {
				
				var d = this.div;
				
				jQuery(this).each(function() {
				var kv = this + "";
				
				var classNames = "tui-key";
				if (kv.length > 1) classNames += " tui-special-key";
				if (kv == "SPACE") classNames += " tui-spacebar-key";
				
				jQuery(d).append( jQuery("<div class='" + classNames + "'>")
					.append(kv) 
					.bind('mousedown', function(e) {
						e.stopPropagation();
						e.preventDefault();
						var i = 0;
						var key = this;
						jQuery(key).removeClass('a-state-10');
						
						// parse for key, branch for special keys
						
						var k = jQuery(key).text();
						
						if (k == "ENTER") { // TBD: do we care about new lines?
							currentValue += "\n";
							selectedInput.value = currentValue;
						}
						else if(k == "SHIFT") { // TBD, latch a shift state
						}
						else if(k == "SPACE") {
							currentValue += " ";
							selectedInput.value = currentValue;
						}
						else if(k == "DELETE") {
							if (currentValue.length > 0)
								currentValue = currentValue.substring(0, currentValue.length-1);
							selectedInput.value = currentValue;
						}
						else {
							currentValue += jQuery(key).text();
							selectedInput.value = currentValue;
						}
						
						// kick off animation through the 10 CSS states
						var t = setInterval(function() {
							if (i == 10) clearTimeout(t);
							else {
							
								i++;
								jQuery(key).addClass('a-state-'+i);
								jQuery(key).removeClass('a-state-'+(i-1));
							
							}
						}, 15);					
					}));
				});
			});
				
			jQuery(".tui-container")
				.append(
					jQuery("<div class='close'>")
						.append("DONE")
						.click(function() {
							var i = 0;
							var key = this;
							var t = setInterval(function() {
							if (i == 10) {
								clearTimeout(t);
								jQuery(".tui-container").fadeOut('fast', function() {
									jQuery(".tui-container").remove();
								});
							}
							else {
							
								i++;
								jQuery(key).addClass('a-state-'+i);
								jQuery(key).removeClass('a-state-'+(i-1));
							
							}
						}, 15);	
						})
				)
				.css({opacity: 0, visibility: 'visible'})
				.animate({opacity: 1}, 'slow', 'easeout')

		});		
});