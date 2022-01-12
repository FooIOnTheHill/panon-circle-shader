#version 130

#define circleRadius $circleRadius
#define borderWidth $borderWidth
#define amplification $amplification
#define circleRotationOffset $circleRotationOffset
#define barAmount $barAmount
#define smoothing $smoothing
#define smoothingLevel $smoothingLevel
#define rotateColor $rotateColor
#define rotateCircle $rotateCircle
#define colorBaseRotationSpeed $colorBaseRotationSpeed
#define circleBaseRotationSpeed $circleBaseRotationSpeed
#define volumeIncreaseRadius $volumeIncreaseRadius
#define barWidth $barWidth
#define drawBaseCircle $drawBaseCircle

//converts euclidean to polar coordinates (x,y) -> (phi,r)
vec2 euclideanToPolar(in vec2 vec, in float cx, in float cy) {

    float dx = vec.x - cx;
    float dy = vec.y - cy;
    float volume = texelFetch(iChannel2, ivec2(0, smoothingLevel),0).x;
    float phi = atan(dy, dx) - (circleRotationOffset / 360) * 2 * 3.1415926535;
    if(rotateCircle){
        phi += float(iTime) * circleBaseRotationSpeed;
    }
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

vec4 getRealRGB(float x, float alpha){
    return vec4(getRGB(x) * alpha, alpha);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {


    float volume = texelFetch(iChannel2, ivec2(0, smoothingLevel),0).x;

    float r = 0.5 * circleRadius * iResolution.y + volume * volumeIncreaseRadius;
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

    vec4 data;// = texture(iChannel1, vec2(divideIntoSections(normalized, barAmount / 2), 0));
    vec4 oldData;
    if(smoothing){
        float lowerBound = divideIntoSections(normalized, barAmount/2);
        if(lowerBound != -1){
            data = texelFetch(iChannel2, ivec2(lowerBound * iResolution.x, smoothingLevel), 0);
        }else{
            if(!drawBaseCircle)return;//fragColor = vec4(0,0,0,0);
        }
    }else{
        data = texture(iChannel1, vec2(divideIntoSections(normalized, barAmount/2), 0));
    }

    if(polar.x > 0){
    
        amp = data.r * amplification;

    }else{
        
        amp = data.g * amplification;

    }


    if(polar.y > r - borderWidth){
        float colorOffset = rotateColor ? float(iTime) * colorBaseRotationSpeed : 0;
        float rgbX = mod((polar.x + 3.1415926535)/(2*3.1415926535) + colorOffset, 1);
        if(rgbX > 0.5){
            rgbX = 1 - rgbX;
        }
        if(polar.y < r + amp){
            fragColor=getRealRGB(rgbX * 2, 1);
            //fragColor=vec4(02,0,0, mod(polar.x,0.1) > 0.05 ? 1.0 : 0.1);
        }else if(polar.y - r - amp < 5){
            //fragColor=getRealRGB(rgbX, 0.05 );
        }else{
            fragColor = vec4(0,0,0,0);
        }
    }else{
        fragColor = vec4(0,0,0,0);
    }
    if(iBeat > 0){
        fragColor = vec4(1.,1.,1.,1.);
    }
    
}
