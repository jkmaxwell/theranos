/*
* send ken data dump
* break it up into smaller objects (survey, config, etc.)
* make error screen and error handling
*/

TheranOS.Data = function() { // Set up Data class
	this.data = {
		survey: {}
	}; 
}
TheranOS.Data.prototype = {
	write: function(key,value,multiple) {
		if(key.indexOf('survey') > -1) {
			// If the data is empty, initialize it.
			if (this.data["survey"][key] == null) { 
				this.data["survey"][key] = [];
				$.log('TheranOS.Data.write: Creating data["survey"]["'+key+'"]');
			}
			$.log('TheranOS.Data.write: Trying to write '+value+' to data["survey"]['+key+']')
			// If the key is already there, don't write it.
			if ((this.read(key)+"").indexOf(value+"") > -1) {
				$.log('TheranOS.Data.write: Value is already stored in key.  Ignoring.');
			} else {
				this.data["survey"][key].push(value); // push the value to the end
				$.log('TheranOS.Data.write: data["survey"]['+key+'] = '+this.read(key));
			};			
		} else {
			// If the data is empty, initialize it.
			if (this.data[key] == null) { 
				this.data[key] = [];
				$.log('TheranOS.Data.write: Creating data['+key+']');
			}
			$.log('TheranOS.Data.write: Trying to write '+value+' to data['+key+']')
			// If the key is already there, don't write it.
			if ((this.read(key)+"").indexOf(value+"") > -1) {
				$.log('TheranOS.Data.write: Value is already stored in key.  Ignoring.');
			} else {
				this.data[key].push(value); // push the value to the end
				$.log('TheranOS.Data.write: data['+key+'] = '+this.read(key));
			};
		}
		$.log('TheranOS.Data.write: at this point our data is: '+this.serialize())
	},
	read: function(key) {
		if (key) {
			if (key.indexOf('survey') > -1) {	
				var _data = (this.data["survey"][key]) ? this.data["survey"][key].toString() : "";
				var _returnedData = (_data.length > 0) ? _data : false;
				$.log('read: data["survey"]['+key+'] = '+_returnedData);
				return _returnedData;			
			} else {
				var _data = (this.data[key]) ? this.data[key].toString() : "";
				var _returnedData = (_data.length > 0) ? _data : false;
				$.log('read: data['+key+'] = '+_returnedData);
				return _returnedData;		
			}
		}				
	},
	clear: function(key,value) {
		if (key.indexOf('survey') > -1) {
			if (this.data["survey"][key]) {
				if (value) {
					$.log('clear: Trying to clear '+value+' from data["survey"]['+key+']')
					for (var i=0; i<this.data["survey"][key].length; i++) {
						$.log('clear: Testing if TheranOS.Data.User["survey"]['+key+']['+i+'] = '+this.data["survey"][key][i]+' = '+value);
						if (this.data["survey"][key][i] == value) {
							$.log('clear: Found it.  Attempting to splice item #'+i+' from array. Current length is '+this.data["survey"][key].length+' items.');
							this.data["survey"][key].splice(i,1)
							$.log('clear: Hopefully we got rid of it. New length is '+this.data["survey"][key].length+' items.');
						}
					}
					$.log('clear: data["survey"]['+key+'] = '+this.read(key));
				} else {
					$.log('clear: Trying to clear data["survey"]['+key+'], which is currently: '+this.read(key))
					this.data["survey"][key].length = 0;
					$.log('clear: data["survey"]['+key+'] = '+this.read(key));
				}
			}
		} else {
			if (this.data[key]) {
				if (value) {
					$.log('clear: Trying to clear '+value+' from data['+key+']')
					for (var i=0; i<this.data[key].length; i++) {
						$.log('clear: Testing if TheranOS.Data.User['+key+']['+i+'] = '+this.data[key][i]+' = '+value);
						if (this.data[key][i] == value) {
							$.log('clear: Found it.  Attempting to splice item #'+i+' from array. Current length is '+this.data[key].length+' items.');
							this.data[key].splice(i,1)
							$.log('clear: Hopefully we got rid of it. New length is '+this.data[key].length+' items.');
						}
					}
					$.log('clear: data['+key+'] = '+this.read(key));
				} else {
					$.log('clear: Trying to clear data['+key+'], which is currently: '+this.read(key))
					this.data[key].length = 0;
					$.log('clear: data['+key+'] = '+this.read(key));
				}
			}
		}
	},
	serialize: function() {
		var _sSerializedData = JSON.stringify(this.data)
		$.log('TheranOS.Data.serialize(): '+ _sSerializedData)
		return _sSerializedData;
	},
	send: function() {
		// post to a specific url
	}
}
TheranOS.Data.User = new TheranOS.Data();		// Set up User Data
TheranOS.Data.System = new TheranOS.Data();		// Set up System Data