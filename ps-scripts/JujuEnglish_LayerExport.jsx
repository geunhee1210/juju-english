/**
 * JujuEnglish 레이어 일괄 내보내기 스크립트
 * 
 * 기능:
 * 1. PSD 레이어 구조 검증
 * 2. 레이어별 PNG 내보내기
 * 3. After Effects 임포트용 파일 구조 생성
 * 4. 메타데이터 JSON 생성
 * 
 * 사용법: Photoshop에서 File > Scripts > Browse에서 실행
 */

// @target photoshop
// @script "JujuEnglish Layer Export"

#target photoshop

// 설정
var CONFIG = {
    prefixes: {
        CHAR: "캐릭터",
        BG: "배경",
        PROP: "소품",
        FX: "효과"
    },
    requiredPrefixes: ["CHAR_", "BG_"],
    outputBase: "02_누끼"
};

// 메인 UI
function showMainDialog() {
    var dialog = new Window("dialog", "주주잉글리시 레이어 내보내기");
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];
    
    // 프로젝트 정보
    var projectGroup = dialog.add("panel", undefined, "프로젝트 정보");
    projectGroup.alignChildren = ["fill", "top"];
    projectGroup.margins = 15;
    
    var epGroup = projectGroup.add("group");
    epGroup.add("statictext", undefined, "에피소드 ID:");
    var epInput = epGroup.add("edittext", undefined, "EP001");
    epInput.characters = 15;
    
    // 레이어 현황
    var statusGroup = dialog.add("panel", undefined, "현재 문서 레이어 현황");
    statusGroup.alignChildren = ["fill", "top"];
    statusGroup.margins = 15;
    
    var statusText = statusGroup.add("statictext", undefined, 
        "문서를 분석하려면 '레이어 분석' 버튼을 클릭하세요.", 
        { multiline: true });
    statusText.preferredSize = [350, 100];
    
    var analyzeBtn = statusGroup.add("button", undefined, "레이어 분석");
    analyzeBtn.onClick = function() {
        var analysis = analyzeDocument();
        statusText.text = analysis;
    };
    
    // 내보내기 옵션
    var exportGroup = dialog.add("panel", undefined, "내보내기 옵션");
    exportGroup.alignChildren = ["fill", "top"];
    exportGroup.margins = 15;
    
    var trimLayers = exportGroup.add("checkbox", undefined, "투명 픽셀 자르기 (Trim)");
    trimLayers.value = true;
    
    var includeHidden = exportGroup.add("checkbox", undefined, "숨김 레이어도 내보내기");
    includeHidden.value = false;
    
    var createMetadata = exportGroup.add("checkbox", undefined, "메타데이터 JSON 생성");
    createMetadata.value = true;
    
    var createAEStructure = exportGroup.add("checkbox", undefined, "After Effects 구조 생성");
    createAEStructure.value = true;
    
    // 출력 폴더
    var outputGroup = dialog.add("panel", undefined, "출력 경로");
    outputGroup.alignChildren = ["fill", "top"];
    outputGroup.margins = 15;
    
    var outputPathGroup = outputGroup.add("group");
    var outputPath = outputPathGroup.add("edittext", undefined, "");
    outputPath.characters = 35;
    var outputBrowse = outputPathGroup.add("button", undefined, "찾아보기...");
    
    outputBrowse.onClick = function() {
        var folder = Folder.selectDialog("출력 폴더 선택");
        if (folder) outputPath.text = folder.fsName;
    };
    
    // 버튼
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = ["center", "top"];
    
    var validateBtn = buttonGroup.add("button", undefined, "구조 검증");
    var exportBtn = buttonGroup.add("button", undefined, "일괄 내보내기");
    var closeBtn = buttonGroup.add("button", undefined, "닫기");
    
    validateBtn.onClick = function() {
        validateLayerStructure();
    };
    
    exportBtn.onClick = function() {
        var settings = {
            episodeId: epInput.text,
            outputPath: outputPath.text,
            trimLayers: trimLayers.value,
            includeHidden: includeHidden.value,
            createMetadata: createMetadata.value,
            createAEStructure: createAEStructure.value
        };
        
        if (!settings.outputPath) {
            if (app.activeDocument && app.activeDocument.path) {
                settings.outputPath = app.activeDocument.path + "/" + CONFIG.outputBase;
            } else {
                alert("출력 경로를 선택해주세요.");
                return;
            }
        }
        
        exportAllLayers(settings);
    };
    
    closeBtn.onClick = function() {
        dialog.close();
    };
    
    // 문서가 열려있으면 자동 분석
    if (app.activeDocument) {
        outputPath.text = app.activeDocument.path + "/" + CONFIG.outputBase;
        analyzeBtn.notify();
    }
    
    dialog.show();
}

// 문서 분석
function analyzeDocument() {
    if (!app.activeDocument) {
        return "열린 문서가 없습니다.";
    }
    
    var doc = app.activeDocument;
    var layers = getAllLayers(doc);
    
    var counts = {
        CHAR: 0,
        BG: 0,
        PROP: 0,
        FX: 0,
        OTHER: 0
    };
    
    for (var i = 0; i < layers.length; i++) {
        var name = layers[i].name;
        if (name.indexOf("CHAR_") === 0) counts.CHAR++;
        else if (name.indexOf("BG_") === 0) counts.BG++;
        else if (name.indexOf("PROP_") === 0) counts.PROP++;
        else if (name.indexOf("FX_") === 0) counts.FX++;
        else counts.OTHER++;
    }
    
    var report = "문서: " + doc.name + "\n";
    report += "크기: " + doc.width + " x " + doc.height + "\n";
    report += "총 레이어: " + layers.length + "개\n\n";
    report += "분류별 레이어:\n";
    report += "  캐릭터 (CHAR_): " + counts.CHAR + "개\n";
    report += "  배경 (BG_): " + counts.BG + "개\n";
    report += "  소품 (PROP_): " + counts.PROP + "개\n";
    report += "  효과 (FX_): " + counts.FX + "개\n";
    
    if (counts.OTHER > 0) {
        report += "\n⚠️ 미분류: " + counts.OTHER + "개";
    }
    
    return report;
}

// 모든 레이어 가져오기 (중첩 레이어 포함)
function getAllLayers(container) {
    var layers = [];
    
    // 일반 레이어
    for (var i = 0; i < container.artLayers.length; i++) {
        layers.push(container.artLayers[i]);
    }
    
    // 레이어 그룹 내 레이어
    for (var j = 0; j < container.layerSets.length; j++) {
        var groupLayers = getAllLayers(container.layerSets[j]);
        layers = layers.concat(groupLayers);
    }
    
    return layers;
}

// 레이어 구조 검증
function validateLayerStructure() {
    if (!app.activeDocument) {
        alert("열린 문서가 없습니다.");
        return false;
    }
    
    var doc = app.activeDocument;
    var layers = getAllLayers(doc);
    var issues = [];
    var warnings = [];
    
    // 필수 레이어 확인
    var hasChar = false;
    var hasBg = false;
    
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var name = layer.name;
        
        if (name.indexOf("CHAR_") === 0) hasChar = true;
        if (name.indexOf("BG_") === 0) hasBg = true;
        
        // 명명 규칙 확인
        if (!isValidLayerName(name)) {
            warnings.push("미분류 레이어: " + name);
        }
        
        // 빈 레이어 확인
        if (isEmptyLayer(layer)) {
            warnings.push("빈 레이어: " + name);
        }
    }
    
    if (!hasChar) {
        issues.push("캐릭터 레이어(CHAR_)가 없습니다.");
    }
    
    if (!hasBg) {
        issues.push("배경 레이어(BG_)가 없습니다.");
    }
    
    // 결과 표시
    var result = "레이어 구조 검증 결과\n";
    result += "======================\n\n";
    
    if (issues.length === 0 && warnings.length === 0) {
        result += "✅ 모든 검증을 통과했습니다!";
        alert(result);
        return true;
    }
    
    if (issues.length > 0) {
        result += "❌ 오류:\n";
        for (var j = 0; j < issues.length; j++) {
            result += "  - " + issues[j] + "\n";
        }
        result += "\n";
    }
    
    if (warnings.length > 0) {
        result += "⚠️ 경고:\n";
        for (var k = 0; k < Math.min(warnings.length, 10); k++) {
            result += "  - " + warnings[k] + "\n";
        }
        if (warnings.length > 10) {
            result += "  ... 외 " + (warnings.length - 10) + "개\n";
        }
    }
    
    alert(result);
    return issues.length === 0;
}

// 유효한 레이어 이름 확인
function isValidLayerName(name) {
    var validPrefixes = ["CHAR_", "BG_", "PROP_", "FX_", "Background"];
    for (var i = 0; i < validPrefixes.length; i++) {
        if (name.indexOf(validPrefixes[i]) === 0) {
            return true;
        }
    }
    return false;
}

// 빈 레이어 확인
function isEmptyLayer(layer) {
    try {
        var bounds = layer.bounds;
        return (bounds[2] - bounds[0] === 0 || bounds[3] - bounds[1] === 0);
    } catch (e) {
        return true;
    }
}

// 모든 레이어 내보내기
function exportAllLayers(settings) {
    if (!app.activeDocument) {
        alert("열린 문서가 없습니다.");
        return;
    }
    
    var doc = app.activeDocument;
    var layers = getAllLayers(doc);
    
    // 출력 폴더 생성
    var baseFolder = new Folder(settings.outputPath);
    if (!baseFolder.exists) {
        baseFolder.create();
    }
    
    // 하위 폴더 생성
    var subFolders = {};
    for (var prefix in CONFIG.prefixes) {
        var folder = new Folder(settings.outputPath + "/" + CONFIG.prefixes[prefix]);
        if (!folder.exists) {
            folder.create();
        }
        subFolders[prefix] = folder;
    }
    
    var exported = [];
    var failed = [];
    
    // 진행 표시
    var progressWin = new Window("palette", "내보내기 중...");
    var progressText = progressWin.add("statictext", undefined, "0 / " + layers.length);
    progressWin.show();
    
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        
        // 숨김 레이어 스킵
        if (!settings.includeHidden && !layer.visible) {
            continue;
        }
        
        // 빈 레이어 스킵
        if (isEmptyLayer(layer)) {
            continue;
        }
        
        try {
            var result = exportLayer(doc, layer, settings);
            exported.push(result);
        } catch (e) {
            failed.push({ name: layer.name, error: e.message });
        }
        
        progressText.text = (i + 1) + " / " + layers.length;
    }
    
    progressWin.close();
    
    // 메타데이터 생성
    if (settings.createMetadata) {
        createMetadataJson(settings, exported);
    }
    
    // AE 구조 생성
    if (settings.createAEStructure) {
        createAEImportFile(settings, exported);
    }
    
    // 결과 표시
    var resultMsg = "내보내기 완료!\n\n";
    resultMsg += "성공: " + exported.length + "개\n";
    resultMsg += "실패: " + failed.length + "개\n";
    resultMsg += "\n저장 경로: " + settings.outputPath;
    
    if (failed.length > 0) {
        resultMsg += "\n\n실패한 레이어:\n";
        for (var j = 0; j < Math.min(failed.length, 5); j++) {
            resultMsg += "- " + failed[j].name + ": " + failed[j].error + "\n";
        }
    }
    
    alert(resultMsg);
}

// 개별 레이어 내보내기
function exportLayer(doc, layer, settings) {
    // 레이어 타입 결정
    var layerName = layer.name;
    var layerType = "OTHER";
    var folderName = "";
    
    if (layerName.indexOf("CHAR_") === 0) {
        layerType = "CHAR";
        folderName = CONFIG.prefixes.CHAR;
    } else if (layerName.indexOf("BG_") === 0) {
        layerType = "BG";
        folderName = CONFIG.prefixes.BG;
    } else if (layerName.indexOf("PROP_") === 0) {
        layerType = "PROP";
        folderName = CONFIG.prefixes.PROP;
    } else if (layerName.indexOf("FX_") === 0) {
        layerType = "FX";
        folderName = CONFIG.prefixes.FX;
    } else {
        folderName = CONFIG.prefixes.CHAR;  // 기본값
    }
    
    // 파일명
    var fileName = settings.episodeId + "_" + layerName + ".png";
    var savePath = new File(settings.outputPath + "/" + folderName + "/" + fileName);
    
    // 임시 문서 생성
    var tempDoc = doc.duplicate();
    
    // 다른 레이어 삭제
    var tempLayers = getAllLayers(tempDoc);
    for (var i = tempLayers.length - 1; i >= 0; i--) {
        if (tempLayers[i].name !== layerName) {
            try {
                tempLayers[i].remove();
            } catch (e) {}
        }
    }
    
    // 투명 픽셀 자르기
    if (settings.trimLayers) {
        try {
            tempDoc.trim(TrimType.TRANSPARENT);
        } catch (e) {}
    }
    
    // PNG 옵션
    var pngOpts = new ExportOptionsSaveForWeb();
    pngOpts.format = SaveDocumentType.PNG;
    pngOpts.PNG8 = false;
    pngOpts.transparency = true;
    pngOpts.quality = 100;
    
    // 저장
    tempDoc.exportDocument(savePath, ExportType.SAVEFORWEB, pngOpts);
    
    // 레이어 정보 수집
    var layerInfo = {
        name: layerName,
        type: layerType,
        file: savePath.fsName,
        width: tempDoc.width.value,
        height: tempDoc.height.value,
        position: {
            x: layer.bounds[0].value,
            y: layer.bounds[1].value
        }
    };
    
    tempDoc.close(SaveOptions.DONOTSAVECHANGES);
    
    return layerInfo;
}

// 메타데이터 JSON 생성
function createMetadataJson(settings, layers) {
    var metadata = {
        episodeId: settings.episodeId,
        exportDate: new Date().toISOString(),
        totalLayers: layers.length,
        layers: []
    };
    
    // 레이어 정보 정리
    for (var i = 0; i < layers.length; i++) {
        metadata.layers.push({
            index: i,
            name: layers[i].name,
            type: layers[i].type,
            file: layers[i].file.replace(/\\/g, "/"),
            size: {
                width: layers[i].width,
                height: layers[i].height
            },
            position: layers[i].position
        });
    }
    
    // JSON 파일 저장
    var jsonFile = new File(settings.outputPath + "/" + settings.episodeId + "_metadata.json");
    jsonFile.encoding = "UTF-8";
    jsonFile.open("w");
    jsonFile.write(JSON.stringify(metadata, null, 2));
    jsonFile.close();
}

// After Effects 임포트 파일 생성
function createAEImportFile(settings, layers) {
    var aeScript = '// After Effects Import Script for ' + settings.episodeId + '\n';
    aeScript += '// Generated: ' + new Date().toString() + '\n\n';
    aeScript += 'var projectFolder = "' + settings.outputPath.replace(/\\/g, "/") + '";\n\n';
    aeScript += 'function importJujuEnglishAssets() {\n';
    aeScript += '    var importedItems = [];\n\n';
    
    // 파일 임포트 코드 생성
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var relativePath = layer.file.replace(settings.outputPath, "").replace(/\\/g, "/");
        
        aeScript += '    // Import: ' + layer.name + '\n';
        aeScript += '    try {\n';
        aeScript += '        var file = new File(projectFolder + "' + relativePath + '");\n';
        aeScript += '        if (file.exists) {\n';
        aeScript += '            var imported = app.project.importFile(new ImportOptions(file));\n';
        aeScript += '            imported.name = "' + layer.name + '";\n';
        aeScript += '            importedItems.push(imported);\n';
        aeScript += '        }\n';
        aeScript += '    } catch (e) {}\n\n';
    }
    
    aeScript += '    return importedItems;\n';
    aeScript += '}\n\n';
    aeScript += 'importJujuEnglishAssets();\n';
    
    // 스크립트 파일 저장
    var scriptFile = new File(settings.outputPath + "/" + settings.episodeId + "_ae_import.jsx");
    scriptFile.encoding = "UTF-8";
    scriptFile.open("w");
    scriptFile.write(aeScript);
    scriptFile.close();
}

// JSON 지원 (구버전 ExtendScript)
if (typeof JSON === 'undefined') {
    var JSON = {
        stringify: function(obj, replacer, space) {
            var result = '';
            var indent = space || '';
            
            if (obj === null) return 'null';
            if (typeof obj === 'undefined') return undefined;
            if (typeof obj === 'string') return '"' + obj.replace(/"/g, '\\"') + '"';
            if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
            
            if (obj instanceof Array) {
                result = '[\n';
                for (var i = 0; i < obj.length; i++) {
                    if (i > 0) result += ',\n';
                    result += indent + '  ' + JSON.stringify(obj[i], null, indent + '  ');
                }
                result += '\n' + indent + ']';
                return result;
            }
            
            if (typeof obj === 'object') {
                var keys = [];
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) keys.push(key);
                }
                
                result = '{\n';
                for (var j = 0; j < keys.length; j++) {
                    if (j > 0) result += ',\n';
                    result += indent + '  "' + keys[j] + '": ' + JSON.stringify(obj[keys[j]], null, indent + '  ');
                }
                result += '\n' + indent + '}';
                return result;
            }
            
            return String(obj);
        }
    };
}

// 스크립트 실행
try {
    showMainDialog();
} catch (e) {
    alert("스크립트 오류: " + e.message);
}

