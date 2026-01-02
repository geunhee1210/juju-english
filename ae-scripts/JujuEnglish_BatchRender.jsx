/**
 * 주주잉글리시 배치 렌더링 스크립트
 * 여러 컴포지션을 렌더링 큐에 추가하고 설정합니다.
 * 
 * 사용법: After Effects에서 스크립트 실행
 */

// @target aftereffects

(function() {

    // 렌더링 설정
    var RENDER_CONFIG = {
        // 출력 설정
        output: {
            format: "H.264",              // H.264 (MP4)
            codec: "H.264",
            quality: 100,
            resolution: [1920, 1080],
            frameRate: 24
        },
        
        // 프리뷰 설정
        preview: {
            format: "H.264",
            quality: 50,
            resolution: [960, 540],
            suffix: "_preview"
        },
        
        // 파일 네이밍
        naming: {
            pattern: "[episodeId]_[compName]_[date]",
            dateFormat: "YYMMDD"
        }
    };

    // 메인 함수
    function main() {
        // UI 생성
        var dialog = createDialog();
        dialog.show();
    }

    // UI 다이얼로그
    function createDialog() {
        var dialog = new Window("dialog", "주주잉글리시 배치 렌더링");
        dialog.orientation = "column";
        dialog.alignChildren = ["fill", "top"];

        // 컴포지션 선택 패널
        var compPanel = dialog.add("panel", undefined, "렌더링할 컴포지션");
        compPanel.alignChildren = ["fill", "top"];
        compPanel.preferredSize.height = 200;

        var compList = compPanel.add("listbox", undefined, [], {
            multiselect: true
        });
        compList.preferredSize = [350, 150];

        // 컴포지션 목록 채우기 (EP로 시작하는 메인 컴프)
        var mainComps = [];
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof CompItem && item.name.match(/^EP\d{3}_Main$/)) {
                mainComps.push(item);
                compList.add("item", item.name);
            }
        }

        // 전체 선택 버튼
        var selectGroup = compPanel.add("group");
        var selectAllBtn = selectGroup.add("button", undefined, "전체 선택");
        var deselectBtn = selectGroup.add("button", undefined, "선택 해제");
        
        selectAllBtn.onClick = function() {
            for (var i = 0; i < compList.items.length; i++) {
                compList.items[i].selected = true;
            }
        };
        
        deselectBtn.onClick = function() {
            for (var i = 0; i < compList.items.length; i++) {
                compList.items[i].selected = false;
            }
        };

        // 렌더링 옵션
        var optionPanel = dialog.add("panel", undefined, "렌더링 옵션");
        optionPanel.alignChildren = ["left", "top"];

        var rbFinal = optionPanel.add("radiobutton", undefined, "최종본 (1920x1080, 고화질)");
        rbFinal.value = true;
        var rbPreview = optionPanel.add("radiobutton", undefined, "프리뷰 (960x540, 저화질)");
        
        var cbOpenFolder = optionPanel.add("checkbox", undefined, "렌더링 후 폴더 열기");
        cbOpenFolder.value = true;

        // 출력 경로
        var pathPanel = dialog.add("panel", undefined, "출력 경로");
        pathPanel.alignChildren = ["fill", "top"];
        
        var pathGroup = pathPanel.add("group");
        pathGroup.alignChildren = ["left", "center"];
        
        var pathInput = pathGroup.add("edittext", undefined, "");
        pathInput.preferredSize.width = 280;
        pathInput.text = Folder.desktop.fsName + "/JujuEnglish_Render";
        
        var browseBtn = pathGroup.add("button", undefined, "...");
        browseBtn.onClick = function() {
            var folder = Folder.selectDialog("출력 폴더 선택");
            if (folder) {
                pathInput.text = folder.fsName;
            }
        };

        // 버튼
        var buttonGroup = dialog.add("group");
        buttonGroup.alignment = ["right", "top"];
        
        var cancelBtn = buttonGroup.add("button", undefined, "취소");
        var addBtn = buttonGroup.add("button", undefined, "큐에 추가");
        var renderBtn = buttonGroup.add("button", undefined, "즉시 렌더링");
        
        cancelBtn.onClick = function() {
            dialog.close();
        };
        
        addBtn.onClick = function() {
            var selectedComps = getSelectedComps(compList, mainComps);
            if (selectedComps.length === 0) {
                alert("렌더링할 컴포지션을 선택하세요.");
                return;
            }
            
            var outputPath = pathInput.text;
            var isPreview = rbPreview.value;
            
            addToRenderQueue(selectedComps, outputPath, isPreview);
            
            alert(selectedComps.length + "개 컴포지션이 렌더링 큐에 추가되었습니다.");
            dialog.close();
        };
        
        renderBtn.onClick = function() {
            var selectedComps = getSelectedComps(compList, mainComps);
            if (selectedComps.length === 0) {
                alert("렌더링할 컴포지션을 선택하세요.");
                return;
            }
            
            var outputPath = pathInput.text;
            var isPreview = rbPreview.value;
            
            addToRenderQueue(selectedComps, outputPath, isPreview);
            dialog.close();
            
            // 렌더링 시작
            app.project.renderQueue.render();
            
            // 폴더 열기
            if (cbOpenFolder.value) {
                var folder = new Folder(outputPath);
                if (folder.exists) {
                    folder.execute();
                }
            }
        };

        return dialog;
    }

    // 선택된 컴포지션 가져오기
    function getSelectedComps(list, comps) {
        var selected = [];
        for (var i = 0; i < list.items.length; i++) {
            if (list.items[i].selected) {
                selected.push(comps[i]);
            }
        }
        return selected;
    }

    // 렌더링 큐에 추가
    function addToRenderQueue(comps, outputPath, isPreview) {
        // 출력 폴더 생성
        var folder = new Folder(outputPath);
        if (!folder.exists) {
            folder.create();
        }

        var config = isPreview ? RENDER_CONFIG.preview : RENDER_CONFIG.output;
        var dateStr = getDateString();

        for (var i = 0; i < comps.length; i++) {
            var comp = comps[i];
            
            // 렌더링 큐에 추가
            var renderItem = app.project.renderQueue.items.add(comp);
            
            // 출력 모듈 설정
            var outputModule = renderItem.outputModule(1);
            
            // 파일명 생성
            var episodeId = comp.name.match(/EP\d{3}/)[0];
            var suffix = isPreview ? "_preview" : "_final";
            var filename = episodeId + suffix + "_" + dateStr + ".mp4";
            
            // 출력 경로 설정
            var outputFile = new File(outputPath + "/" + filename);
            outputModule.file = outputFile;
            
            // H.264 템플릿 적용 (있는 경우)
            try {
                outputModule.applyTemplate("H.264");
            } catch (e) {
                // 템플릿이 없으면 기본값 사용
            }
        }
    }

    // 날짜 문자열 생성
    function getDateString() {
        var d = new Date();
        var year = String(d.getFullYear()).slice(-2);
        var month = String(d.getMonth() + 1).padStart(2, "0");
        var day = String(d.getDate()).padStart(2, "0");
        return year + month + day;
    }

    // String padStart 폴리필
    if (!String.prototype.padStart) {
        String.prototype.padStart = function(targetLength, padString) {
            targetLength = targetLength >> 0;
            padString = String(typeof padString !== 'undefined' ? padString : ' ');
            if (this.length >= targetLength) {
                return String(this);
            }
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length);
            }
            return padString.slice(0, targetLength) + String(this);
        };
    }

    // 실행
    main();

})();

