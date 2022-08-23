var ModelComponent = pc.createScript('modelComponent');

ModelComponent.attributes.add('loaded', { type : 'boolean', default : false });
ModelComponent.prototype.initialize = function() {
    if(this.loaded){
        setTimeout(function(self){
            self.entity.fire('Model:Loaded', true);
        }, 1000, this);

        return false;
    }

    this.materialCount  = 0;
    this.materialLoaded = 0;
    
    var assetId = this.entity.model.asset;
    
    if(!assetId){
        return false;
    }
    
    var asset   = this.app.assets.get(assetId);
    var self    = this;
    
    asset.ready(function(){
        self.entity.fire('Model:Loaded', false);
        self.checkMaterials();
    });
};

ModelComponent.prototype.checkMaterials = function() {
    var meshInstances = this.entity.model.meshInstances;
    var self  = this;
    
    this.materialCount = meshInstances.length;
    
    for(var index in meshInstances){
        var material = meshInstances[index].material;
        var asset    = this.app.assets.find(material.name);

        if(!asset){
            return false;
        }
        
        asset.ready(function(){
            self.checkTextures(material);
        });
        
        this.app.assets.load(asset);
    }
};

ModelComponent.prototype.checkTextures = function(material) {
    //check diffuse
    //check opacityMap
    //check emissiveMap
    var assetReferences = material._assetReferences;
    var loadedTextureCount = 0;
    var textureCount = 0;
    var self = this;

    for(var index in assetReferences){
        var ref = assetReferences[index];

        textureCount++;

        this.app.assets.load(ref.asset);
        ref.asset.ready(function(){ 
            loadedTextureCount++;

            if(loadedTextureCount >= textureCount){
                self.setMaterial();
            }
        });
    }

    if(textureCount === 0){
        this.setMaterial();
    }
};

ModelComponent.prototype.setMaterial = function() {
    this.materialLoaded++;
    
    if(this.materialCount == this.materialLoaded){
        this.entity.fire('Model:Loaded', true);
    }
};