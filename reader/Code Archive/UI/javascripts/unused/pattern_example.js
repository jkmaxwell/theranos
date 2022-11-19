// Interfaces.

var Composite = new Interface('Composite', ['add', 'remove', 'getChild', 'getAllLeaves']);
var GalleryItem = new Interface('GalleryItem', ['hide', 'show', 'addTag', 'getPhotosWithTag']);


// DynamicGallery class.

var DynamicGallery = function(id) { // implements Composite, GalleryItem
  this.children = [];
  this.tags = [];
  this.element = document.createElement('div');
  this.element.id = id;
  this.element.className = 'dynamic-gallery';
}

DynamicGallery.prototype = {

  // Implement the Composite interface.

  add: function(child) {
    Interface.ensureImplements(child, Composite, GalleryItem);
    this.children.push(child);
    this.element.appendChild(child.getElement());
  },
  remove: function(child) {
    for(var node, i = 0; node = this.getChild(i); i++) {
      if(node == child) {
        this.formComponents[i].splice(i, 1);
        break;
      }
    }
    this.element.removeChild(child.getElement());
  },
  getChild: function(i) {
    return this.children[i];
  },
  getAllLeaves: function() {
    var leaves = [];
    for(var node, i = 0; node = this.getChild(i); i++) {
      leaves.concat(node.getAllLeaves());
    }
    return leaves;
  },

  // Implement the GalleryItem interface.
  
  hide: function() {
    this.element.style.display = 'none';
  },
  show: function() {
    this.element.style.display = 'block';
    for(var node, i = 0; node = this.getChild(i); i++) {
      node.show();
    }    
  },
  addTag: function(tag) {
    this.tags.push(tag);
    for(var node, i = 0; node = this.getChild(i); i++) {
      node.addTag(tag);
    }
  },
  getPhotosWithTag: function(tag) {
    // First search in this object's tags; if the tag is found here, we can stop
    // the search and just return all the leaf nodes.
    for(var i = 0, len = this.tags.length; i < len; i++) {
      if(this.tags[i] === tag) {
        return this.getAllLeaves();
      }
    }

    // If the tag isn't found in this object's tags, pass the request down
    // the hierarchy.
    for(var results = [], node, i = 0; node = this.getChild(i); i++) {
      results.concat(node.getPhotosWithTag(tag));
    }
    return results;
  },
 
  // Helper methods.
  
  getElement: function() {
    return this.element;
  }
};

// GalleryImage class.

var GalleryImage = function(src) { // implements Composite, GalleryItem
  this.element = document.createElement('img');
  this.element.className = 'gallery-image';
  this.element.src = src;
  this.tags = [];
}

GalleryImage.prototype = {

  // Implement the Composite interface.

  add: function() {},       // This is a leaf node, so we don't
  remove: function() {},    // implement these methods, we just
  getChild: function() {},  // define them.
  getAllLeaves: function() { // Just return this.
    return [this];
  },

  // Implement the GalleryItem interface.
  
  hide: function() {
    this.element.style.display = 'none';
  },
  show: function() {
    this.element.style.display = ''; // Restore the display attribute to its 
                                     // previous setting.
  },
  addTag: function(tag) {
    this.tags.push(tag);
  },
  getPhotosWithTag: function(tag) {
    for(var i = 0, len = this.tags.length; i < len; i++) {
      if(this.tags[i] === tag) {
        return [this];
      }
    }
    return []; // Return an empty array if no matches were found.
  },
 
  // Helper methods.
  
  getElement: function() {
    return this.element;
  }
};

// Usage.

var topGallery = new DynamicGallery('top-gallery');

topGallery.add(new GalleryImage('/img/image-1.jpg'));
topGallery.add(new GalleryImage('/img/image-2.jpg'));
topGallery.add(new GalleryImage('/img/image-3.jpg'));

var vacationPhotos = new DynamicGallery('vacation-photos');

for(var i = 0; i < 30; i++) {
  vacationPhotos.add(new GalleryImage('/img/vac/image-' + i + '.jpg'));
}

topGallery.add(vacationPhotos);
topGallery.show();      // Show the main gallery,
vacationPhotos.hide();  // but hide the vacation gallery.
