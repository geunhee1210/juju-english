/**
 * JujuEnglish 배경 리터칭 자동화 스크립트
 * 
 * 기능:
 * 1. 누끼 영역을 선택하고 배경 확장
 * 2. Content-Aware Fill 적용
 * 3. Generative Fill을 위한 선택 영역 준비
 * 4. 배경 레이어 정리 및 내보내기
 * 
 * 사용법: Photoshop에서 File > Scripts > Browse에서 실행
 */

// @target photoshop
// @script "JujuEnglish Background Fill"

#target photoshop

// 설정
var CONFIG = {
    expandPixels: 20,  // 선택 영역 확장 픽셀
    featherPixels: 5,  // 가장자리 페더 값
    bgPrefix: "BG_",
    outputFolder: "02_누끼/배경"
};

// 메인 UI
function showMainDialog() {
    var dialog = new Window("dialog", "주주잉글리시 배경 리터칭 도구");
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];
    
    // 작업 옵션
    var optionsGroup = dialog.add("panel", undefined, "배경 채우기 옵션");
    optionsGroup.alignChildren = ["fill", "top"];
    optionsGroup.margins = 15;
    
    // 확장 픽셀
    var expandGroup = optionsGroup.add("group");
    expandGroup.add("statictext", undefined, "선택 영역 확장 (px):");
    var expandSlider = expandGroup.add("slider", undefined, 20, 0, 100);
    var expandValue = expandGroup.add("statictext", undefined, "20");
    expandValue.characters = 4;
    
    expandSlider.onChanging = function() {
        expandValue.text = Math.round(expandSlider.value);
    };
    
    // 페더 픽셀
    var featherGroup = optionsGroup.add("group");
    featherGroup.add("statictext", undefined, "가장자리 페더 (px):");
    var featherSlider = featherGroup.add("slider", undefined, 5, 0, 30);
    var featherValue = featherGroup.add("statictext", undefined, "5");
    featherValue.characters = 4;
    
    featherSlider.onChanging = function() {
        featherValue.text = Math.round(featherSlider.value);
    };
    
    // 채우기 방식
    var fillGroup = dialog.add("panel", undefined, "채우기 방식");
    fillGroup.alignChildren = ["fill", "top"];
    fillGroup.margins = 15;
    
    var fillMethod = fillGroup.add("dropdownlist", undefined, [
        "Content-Aware Fill",
        "Generative Fill 준비 (선택 영역만)",
        "단색 채우기",
        "그라데이션 채우기"
    ]);
    fillMethod.selection = 0;
    
    // 단색 옵션
    var colorGroup = fillGroup.add("group");
    colorGroup.add("statictext", undefined, "배경색:");
    var colorBtn = colorGroup.add("button", undefined, "색상 선택...");
    var selectedColor = { r: 255, g: 255, b: 255 };
    
    colorBtn.onClick = function() {
        var color = app.foregroundColor;
        if ($.os.indexOf("Mac") !== -1) {
            // Mac에서 색상 피커 열기
            app.showColorPicker();
            selectedColor = {
                r: app.foregroundColor.rgb.red,
                g: app.foregroundColor.rgb.green,
                b: app.foregroundColor.rgb.blue
            };
        } else {
            alert("Photoshop에서 전경색을 설정한 후 사용하세요.");
        }
    };
    
    // 작업 버튼
    var actionGroup = dialog.add("panel", undefined, "작업");
    actionGroup.alignChildren = ["fill", "top"];
    actionGroup.margins = 15;
    
    var selectNukki = actionGroup.add("button", undefined, "1. 누끼 영역 선택 (투명 픽셀)");
    var invertSel = actionGroup.add("button", undefined, "2. 선택 영역 반전");
    var expandSel = actionGroup.add("button", undefined, "3. 선택 영역 확장 및 페더");
    var applyFill = actionGroup.add("button", undefined, "4. 채우기 적용");
    var exportBg = actionGroup.add("button", undefined, "5. 배경 PNG 내보내기");
    
    // 이벤트 핸들러
    selectNukki.onClick = function() {
        selectTransparentPixels();
    };
    
    invertSel.onClick = function() {
        invertSelection();
    };
    
    expandSel.onClick = function() {
        expandAndFeatherSelection(
            Math.round(expandSlider.value),
            Math.round(featherSlider.value)
        );
    };
    
    applyFill.onClick = function() {
        var method = fillMethod.selection.index;
        switch (method) {
            case 0:
                applyContentAwareFill();
                break;
            case 1:
                alert("선택 영역이 준비되었습니다.\nEdit > Generative Fill을 사용하세요.");
                break;
            case 2:
                applySolidFill(selectedColor);
                break;
            case 3:
                applyGradientFill();
                break;
        }
    };
    
    exportBg.onClick = function() {
        var episodeId = prompt("에피소드 ID:", "EP001");
        if (episodeId) {
            exportBackgroundLayer(episodeId);
        }
    };
    
    // 일괄 처리 버튼
    var batchGroup = dialog.add("group");
    batchGroup.alignment = ["center", "top"];
    
    var autoProcess = batchGroup.add("button", undefined, "자동 배경 처리");
    var closeBtn = batchGroup.add("button", undefined, "닫기");
    
    autoProcess.onClick = function() {
        var settings = {
            expand: Math.round(expandSlider.value),
            feather: Math.round(featherSlider.value),
            fillMethod: fillMethod.selection.index
        };
        
        autoProcessBackground(settings);
    };
    
    closeBtn.onClick = function() {
        dialog.close();
    };
    
    dialog.show();
}

// 투명 픽셀 선택
function selectTransparentPixels() {
    if (!app.activeDocument) {
        alert("열린 문서가 없습니다.");
        return;
    }
    
    try {
        var idChnl = charIDToTypeID("Chnl");
        var idTrsp = charIDToTypeID("Trsp");
        var idSetd = charIDToTypeID("setd");
        var idnull = charIDToTypeID("null");
        var idT = charIDToTypeID("T   ");
        var idOrdn = charIDToTypeID("Ordn");
        
        var ref = new ActionReference();
        ref.putProperty(idChnl, charIDToTypeID("fsel"));
        
        var ref2 = new ActionReference();
        ref2.putEnumerated(idChnl, idChnl, idTrsp);
        
        var desc = new ActionDescriptor();
        desc.putReference(idnull, ref);
        desc.putReference(idT, ref2);
        
        executeAction(idSetd, desc, DialogModes.NO);
        
        alert("투명 픽셀이 선택되었습니다.");
    } catch (e) {
        alert("오류: " + e.message);
    }
}

// 선택 영역 반전
function invertSelection() {
    if (!app.activeDocument) {
        alert("열린 문서가 없습니다.");
        return;
    }
    
    try {
        app.activeDocument.selection.invert();
        alert("선택 영역이 반전되었습니다.");
    } catch (e) {
        alert("선택 영역이 없습니다.");
    }
}

// 선택 영역 확장 및 페더
function expandAndFeatherSelection(expandPx, featherPx) {
    if (!app.activeDocument) {
        alert("열린 문서가 없습니다.");
        return;
    }
    
    var doc = app.activeDocument;
    
    try {
        // 선택 영역 확장
        if (expandPx > 0) {
            doc.selection.expand(UnitValue(expandPx, "px"));
        }
        
        // 페더 적용
        if (featherPx > 0) {
            doc.selection.feather(UnitValue(featherPx, "px"));
        }
        
        alert("선택 영역이 확장되고 페더가 적용되었습니다.");
    } catch (e) {
        alert("선택 영역이 없습니다.");
    }
}

// Content-Aware Fill 적용
function applyContentAwareFill() {
    if (!app.activeDocument) {
        alert("열린 문서가 없습니다.");
        return;
    }
    
    try {
        // Content-Aware Fill 실행
        var idFl = charIDToTypeID("Fl  ");
        var desc = new ActionDescriptor();
        
        desc.putEnumerated(
            charIDToTypeID("Usng"),
            charIDToTypeID("FlCn"),
            stringIDToTypeID("contentAware")
        );
        
        desc.putEnumerated(
            charIDToTypeID("Md  "),
            charIDToTypeID("BlnM"),
            charIDToTypeID("Nrml")
        );
        
        desc.putUnitDouble(
            charIDToTypeID("Opct"),
            charIDToTypeID("#Prc"),
            100
        );
        
        executeAction(idFl, desc, DialogModes.NO);
        
        // 선택 해제
        app.activeDocument.selection.deselect();
        
        alert("Content-Aware Fill이 적용되었습니다.");
    } catch (e) {
        alert("오류: " + e.message + "\n선택 영역을 확인하세요.");
    }
}

// 단색 채우기
function applySolidFill(color) {
    if (!app.activeDocument) {
        alert("열린 문서가 없습니다.");
        return;
    }
    
    try {
        var doc = app.activeDocument;
        
        // 색상 설정
        var fillColor = new SolidColor();
        fillColor.rgb.red = color.r;
        fillColor.rgb.green = color.g;
        fillColor.rgb.blue = color.b;
        
        doc.selection.fill(fillColor, ColorBlendMode.NORMAL, 100);
        doc.selection.deselect();
        
        alert("단색으로 채워졌습니다.");
    } catch (e) {
        alert("오류: " + e.message);
    }
}

// 그라데이션 채우기
function applyGradientFill() {
    if (!app.activeDocument) {
        alert("열린 문서가 없습니다.");
        return;
    }
    
    try {
        // 그라데이션 도구 사용 (전경색 → 배경색)
        var idGrdn = charIDToTypeID("Grdn");
        var desc = new ActionDescriptor();
        var desc2 = new ActionDescriptor();
        
        desc2.putString(charIDToTypeID("Nm  "), "Foreground to Background");
        desc2.putEnumerated(
            charIDToTypeID("GrdF"),
            charIDToTypeID("GrdF"),
            charIDToTypeID("CstS")
        );
        
        desc.putObject(charIDToTypeID("Grad"), charIDToTypeID("Grdn"), desc2);
        desc.putEnumerated(
            charIDToTypeID("Type"),
            charIDToTypeID("GrdT"),
            charIDToTypeID("Lnr ")
        );
        
        desc.putUnitDouble(
            charIDToTypeID("Angl"),
            charIDToTypeID("#Ang"),
            90
        );
        
        executeAction(idGrdn, desc, DialogModes.NO);
        
        app.activeDocument.selection.deselect();
        
        alert("그라데이션으로 채워졌습니다.");
    } catch (e) {
        alert("오류: " + e.message);
    }
}

// 자동 배경 처리
function autoProcessBackground(settings) {
    if (!app.activeDocument) {
        alert("열린 문서가 없습니다.");
        return;
    }
    
    try {
        // 1. 투명 픽셀 선택
        selectTransparentPixels();
        
        // 2. 선택 영역 확장 및 페더
        expandAndFeatherSelection(settings.expand, settings.feather);
        
        // 3. 채우기 적용
        if (settings.fillMethod === 0) {
            applyContentAwareFill();
        } else {
            alert("선택 영역이 준비되었습니다.\nGenerative Fill 또는 수동 채우기를 진행하세요.");
        }
        
    } catch (e) {
        alert("자동 처리 중 오류: " + e.message);
    }
}

// 배경 레이어 PNG 내보내기
function exportBackgroundLayer(episodeId) {
    if (!app.activeDocument) {
        alert("열린 문서가 없습니다.");
        return;
    }
    
    var doc = app.activeDocument;
    
    try {
        // 출력 폴더 생성
        var outputPath = doc.path + "/" + CONFIG.outputFolder;
        var outputFolder = new Folder(outputPath);
        if (!outputFolder.exists) {
            outputFolder.create();
        }
        
        // 파일명
        var fileName = episodeId + "_" + CONFIG.bgPrefix + "main.png";
        var savePath = new File(outputPath + "/" + fileName);
        
        // PNG 옵션
        var pngOpts = new ExportOptionsSaveForWeb();
        pngOpts.format = SaveDocumentType.PNG;
        pngOpts.PNG8 = false;
        pngOpts.transparency = false;  // 배경은 불투명
        pngOpts.quality = 100;
        
        // 내보내기
        doc.exportDocument(savePath, ExportType.SAVEFORWEB, pngOpts);
        
        alert("배경이 저장되었습니다:\n" + savePath.fsName);
    } catch (e) {
        alert("내보내기 오류: " + e.message);
    }
}

// 배경 확장 (캔버스 크기 증가)
function extendCanvasForBackground() {
    if (!app.activeDocument) {
        alert("열린 문서가 없습니다.");
        return;
    }
    
    var doc = app.activeDocument;
    
    var dialog = new Window("dialog", "캔버스 확장");
    dialog.orientation = "column";
    
    var widthGroup = dialog.add("group");
    widthGroup.add("statictext", undefined, "확장 비율 (%):");
    var extensionPercent = widthGroup.add("edittext", undefined, "120");
    extensionPercent.characters = 5;
    
    var anchorGroup = dialog.add("group");
    anchorGroup.add("statictext", undefined, "기준점:");
    var anchor = anchorGroup.add("dropdownlist", undefined, [
        "중앙", "상단", "하단", "좌측", "우측"
    ]);
    anchor.selection = 0;
    
    var btnGroup = dialog.add("group");
    var okBtn = btnGroup.add("button", undefined, "확장");
    var cancelBtn = btnGroup.add("button", undefined, "취소");
    
    okBtn.onClick = function() {
        var percent = parseInt(extensionPercent.text) / 100;
        var newWidth = doc.width.value * percent;
        var newHeight = doc.height.value * percent;
        
        var anchorPositions = [
            AnchorPosition.MIDDLECENTER,
            AnchorPosition.TOPCENTER,
            AnchorPosition.BOTTOMCENTER,
            AnchorPosition.MIDDLELEFT,
            AnchorPosition.MIDDLERIGHT
        ];
        
        doc.resizeCanvas(
            UnitValue(newWidth, "px"),
            UnitValue(newHeight, "px"),
            anchorPositions[anchor.selection.index]
        );
        
        dialog.close();
        alert("캔버스가 확장되었습니다.");
    };
    
    cancelBtn.onClick = function() {
        dialog.close();
    };
    
    dialog.show();
}

// 스크립트 실행
try {
    showMainDialog();
} catch (e) {
    alert("스크립트 오류: " + e.message);
}

