const screenSizes = {
    s1:375,
    s2:550,
    s3:1060,
    s4:1280
}
export const MediaSizes = {
    small:1,
    medium:2,
    large:3,
    xlarge:4,
    xxlarge:6
}
export const CheckMedia = (screenWidth) =>{
    if(screenWidth < screenSizes.s1){
        return MediaSizes.small;
    }else if(screenWidth >= screenSizes.s1 && screenWidth < screenSizes.s2){
        return MediaSizes.medium;
    }else if(screenWidth >= screenSizes.s2 && screenWidth < screenSizes.s3){
        return MediaSizes.large;
    }else if(screenWidth >= screenSizes.s3 && screenWidth < screenSizes.s4){
        return MediaSizes.xlarge;
    }else{
        return MediaSizes.xxlarge;
    }
}