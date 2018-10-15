# -*- coding: utf-8 -*-
"""
Created on Mon Apr 30 15:51:54 2018

@author: s_jan001
"""

from flask import Flask, render_template, request
from analyser import completeness
from analyser import qualitativeAnalyser
from qualifier import qualify_map
import sys
import json
import os



#sys.setrecursionlimit(22000)

"""
create flask web app instance 
"""
app = Flask(__name__)
metricMapID = None
sketchMapID = None


@app.route("/")
def dashboard():
    return render_template("dashboard.html")


@app.route("/main_sketchClassifier", methods=["POST", "GET"])
def main_page():
    return render_template("main_sketchClassifier.html")


@app.route("/metricFileName", methods=["POST", "GET"])
def getMetricMapID():
    global metricMapID
    metricMapID = request.args.get("metricFileName")
    print("1 Metric Map ID....:", metricMapID)
    return "msg"


@app.route("/sketchFileName", methods=["POST", "GET"])
def getSketchMapID():
    global sketchMapID
    sketchMapID = request.args.get("sketchFileName")
    print("sketch map id...",sketchMapID)
    return "msg"


"""
    - load metric map geojson into qualifier 
"""


@app.route("/mmReceiver", methods=["POST", "GET"])
def mmGeoJsonReceiver():

    global metricMapID
    metricMapID = metricMapID
    mmGeoJson = request.get_json("MMGeoJsonData")
    data_format = "geojson"
    map_type = "metric_map"
    metricMapData = qualify_map.main_loader(metricMapID, mmGeoJson, data_format, map_type)
    filepath = "./output/"+str(metricMapID)+".json"
    print("final file path mm...", filepath)
    try:
       if os.path.exists(filepath):
           os.remove(filepath)
       f = open(filepath, "a+")
       f.write(json.dumps(metricMapData,indent=4))
       f.close()
    except IOError:
        print("Metric map QCNs json path problem ")
    return "Qualify Successfully"


"""
    - load sketch map geojson into qualifier 
"""


@app.route("/smReceiver", methods=["POST", "GET"])
def smGeoJsonReceiver():
    global sketchMapID
    sketchMapID = sketchMapID
    smGeoJson = request.get_json()
    data_format = "geojson"
    map_type = "sketch_map"
    sketchMapData = qualify_map.main_loader(sketchMapID, smGeoJson, data_format, map_type)
    filepath = './output/'+str(sketchMapID)+'.json'
    print("final file path. sm..",filepath)
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
        f = open(filepath, "a+")
        f.write(json.dumps(sketchMapData,indent=4))
        f.close()
    except IOError:
        print("Sketch map QCNs json path problem ")
    return "Qualify Successfully"


"""
@app.route("/initializeDatabase", methods=["POST", "GET"])
def initializeDatabase():
    #deleted = completeness.deleteAllRecords()
    #msg = completeness.createGraphStructure()
    return "msg"
"""

@app.route('/results', methods=["POST", "GET"])
def getDatabseResults():
    global metricMapID
    global sketchMapID
    sketchMapID = sketchMapID
    metricMapID = metricMapID
    with open( './output/'+metricMapID+'.json') as mmjson:
        try:
            #print("reading path..",os.path.join(dir_qcns,'metric_map.json'))
            metricMapQCNs = json.load(mmjson)
        except IOError:
            print("metric_map.json is not loading ")

    with open('./output/'+sketchMapID+'.json') as smjson:
        try:
            sketchMapQCNs = json.load(smjson)
        except IOError:
            print("sketch_map.json is not loading ")


    total_mm_landmarks = completeness.get_landmarks_mm(metricMapQCNs)
    toal_mm_streets = completeness.get_streets_mm(metricMapQCNs)
    total_mm_cityblocks = completeness.get_cityblocks_mm(metricMapQCNs)

    print("total landmarks in MM...:", total_mm_landmarks)
    print("total streets in MM...:", toal_mm_streets)
    print("matched city-blocks in MM...:", total_mm_cityblocks)
    print("======================================")
    totalSketchedLandmarks = completeness.get_landmarks_sm(sketchMapQCNs)
    totalSketchedStreets = completeness.get_streets_sm(sketchMapQCNs)
    totalSketchedCityblocks = completeness.get_cityblocks_sm(sketchMapQCNs)

    print("total landmarks in SM...:", totalSketchedLandmarks)
    print("total streets in SM...:", totalSketchedStreets)
    print("matched city-blocks in SM...:", totalSketchedCityblocks)
    print("======================================")

    landmarkCompleteness = completeness.get_landmarkCompleteness(totalSketchedLandmarks,total_mm_landmarks)
    landmarkCompleteness = round(landmarkCompleteness, 2)

    streetCompleteness= completeness.get_streetCompleteness(totalSketchedStreets,toal_mm_streets)
    streetCompleteness = round(streetCompleteness, 2)

    cityblockCompleteness = completeness.get_cityblockCompleteness(totalSketchedCityblocks,total_mm_cityblocks)
    cityblockCompleteness = round(cityblockCompleteness, 2)

    overAllCompleteness=completeness.get_overall_completness(landmarkCompleteness,streetCompleteness,cityblockCompleteness)


    """
        Measure the correct relations using RCC11
    """
    totalRCC11Relations_mm = qualitativeAnalyser.getTotalRelations_rcc8_mm(metricMapQCNs)
    totalRCC11Relations = qualitativeAnalyser.getTotalRelations_rcc8_sm(sketchMapQCNs)
    correctRCC11Relations = qualitativeAnalyser.getCorrrctRelation_rcc8(sketchMapQCNs, metricMapQCNs)
    wrongMatchedRCC11rels = qualitativeAnalyser.getWrongRelations_rcc8(sketchMapQCNs, metricMapQCNs)
    missingRCC11rels = totalRCC11Relations_mm - (correctRCC11Relations + wrongMatchedRCC11rels)
    if correctRCC11Relations != 0 or totalRCC11Relations != 0:
        correctnessAccuracy_rcc11 = (correctRCC11Relations / totalRCC11Relations) * 100
    else:
        correctnessAccuracy_rcc11= 0.00

    print("total RCC11 rels in MM...:", totalRCC11Relations_mm)
    print("total RCC11 rels in SM...:", totalRCC11Relations)
    print("matched RCC11 rels...:", correctRCC11Relations)
    print("wrong matched RCC11 rels...:", wrongMatchedRCC11rels)
    print("missing RCC11 rels...:", missingRCC11rels)
    print("======================================")

    """
            Measure the correct relations using Linear Ordering 
            alogn the defined route 
        """
    total_lO_rels_mm = qualitativeAnalyser.getTotalLinearOrderingReltions_mm(metricMapQCNs)
    total_LO_rels_sm = qualitativeAnalyser.getTotalLinearOrderingReltions_sm(sketchMapQCNs)
    matched_LO_rels = qualitativeAnalyser.getCorrectRelation_linearOrdering(sketchMapQCNs, metricMapQCNs)
    wrong_matched_LO_rels = qualitativeAnalyser.getWrongRelations_linearOrdering(sketchMapQCNs, metricMapQCNs)
    missing_LO_rels = total_lO_rels_mm - (matched_LO_rels + wrong_matched_LO_rels)
    if matched_LO_rels != 0 or total_LO_rels_sm != 0:
        correctnessAccuracy_LO = (matched_LO_rels / total_LO_rels_sm) * 100
    else:
        correctnessAccuracy_LO = 0.00
    print("total LO rels_mm...:", total_lO_rels_mm)
    print("total LO rels_sm...:", total_LO_rels_sm)
    print("matched LO rels...:", matched_LO_rels)
    print("wrong matched LO rels...:", wrong_matched_LO_rels)
    print("missing LO rels...:", missing_LO_rels)
    print("======================================")

    """
        Measure the correct relations using LeftRight
        alogn the defined route 
    """
    total_LR_rels_mm = qualitativeAnalyser.getTotalLeftRightRelations_mm(metricMapQCNs)
    total_LR_rels_sm = qualitativeAnalyser.getTotalLeftRightRelations_sm(sketchMapQCNs)
    matched_LR_rels = qualitativeAnalyser.getCorrectrelations_leftRight(sketchMapQCNs, metricMapQCNs)
    wrong_matched_LR_rels = qualitativeAnalyser.getWrongCorrectrelations_leftRight(sketchMapQCNs, metricMapQCNs)
    missing_LR_rels = total_LR_rels_mm - (matched_LR_rels + wrong_matched_LR_rels)
    if matched_LR_rels != 0 or total_LR_rels_sm != 0:
        correctnessAccuracy_LR = (matched_LR_rels / total_LR_rels_sm) * 100
    else:
        correctnessAccuracy_LR = 0.00
    print("total LR rels_mm...:", total_LR_rels_mm)
    print("total LR rels_sm...:", total_LR_rels_sm)
    print("matched LR rels...:", matched_LR_rels)
    print("wrong matched LR rels...:", wrong_matched_LR_rels)
    print("missing LR rels...:", missing_LR_rels)
    print("======================================")



    """
        Measure the correct relations using Topologocal Relations between streets and regions 
        
    """
    total_DE9IM_rels_mm = qualitativeAnalyser.getTotalDE9IMRelations_mm(metricMapQCNs)
    total_DE9IM_rels_sm = qualitativeAnalyser.getTotalDE9IMRelations_sm(sketchMapQCNs)
    matched_DE9IM_rels = qualitativeAnalyser.getCorrectrelations_DE9IM(sketchMapQCNs, metricMapQCNs)
    wrong_matched_DE9IM_rels = qualitativeAnalyser.getWrongCorrectrelations_DE9IM(sketchMapQCNs, metricMapQCNs)
    missing_DE9IM_rels = total_DE9IM_rels_mm - (matched_DE9IM_rels + wrong_matched_DE9IM_rels)
    if matched_DE9IM_rels != 0 or total_DE9IM_rels_sm != 0:
        correctnessAccuracy_DE9IM = (matched_DE9IM_rels / total_DE9IM_rels_sm) * 100
    else:
        correctnessAccuracy_DE9IM = 0.00
    print("total DE9IM rels_mm...:", total_DE9IM_rels_mm)
    print("total DE9IM rels_sm...:", total_DE9IM_rels_sm)
    print("matched DE9IM rels...:", matched_DE9IM_rels)
    print("wrong matched DE9IM rels...:", wrong_matched_DE9IM_rels)
    print("missing DE9IM rels...:", missing_DE9IM_rels)
    print("======================================")

    """
        Measure the correct relations using Topologocal Relations between streets  
    """
    total_streetTop_rels_mm = qualitativeAnalyser.getTotalStreetTopology_mm(metricMapQCNs)
    total_streetTop_rels_sm = qualitativeAnalyser.getTotalStreetTopology_sm(sketchMapQCNs)
    matched_streetTop_rels = qualitativeAnalyser.getCorrectrelations_streetTopology(sketchMapQCNs, metricMapQCNs)
    wrong_matched_streetTop_rels = qualitativeAnalyser.getWrongCorrectrelations_streetTopology(sketchMapQCNs, metricMapQCNs)
    missing_streetTop_rels = total_streetTop_rels_mm - (matched_streetTop_rels + wrong_matched_streetTop_rels)
    if matched_streetTop_rels != 0 or total_streetTop_rels_sm != 0:
        correctnessAccuracy_streetTop = (matched_streetTop_rels / total_streetTop_rels_sm) * 100
    else:
        correctnessAccuracy_streetTop = 0.00
    print("total streetTop rels_mm...:", total_streetTop_rels_mm)
    print("total streetTop rels_sm...:", total_streetTop_rels_sm)
    print("matched streetTop rels...:", matched_streetTop_rels)
    print("wrong matched streetTop rels...:", wrong_matched_streetTop_rels)
    print("missing streetTop rels...:", missing_streetTop_rels)
    print("======================================")

    """
         Measure the correct relations using Orientation Relations between streets  
     """
    total_opra_rels_mm = qualitativeAnalyser.getTotalOPRA_mm(metricMapQCNs)
    total_opra_rels_sm = qualitativeAnalyser.getTotalOPRA_sm(sketchMapQCNs)
    matched_opra_rels = qualitativeAnalyser.getCorrectrelations_opra(sketchMapQCNs, metricMapQCNs)
    wrong_matched_opra_rels = qualitativeAnalyser.getWrongCorrectrelations_opra(sketchMapQCNs, metricMapQCNs)
    missing_opra_rels = total_opra_rels_mm - (matched_opra_rels + wrong_matched_opra_rels)
    if matched_opra_rels != 0 or total_opra_rels_sm != 0:
        correctnessAccuracy_opra = (matched_opra_rels / total_opra_rels_sm) * 100
    else:
        correctnessAccuracy_opra=0.00
    print("total opra rels_mm...:", total_opra_rels_mm)
    print("total opra rels_sm...:", total_opra_rels_sm)
    print("matched opra rels...:", matched_opra_rels)
    print("wrong matched opra rels...:", wrong_matched_opra_rels)
    print("missing opra rels...:", missing_opra_rels)
    print("======================================")

    """
           Calculate Recision and Recall 
     """

    total_no_correct_rels = correctRCC11Relations + matched_LO_rels + matched_LR_rels + matched_DE9IM_rels + matched_streetTop_rels + matched_opra_rels
    total_no_rels_sm = totalRCC11Relations + total_LO_rels_sm + total_LR_rels_sm + total_DE9IM_rels_sm + total_streetTop_rels_sm + total_opra_rels_sm
    total_on_rels_MM = totalRCC11Relations_mm + total_lO_rels_mm + total_LR_rels_mm + total_DE9IM_rels_mm + total_streetTop_rels_mm + total_opra_rels_mm
    precision = total_no_correct_rels / total_no_rels_sm
    recall = total_no_correct_rels / total_on_rels_MM

    f_score = 2 * ((precision * recall) / (precision + recall))
    print("precision....:", precision)
    print("recall....:", recall)
    print("F-value....:", f_score)

    return render_template("results.html", sketchMapID=sketchMapID,total_mm_landmarks=total_mm_landmarks,toal_mm_streets=toal_mm_streets,total_mm_cityblocks=total_mm_cityblocks,totalSketchedLandmarks=totalSketchedLandmarks,totalSketchedStreets=totalSketchedStreets,totalSketchedCityblocks=totalSketchedCityblocks,landmarkCompleteness=landmarkCompleteness,streetCompleteness=streetCompleteness,cityblockCompleteness=cityblockCompleteness,
                           overAllCompleteness=round(overAllCompleteness,2), totalRCC11Relations_mm=totalRCC11Relations_mm,totalRCC11Relations=totalRCC11Relations,correctRCC11Relations=correctRCC11Relations,wrongMatchedRCC11rels=wrongMatchedRCC11rels,missingRCC11rels=missingRCC11rels,
                           correctnessAccuracy_rcc11=round(correctnessAccuracy_rcc11,2),total_lO_rels_mm=total_lO_rels_mm,total_LO_rels_sm=total_LO_rels_sm,matched_LO_rels=matched_LO_rels,wrong_matched_LO_rels=wrong_matched_LO_rels,missing_LO_rels=missing_LO_rels,
                           correctnessAccuracy_LO=round(correctnessAccuracy_LO,2),total_LR_rels_mm=total_LR_rels_mm,total_LR_rels_sm=total_LR_rels_sm,matched_LR_rels=matched_LR_rels,wrong_matched_LR_rels=wrong_matched_LR_rels,missing_LR_rels=missing_LR_rels,
                           correctnessAccuracy_LR=round(correctnessAccuracy_LR,2),total_DE9IM_rels_mm=total_DE9IM_rels_mm,total_DE9IM_rels_sm=total_DE9IM_rels_sm,matched_DE9IM_rels=matched_DE9IM_rels,wrong_matched_DE9IM_rels=wrong_matched_DE9IM_rels,missing_DE9IM_rels=missing_DE9IM_rels,
                           correctnessAccuracy_DE9IM=round(correctnessAccuracy_DE9IM,2),total_streetTop_rels_mm=total_streetTop_rels_mm,total_streetTop_rels_sm=total_streetTop_rels_sm,matched_streetTop_rels=matched_streetTop_rels,wrong_matched_streetTop_rels=wrong_matched_streetTop_rels,missing_streetTop_rels=missing_streetTop_rels,
                           correctnessAccuracy_streetTop=round(correctnessAccuracy_streetTop,2),total_opra_rels_mm=total_opra_rels_mm,total_opra_rels_sm=total_opra_rels_sm,matched_opra_rels=matched_opra_rels,wrong_matched_opra_rels=wrong_matched_opra_rels,missing_opra_rels=missing_opra_rels,
                           correctnessAccuracy_opra=round(correctnessAccuracy_opra,2),precision=round(precision,2),recall=round(recall,2),
                           f_score=round(f_score,2)
                           )

if __name__ == '__main__':

    app.run(debug=True)
