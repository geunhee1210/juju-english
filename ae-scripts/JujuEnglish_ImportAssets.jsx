/**
 * 주주잉글리시 After Effects 자동화 스크립트
 * 애셋 일괄 가져오기 및 구성
 * 
 * 사용법: After Effects > File > Scripts > Run Script File
 */

// @target aftereffects

(function() {
    // 설정
    var CONFIG = {
        compWidth: 1920,
        compHeight: 1080,
        frameRate: 24,
        duration: 120, // 2분 (초)
        pixelAspect: 1,
    };

    // 레이어 그룹 정의
    var LAYER_GROUPS = {
        "배경": { order: 1, parent: null },
        "소품_뒤": { order: 2, parent: null },
        "캐릭터": { order: 3, parent: null },
        "소품_앞": { order: 4, parent: null },
        "효과": { order: 5, parent: null },
        "UI": { order: 6, parent: null }
    };

    // 메인 함수
    function main() {
        // 프로젝트 폴더 선택
        var projectFolder = Folder.selectDialog("프로젝트 폴더를 선택하세요 (EP001_xxx)");
        if (!projectFolder) {
            alert("폴더가 선택되지 않았습니다.");
            return;
        }

        // 에피소드 정보 추출
        var folderName = projectFolder.name;
        var episodeMatch = folderName.match(/EP(\d{3})/);
        if (!episodeMatch) {
            alert("올바른 프로젝트 폴더가 아닙니다.\n폴더명: EP001_xxx 형식이어야 합니다.");
            return;
        }

        var episodeNumber = episodeMatch[1];
        var episodeName = folderName.replace(/EP\d{3}_/, "");

        // 컴포지션 생성 확인
        var confirmCreate = confirm(
            "새 프로젝트를 생성합니다:\n\n" +
            "에피소드: EP" + episodeNumber + "\n" +
            "제목: " + episodeName + "\n" +
            "해상도: " + CONFIG.compWidth + "x" + CONFIG.compHeight + "\n" +
            "프레임레이트: " + CONFIG.frameRate + "fps\n" +
            "길이: " + (CONFIG.duration / 60) + "분\n\n" +
            "계속하시겠습니까?"
        );

        if (!confirmCreate) return;

        app.beginUndoGroup("주주잉글리시 프로젝트 생성");

        try {
            // 프로젝트 폴더 구조 생성
            var projectBin = createProjectBins(episodeNumber, episodeName);

            // 메인 컴포지션 생성
            var mainComp = createMainComposition(episodeNumber, episodeName);

            // 애셋 가져오기
            var assetCounts = importAssets(projectFolder, projectBin, mainComp);

            // 결과 보고
            alert(
                "프로젝트 생성 완료!\n\n" +
                "가져온 파일:\n" +
                "- 캐릭터: " + assetCounts.character + "개\n" +
                "- 배경: " + assetCounts.background + "개\n" +
                "- 소품: " + assetCounts.prop + "개\n" +
                "- 오디오: " + assetCounts.audio + "개"
            );

        } catch (e) {
            alert("오류 발생: " + e.toString());
        }

        app.endUndoGroup();
    }

    // 프로젝트 빈 구조 생성
    function createProjectBins(episodeNumber, episodeName) {
        var root = app.project;
        
        // 메인 폴더
        var mainBin = root.items.addFolder("EP" + episodeNumber + "_" + episodeName);
        
        // 하위 폴더
        var bins = {
            main: mainBin,
            comps: mainBin.items.addFolder("01_컴포지션"),
            characters: mainBin.items.addFolder("02_캐릭터"),
            backgrounds: mainBin.items.addFolder("03_배경"),
            props: mainBin.items.addFolder("04_소품"),
            audio: mainBin.items.addFolder("05_오디오"),
            precomps: mainBin.items.addFolder("06_프리컴프"),
            renders: mainBin.items.addFolder("07_렌더"),
        };

        return bins;
    }

    // 메인 컴포지션 생성
    function createMainComposition(episodeNumber, episodeName) {
        var compName = "EP" + episodeNumber + "_Main";
        
        var comp = app.project.items.addComp(
            compName,
            CONFIG.compWidth,
            CONFIG.compHeight,
            CONFIG.pixelAspect,
            CONFIG.duration,
            CONFIG.frameRate
        );

        // 마커 추가 (섹션 구분용)
        var markers = comp.markerProperty;
        
        // 인트로 마커
        var introMarker = new MarkerValue("인트로");
        markers.setValueAtTime(0, introMarker);
        
        // 본편 시작 마커
        var mainMarker = new MarkerValue("본편 시작");
        markers.setValueAtTime(5, mainMarker);
        
        // 아웃트로 마커
        var outroMarker = new MarkerValue("아웃트로");
        markers.setValueAtTime(CONFIG.duration - 10, outroMarker);

        // 가이드 레이어 추가
        createGuideLayer(comp);

        return comp;
    }

    // 가이드 레이어 생성
    function createGuideLayer(comp) {
        // Safe Zone 가이드
        var safeZone = comp.layers.addShape();
        safeZone.name = "[가이드] Safe Zone";
        safeZone.guideLayer = true;
        
        var contents = safeZone.property("Contents");
        var rectGroup = contents.addProperty("ADBE Vector Group");
        var rectPath = rectGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
        
        // 90% Safe Zone
        rectPath.property("Size").setValue([CONFIG.compWidth * 0.9, CONFIG.compHeight * 0.9]);
        
        var stroke = rectGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
        stroke.property("Color").setValue([1, 0, 0, 1]);
        stroke.property("Stroke Width").setValue(2);
        
        safeZone.moveToEnd();
    }

    // 애셋 가져오기
    function importAssets(projectFolder, bins, mainComp) {
        var counts = {
            character: 0,
            background: 0,
            prop: 0,
            audio: 0
        };

        // 누끼 폴더 경로
        var nukkiFolder = new Folder(projectFolder.fsName + "/02_누끼");
        var audioFolder = new Folder(projectFolder.fsName + "/05_오디오");

        // 캐릭터 가져오기
        var charFolder = new Folder(nukkiFolder.fsName + "/캐릭터");
        if (charFolder.exists) {
            counts.character = importFolderContents(charFolder, bins.characters, mainComp, "캐릭터");
        }

        // 배경 가져오기
        var bgFolder = new Folder(nukkiFolder.fsName + "/배경");
        if (bgFolder.exists) {
            counts.background = importFolderContents(bgFolder, bins.backgrounds, mainComp, "배경");
        }

        // 소품 가져오기
        var propFolder = new Folder(nukkiFolder.fsName + "/소품");
        if (propFolder.exists) {
            counts.prop = importFolderContents(propFolder, bins.props, mainComp, "소품");
        }

        // 오디오 가져오기
        if (audioFolder.exists) {
            var narrFolder = new Folder(audioFolder.fsName + "/내레이션");
            var bgmFolder = new Folder(audioFolder.fsName + "/BGM");
            
            if (narrFolder.exists) {
                counts.audio += importAudioFiles(narrFolder, bins.audio, mainComp, "내레이션");
            }
            if (bgmFolder.exists) {
                counts.audio += importAudioFiles(bgmFolder, bins.audio, mainComp, "BGM");
            }
        }

        return counts;
    }

    // 폴더 내용 가져오기
    function importFolderContents(folder, bin, comp, layerPrefix) {
        var files = folder.getFiles(function(f) {
            return f instanceof File && /\.(png|psd|tiff?|jpg|jpeg)$/i.test(f.name);
        });

        var count = 0;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            
            try {
                // 파일 가져오기
                var importOptions = new ImportOptions(file);
                
                // PSD 파일 처리
                if (/\.psd$/i.test(file.name)) {
                    importOptions.importAs = ImportAsType.COMP_CROPPED_LAYERS;
                }
                
                var item = app.project.importFile(importOptions);
                item.parentFolder = bin;
                
                // 컴포지션에 레이어 추가 (PSD가 아닌 경우)
                if (!(item instanceof CompItem)) {
                    var layer = comp.layers.add(item);
                    layer.name = layerPrefix + "_" + (count + 1).toString().padStart(3, "0");
                    
                    // 중앙 정렬
                    layer.position.setValue([CONFIG.compWidth / 2, CONFIG.compHeight / 2]);
                    
                    // 레이어 비활성화 (정리 후 활성화)
                    layer.enabled = false;
                }
                
                count++;
            } catch (e) {
                // 가져오기 실패 시 스킵
            }
        }

        return count;
    }

    // 오디오 파일 가져오기
    function importAudioFiles(folder, bin, comp, prefix) {
        var files = folder.getFiles(function(f) {
            return f instanceof File && /\.(wav|mp3|aiff?)$/i.test(f.name);
        });

        var count = 0;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            
            try {
                var importOptions = new ImportOptions(file);
                var item = app.project.importFile(importOptions);
                item.parentFolder = bin;
                
                // 컴포지션에 오디오 레이어 추가
                var layer = comp.layers.add(item);
                layer.name = prefix + "_" + (count + 1).toString().padStart(2, "0");
                layer.moveToEnd();
                
                count++;
            } catch (e) {
                // 가져오기 실패 시 스킵
            }
        }

        return count;
    }

    // String padStart 폴리필 (ExtendScript 호환)
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

