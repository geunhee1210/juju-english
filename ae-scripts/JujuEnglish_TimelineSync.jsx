/**
 * 주주잉글리시 타임라인 자동 구성 & 오디오 싱크 스크립트
 * 내레이션 마커를 기반으로 타임라인을 자동 구성합니다.
 * 
 * 사용법: 메인 컴포지션을 선택한 후 스크립트 실행
 */

// @target aftereffects

(function() {

    // 타임라인 설정
    var TIMELINE_CONFIG = {
        // 씬 구성 (8페이지 기준)
        scenes: [
            { name: "인트로", duration: 5, page: 0 },
            { name: "Page 1", duration: 12, page: 1 },
            { name: "Page 2", duration: 12, page: 2 },
            { name: "Page 3", duration: 12, page: 3 },
            { name: "Page 4", duration: 12, page: 4 },
            { name: "Page 5", duration: 12, page: 5 },
            { name: "Page 6", duration: 12, page: 6 },
            { name: "Page 7", duration: 12, page: 7 },
            { name: "Page 8", duration: 12, page: 8 },
            { name: "아웃트로", duration: 9, page: 0 }
        ],
        
        // 전환 효과 설정
        transitions: {
            type: "crossfade",  // crossfade, wipe, none
            duration: 0.5      // 초
        },
        
        // BGM 페이드 설정
        bgmFade: {
            fadeIn: 2,   // 시작 페이드인 (초)
            fadeOut: 3,  // 종료 페이드아웃 (초)
            volume: -6   // dB
        }
    };

    // 메인 함수
    function main() {
        var comp = app.project.activeItem;
        
        if (!(comp instanceof CompItem)) {
            alert("컴포지션을 먼저 선택해주세요.");
            return;
        }

        // UI 생성
        var dialog = createDialog(comp);
        dialog.show();
    }

    // UI 다이얼로그 생성
    function createDialog(comp) {
        var dialog = new Window("dialog", "주주잉글리시 타임라인 설정");
        dialog.orientation = "column";
        dialog.alignChildren = ["fill", "top"];

        // 컴포지션 정보
        var infoPanel = dialog.add("panel", undefined, "컴포지션 정보");
        infoPanel.alignChildren = ["left", "top"];
        infoPanel.add("statictext", undefined, "이름: " + comp.name);
        infoPanel.add("statictext", undefined, "길이: " + comp.duration.toFixed(1) + "초");
        infoPanel.add("statictext", undefined, "레이어: " + comp.numLayers + "개");

        // 기능 선택
        var optionPanel = dialog.add("panel", undefined, "실행할 작업");
        optionPanel.alignChildren = ["left", "top"];
        
        var cbMarkers = optionPanel.add("checkbox", undefined, "씬 마커 생성 (8페이지 기준)");
        cbMarkers.value = true;
        
        var cbAudioSync = optionPanel.add("checkbox", undefined, "오디오 마커 분석");
        cbAudioSync.value = true;
        
        var cbBGMFade = optionPanel.add("checkbox", undefined, "BGM 페이드 인/아웃 적용");
        cbBGMFade.value = true;
        
        var cbLayerOrganize = optionPanel.add("checkbox", undefined, "레이어 시간 정리");
        cbLayerOrganize.value = false;

        // 버튼
        var buttonGroup = dialog.add("group");
        buttonGroup.alignment = ["right", "top"];
        
        var cancelBtn = buttonGroup.add("button", undefined, "취소");
        var okBtn = buttonGroup.add("button", undefined, "실행");
        
        cancelBtn.onClick = function() {
            dialog.close();
        };
        
        okBtn.onClick = function() {
            dialog.close();
            
            app.beginUndoGroup("타임라인 자동 구성");
            
            try {
                var results = [];
                
                if (cbMarkers.value) {
                    createSceneMarkers(comp);
                    results.push("씬 마커 생성됨");
                }
                
                if (cbAudioSync.value) {
                    var audioCount = analyzeAudioMarkers(comp);
                    results.push("오디오 마커 " + audioCount + "개 생성됨");
                }
                
                if (cbBGMFade.value) {
                    applyBGMFade(comp);
                    results.push("BGM 페이드 적용됨");
                }
                
                if (cbLayerOrganize.value) {
                    organizeLayerTiming(comp);
                    results.push("레이어 시간 정리됨");
                }
                
                alert("완료!\n\n" + results.join("\n"));
                
            } catch (e) {
                alert("오류 발생: " + e.toString());
            }
            
            app.endUndoGroup();
        };

        return dialog;
    }

    // 씬 마커 생성
    function createSceneMarkers(comp) {
        var markers = comp.markerProperty;
        var currentTime = 0;
        
        // 기존 마커 제거 (선택적)
        while (markers.numKeys > 0) {
            markers.removeKey(1);
        }
        
        // 새 마커 생성
        for (var i = 0; i < TIMELINE_CONFIG.scenes.length; i++) {
            var scene = TIMELINE_CONFIG.scenes[i];
            
            var markerValue = new MarkerValue(scene.name);
            markerValue.comment = "Page " + scene.page + " / Duration: " + scene.duration + "s";
            markerValue.duration = scene.duration;
            
            // 마커 색상 설정 (인트로/아웃트로는 다른 색)
            if (i === 0 || i === TIMELINE_CONFIG.scenes.length - 1) {
                markerValue.label = 9; // 노란색
            } else {
                markerValue.label = 11; // 파란색
            }
            
            markers.setValueAtTime(currentTime, markerValue);
            currentTime += scene.duration;
        }
    }

    // 오디오 마커 분석
    function analyzeAudioMarkers(comp) {
        var markerCount = 0;
        
        // 내레이션 레이어 찾기
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            
            // 오디오 레이어인지 확인
            if (layer.hasAudio && layer.name.toLowerCase().indexOf("narr") !== -1) {
                // 레이어의 인/아웃 포인트에 마커 추가
                var markerValue = new MarkerValue("🎤 " + layer.name);
                markerValue.label = 14; // 핑크색
                
                comp.markerProperty.setValueAtTime(layer.inPoint, markerValue);
                markerCount++;
            }
        }
        
        return markerCount;
    }

    // BGM 페이드 적용
    function applyBGMFade(comp) {
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            
            // BGM 레이어 찾기
            if (layer.hasAudio && layer.name.toLowerCase().indexOf("bgm") !== -1) {
                var audioLevels = layer.property("Audio").property("Audio Levels");
                
                // 기존 키프레임 제거
                while (audioLevels.numKeys > 0) {
                    audioLevels.removeKey(1);
                }
                
                // 페이드인
                audioLevels.setValueAtTime(layer.inPoint, [-100, -100]);
                audioLevels.setValueAtTime(
                    layer.inPoint + TIMELINE_CONFIG.bgmFade.fadeIn,
                    [TIMELINE_CONFIG.bgmFade.volume, TIMELINE_CONFIG.bgmFade.volume]
                );
                
                // 페이드아웃
                audioLevels.setValueAtTime(
                    layer.outPoint - TIMELINE_CONFIG.bgmFade.fadeOut,
                    [TIMELINE_CONFIG.bgmFade.volume, TIMELINE_CONFIG.bgmFade.volume]
                );
                audioLevels.setValueAtTime(layer.outPoint, [-100, -100]);
                
                // 이징 적용
                for (var k = 1; k <= audioLevels.numKeys; k++) {
                    var easeIn = new KeyframeEase(0.5, 75);
                    var easeOut = new KeyframeEase(0.5, 75);
                    audioLevels.setTemporalEaseAtKey(k, [easeIn, easeIn], [easeOut, easeOut]);
                }
            }
        }
    }

    // 레이어 시간 정리
    function organizeLayerTiming(comp) {
        var markers = comp.markerProperty;
        
        if (markers.numKeys < 2) {
            alert("씬 마커가 없습니다. 먼저 마커를 생성하세요.");
            return;
        }
        
        // 배경 레이어 찾아서 시간 설정
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            var name = layer.name.toLowerCase();
            
            // 배경 레이어는 전체 길이로
            if (name.indexOf("bg") !== -1 || name.indexOf("배경") !== -1) {
                layer.inPoint = 0;
                layer.outPoint = comp.duration;
            }
            
            // 캐릭터/소품은 기본 활성화 상태로
            if (name.indexOf("char") !== -1 || name.indexOf("캐릭터") !== -1) {
                layer.enabled = true;
            }
        }
    }

    // 실행
    main();

})();

