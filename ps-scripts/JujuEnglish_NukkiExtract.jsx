/**
 * JujuEnglish Nukki (배경 제거) 자동화 스크립트
 * 
 * 기능:
 * 1. 교재 이미지에서 캐릭터/오브젝트 자동 선택
 * 2. 배경 제거 및 누끼 추출
 * 3. 레이어 정리 및 명명
 * 4. PNG 내보내기
 * 
 * 사용법: Photoshop에서 File > Scripts > Browse에서 실행
 */

// @target photoshop
// @script "JujuEnglish Nukki Extract"

#target photoshop

// 설정
var CONFIG = {
    // 출력 폴더명
    outputFolder: "02_누끼",
    
    // 레이어 분류 접두사
    prefixes: {
        character: "CHAR_",
        background: "BG_",
        prop: "PROP_",
        effect: "FX_"
    },
    
    // PNG 내보내기 옵션
    pngOptions: {
        compression: 6,
        interlaced: false
    },
    
    // 자동 선택 허용 오차
    tolerance: 32,
    
    // 기본 페이지 수
    pageCount: 8
};

// 메인 UI
function showMainDialog() {
    var dialog = new Window("dialog", "주주잉글리시 누끼 추출 도구");
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
    
    var titleGroup = projectGroup.add("group");
    titleGroup.add("statictext", undefined, "에피소드 제목:");
    var titleInput = titleGroup.add("edittext", undefined, "The Little Red Hen");
    titleInput.characters = 30;
    
    // 작업 옵션
    var optionsGroup = dialog.add("panel", undefined, "작업 옵션");
    optionsGroup.alignChildren = ["fill", "top"];
    optionsGroup.margins = 15;
    
    var autoSelect = optionsGroup.add("checkbox", undefined, "자동 배경 선택 사용");
    autoSelect.value = true;
    
    var refineMask = optionsGroup.add("checkbox", undefined, "선택 영역 다듬기 (Select and Mask)");
    refineMask.value = true;
    
    var createLayers = optionsGroup.add("checkbox", undefined, "레이어 자동 분리");
    createLayers.value = true;
    
    var exportPng = optionsGroup.add("checkbox", undefined, "PNG 자동 내보내기");
    exportPng.value = true;
    
    // 레이어 분류
    var layerGroup = dialog.add("panel", undefined, "레이어 분류 (현재 레이어에 적용)");
    layerGroup.alignChildren = ["fill", "top"];
    layerGroup.margins = 15;
    
    var layerTypeGroup = layerGroup.add("group");
    layerTypeGroup.add("statictext", undefined, "레이어 유형:");
    var layerType = layerTypeGroup.add("dropdownlist", undefined, 
        ["캐릭터 (CHAR)", "배경 (BG)", "소품 (PROP)", "효과 (FX)"]);
    layerType.selection = 0;
    
    var layerNameGroup = layerGroup.add("group");
    layerNameGroup.add("statictext", undefined, "레이어 이름:");
    var layerNameInput = layerNameGroup.add("edittext", undefined, "001");
    layerNameInput.characters = 20;
    
    var applyNameBtn = layerGroup.add("button", undefined, "레이어 이름 적용");
    applyNameBtn.onClick = function() {
        if (!app.activeDocument || !app.activeDocument.activeLayer) {
            alert("활성화된 레이어가 없습니다.");
            return;
        }
        
        var prefixes = ["CHAR_", "BG_", "PROP_", "FX_"];
        var prefix = prefixes[layerType.selection.index];
        var newName = prefix + layerNameInput.text;
        
        app.activeDocument.activeLayer.name = newName;
        alert("레이어 이름이 '" + newName + "'(으)로 변경되었습니다.");
    };
    
    // 작업 버튼
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = ["center", "top"];
    
    var processBtn = buttonGroup.add("button", undefined, "누끼 추출 시작");
    var batchBtn = buttonGroup.add("button", undefined, "배치 처리");
    var cancelBtn = buttonGroup.add("button", undefined, "취소");
    
    // 이벤트 핸들러
    processBtn.onClick = function() {
        if (!app.activeDocument) {
            alert("열린 문서가 없습니다.");
            return;
        }
        
        var settings = {
            episodeId: epInput.text,
            title: titleInput.text,
            autoSelect: autoSelect.value,
            refineMask: refineMask.value,
            createLayers: createLayers.value,
            exportPng: exportPng.value
        };
        
        dialog.close();
        processCurrentDocument(settings);
    };
    
    batchBtn.onClick = function() {
        dialog.close();
        showBatchDialog();
    };
    
    cancelBtn.onClick = function() {
        dialog.close();
    };
    
    dialog.show();
}

// 배치 처리 다이얼로그
function showBatchDialog() {
    var dialog = new Window("dialog", "배치 누끼 추출");
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];
    
    // 입력 폴더
    var inputGroup = dialog.add("panel", undefined, "입력 폴더");
    inputGroup.alignChildren = ["fill", "top"];
    inputGroup.margins = 15;
    
    var inputPathGroup = inputGroup.add("group");
    var inputPath = inputPathGroup.add("edittext", undefined, "");
    inputPath.characters = 40;
    var inputBrowse = inputPathGroup.add("button", undefined, "찾아보기...");
    
    inputBrowse.onClick = function() {
        var folder = Folder.selectDialog("입력 폴더 선택");
        if (folder) inputPath.text = folder.fsName;
    };
    
    // 출력 폴더
    var outputGroup = dialog.add("panel", undefined, "출력 폴더");
    outputGroup.alignChildren = ["fill", "top"];
    outputGroup.margins = 15;
    
    var outputPathGroup = outputGroup.add("group");
    var outputPath = outputPathGroup.add("edittext", undefined, "");
    outputPath.characters = 40;
    var outputBrowse = outputPathGroup.add("button", undefined, "찾아보기...");
    
    outputBrowse.onClick = function() {
        var folder = Folder.selectDialog("출력 폴더 선택");
        if (folder) outputPath.text = folder.fsName;
    };
    
    // 옵션
    var optionsGroup = dialog.add("panel", undefined, "배치 옵션");
    optionsGroup.alignChildren = ["fill", "top"];
    optionsGroup.margins = 15;
    
    var fileTypes = optionsGroup.add("checkbox", undefined, "JPG/PNG 파일만 처리");
    fileTypes.value = true;
    
    var preserveStructure = optionsGroup.add("checkbox", undefined, "폴더 구조 유지");
    preserveStructure.value = true;
    
    // 버튼
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = ["center", "top"];
    
    var startBtn = buttonGroup.add("button", undefined, "배치 처리 시작");
    var cancelBtn = buttonGroup.add("button", undefined, "취소");
    
    startBtn.onClick = function() {
        if (!inputPath.text || !outputPath.text) {
            alert("입력/출력 폴더를 선택해주세요.");
            return;
        }
        
        dialog.close();
        processBatch(inputPath.text, outputPath.text, {
            fileTypes: fileTypes.value,
            preserveStructure: preserveStructure.value
        });
    };
    
    cancelBtn.onClick = function() {
        dialog.close();
    };
    
    dialog.show();
}

// 현재 문서 처리
function processCurrentDocument(settings) {
    var doc = app.activeDocument;
    
    try {
        // 히스토리 상태 저장
        var savedState = doc.activeHistoryState;
        
        // 1. 배경 자동 선택
        if (settings.autoSelect) {
            selectBackground();
        }
        
        // 2. 선택 영역 반전 (배경 → 객체)
        doc.selection.invert();
        
        // 3. 선택 영역 다듬기
        if (settings.refineMask) {
            refineSelection();
        }
        
        // 4. 선택 영역을 새 레이어로
        if (settings.createLayers) {
            var newLayer = doc.artLayers.add();
            doc.selection.copy();
            doc.paste();
            newLayer.name = CONFIG.prefixes.character + "001";
        }
        
        // 5. PNG 내보내기
        if (settings.exportPng) {
            exportLayerAsPNG(doc.activeLayer, settings.episodeId, settings.title);
        }
        
        alert("누끼 추출이 완료되었습니다!");
        
    } catch (e) {
        alert("오류 발생: " + e.message);
        // 원래 상태로 복원
        doc.activeHistoryState = savedState;
    }
}

// 배경 자동 선택 (Magic Wand 도구 시뮬레이션)
function selectBackground() {
    var doc = app.activeDocument;
    
    // 이미지 좌상단 모서리 선택 (보통 배경)
    var idMagicWand = stringIDToTypeID("magicWandTool");
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    
    ref.putProperty(charIDToTypeID("Chnl"), charIDToTypeID("fsel"));
    desc.putReference(charIDToTypeID("null"), ref);
    
    var clickPoint = new ActionDescriptor();
    clickPoint.putUnitDouble(charIDToTypeID("Hrzn"), charIDToTypeID("#Pxl"), 0);
    clickPoint.putUnitDouble(charIDToTypeID("Vrtc"), charIDToTypeID("#Pxl"), 0);
    desc.putObject(charIDToTypeID("T   "), charIDToTypeID("Pnt "), clickPoint);
    
    desc.putInteger(charIDToTypeID("Tlrn"), CONFIG.tolerance);
    desc.putBoolean(charIDToTypeID("AntA"), true);
    desc.putBoolean(charIDToTypeID("Cntg"), true);
    
    executeAction(charIDToTypeID("setd"), desc, DialogModes.NO);
    
    // 유사 색상 영역 확장
    try {
        var idGrow = charIDToTypeID("Grow");
        executeAction(idGrow, undefined, DialogModes.NO);
    } catch (e) {}
}

// 선택 영역 다듬기
function refineSelection() {
    try {
        // Select and Mask 또는 Refine Edge 실행
        var desc = new ActionDescriptor();
        desc.putUnitDouble(charIDToTypeID("Rdus"), charIDToTypeID("#Pxl"), 2);
        desc.putBoolean(charIDToTypeID("Smth"), true);
        desc.putUnitDouble(charIDToTypeID("Fthr"), charIDToTypeID("#Pxl"), 1);
        desc.putUnitDouble(charIDToTypeID("Cntr"), charIDToTypeID("#Prc"), 10);
        desc.putUnitDouble(charIDToTypeID("ShfE"), charIDToTypeID("#Prc"), -5);
        
        executeAction(stringIDToTypeID("refineSelectionEdge"), desc, DialogModes.NO);
    } catch (e) {
        // 구버전 Photoshop - Smooth 적용
        try {
            var idSmth = charIDToTypeID("Smth");
            var desc2 = new ActionDescriptor();
            desc2.putUnitDouble(charIDToTypeID("Rdus"), charIDToTypeID("#Pxl"), 2);
            executeAction(idSmth, desc2, DialogModes.NO);
        } catch (e2) {}
    }
}

// 레이어를 PNG로 내보내기
function exportLayerAsPNG(layer, episodeId, title) {
    var doc = app.activeDocument;
    var docPath = doc.path;
    
    // 출력 폴더 생성
    var outputFolder = new Folder(docPath + "/" + CONFIG.outputFolder);
    if (!outputFolder.exists) {
        outputFolder.create();
    }
    
    // 캐릭터/배경/소품 하위 폴더 생성
    var subFolders = ["캐릭터", "배경", "소품", "효과"];
    for (var i = 0; i < subFolders.length; i++) {
        var subFolder = new Folder(outputFolder + "/" + subFolders[i]);
        if (!subFolder.exists) {
            subFolder.create();
        }
    }
    
    // 레이어 이름으로 저장 폴더 결정
    var layerName = layer.name;
    var saveFolder = outputFolder + "/캐릭터"; // 기본값
    
    if (layerName.indexOf("BG_") === 0) {
        saveFolder = outputFolder + "/배경";
    } else if (layerName.indexOf("PROP_") === 0) {
        saveFolder = outputFolder + "/소품";
    } else if (layerName.indexOf("FX_") === 0) {
        saveFolder = outputFolder + "/효과";
    }
    
    // 파일명 생성
    var fileName = episodeId + "_" + layerName + ".png";
    var savePath = new File(saveFolder + "/" + fileName);
    
    // PNG 옵션 설정
    var pngOpts = new ExportOptionsSaveForWeb();
    pngOpts.format = SaveDocumentType.PNG;
    pngOpts.PNG8 = false;
    pngOpts.transparency = true;
    pngOpts.interlaced = CONFIG.pngOptions.interlaced;
    pngOpts.quality = 100;
    
    // 임시 문서 생성 후 내보내기
    var tempDoc = doc.duplicate();
    
    // 다른 레이어 숨기기
    for (var i = 0; i < tempDoc.artLayers.length; i++) {
        if (tempDoc.artLayers[i].name !== layer.name) {
            tempDoc.artLayers[i].visible = false;
        }
    }
    
    // 투명 픽셀 자르기
    try {
        tempDoc.trim(TrimType.TRANSPARENT);
    } catch (e) {}
    
    // 저장
    tempDoc.exportDocument(savePath, ExportType.SAVEFORWEB, pngOpts);
    tempDoc.close(SaveOptions.DONOTSAVECHANGES);
    
    return savePath;
}

// 배치 처리
function processBatch(inputPath, outputPath, options) {
    var inputFolder = new Folder(inputPath);
    var outputFolder = new Folder(outputPath);
    
    if (!outputFolder.exists) {
        outputFolder.create();
    }
    
    // 파일 목록 가져오기
    var files;
    if (options.fileTypes) {
        files = inputFolder.getFiles(/\.(jpg|jpeg|png|psd|tif|tiff)$/i);
    } else {
        files = inputFolder.getFiles();
    }
    
    var processedCount = 0;
    var errorCount = 0;
    var errors = [];
    
    // 진행 표시
    var progressWin = new Window("palette", "배치 처리 중...");
    progressWin.add("statictext", undefined, "처리 중: 0 / " + files.length);
    progressWin.show();
    
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        
        if (file instanceof File) {
            try {
                // 파일 열기
                var doc = app.open(file);
                
                // 처리
                var settings = {
                    episodeId: extractEpisodeId(file.name),
                    title: file.name.replace(/\.[^/.]+$/, ""),
                    autoSelect: true,
                    refineMask: true,
                    createLayers: true,
                    exportPng: true
                };
                
                processCurrentDocument(settings);
                
                // 문서 닫기
                doc.close(SaveOptions.DONOTSAVECHANGES);
                
                processedCount++;
                
            } catch (e) {
                errorCount++;
                errors.push(file.name + ": " + e.message);
            }
        }
        
        // 진행 상태 업데이트
        progressWin.children[0].text = "처리 중: " + (i + 1) + " / " + files.length;
    }
    
    progressWin.close();
    
    // 결과 보고
    var resultMsg = "배치 처리 완료!\n\n";
    resultMsg += "성공: " + processedCount + "개\n";
    resultMsg += "실패: " + errorCount + "개";
    
    if (errors.length > 0) {
        resultMsg += "\n\n오류 목록:\n" + errors.join("\n");
    }
    
    alert(resultMsg);
}

// 파일명에서 에피소드 ID 추출
function extractEpisodeId(fileName) {
    var match = fileName.match(/EP\d{3}/i);
    return match ? match[0].toUpperCase() : "EP001";
}

// 레이어 구조 검증
function validateLayerStructure() {
    if (!app.activeDocument) {
        alert("열린 문서가 없습니다.");
        return;
    }
    
    var doc = app.activeDocument;
    var report = "레이어 구조 검증 결과\n";
    report += "=====================\n\n";
    
    var characters = [];
    var backgrounds = [];
    var props = [];
    var effects = [];
    var unnamed = [];
    
    for (var i = 0; i < doc.artLayers.length; i++) {
        var layer = doc.artLayers[i];
        var name = layer.name;
        
        if (name.indexOf("CHAR_") === 0) {
            characters.push(name);
        } else if (name.indexOf("BG_") === 0) {
            backgrounds.push(name);
        } else if (name.indexOf("PROP_") === 0) {
            props.push(name);
        } else if (name.indexOf("FX_") === 0) {
            effects.push(name);
        } else {
            unnamed.push(name);
        }
    }
    
    report += "캐릭터 (CHAR_): " + characters.length + "개\n";
    report += characters.join(", ") + "\n\n";
    
    report += "배경 (BG_): " + backgrounds.length + "개\n";
    report += backgrounds.join(", ") + "\n\n";
    
    report += "소품 (PROP_): " + props.length + "개\n";
    report += props.join(", ") + "\n\n";
    
    report += "효과 (FX_): " + effects.length + "개\n";
    report += effects.join(", ") + "\n\n";
    
    if (unnamed.length > 0) {
        report += "⚠️ 미분류 레이어: " + unnamed.length + "개\n";
        report += unnamed.join(", ") + "\n";
        report += "\n레이어 이름 규칙을 적용해주세요!";
    } else {
        report += "✅ 모든 레이어가 올바르게 분류되었습니다!";
    }
    
    alert(report);
}

// 모든 레이어 일괄 내보내기
function exportAllLayers() {
    if (!app.activeDocument) {
        alert("열린 문서가 없습니다.");
        return;
    }
    
    var doc = app.activeDocument;
    var episodeId = prompt("에피소드 ID를 입력하세요:", "EP001");
    
    if (!episodeId) return;
    
    var exportedCount = 0;
    
    for (var i = 0; i < doc.artLayers.length; i++) {
        var layer = doc.artLayers[i];
        
        // 빈 레이어 건너뛰기
        if (layer.bounds[2] - layer.bounds[0] === 0 || 
            layer.bounds[3] - layer.bounds[1] === 0) {
            continue;
        }
        
        try {
            exportLayerAsPNG(layer, episodeId, "");
            exportedCount++;
        } catch (e) {
            // 오류 무시하고 계속
        }
    }
    
    alert(exportedCount + "개의 레이어가 내보내졌습니다!");
}

// 스크립트 실행
try {
    showMainDialog();
} catch (e) {
    alert("스크립트 오류: " + e.message);
}

