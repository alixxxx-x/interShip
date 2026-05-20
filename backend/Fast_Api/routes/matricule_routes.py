from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from Fast_Api.services import matricule_service

router = APIRouter(prefix="/api/matricules", tags=["Matriculations"])

@router.get("/")
async def get_matriculations():
    """
    Returns a list of all matriculations including company name and matricule.
    """
    try:
        data = await matricule_service.get_all_matriculations()
        return JSONResponse(status_code=200, content={"data": data})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
from typing import List

class GenerateMatriculesRequest(BaseModel):
    companies: List[str]

@router.post("/generate")
async def generate_matriculations(request: GenerateMatriculesRequest):
    """
    Generates matricules for a provided list of company names.
    """
    try:
        data = await matricule_service.generate_matricules_for_names(request.companies)
        return JSONResponse(status_code=200, content={
            "message": f"Successfully generated {len(data)} matriculations.",
            "data": data
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/refresh")
async def refresh_matriculations():
    """
    Manually forces ALL existing matriculations to regenerate.
    """
    try:
        data = await matricule_service.force_refresh_matriculations()
        return JSONResponse(status_code=200, content={
            "message": f"Successfully refreshed {len(data)} matriculations.",
            "data": data
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))