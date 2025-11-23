from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ai_models import (
    OCRService,
    FaceVerificationService,
    LivenessCheckService,
    DeepfakeDetectionService,
    RiskScoringService,
)

router = APIRouter(tags=["ai"])


@router.post("/api/v1/ai/ocr")
async def ocr_document(file: UploadFile = File(...)):
    try:
        data = await OCRService.extract_document_info(file)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/v1/ai/face/verify")
async def face_verify(selfie: UploadFile = File(...), document_face: UploadFile = File(...)):
    try:
        data = await FaceVerificationService.verify_face_match(selfie, document_face)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/v1/ai/liveness")
async def liveness(video: UploadFile = File(...)):
    try:
        data = await LivenessCheckService.check_liveness(video)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/v1/ai/deepfake")
async def deepfake(image: UploadFile = File(...)):
    try:
        data = await DeepfakeDetectionService.detect_deepfake(image)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/v1/ai/risk")
async def risk(payload: dict):
    try:
        data = await RiskScoringService.calculate_risk_score(payload)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))