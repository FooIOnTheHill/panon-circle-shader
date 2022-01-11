#version 130

#define circleRadius $circleRadius
#define borderWidth $borderWidth
#define amplification $amplification
#define circleRotationOffset $circleRotationOffset

//converts euclidean to polar coordinates (x,y) -> (phi,r)
vec2 euclideanToPolar(in vec2 vec, in float cx, in float cy) {

    float dx = vec.x - cx;
    float dy = vec.y - cy;

    float phi = atan(dy, dx) - (circleRotationOffset / 360) * 2 * 3.1415926535;
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

    float r = circleRadius * iResolution.y;
    float strokeWidth = borderWidth;

    float cx = iResolution.x / 2;
    float cy = iResolution.y / 2;
    vec2 polar = euclideanToPolar(fragCoord, cx, cy);

    float amp, normalized;
    if(polar.x > 0){
        
        normalized = polar.x / 3.1415926535;

    }else{

        normalized = polar.x / -3.1415926535;
        
    }

    vec4 data = texture(iChannel1, vec2(divideIntoSections(normalized, 1024), 0));

    
    if(polar.x > 0){
    
        amp = data.r * amplification;

    }else{
        
        amp = data.g * amplification;

    }



    if(polar.y < r + amp && polar.y > r - borderWidth){
        float rgbX = normalized;
        if(rgbX > 0.5){
            rgbX = 1 - rgbX;
        }
        fragColor.rgb=getRGB(rgbX);
        fragColor.a=1;
    }else{
        fragColor = vec4(0,0,0,0);
    }

}
