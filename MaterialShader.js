var MaterialShader = pc.createScript('materialShader');

MaterialShader.attributes.add('isDebug', {
    type : 'boolean',
    default : false
});

MaterialShader.attributes.add('light', {
    type : 'boolean',
    default : true
});

MaterialShader.attributes.add('material', {
    type : 'asset',
    assetType : 'material'
});

MaterialShader.attributes.add('textures', {
    type : 'json',
    schema : [
        {
            name : 'name',
            type : 'string',
            default : 'texture_0'
        },
        {
            name : 'texture',
            type : 'asset',
            assetType : 'texture'
        }
    ],
    array : true
});

MaterialShader.attributes.add('colors', {
    type : 'json',
    schema : [
        {
            name : 'name',
            type : 'string',
            default : 'color_0'
        },
        {
            name : 'color',
            type : 'rgba'
        }
    ],
    array : true
});

MaterialShader.attributes.add('vectors', {
    type : 'json',
    schema : [
        {
            name : 'name',
            type : 'string',
            default : 'vector_0'
        },
        {
            name : 'vector',
            type : 'vec2'
        }
    ],
    array : true
});

MaterialShader.attributes.add('numbers', {
    type : 'json',
    schema : [
        {
            name : 'name',
            type : 'string',
            default : 'number_0'
        },
        {
            name : 'number',
            type : 'number',
            default : 0.0
        }
    ],
    array : true
});

MaterialShader.attributes.add('shader', {
    type : 'string',
    default : 'dmVjNCBnZXRDb2xvcih2ZWMyIFVWKXsKLy92ZWMzIHRleHR1cmUgPSB0ZXh0dXJlMkQodGV4dHVyZV8wLCBVVikucmdiOwpjb2xvci5yZ2IgPSB2ZWMzKDAuMCwgMS4wLCAwLjApOwpjb2xvci5hID0gMS4wOwoKcmV0dXJuIGNvbG9yOwp9Cgp2ZWMzIGdldFZlcnRleCh2ZWMzIGxvY2FsUG9zaXRpb24sIHZlYzMgd29ybGRQb3NpdGlvbiwgdmVjMiBVVil7CnZlcnRleC54eXogPSB2ZWMzKDAuMCwgMC4wLCAwLjApOwoKcmV0dXJuIHZlcnRleDsKfQ=='
});

MaterialShader.prototype.initialize = function() {
    this.reset();

    if(this.isDebug){
        this.addCodeEditor();
    }else{
        this.emissive = atob(this.shader);
        this.updateMaterial();
    }

    this.on('attr:textures', this.onAttributeChange, this);
    this.on('attr:colors', this.onAttributeChange, this);
    this.on('attr:vectors', this.onAttributeChange, this);
    this.on('attr:numbers', this.onAttributeChange, this);
    this.on('attr:shader', this.onAttributeChange, this);

    this.entity.on('MaterialShader:Set', this.setVariable, this);

    this.on('state', this.onStateChange, this);

    this.entity.on('Model:Loaded', this.onModelLoaded, this);
    this.app.on('MaterialShader:Reset', this.onStateChange, this);
};

MaterialShader.prototype.setVariable = function(key, value){
    for(var index in this.parameters){
        var parameter = this.parameters[index];

        this.currentMaterial.setParameter(
            parameter.name,
            parameter.resource
        );

        if(parameter.name == key){
            this.parameters[index].resource = value;
        }
    }
};

MaterialShader.prototype.onModelLoaded = function(state){
    if(state === true){
        setTimeout(function(self){
            self.onAttributeChange();
        }, 3000, this);
    }
};

MaterialShader.prototype.onStateChange = function(state){
    this.reset();
};

MaterialShader.prototype.copy = function(code){
    var text = btoa(code);

    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
};

MaterialShader.prototype.addCodeEditor = function(){
    var self = this;

    var saveButton = document.createElement('button');
        saveButton.style.position = 'fixed';
        saveButton.style.left = '10px';
        saveButton.style.top  = '340px';
        saveButton.style.width  = '100px';
        saveButton.style.height  = '40px';
        saveButton.style.background = 'rgba(0, 0, 0, 0.5)';
        saveButton.style.color = '#fff';
        saveButton.textContent = 'Copy';
        saveButton.onclick = function(){
            self.copy(self.emissiveCode.value);
        };
    
    document.body.appendChild(saveButton);

    var textarea = document.createElement('textarea');
        textarea.style.position = 'fixed';
        textarea.style.left = '10px';
        textarea.style.top  = '10px';
        textarea.style.width  = '400px';
        textarea.style.height = '300px';
        textarea.style.padding = '10px';
        textarea.style.background = 'rgba(0, 0, 0, 0.5)';
        textarea.style.outline = 'none';
        textarea.style.color = 'white';
        textarea.onkeyup = this.onShaderChange.bind(this);

    var customCSS = document.createElement('style');
        customCSS.innerText = '#application-console{max-height: 80px;}';
    document.body.appendChild(customCSS);
    
    this.emissiveCode = textarea;
    this.emissiveCode.value = atob(this.shader);
    
    this.emissive = this.emissiveCode.value;
    this.updateMaterial();
    document.body.appendChild(textarea);
    //console.error = function(text){};
};

MaterialShader.prototype.onShaderChange = function(){
    /*
    if(this.emissiveCode.value.substr(-1) != ';' || this.emissiveCode.value.substr(-1) != '\n'){
        return false;
    }
    */

    clearTimeout(this.timer);
    this.timer = setTimeout(function(self){
        self.emissive = self.emissiveCode.value;
        self.updateMaterial();
    }, 100, this);
};

MaterialShader.prototype.reset = function(){
    this.timestamp  = 0.0;
    this.parameters = [];
};

MaterialShader.prototype.line = function(string) {
    return string + '\n';
};

MaterialShader.prototype.number = function(number) {
    return parseFloat(number).toFixed(2);
};

MaterialShader.prototype.colorRGB = function(color) {
    return 'vec3(' + 
        this.number(color.data[0]) + ', ' + 
        this.number(color.data[1]) + ', ' + 
        this.number(color.data[2]) + 
    ')';
};

MaterialShader.prototype.colorRGBA = function(color) {
    return 'vec4(' + 
        this.number(color.data[0]) + ', ' + 
        this.number(color.data[1]) + ', ' + 
        this.number(color.data[2]) + ', ' +
        this.number(color.data[3]) + 
    ')';
};

MaterialShader.prototype.addParameter = function(array, type) {
    var output = '';

    for(var index in this[array]){
        var item = this[array][index];
        var resource = false;

        output+=this.line('uniform ' + type + ' ' + item.name + ';');

        if(array == 'textures'){
            resource = item.texture.resource;
        }

        if(array == 'colors'){
            resource = item.color.data;
        }

        if(array == 'vectors'){
            resource = item.vector.data;
        }

        if(array == 'numbers'){
            resource = item.number;
        }

        this.parameters.push({
            name : item.name,
            resource : resource
        });
    }

    return output;
};

MaterialShader.prototype.generateShaderOutput = function() {
    var output = '';

    output+= this.addParameter('textures', 'sampler2D');
    output+= this.addParameter('colors', 'vec4');
    output+= this.addParameter('vectors', 'vec2');
    output+= this.addParameter('numbers', 'float');
    output+= this.line('uniform float timestamp;');
    output+= this.line('uniform float alpha_ref;');

    output+= this.line('vec4 color  = vec4(0.0);');
    output+= this.line('vec3 vertex = vec3(0.0);');
    output+= this.line(this.emissive);

    
    output+= this.line('void getEmission() {');
    output+= this.line('}');

    output+= this.line('void getAlbedo() {');
    output+= this.line('}');

    output+= this.line('void getOpacity() {');
    //output+= this.line('dAlpha = color.a;');
    output+= this.line('}');

    output+= this.line('void alphaTest(float a) {');
    output+= this.line('if (a < alpha_ref) discard;');
    output+= this.line('}');
    

    return output;
};

MaterialShader.prototype.onAttributeChange = function() {
    this.reset();
    this.updateMaterial();

    //console.log('[DEBUG] Material updated!');
};

MaterialShader.prototype.generateTransformOutput = function() {
    var output = '';

    output+= this.addParameter('textures', 'sampler2D');
    output+= this.addParameter('colors', 'vec4');
    output+= this.addParameter('vectors', 'vec2');
    output+= this.addParameter('numbers', 'float');
    output+= this.line('uniform float timestamp;');

    output+= this.line('mat4 getModelMatrix() {');
    output+= this.line('return matrix_model;');
    output+= this.line('}');

    output+= this.line('vec4 color  = vec4(0.0);');
    output+= this.line('vec3 vertex = vec3(0.0);');

    output+= this.line(this.emissive);

    output+= this.line('vec4 getPosition() {');
    output+= this.line('dModelMatrix = getModelMatrix();');
    output+= this.line('vec3 localPos = vertex_position;');
    output+= this.line('vec4 posW   = dModelMatrix * vec4(localPos, 1.0);');
    output+= this.line('vec2 UV     = localPos.xy * 0.5 + vec2(0.5, 0.5);');

    output+= this.line('posW.xyz+= getVertex(localPos, posW.xyz, UV);');
    output+= this.line('dPositionW = posW.xyz;');

    output+= this.line('vec4 outputPosition = matrix_viewProjection * posW;');
    output+= this.line('return outputPosition;');

    output+= this.line('}');

    output+= this.line('vec3 getWorldPosition() {');
    output+= this.line('return dPositionW;');
    output+= this.line('}');
    


    return output;
};

MaterialShader.prototype.updateMaterial = function() {
    this.timestamp = 0.0;

    this.currentMaterial = this.material.resource;

    this.currentMaterial.chunks.diffusePS  = this.generateShaderOutput();
    this.currentMaterial.chunks.opacityPS  = ' ';
    this.currentMaterial.chunks.emissivePS = ' ';
    
    this.currentMaterial.chunks.alphaTestPS = ' ';

    this.currentMaterial.chunks.transformVS = this.generateTransformOutput();

    this.currentMaterial.chunks.endPS = 'vec4 outputColor = getColor(vUv0);';
    this.currentMaterial.chunks.endPS+= 'dAlpha = outputColor.a;';
    this.currentMaterial.chunks.endPS+= 'alphaTest(outputColor.a);';

    this.currentMaterial.chunks.endPS+= 'gl_FragColor.rgb = outputColor.rgb;';

    if(this.light){
        this.currentMaterial.chunks.endPS+= 'gl_FragColor.rgb = mix(gl_FragColor.rgb * dDiffuseLight, dSpecularLight + dReflection.rgb * dReflection.a, dSpecularity);';
        this.currentMaterial.chunks.endPS+= 'gl_FragColor.rgb = addFog(gl_FragColor.rgb);';
        this.currentMaterial.chunks.endPS+= 'gl_FragColor.rgb = gammaCorrectOutput(gl_FragColor.rgb);';
    }

    this.currentMaterial.update();
};

MaterialShader.prototype.update = function(dt) {
    if(this.currentMaterial){
        for(var index in this.parameters){
            var parameter = this.parameters[index];

            this.currentMaterial.setParameter(
                parameter.name,
                parameter.resource
            );
        }

        this.currentMaterial.setParameter(
            'timestamp',
            this.timestamp
        );
    }
    
    this.timestamp+=dt;
};
