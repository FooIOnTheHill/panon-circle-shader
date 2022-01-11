#version 130
#define circleRotationOffset $circleRotationOffset
#define smoothingLevel $smoothingLevel

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

    float sectionSize = (3.1415926535) / sectionAmount;

    return floor(x / sectionSize) * sectionSize;

    
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

}