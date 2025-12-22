# File Storage API Documentation

This API provides endpoints for storing and retrieving Excel, CSV, and PDF files as base64-encoded data.

## Endpoints

### 1. Upload File

**Endpoint:** `POST /api/files`

**Description:** Upload an Excel, CSV, or PDF file. The file content is stored as base64-encoded data.

**Request:**

- **Method:** POST
- **Content-Type:** multipart/form-data
- **Body:** Form data with `file` field containing the file to upload

**Supported File Types:**

- Excel: `.xlsx`, `.xls`, `.xlsm`
- CSV: `.csv`
- PDF: `.pdf`

**File Size Limit:** 50MB

**Example Request (using curl):**

```bash
curl -X POST http://localhost:3000/api/files \
  -F "file=@path/to/your/file.xlsx"
```

**Example Request (using JavaScript fetch):**

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/files', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result);
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "fileName": "example.xlsx",
  "fileSize": 12345,
  "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "uploadedAt": "2025-12-22T21:59:14.049Z"
}
```

**Error Responses:**

400 Bad Request (Invalid Content-Type):

```json
{
  "error": "Content-Type must be multipart/form-data"
}
```

400 Bad Request (No file provided):

```json
{
  "error": "No file provided"
}
```

400 Bad Request (Invalid file type):

```json
{
  "error": "Invalid file type. Only Excel (.xlsx, .xls, .xlsm), CSV (.csv), and PDF (.pdf) files are allowed"
}
```

413 Payload Too Large:

```json
{
  "error": "File size exceeds 50MB limit"
}
```

500 Internal Server Error:

```json
{
  "error": "Internal server error while uploading file"
}
```

---

### 2. Retrieve File

**Endpoint:** `GET /api/files?filename={filename}`

**Description:** Retrieve a previously uploaded file by its filename. Returns the file content as base64-encoded data.

**Request:**

- **Method:** GET
- **Query Parameters:**
  - `filename` (required): Name of the file to retrieve

**Example Request (using curl):**

```bash
curl -X GET "http://localhost:3000/api/files?filename=example.xlsx"
```

**Example Request (using JavaScript fetch):**

```javascript
const fileName = 'example.xlsx';
const response = await fetch(`/api/files?filename=${encodeURIComponent(fileName)}`);
const result = await response.json();

if (result.success) {
  // Decode base64 content
  const binaryString = atob(result.content);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: result.mimeType });

  // Create download link or process the file
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "fileName": "example.xlsx",
  "content": "UEsDBBQABgAIAAAAIQBi7p1o...(base64 encoded content)...",
  "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "uploadedAt": "2025-12-22T21:59:14.049Z"
}
```

**Error Responses:**

400 Bad Request (No filename provided):

```json
{
  "error": "Filename parameter is required"
}
```

404 Not Found:

```json
{
  "error": "File not found"
}
```

500 Internal Server Error:

```json
{
  "error": "Internal server error while retrieving file"
}
```

---

### 3. Delete File

**Endpoint:** `DELETE /api/files?filename={filename}`

**Description:** Delete a previously uploaded file by its filename.

**Request:**

- **Method:** DELETE
- **Query Parameters:**
  - `filename` (required): Name of the file to delete

**Example Request (using curl):**

```bash
curl -X DELETE "http://localhost:3000/api/files?filename=example.xlsx"
```

**Example Request (using JavaScript fetch):**

```javascript
const fileName = 'example.xlsx';
const response = await fetch(`/api/files?filename=${encodeURIComponent(fileName)}`, {
  method: 'DELETE',
});
const result = await response.json();
console.log(result);
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "File example.xlsx deleted successfully"
}
```

**Error Responses:**

400 Bad Request (No filename provided):

```json
{
  "error": "Filename parameter is required"
}
```

404 Not Found:

```json
{
  "error": "File not found"
}
```

500 Internal Server Error:

```json
{
  "error": "Internal server error while deleting file"
}
```

---

### 4. List Files (Placeholder)

**Endpoint:** `GET /api/files/list`

**Description:** List all stored files (metadata only, no content). This is a placeholder endpoint for production implementation.

**Request:**

- **Method:** GET

**Example Request (using curl):**

```bash
curl -X GET "http://localhost:3000/api/files/list"
```

**Response (200 OK):**

```json
{
  "message": "List endpoint - integrate with your storage solution",
  "note": "In production, connect this to your database to list all stored files"
}
```

---

## Storage Implementation

**Current Implementation:**

- Files are stored in-memory using a JavaScript `Map`
- Data is lost when the server restarts
- Not suitable for production use

**Production Recommendations:**

1. **Database Storage:**
   - Use a database (PostgreSQL, MongoDB, MySQL) to store file metadata
   - Store base64 content in database or reference to file storage service
2. **Cloud Storage:**
   - Azure Blob Storage
   - AWS S3
   - Google Cloud Storage
   - Store base64 encoded files or raw binary files

3. **Hybrid Approach:**
   - Store metadata in database
   - Store files in cloud storage
   - Keep file URLs/references in database

**Example Database Schema:**

```sql
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,  -- base64 encoded
  mime_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Security Considerations

1. **File Type Validation:**
   - Currently validates file extensions and MIME types
   - Consider adding content-based validation (magic bytes)

2. **File Size Limits:**
   - Set to 50MB by default
   - Adjust based on your infrastructure and requirements

3. **Filename Sanitization:**
   - Ensure filenames don't contain path traversal characters
   - Consider generating unique IDs for files instead of using original names

4. **Authentication:**
   - Current implementation has no authentication
   - Add authentication middleware before deploying to production

5. **Rate Limiting:**
   - Implement rate limiting to prevent abuse
   - Consider using a reverse proxy (Nginx) or API gateway

6. **CORS:**
   - Configure CORS policies as needed for your frontend

---

## Application Insights Integration

All file operations are tracked with Azure Application Insights:

- **FileUploaded** - Tracks successful file uploads with metadata
- **FileRetrieved** - Tracks file retrieval requests
- **FileDeleted** - Tracks file deletion operations
- **Exceptions** - All errors are tracked for monitoring

View telemetry in Azure Portal under your Application Insights resource.

---

## Testing

### Using Postman

1. **Upload File:**
   - Method: POST
   - URL: `http://localhost:3000/api/files`
   - Body: form-data
   - Key: `file` (type: File)
   - Value: Select your Excel/CSV/PDF file

2. **Retrieve File:**
   - Method: GET
   - URL: `http://localhost:3000/api/files?filename=yourfile.xlsx`

3. **Delete File:**
   - Method: DELETE
   - URL: `http://localhost:3000/api/files?filename=yourfile.xlsx`

### Using JavaScript

See code examples in each endpoint section above.

---

## Migration to Production

When moving to production:

1. Replace in-memory storage with database or cloud storage
2. Add authentication and authorization
3. Implement rate limiting
4. Add input sanitization and validation
5. Set up proper error logging
6. Configure CORS policies
7. Add file encryption at rest (if required)
8. Implement backup and recovery procedures
9. Set up monitoring and alerting
10. Document API versioning strategy

---

## Support

For issues or questions:

- Check Application Insights for error logs
- Review server logs for detailed error information
- Ensure environment variables are properly configured
