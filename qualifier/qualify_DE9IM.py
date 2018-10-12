"""
Spyder Editor

This is a temporary script file.

Captures the TOPOLOGICAL RELATIONS between 
    (
        LINE-LINE
        LINE-POLYGON
        LINE-POINT
        POLYGON-POINT
    )features 

@s_jan

"""

from qualifier.utils_i4l import pattern


disjoint = pattern('FF*FF****')
touch =pattern('FT*******' or 'F**T*****' or 'F***T****')
#touch = pattern('F01FF0212' or'FF1F00212' )
intersects=pattern('1010F0212')
within = pattern('1FF0FF212')
crosses = pattern('101FF0212' )


def topolgical_relation_lineRegion (f1, f2):
   
    im_pattern=f1.relate(f2)
    #return im_pattern
    if( disjoint.matches(im_pattern)):
        return "disjoint" 
    elif( touch.matches(im_pattern)):
        return "touches"
    elif( intersects.matches(im_pattern)):
        return "intersects"
    elif( within.matches(im_pattern)):
        return "within"
    elif(crosses.matches(im_pattern)):
        return "crosses"
    else:
        return "unKnown"


def qualify_DE9IM(data):
    #every qualifier function must specify these two parameters
    qualify_DE9IM.relation_set = 'DE9IM'
    qualify_DE9IM.arity = 2

    return 'DE9IM', 2, {}, [{'obj 1':data[i]['attributes']['id'], 'obj 2':sec['attributes']['id'], 'relation':topolgical_relation_lineRegion(data[i]['geometry'], sec['geometry'])} 
        for i in range(len(data[:-1])) for sec in data[i+1:]
                            if (
                                    (data[i]['geometry'].geom_type=='Polygon' and sec['geometry'].geom_type=='LineString')
                                    or
                                    (data[i]['geometry'].geom_type=='LineString' and sec['geometry'].geom_type=='Polygon')
                            )]

