"""
S3/MinIO file storage service.
"""
import boto3
from app.core.config import settings
from typing import Optional
from fastapi import UploadFile, HTTPException, status
import os


class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT if not settings.USE_S3_SSL else None,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION,
            use_ssl=settings.USE_S3_SSL,
        )
        self.bucket = settings.S3_BUCKET
    
    async def upload_file(self, file: UploadFile, folder: str) -> str:
        """Upload file to S3 and return file key."""
        try:
            # Read file
            contents = await file.read()
            
            # Validate file size (max 50MB)
            if len(contents) > 50 * 1024 * 1024:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="File is too large",
                )
            
            # Generate file key
            file_key = f"{folder}/{file.filename}"
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket,
                Key=file_key,
                Body=contents,
                ContentType=file.content_type,
            )
            
            return file_key
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file: {str(e)}",
            )
    
    def get_signed_url(self, file_key: str, expiration: int = 3600) -> str:
        """Get a signed URL for file access."""
        try:
            url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": file_key},
                ExpiresIn=expiration,
            )
            return url
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate signed URL: {str(e)}",
            )
    
    def delete_file(self, file_key: str) -> bool:
        """Delete a file from S3."""
        try:
            self.s3_client.delete_object(Bucket=self.bucket, Key=file_key)
            return True
        except Exception as e:
            return False


# Singleton instance
s3_service = S3Service()
