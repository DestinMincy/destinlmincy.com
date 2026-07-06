# Unit 07: Contract Generation And S3 Storage

## Goal

Generate contract PDFs from published template versions and store generated PDFs in a private S3 bucket.

## Design

Generated contracts must be traceable to the exact published template version and field values used. Free-form document editing after generation is not allowed.

## Implementation

### Generation

- Create contract from client relationship, project, published template version, designated signer, and field values.
- Validate required fields before generation.
- Render generated contract preview.
- Generate PDF.
- Store generated PDF in private S3.
- Save S3 object metadata and checksum/hash if practical.

### Regeneration

- Allow regeneration from the same template version and field values before sending to DocuSign.
- Do not allow free-form editing of generated PDFs.

## Dependencies

- Contract template editor.
- Private S3 bucket configuration.
- PDF generation engine selected during implementation.

## Verify When Done

- [ ] Admin can generate a contract from a published template version.
- [ ] Missing required variables block generation.
- [ ] Generated PDF is stored in private S3.
- [ ] Contract record stores template version reference and S3 metadata.
- [ ] Generated contract cannot be free-edited.
