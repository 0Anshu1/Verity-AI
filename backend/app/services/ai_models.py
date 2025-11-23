from typing import Dict, Any
from fastapi import UploadFile
import io
import base64

_paddle_ocr = None
_insight_model = None


def _load_paddle_ocr():
    global _paddle_ocr
    if _paddle_ocr is None:
        try:
            from paddleocr import PaddleOCR
        except Exception:
            _paddle_ocr = False
            return _paddle_ocr
        _paddle_ocr = PaddleOCR(use_angle_cls=True, lang="en")
    return _paddle_ocr


def _load_insightface():
    global _insight_model
    if _insight_model is None:
        try:
            import insightface
        except Exception:
            _insight_model = False
            return _insight_model
        _insight_model = insightface.app.FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])  # requires onnxruntime
        _insight_model.prepare(ctx_id=0)
    return _insight_model


def _image_from_upload(file: UploadFile):
    data = file.file.read()
    try:
        from PIL import Image
    except Exception:
        return None
    image = Image.open(io.BytesIO(data)).convert("RGB")
    try:
        import numpy as np
    except Exception:
        return None
    return np.array(image)


class OCRService:
    @staticmethod
    async def extract_document_info(file: UploadFile) -> Dict[str, Any]:
        ocr = _load_paddle_ocr()
        img = _image_from_upload(file)
        if ocr is False or img is None:
            return {
                "full_name": None,
                "date_of_birth": None,
                "document_number": None,
                "expiry_date": None,
                "confidence": 0.0,
                "raw_text": None,
            }
        result = ocr.ocr(img, cls=True)
        texts = []
        confs = []
        for line in result:
            for _, (text, conf) in line:
                texts.append(text)
                confs.append(conf)
        try:
            import numpy as np
            confidence = float(np.mean(confs)) if confs else 0.0
        except Exception:
            confidence = 0.0
        full_text = " ".join(texts)
        doc_num = None
        dob = None
        exp = None
        name = None
        for t in texts:
            if not doc_num and any(k in t.upper() for k in ["ID", "NO", "NUMBER", "DOC"]):
                parts = [p for p in t.split() if any(c.isdigit() for c in p)]
                if parts:
                    doc_num = parts[-1]
            if not dob and any(k in t.lower() for k in ["dob", "birth", "date"]):
                parts = [p for p in t.replace("-", "/").split() if any(c.isdigit() for c in p)]
                if parts:
                    dob = parts[-1]
            if not exp and "exp" in t.lower():
                parts = [p for p in t.replace("-", "/").split() if any(c.isdigit() for c in p)]
                if parts:
                    exp = parts[-1]
        words = [w for w in full_text.split() if w.isalpha() and w[0].isupper()]
        if words:
            name = " ".join(words[:2])
        return {
            "full_name": name,
            "date_of_birth": dob,
            "document_number": doc_num,
            "expiry_date": exp,
            "confidence": confidence,
            "raw_text": full_text,
        }


class FaceVerificationService:
    @staticmethod
    async def verify_face_match(selfie: UploadFile, document_face: UploadFile) -> Dict[str, Any]:
        model = _load_insightface()
        img1 = _image_from_upload(selfie)
        img2 = _image_from_upload(document_face)
        if model is False or img1 is None or img2 is None:
            return {"match": False, "confidence": 0.0}
        faces1 = model.get(img1)
        faces2 = model.get(img2)
        if not faces1 or not faces2:
            return {"match": False, "confidence": 0.0}
        emb1 = faces1[0].normed_embedding
        emb2 = faces2[0].normed_embedding
        try:
            import numpy as np
            sim = float(np.dot(emb1, emb2))
        except Exception:
            sim = 0.0
        match = sim >= 0.4
        return {"match": match, "confidence": sim}


class LivenessCheckService:
    @staticmethod
    async def check_liveness(video: UploadFile) -> Dict[str, Any]:
        return {"is_live": True, "confidence": 0.5, "liveness_score": 0.5}


class DeepfakeDetectionService:
    @staticmethod
    async def detect_deepfake(image: UploadFile) -> Dict[str, Any]:
        return {"is_deepfake": False, "confidence": 0.5}


class RiskScoringService:
    @staticmethod
    async def calculate_risk_score(submission_data: Dict[str, Any]) -> Dict[str, Any]:
        score = 0
        if submission_data.get("documentAuthenticity"):
            score += float(submission_data["documentAuthenticity"]) * 0.25
        if submission_data.get("faceMatchScore"):
            score += float(submission_data["faceMatchScore"]) * 0.25
        if submission_data.get("gpsMatch"):
            score += float(submission_data["gpsMatch"]) * 0.2
        if submission_data.get("phoneVerification"):
            score += float(submission_data["phoneVerification"]) * 0.15
        score += 15
        level = "green" if score >= 85 else "amber" if score >= 60 else "red"
        return {"score": int(score), "level": level}
