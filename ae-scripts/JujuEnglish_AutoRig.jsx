/**
 * 주주잉글리시 캐릭터 자동 리깅 스크립트
 * PSD 레이어 구조를 기반으로 기본 리깅을 설정합니다.
 * 
 * 사용법: 캐릭터 컴포지션을 선택한 후 스크립트 실행
 */

// @target aftereffects

(function() {

    // 리깅 설정
    var RIG_CONFIG = {
        // 신체 부위별 앵커 포인트 위치 (비율)
        anchorPoints: {
            "head": [0.5, 0.9],      // 머리: 하단 중앙 (목 연결점)
            "body": [0.5, 0.2],      // 몸통: 상단 중앙
            "arm_L": [0.9, 0.2],     // 왼팔: 오른쪽 상단 (어깨)
            "arm_R": [0.1, 0.2],     // 오른팔: 왼쪽 상단 (어깨)
            "hand_L": [0.9, 0.3],    // 왼손: 손목
            "hand_R": [0.1, 0.3],    // 오른손: 손목
            "leg_L": [0.7, 0.1],     // 왼다리: 골반
            "leg_R": [0.3, 0.1],     // 오른다리: 골반
            "foot_L": [0.5, 0.1],    // 왼발: 발목
            "foot_R": [0.5, 0.1],    // 오른발: 발목
            "tail": [0.5, 0.1],      // 꼬리: 엉덩이
            "ear_L": [0.8, 0.9],     // 왼귀
            "ear_R": [0.2, 0.9],     // 오른귀
        },
        
        // 부모-자식 관계
        hierarchy: {
            "head": "body",
            "arm_L": "body",
            "arm_R": "body",
            "hand_L": "arm_L",
            "hand_R": "arm_R",
            "leg_L": "body",
            "leg_R": "body",
            "foot_L": "leg_L",
            "foot_R": "leg_R",
            "tail": "body",
            "ear_L": "head",
            "ear_R": "head",
        },
        
        // 표정 레이어 (눈, 입)
        expressionLayers: ["eye", "mouth", "eyebrow", "눈", "입", "눈썹"],
    };

    // 메인 함수
    function main() {
        var comp = app.project.activeItem;
        
        if (!(comp instanceof CompItem)) {
            alert("컴포지션을 먼저 선택해주세요.");
            return;
        }

        var confirmRig = confirm(
            "캐릭터 자동 리깅을 시작합니다.\n\n" +
            "컴포지션: " + comp.name + "\n" +
            "레이어 수: " + comp.numLayers + "\n\n" +
            "PSD 레이어명 규칙:\n" +
            "- body, head, arm_L, arm_R 등\n" +
            "- 또는 한글: 몸통, 머리, 왼팔, 오른팔 등\n\n" +
            "계속하시겠습니까?"
        );

        if (!confirmRig) return;

        app.beginUndoGroup("주주잉글리시 자동 리깅");

        try {
            var result = autoRig(comp);
            
            alert(
                "리깅 완료!\n\n" +
                "- 앵커 포인트 설정: " + result.anchorSet + "개\n" +
                "- 부모 연결: " + result.parented + "개\n" +
                "- 표정 레이어: " + result.expressions + "개\n\n" +
                "수동 확인이 필요한 레이어가 있을 수 있습니다."
            );
        } catch (e) {
            alert("오류 발생: " + e.toString());
        }

        app.endUndoGroup();
    }

    // 자동 리깅 실행
    function autoRig(comp) {
        var result = {
            anchorSet: 0,
            parented: 0,
            expressions: 0
        };

        var layers = {};
        var layerNameMap = {};

        // 레이어 이름 → 인덱스 매핑
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            var name = normalizeLayerName(layer.name);
            layers[name] = layer;
            layerNameMap[name] = i;
        }

        // 1. 앵커 포인트 설정
        for (var partName in RIG_CONFIG.anchorPoints) {
            var layer = findLayerByPart(layers, partName);
            if (layer) {
                setAnchorPoint(layer, RIG_CONFIG.anchorPoints[partName]);
                result.anchorSet++;
            }
        }

        // 2. 부모-자식 관계 설정
        for (var childPart in RIG_CONFIG.hierarchy) {
            var parentPart = RIG_CONFIG.hierarchy[childPart];
            var childLayer = findLayerByPart(layers, childPart);
            var parentLayer = findLayerByPart(layers, parentPart);
            
            if (childLayer && parentLayer) {
                childLayer.parent = parentLayer;
                result.parented++;
            }
        }

        // 3. 표정 레이어 처리
        for (var name in layers) {
            var layer = layers[name];
            for (var j = 0; j < RIG_CONFIG.expressionLayers.length; j++) {
                if (name.toLowerCase().indexOf(RIG_CONFIG.expressionLayers[j].toLowerCase()) !== -1) {
                    // 머리에 부모 연결
                    var headLayer = findLayerByPart(layers, "head");
                    if (headLayer && layer.parent !== headLayer) {
                        layer.parent = headLayer;
                    }
                    result.expressions++;
                    break;
                }
            }
        }

        // 4. 기본 애니메이션 표현식 추가
        addIdleExpressions(comp, layers);

        return result;
    }

    // 레이어 이름 정규화
    function normalizeLayerName(name) {
        // 공백, 특수문자 제거, 소문자 변환
        return name.toLowerCase()
            .replace(/[\s\-_]+/g, "_")
            .replace(/[^a-z0-9_가-힣]/g, "");
    }

    // 부위명으로 레이어 찾기
    function findLayerByPart(layers, partName) {
        // 영문 키워드 매핑
        var keywords = {
            "head": ["head", "머리", "얼굴"],
            "body": ["body", "몸", "몸통", "torso"],
            "arm_L": ["arm_l", "leftarm", "왼팔", "좌팔"],
            "arm_R": ["arm_r", "rightarm", "오른팔", "우팔"],
            "hand_L": ["hand_l", "lefthand", "왼손", "좌손"],
            "hand_R": ["hand_r", "righthand", "오른손", "우손"],
            "leg_L": ["leg_l", "leftleg", "왼다리", "좌다리"],
            "leg_R": ["leg_r", "rightleg", "오른다리", "우다리"],
            "foot_L": ["foot_l", "leftfoot", "왼발", "좌발"],
            "foot_R": ["foot_r", "rightfoot", "오른발", "우발"],
            "tail": ["tail", "꼬리"],
            "ear_L": ["ear_l", "leftear", "왼귀", "좌귀"],
            "ear_R": ["ear_r", "rightear", "오른귀", "우귀"],
        };

        var searchTerms = keywords[partName] || [partName];
        
        for (var layerName in layers) {
            for (var i = 0; i < searchTerms.length; i++) {
                if (layerName.indexOf(searchTerms[i]) !== -1) {
                    return layers[layerName];
                }
            }
        }
        
        return null;
    }

    // 앵커 포인트 설정
    function setAnchorPoint(layer, ratios) {
        if (!(layer instanceof AVLayer)) return;
        
        var width = layer.width;
        var height = layer.height;
        var newAnchor = [width * ratios[0], height * ratios[1]];
        
        // 현재 위치 유지하면서 앵커 이동
        var currentAnchor = layer.anchorPoint.value;
        var currentPos = layer.position.value;
        
        var delta = [
            newAnchor[0] - currentAnchor[0],
            newAnchor[1] - currentAnchor[1]
        ];
        
        layer.anchorPoint.setValue(newAnchor);
        layer.position.setValue([
            currentPos[0] + delta[0],
            currentPos[1] + delta[1]
        ]);
    }

    // 아이들 애니메이션 표현식 추가
    function addIdleExpressions(comp, layers) {
        // 머리 살짝 흔들기
        var headLayer = findLayerByPart(layers, "head");
        if (headLayer) {
            try {
                headLayer.rotation.expression = 
                    "// 살짝 흔들림\n" +
                    "wiggle(0.5, 2)";
            } catch (e) {}
        }

        // 꼬리 흔들기
        var tailLayer = findLayerByPart(layers, "tail");
        if (tailLayer) {
            try {
                tailLayer.rotation.expression = 
                    "// 꼬리 흔들기\n" +
                    "Math.sin(time * 3) * 10";
            } catch (e) {}
        }

        // 귀 움직임
        var earL = findLayerByPart(layers, "ear_L");
        var earR = findLayerByPart(layers, "ear_R");
        
        if (earL) {
            try {
                earL.rotation.expression = 
                    "// 귀 움직임\n" +
                    "Math.sin(time * 2) * 5";
            } catch (e) {}
        }
        if (earR) {
            try {
                earR.rotation.expression = 
                    "// 귀 움직임\n" +
                    "Math.sin(time * 2 + 0.5) * 5";
            } catch (e) {}
        }
    }

    // 실행
    main();

})();

