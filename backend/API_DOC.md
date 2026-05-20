# CV OCR API Documentation

This document describes the FastAPI interactions for the CV OCR microservice. The service uses either Gemini or OpenAI to extract structured information from resumes (PDF, JPG, PNG).

## Configuration
The active AI provider is configured via the `.env` file using the `OCR_PROVIDER` key:
- `OCR_PROVIDER=gemini` (requires `GEMINI_API_KEY`)
- `OCR_PROVIDER=openai` (requires `OPENAI_API_KEY` and the `openai` Python package)

## Base URL
The API runs alongside the Django application or independently on the FastAPI port (typically `http://localhost:8000`).

---

## Endpoints

### 1. Upload & Parse CV
**Endpoint:** `/api/cv/upload`
**Method:** `POST`
**Content-Type:** `multipart/form-data`

This endpoint parses the uploaded CV, extracts structured data, and associates it with a specific `student_id` in the database.

#### Request Parameters (Form Data)
| Field | Type | Required | Description |
|---|---|---|---|
| `student_id` | `integer` | **Yes** | The ID of the student to associate the CV with. |
| `file` | `file` | **Yes** | The CV file. Supported types: `application/pdf`, `image/jpeg`, `image/jpg`, `image/png`. |

#### Responses

**200 OK**
Returns the extracted data and the ID of the created/updated `DigitalCV` record.
```json
{
  "message": "CV data extracted and saved successfully.",
  "extracted_data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "profile_summary": "Experienced software engineer...",
    "experience": "...",
    "education": "...",
    "skills": ["Python", "FastAPI", "React"]
  },
  "digital_cv_id": 42
}
```

**400 Bad Request**
Invalid file format.
```json
{
  "detail": "Invalid file type. Only PDF, JPG, and PNG are supported."
}
```

**404 Not Found**
The provided `student_id` does not exist.
```json
{
  "detail": "Student not found"
}
```

**500 Internal Server Error**
AI parsing failed or API key missing.
```json
{
  "detail": "AI parsing failed: <error details>"
}
```

---

### 2. Parse CV (No Database Save)
**Endpoint:** `/api/cv/parse`
**Method:** `POST`
**Content-Type:** `multipart/form-data`

This endpoint strictly parses the uploaded CV and returns the structured data without saving anything to the database.

#### Request Parameters (Form Data)
| Field | Type | Required | Description |
|---|---|---|---|
| `file` | `file` | **Yes** | The CV file. Supported types: `application/pdf`, `image/jpeg`, `image/jpg`, `image/png`. |

#### Responses

**200 OK**
Returns the extracted JSON data.
```json
{
  "message": "CV data extracted successfully.",
  "extracted_data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "profile_summary": "Experienced software engineer...",
    "experience": "...",
    "education": "...",
    "skills": ["Python", "FastAPI", "React"]
  }
}
```

**400 Bad Request**
Invalid file format.
```json
{
  "detail": "Invalid file type. Only PDF, JPG, and PNG are supported."
}
```

**500 Internal Server Error**
AI parsing failed or API key missing.
```json
{
  "detail": "AI parsing failed: <error details>"
}
```
