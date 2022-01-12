#version 130
#define circleRotationOffset $circleRotationOffset
#define smoothingLevel $smoothingLevel
#define barWidth $barWidth
#define barAmount $barAmount

//converts euclidean to polar coordinates (x,y) -> (phi,r)
vec2 euclideanToPolar(in vec2 vec, in float cx, in float cy) {

    float dx = vec.x - cx;
    float dy = vec.y - cy;

    float phi = atan(dy, dx) - (circleRotationOffset / 360) * 2 * 3.1415926535;
    phi = mod(phi + 3.1415926535, 2 * 3.1415926535) - 3.1415926535;
    float r = sqrt(pow(dx,2) + pow(dy,2));

    return vec2(phi,r);
}

float divideIntoSections(in float x, in int sectionAmount) {

    float sectionSize = 1.0 / sectionAmount;

    float actualSectionSize = barWidth * sectionSize;
    float gapSize = ((1-barWidth)/2) * sectionSize;

    float sectionLowerBound = floor(x / sectionSize) * sectionSize;
    if(x > sectionLowerBound + gapSize && x <= sectionLowerBound + sectionSize - gapSize){
        return sectionLowerBound;
    }else{
        return -1;
    }

    
}


//converts polar to euclidean coordinates (phi,r) -> (x,y)
vec2 polarToEuclidean(in vec2 vec, in float cx, in float cy) {

    float x = cx + vec.y * acos(vec.x);
    float y = cy + vec.y * asin(vec.x);

    return vec2(x,y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {

/*    float cx = iResolution.x / 2;
    float cy = iResolution.y / 2;

    vec2 polar = euclideanToPolar(fragCoord, cx, cy);

    float normalized;    
    if(polar.x > 0){
        normalized = polar.x / 3.1415926535;
    }else{
        normalized = polar.x / -3.1415926535;
    }
    
    vec4 newdata = texture(iChannel1, vec2(normalized,0));
    vec4 olddata = texelFetch(iChannel2,ivec2(normalized * iResolution.x,0) , mod(frame, 2));
    
    fragColor=vec4(newdata);
*/

    vec4 newdata = texture(iChannel1, vec2(float(fragCoord.x) / float(iResolution.x),0.0));
    if(fragCoord.y == mod(iFrame, smoothingLevel)){

        fragColor = newdata;
        
    }else if(fragCoord.y < smoothingLevel){

        fragColor = texelFetch(iChannel2, ivec2(fragCoord.x, fragCoord.y), 0);

    }
    if(fragCoord.y == smoothingLevel){
        float sectionSize = 1.0 / barAmount;
        vec4 value = vec4(0,0,0,0);
        for(int i = 0;i<smoothingLevel;i++){
            vec4 val = texelFetch(iChannel2, ivec2(fragCoord.x, i),0);
            value += val;
        }
        fragColor = value/smoothingLevel;
    }
    if(fragCoord.y == smoothingLevel + 1 && fragCoord.x == 0){
        float vol = 0;
        for(int x = 0;x<iResolution.x;x++){
            for(int y = 0;y<smoothingLevel;y++){
                vol += texelFetch(iChannel2, ivec2(x,y),0).r;
                vol += texelFetch(iChannel2, ivec2(x,y),0).g;
            }
        }
        vol /= (iResolution.x * smoothingLevel * 2);

        fragColor = vec4(vol, 0, 0, 0);
        
    }

}